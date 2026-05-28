import type {
  AttributeAst,
  DefinitionAst,
  Diagnostic,
  FieldAst,
  SchemaAst,
  StateAst,
  StateKeyAst,
  StateValueAst,
  TypeAliasAst,
  TypeArgAst,
  TypeExprAst,
} from "./ast.js";
import { SchemaParseError, diagnostic } from "./errors.js";
import { type Token, type TokenKind, lex } from "./lexer.js";

export function parseSchema(schemaText: string): SchemaAst {
  const parser = new Parser(lex(schemaText));
  return parser.parseSchema();
}

class Parser {
  private index = 0;
  private readonly diagnostics: Diagnostic[] = [];

  constructor(private readonly tokens: Token[]) {}

  parseSchema(): SchemaAst {
    const definitions: DefinitionAst[] = [];
    while (!this.check("eof")) {
      const definition = this.parseDefinition();
      if (definition) {
        definitions.push(definition);
      } else {
        this.synchronize();
      }
    }

    if (this.diagnostics.length > 0) {
      throw new SchemaParseError(this.diagnostics);
    }

    return { kind: "Schema", definitions };
  }

  private parseDefinition(): DefinitionAst | undefined {
    if (this.matchIdentifier("type")) return this.parseTypeAlias(this.previous());
    if (this.matchIdentifier("StateKey")) return this.parseStateKey(this.previous());
    if (this.matchIdentifier("StateValue")) return this.parseStateValue(this.previous());
    if (this.matchIdentifier("State")) return this.parseState(this.previous());

    const token = this.peek();
    this.error(
      token,
      `expected definition, got ${token.kind === "identifier" ? token.value : token.kind}`,
    );
    this.advance();
    return undefined;
  }

  private parseTypeAlias(start: Token): TypeAliasAst | undefined {
    const name = this.consume("identifier", "expected type alias name");
    this.consume("=", "expected = after type alias name");
    const target = this.parseTypeExpr();
    if (!name || !target) return undefined;
    return { kind: "TypeAlias", name: name.value, target, span: this.join(start, target.span) };
  }

  private parseStateKey(start: Token): StateKeyAst | undefined {
    const name = this.consume("identifier", "expected StateKey name");
    const block = this.parseBlock();
    if (!name || !block) return undefined;
    return {
      kind: "StateKey",
      name: name.value,
      fields: block.fields,
      span: this.join(start, block.span),
    };
  }

  private parseStateValue(start: Token): StateValueAst | undefined {
    const name = this.consume("identifier", "expected StateValue name");
    const block = this.parseBlock();
    if (!name || !block) return undefined;
    return {
      kind: "StateValue",
      name: name.value,
      fields: block.fields,
      span: this.join(start, block.span),
    };
  }

  private parseState(start: Token): StateAst | undefined {
    const name = this.consume("identifier", "expected State name");
    this.consume("=", "expected = after State name");
    const keySchema = this.consume("identifier", "expected StateKey reference");
    this.consume("->", "expected -> between key and value schemas");
    const valueSchema = this.consume("identifier", "expected StateValue reference");
    const attributes = this.parseAttributes();
    if (!name || !keySchema || !valueSchema) return undefined;
    const endSpan = attributes.at(-1)?.span ?? valueSchema.span;
    return {
      kind: "State",
      name: name.value,
      keySchema: keySchema.value,
      valueSchema: valueSchema.value,
      attributes,
      span: this.join(start, endSpan),
    };
  }

  private parseBlock(): { fields: FieldAst[]; span: Token["span"] } | undefined {
    const open = this.consume("{", "expected {");
    const fields: FieldAst[] = [];
    while (!this.check("}") && !this.check("eof")) {
      const field = this.parseField();
      if (field) {
        fields.push(field);
      } else {
        this.synchronize();
      }
    }
    const close = this.consume("}", "expected }");
    if (!open || !close) return undefined;
    return { fields, span: this.join(open, close.span) };
  }

  private parseField(): FieldAst | undefined {
    const type = this.parseTypeExpr();
    if (!type) return undefined;

    let name: string | undefined;
    if (
      !["Null", "String", "Hex", "Any"].includes(type.name) &&
      this.check("identifier") &&
      this.tokens[this.index + 1]?.kind !== "(" &&
      this.peek().value !== "type" &&
      !this.isDefinitionKeyword(this.peek().value)
    ) {
      name = this.advance().value;
    }
    const attributes = this.parseAttributes();
    const endSpan = attributes.at(-1)?.span ?? type.span;
    return { kind: "Field", type, name, attributes, span: this.join(type.span, endSpan) };
  }

  private parseTypeExpr(): TypeExprAst | undefined {
    const name = this.consume("identifier", "expected type name");
    if (!name) return undefined;
    const args: TypeArgAst[] = [];
    let end = name.span;
    if (this.match("(")) {
      if (!this.check(")")) {
        do {
          const arg = this.parseArg();
          if (arg) args.push(arg);
        } while (this.match(","));
      }
      const close = this.consume(")", "expected )");
      if (close) end = close.span;
    }
    return { kind: "TypeExpr", name: name.value, args, span: this.join(name, end) };
  }

  private parseArg(): TypeArgAst | undefined {
    if (this.match("number")) {
      const token = this.previous();
      return { kind: "number", value: Number.parseInt(token.value, 10), span: token.span };
    }
    if (this.match("string")) {
      const token = this.previous();
      return { kind: "string", value: token.value, span: token.span };
    }
    if (this.match("fieldRef")) {
      const token = this.previous();
      return { kind: "fieldRef", name: token.value, span: token.span };
    }
    this.error(this.peek(), "expected argument");
    this.advance();
    return undefined;
  }

  private parseAttributes(): AttributeAst[] {
    const attributes: AttributeAst[] = [];
    while (this.match("@")) {
      const at = this.previous();
      const name = this.consume("identifier", "expected attribute name");
      const args: TypeArgAst[] = [];
      let end = name?.span ?? at.span;
      if (this.match("(")) {
        if (!this.check(")")) {
          do {
            const arg = this.parseArg();
            if (arg) args.push(arg);
          } while (this.match(","));
        }
        const close = this.consume(")", "expected )");
        if (close) end = close.span;
      }
      if (name) {
        attributes.push({ name: name.value, args, span: this.join(at, end) });
      }
    }
    return attributes;
  }

  private consume(kind: TokenKind, message: string): Token | undefined {
    if (this.check(kind)) return this.advance();
    this.error(this.peek(), message);
    return undefined;
  }

  private match(kind: TokenKind): boolean {
    if (!this.check(kind)) return false;
    this.advance();
    return true;
  }

  private matchIdentifier(value: string): boolean {
    if (!this.check("identifier") || this.peek().value !== value) return false;
    this.advance();
    return true;
  }

  private check(kind: TokenKind): boolean {
    return this.peek().kind === kind;
  }

  private advance(): Token {
    if (!this.check("eof")) this.index += 1;
    return this.previous();
  }

  private peek(): Token {
    return this.tokens[this.index];
  }

  private previous(): Token {
    return this.tokens[this.index - 1];
  }

  private error(token: Token, message: string): void {
    this.diagnostics.push(diagnostic("parse.syntax", message, token.span));
  }

  private synchronize(): void {
    while (!this.check("eof")) {
      if (this.check("}")) {
        this.advance();
        return;
      }
      if (this.check("identifier") && this.isDefinitionKeyword(this.peek().value)) return;
      this.advance();
    }
  }

  private isDefinitionKeyword(value: string): boolean {
    return value === "type" || value === "StateKey" || value === "StateValue" || value === "State";
  }

  private join(start: Token | Token["span"], end: Token | Token["span"]): Token["span"] {
    const startSpan = "span" in start ? start.span : start;
    const endSpan = "span" in end ? end.span : end;
    return {
      start: startSpan.start,
      end: endSpan.end,
      line: startSpan.line,
      column: startSpan.column,
    };
  }
}
