import type { FieldAst, SchemaAst, StateAst, TypeExprAst } from "./ast.js";
import { BUILTIN_TYPES, NUMERIC_TYPES } from "./builtins.js";
import { SchemaValidationError } from "./errors.js";
import type { FieldIr, PatternIr, SchemaIr, StateIr, StructIr, TypeIr, ValueTypeIr } from "./ir.js";
import { asciiToBytesHex } from "./runtime/bytes.js";
import { collectDefinitions, validateSchema } from "./validator.js";

export function astToIr(ast: SchemaAst): SchemaIr {
  const diagnostics = validateSchema(ast);
  if (diagnostics.some((diagnostic) => diagnostic.severity === "error")) {
    throw new SchemaValidationError(diagnostics);
  }

  const context = collectDefinitions(ast, []);
  const types: Record<string, TypeIr> = {};
  for (const [name, alias] of context.aliases) {
    const lengthArg = alias.target.args[0];
    if (lengthArg?.kind === "number") types[name] = { kind: "bytes", length: lengthArg.value };
  }

  const stateKeys: Record<string, StructIr> = {};
  for (const [name, key] of context.stateKeys) {
    stateKeys[name] = structToIr("StateKey", key.name, key.fields, types);
  }

  const stateValues: Record<string, StructIr> = {};
  for (const [name, value] of context.stateValues) {
    stateValues[name] = structToIr("StateValue", value.name, value.fields, types);
  }

  const states = Array.from(context.states.values()).map(stateToIr);

  return {
    version: 1,
    builtins: { ...BUILTIN_TYPES },
    types,
    stateKeys,
    stateValues,
    states,
  };
}

function structToIr(
  kind: "StateKey" | "StateValue",
  name: string,
  fields: FieldAst[],
  types: Record<string, TypeIr>,
): StructIr {
  const irFields = fields.map((field) => fieldToIr(field, types));
  const fixedLength = irFields.some(
    (field) => field.kind === "field" && field.valueType.kind === "rest",
  )
    ? null
    : irFields.reduce((sum, field) => sum + fieldLength(field), 0);
  return { kind, name, fields: irFields, fixedLength };
}

function fieldToIr(field: FieldAst, types: Record<string, TypeIr>): FieldIr {
  if (!field.name) {
    const pattern = patternToIr(field.type);
    return { kind: "pattern", pattern, length: patternLength(pattern) };
  }

  return {
    kind: "field",
    name: field.name,
    valueType: valueTypeToIr(field.type, types),
    sourceTypeName: field.type.name,
  };
}

function patternToIr(type: TypeExprAst): PatternIr {
  if (type.name === "Null") return { kind: "null", length: numberArg(type) };
  if (type.name === "Any") return { kind: "any", length: numberArg(type) };
  if (type.name === "String") {
    const value = stringArg(type);
    return { kind: "string", value, bytesHex: asciiToBytesHex(value) };
  }
  return { kind: "hex", bytesHex: stringArg(type).toUpperCase() };
}

function valueTypeToIr(type: TypeExprAst, types: Record<string, TypeIr>): ValueTypeIr {
  if (type.name === "u8") return { kind: "u8", length: 1 };
  if (type.name === "u16le") return { kind: "u16", endian: "le", length: 2 };
  if (type.name === "u16be") return { kind: "u16", endian: "be", length: 2 };
  if (type.name === "u32le") return { kind: "u32", endian: "le", length: 4 };
  if (type.name === "u32be") return { kind: "u32", endian: "be", length: 4 };
  if (type.name === "u64le") return { kind: "u64", endian: "le", length: 8 };
  if (type.name === "u64be") return { kind: "u64", endian: "be", length: 8 };
  if (type.name === "Bytes" && type.args[0]?.kind === "fieldRef")
    return { kind: "bytesRef", field: type.args[0].name };
  if (type.name === "Bytes") return { kind: "bytes", length: numberArg(type) };
  if (type.name === "Rest") return { kind: "rest" };

  const aliasOrBuiltin = types[type.name] ?? BUILTIN_TYPES[type.name];
  return { kind: "bytes", length: aliasOrBuiltin.length };
}

function stateToIr(state: StateAst): StateIr {
  const priority = state.attributes.find((attribute) => attribute.name === "priority")?.args[0];
  return {
    name: state.name,
    keySchema: state.keySchema,
    valueSchema: state.valueSchema,
    priority: priority?.kind === "number" ? priority.value : 0,
  };
}

function fieldLength(field: FieldIr): number {
  if (field.kind === "pattern") return field.length;
  const type = field.valueType;
  if (type.kind === "bytesRef" || type.kind === "rest") return 0;
  return type.length;
}

function patternLength(pattern: PatternIr): number {
  if (pattern.kind === "string" || pattern.kind === "hex") return pattern.bytesHex.length / 2;
  return pattern.length;
}

function numberArg(type: TypeExprAst): number {
  const arg = type.args[0];
  return arg?.kind === "number" ? arg.value : 0;
}

function stringArg(type: TypeExprAst): string {
  const arg = type.args[0];
  return arg?.kind === "string" ? arg.value : "";
}

export { NUMERIC_TYPES };
