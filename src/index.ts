import { SchemaValidationError } from "./errors.js";
import { parseSchema } from "./parser.js";
import { astToIr } from "./resolver.js";
import { validateSchema } from "./validator.js";

export type * from "./ast.js";
export type * from "./ir.js";
export type { DecodedState, DecodeOptions, StateInput } from "./runtime/decode.js";
export { BUILTIN_TYPES, RESERVED_PREFIX } from "./builtins.js";
export {
  AmbiguousMatchError,
  DecodeError,
  DecodeInputError,
  NoMatchingStateError,
  SchemaParseError,
  SchemaValidationError,
} from "./errors.js";
export { parseSchema } from "./parser.js";
export { astToIr } from "./resolver.js";
export { decodeState, decodeStates } from "./runtime/decode.js";
export { validateSchema } from "./validator.js";

export function compileSchema(schemaText: string) {
  const ast = parseSchema(schemaText);
  const diagnostics = validateSchema(ast);
  if (diagnostics.some((diagnostic) => diagnostic.severity === "error")) {
    throw new SchemaValidationError(diagnostics);
  }
  return astToIr(ast);
}

export function jsonReplacer(_key: string, value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  return value;
}
