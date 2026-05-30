import type { TypeIr } from "./ir.js";

export const RESERVED_PREFIX = "__xhs_";

export const BUILTIN_TYPES: Record<string, TypeIr> = {
  Account: { kind: "bytes", length: 20 },
  Currency: { kind: "bytes", length: 20 },
  Issuer: { kind: "bytes", length: 20 },
  XFL: { kind: "u64", endian: "le", length: 8 },
};

export const NUMERIC_TYPES = new Set(["u8", "u16", "u16be", "u32", "u32be", "u64", "u64be"]);

export const ENDIAN_ATTRIBUTE_TYPES = new Set(["u16", "u32", "u64"]);

export const PATTERN_TYPES = new Set(["Null", "String", "Hex", "Any"]);

export const VALUE_CALL_TYPES = new Set(["Bytes"]);

export function isBuiltinType(name: string): boolean {
  return Object.hasOwn(BUILTIN_TYPES, name);
}
