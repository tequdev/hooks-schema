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
import {
  BUILTIN_TYPES,
  NUMERIC_TYPES,
  PATTERN_TYPES,
  RESERVED_PREFIX,
  isBuiltinType,
} from "./builtins.js";
import { diagnostic } from "./errors.js";
import { isAscii, isHex } from "./runtime/bytes.js";

type Context = {
  aliases: Map<string, TypeAliasAst>;
  stateKeys: Map<string, StateKeyAst>;
  stateValues: Map<string, StateValueAst>;
  states: Map<string, StateAst>;
};

export function validateSchema(ast: SchemaAst): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const context = collectDefinitions(ast, diagnostics);

  for (const alias of context.aliases.values()) validateAlias(alias, diagnostics);
  for (const key of context.stateKeys.values())
    validateStruct(key, "StateKey", context, diagnostics);
  for (const value of context.stateValues.values())
    validateStruct(value, "StateValue", context, diagnostics);
  for (const state of context.states.values()) validateState(state, context, diagnostics);

  return diagnostics;
}

export function collectDefinitions(ast: SchemaAst, diagnostics: Diagnostic[]): Context {
  const context: Context = {
    aliases: new Map(),
    stateKeys: new Map(),
    stateValues: new Map(),
    states: new Map(),
  };
  const allNames = new Map<string, DefinitionAst>();

  for (const definition of ast.definitions) {
    const name = definition.name;
    if (name.startsWith(RESERVED_PREFIX)) {
      diagnostics.push(
        diagnostic(
          "schema.reservedName",
          `${name} uses reserved prefix ${RESERVED_PREFIX}`,
          definition.span,
        ),
      );
    }
    if (allNames.has(name)) {
      diagnostics.push(
        diagnostic("schema.duplicateDefinition", `duplicate definition ${name}`, definition.span),
      );
      continue;
    }
    allNames.set(name, definition);

    if (definition.kind === "TypeAlias") context.aliases.set(name, definition);
    if (definition.kind === "StateKey") context.stateKeys.set(name, definition);
    if (definition.kind === "StateValue") context.stateValues.set(name, definition);
    if (definition.kind === "State") context.states.set(name, definition);
  }

  return context;
}

function validateAlias(alias: TypeAliasAst, diagnostics: Diagnostic[]): void {
  if (isBuiltinType(alias.name)) {
    diagnostics.push(
      diagnostic(
        "schema.builtinAlias",
        `type alias ${alias.name} conflicts with a builtin type`,
        alias.span,
      ),
    );
  }
  if (
    alias.target.name !== "Bytes" ||
    alias.target.args.length !== 1 ||
    alias.target.args[0]?.kind !== "number"
  ) {
    diagnostics.push(
      diagnostic(
        "schema.invalidAlias",
        "MVP type aliases must have the form type Name = Bytes(n)",
        alias.span,
      ),
    );
    return;
  }
  validateNonNegativeLength(alias.target.args[0], diagnostics);
}

function validateStruct(
  struct: StateKeyAst | StateValueAst,
  kind: "StateKey" | "StateValue",
  context: Context,
  diagnostics: Diagnostic[],
): void {
  const names = new Set<string>();
  const priorFields = new Map<string, FieldAst>();
  let totalLength = 0;
  let fixed = true;

  for (let index = 0; index < struct.fields.length; index += 1) {
    const field = struct.fields[index];
    for (const attribute of field.attributes) {
      diagnostics.push(
        diagnostic(
          "schema.unsupportedFieldAttribute",
          `unsupported field attribute @${attribute.name}`,
          attribute.span,
        ),
      );
    }

    if (field.name) {
      if (names.has(field.name)) {
        diagnostics.push(
          diagnostic(
            "schema.duplicateField",
            `duplicate field ${field.name} in ${struct.name}`,
            field.span,
          ),
        );
      }
      names.add(field.name);
    }

    if (kind === "StateKey" && field.type.name === "Rest") {
      diagnostics.push(
        diagnostic("schema.stateKeyRest", "Rest is not allowed in StateKey", field.span),
      );
    }
    if (kind === "StateKey" && isBytesRef(field.type)) {
      diagnostics.push(
        diagnostic(
          "schema.stateKeyDynamicBytes",
          "Bytes($field) is not allowed in StateKey",
          field.span,
        ),
      );
    }

    if (field.type.name === "Rest") {
      if (!field.name)
        diagnostics.push(
          diagnostic("schema.restMustBeNamed", "Rest must be a named field", field.span),
        );
      if (index !== struct.fields.length - 1) {
        diagnostics.push(
          diagnostic("schema.restMustBeLast", "Rest must be the last field", field.span),
        );
      }
      fixed = false;
    }

    if (isBytesRef(field.type)) {
      const ref = field.type.args[0];
      if (ref?.kind === "fieldRef") {
        const referenced = priorFields.get(ref.name);
        if (!referenced) {
          diagnostics.push(
            diagnostic(
              "schema.bytesRefUnknown",
              `Bytes($${ref.name}) references an unknown prior field`,
              ref.span,
            ),
          );
        } else if (!["u8", "u16le", "u16be", "u32le", "u32be"].includes(referenced.type.name)) {
          diagnostics.push(
            diagnostic(
              "schema.bytesRefInvalidType",
              `Bytes($${ref.name}) must reference u8/u16/u32 length field`,
              ref.span,
            ),
          );
        }
      }
    }

    const length = staticFieldLength(field, context, diagnostics);
    if (length === null) {
      fixed = false;
    } else {
      totalLength += length;
    }

    if (field.name) priorFields.set(field.name, field);
  }

  if (kind === "StateKey" && totalLength !== 32) {
    diagnostics.push(
      diagnostic(
        "schema.stateKeyLength",
        `StateKey ${struct.name} must be exactly 32 bytes, got ${totalLength}`,
        struct.span,
      ),
    );
  }

  if (kind === "StateKey" && !fixed) {
    diagnostics.push(
      diagnostic(
        "schema.stateKeyVariable",
        `StateKey ${struct.name} must have a fixed length`,
        struct.span,
      ),
    );
  }
}

function validateState(state: StateAst, context: Context, diagnostics: Diagnostic[]): void {
  if (state.keySchema.kind === "inline") {
    validateStruct(
      {
        kind: "StateKey",
        name: inlineStateKeyName(state.name),
        fields: state.keySchema.fields,
        span: state.keySchema.span,
      },
      "StateKey",
      context,
      diagnostics,
    );
  } else if (!context.stateKeys.has(state.keySchema.name)) {
    diagnostics.push(
      diagnostic("schema.unknownStateKey", `unknown StateKey ${state.keySchema.name}`, state.span),
    );
  }

  if (state.valueSchema.kind === "inline") {
    validateStruct(
      {
        kind: "StateValue",
        name: inlineStateValueName(state.name),
        fields: state.valueSchema.fields,
        span: state.valueSchema.span,
      },
      "StateValue",
      context,
      diagnostics,
    );
  } else if (!context.stateValues.has(state.valueSchema.name)) {
    diagnostics.push(
      diagnostic(
        "schema.unknownStateValue",
        `unknown StateValue ${state.valueSchema.name}`,
        state.span,
      ),
    );
  }

  let priorityCount = 0;
  for (const attribute of state.attributes) {
    if (attribute.name !== "priority") {
      diagnostics.push(
        diagnostic(
          "schema.unsupportedStateAttribute",
          `unsupported State attribute @${attribute.name}`,
          attribute.span,
        ),
      );
      continue;
    }
    priorityCount += 1;
    if (attribute.args.length !== 1 || attribute.args[0]?.kind !== "number") {
      diagnostics.push(
        diagnostic(
          "schema.invalidPriority",
          "@priority requires one numeric argument",
          attribute.span,
        ),
      );
    }
  }
  if (priorityCount > 1) {
    diagnostics.push(
      diagnostic(
        "schema.duplicatePriority",
        `State ${state.name} has multiple @priority attributes`,
        state.span,
      ),
    );
  }
}

function inlineStateKeyName(stateName: string): string {
  return `${RESERVED_PREFIX}${stateName}Key`;
}

function inlineStateValueName(stateName: string): string {
  return `${RESERVED_PREFIX}${stateName}Value`;
}

function staticFieldLength(
  field: FieldAst,
  context: Context,
  diagnostics: Diagnostic[],
): number | null {
  const type = field.type;

  if (type.name === "Rest" || isBytesRef(type)) return null;

  if (NUMERIC_TYPES.has(type.name)) {
    if (type.args.length !== 0) {
      diagnostics.push(
        diagnostic("schema.numericArgs", `${type.name} does not take arguments`, type.span),
      );
    }
    return numericLength(type.name);
  }

  if (type.name === "Bytes") {
    const length = expectLengthArg(type, diagnostics);
    return length;
  }

  if (type.name === "Null" || type.name === "Any") {
    const length = expectLengthArg(type, diagnostics);
    if (field.name)
      diagnostics.push(
        diagnostic(
          "schema.patternNamed",
          `${type.name} is a pattern and must not be named`,
          field.span,
        ),
      );
    return length;
  }

  if (type.name === "String") {
    if (field.name)
      diagnostics.push(
        diagnostic("schema.patternNamed", "String is a pattern and must not be named", field.span),
      );
    const arg = type.args[0];
    if (type.args.length !== 1 || arg?.kind !== "string") {
      diagnostics.push(
        diagnostic("schema.stringArg", "String requires one string argument", type.span),
      );
      return 0;
    }
    if (!isAscii(arg.value)) {
      diagnostics.push(diagnostic("schema.stringAscii", "String pattern must be ASCII", arg.span));
    }
    return arg.value.length;
  }

  if (type.name === "Hex") {
    if (field.name)
      diagnostics.push(
        diagnostic("schema.patternNamed", "Hex is a pattern and must not be named", field.span),
      );
    const arg = type.args[0];
    if (type.args.length !== 1 || arg?.kind !== "string") {
      diagnostics.push(diagnostic("schema.hexArg", "Hex requires one string argument", type.span));
      return 0;
    }
    if (!isHex(arg.value)) {
      diagnostics.push(
        diagnostic("schema.hexInvalid", "Hex requires an even-length hex string", arg.span),
      );
      return 0;
    }
    return arg.value.length / 2;
  }

  if (PATTERN_TYPES.has(type.name)) {
    diagnostics.push(
      diagnostic("schema.invalidPattern", `invalid pattern ${type.name}`, type.span),
    );
    return 0;
  }

  const alias = context.aliases.get(type.name);
  if (alias) {
    if (type.args.length !== 0)
      diagnostics.push(
        diagnostic("schema.aliasArgs", `${type.name} does not take arguments`, type.span),
      );
    const arg = alias.target.args[0];
    return arg?.kind === "number" ? arg.value : 0;
  }

  const builtin = BUILTIN_TYPES[type.name];
  if (builtin) {
    if (type.args.length !== 0)
      diagnostics.push(
        diagnostic("schema.builtinArgs", `${type.name} does not take arguments`, type.span),
      );
    return builtin.length;
  }

  diagnostics.push(diagnostic("schema.unknownType", `unknown type ${type.name}`, type.span));
  return 0;
}

function expectLengthArg(type: TypeExprAst, diagnostics: Diagnostic[]): number {
  const arg = type.args[0];
  if (type.args.length !== 1 || arg?.kind !== "number") {
    diagnostics.push(
      diagnostic(
        "schema.lengthArg",
        `${type.name} requires one numeric length argument`,
        type.span,
      ),
    );
    return 0;
  }
  validateNonNegativeLength(arg, diagnostics);
  return arg.value;
}

function validateNonNegativeLength(arg: TypeArgAst, diagnostics: Diagnostic[]): void {
  if (arg.kind === "number" && arg.value < 0) {
    diagnostics.push(diagnostic("schema.negativeLength", "length must be non-negative", arg.span));
  }
}

function numericLength(name: string): number {
  if (name === "u8") return 1;
  if (name.startsWith("u16")) return 2;
  if (name.startsWith("u32")) return 4;
  return 8;
}

function isBytesRef(type: TypeExprAst): boolean {
  return type.name === "Bytes" && type.args.length === 1 && type.args[0]?.kind === "fieldRef";
}
