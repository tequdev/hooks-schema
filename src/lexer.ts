import type { Diagnostic, SourceSpan } from "./ast.js";
import { SchemaParseError, diagnostic } from "./errors.js";

export type TokenKind =
  | "identifier"
  | "number"
  | "string"
  | "fieldRef"
  | "{"
  | "}"
  | "("
  | ")"
  | ","
  | "="
  | "->"
  | "@"
  | "eof";

export type Token = {
  kind: TokenKind;
  value: string;
  span: SourceSpan;
};

export function lex(input: string): Token[] {
  const tokens: Token[] = [];
  const diagnostics: Diagnostic[] = [];
  let index = 0;
  let line = 1;
  let column = 1;

  const span = (
    start: number,
    end: number,
    startLine: number,
    startColumn: number,
  ): SourceSpan => ({
    start,
    end,
    line: startLine,
    column: startColumn,
  });

  const advance = (): string => {
    const char = input[index] ?? "";
    index += 1;
    if (char === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
    return char;
  };

  const add = (
    kind: TokenKind,
    value: string,
    start: number,
    startLine: number,
    startColumn: number,
  ) => {
    tokens.push({ kind, value, span: span(start, index, startLine, startColumn) });
  };

  while (index < input.length) {
    const char = input[index];

    if (/\s/.test(char)) {
      advance();
      continue;
    }

    if (char === "/" && input[index + 1] === "/") {
      while (index < input.length && input[index] !== "\n") advance();
      continue;
    }

    if (char === "/" && input[index + 1] === "*") {
      const start = index;
      const startLine = line;
      const startColumn = column;
      advance();
      advance();
      while (index < input.length && !(input[index] === "*" && input[index + 1] === "/")) {
        advance();
      }
      if (index >= input.length) {
        diagnostics.push(
          diagnostic(
            "parse.unterminatedBlockComment",
            "unterminated block comment",
            span(start, index, startLine, startColumn),
          ),
        );
        break;
      }
      advance();
      advance();
      continue;
    }

    const start = index;
    const startLine = line;
    const startColumn = column;

    if (/[a-zA-Z_]/.test(char)) {
      let value = "";
      while (index < input.length && /[a-zA-Z0-9_]/.test(input[index])) {
        value += advance();
      }
      add("identifier", value, start, startLine, startColumn);
      continue;
    }

    if (char === "-" && input[index + 1] === ">") {
      advance();
      advance();
      add("->", "->", start, startLine, startColumn);
      continue;
    }

    if (char === "-" || /[0-9]/.test(char)) {
      let value = "";
      if (char === "-") value += advance();
      while (index < input.length && /[0-9]/.test(input[index])) {
        value += advance();
      }
      if (value === "-") {
        diagnostics.push(
          diagnostic(
            "parse.invalidNumber",
            "invalid number literal",
            span(start, index, startLine, startColumn),
          ),
        );
      } else {
        add("number", value, start, startLine, startColumn);
      }
      continue;
    }

    if (char === '"') {
      advance();
      let value = "";
      let terminated = false;
      while (index < input.length) {
        const current = advance();
        if (current === '"') {
          terminated = true;
          break;
        }
        if (current === "\\") {
          const escaped = advance();
          const mapped: Record<string, string> = {
            '"': '"',
            "\\": "\\",
            n: "\n",
            r: "\r",
            t: "\t",
          };
          if (Object.hasOwn(mapped, escaped)) {
            value += mapped[escaped];
          } else {
            diagnostics.push(
              diagnostic(
                "parse.invalidEscape",
                `invalid escape sequence \\${escaped}`,
                span(start, index, startLine, startColumn),
              ),
            );
          }
          continue;
        }
        value += current;
      }
      if (!terminated) {
        diagnostics.push(
          diagnostic(
            "parse.unterminatedString",
            "unterminated string literal",
            span(start, index, startLine, startColumn),
          ),
        );
      }
      add("string", value, start, startLine, startColumn);
      continue;
    }

    if (char === "$") {
      advance();
      let name = "";
      while (index < input.length && /[a-zA-Z0-9_]/.test(input[index])) {
        name += advance();
      }
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
        diagnostics.push(
          diagnostic(
            "parse.invalidFieldRef",
            "invalid field reference",
            span(start, index, startLine, startColumn),
          ),
        );
      } else {
        add("fieldRef", name, start, startLine, startColumn);
      }
      continue;
    }

    if ("{}(),=@".includes(char)) {
      advance();
      add(char as TokenKind, char, start, startLine, startColumn);
      continue;
    }

    diagnostics.push(
      diagnostic(
        "parse.unexpectedCharacter",
        `unexpected character ${char}`,
        span(start, start + 1, startLine, startColumn),
      ),
    );
    advance();
  }

  tokens.push({ kind: "eof", value: "", span: span(index, index, line, column) });

  if (diagnostics.length > 0) {
    throw new SchemaParseError(diagnostics);
  }

  return tokens;
}
