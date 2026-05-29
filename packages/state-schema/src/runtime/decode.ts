import { NUMERIC_TYPES, isBuiltinType } from "../builtins.js";
import {
  AmbiguousMatchError,
  DecodeError,
  DecodeInputError,
  NoMatchingStateError,
} from "../errors.js";
import type {
  FieldIr,
  MetadataIr,
  NamedFieldIr,
  SchemaIr,
  StateIr,
  StructIr,
  ValueTypeIr,
} from "../ir.js";
import { bytesToHex, hexToBytes } from "./bytes.js";
import { matchPattern } from "./match.js";
import { decodeNumeric } from "./numeric.js";

export type StateInput = {
  key: string;
  value: string;
};

export type DecodeOptions = {
  mode?: "strict" | "loose";
};

export type DecodedFieldMetadata = MetadataIr & {
  typeName: string;
  type: ValueTypeIr;
};

export type DecodedState = {
  state: string;
  metadata: MetadataIr;
  keySchema: string;
  valueSchema: string;
  key: Record<string, unknown>;
  value: Record<string, unknown>;
  fieldMetadata: {
    key: Record<string, DecodedFieldMetadata>;
    value: Record<string, DecodedFieldMetadata>;
  };
  raw: {
    key: string;
    value: string;
  };
  match: {
    score: number;
    reasons: string[];
  };
};

type Candidate = {
  state: StateIr;
  key: Record<string, unknown>;
  value: Record<string, unknown>;
  fieldMetadata: {
    key: Record<string, DecodedFieldMetadata>;
    value: Record<string, DecodedFieldMetadata>;
  };
  score: number;
  reasons: string[];
};

type StructResult =
  | { ok: true; fields: Record<string, unknown>; score: number; reasons: string[] }
  | { ok: false; reason: string };

export function decodeState(
  schema: SchemaIr,
  input: StateInput,
  options: DecodeOptions = {},
): DecodedState {
  const key = hexToBytes(input.key);
  const value = hexToBytes(input.value);

  if (key.length !== 32) {
    throw new DecodeInputError("State key must be 32 bytes");
  }

  const candidates: Candidate[] = [];
  for (const state of schema.states) {
    const keySchema = schema.stateKeys[state.keySchema];
    const valueSchema = schema.stateValues[state.valueSchema];
    if (!keySchema || !valueSchema) continue;

    const keyResult = tryDecodeStruct(keySchema, key, "key");
    if (!keyResult.ok) continue;

    const valueResult = tryDecodeStruct(valueSchema, value, "value");
    if (!valueResult.ok) continue;

    let score = keyResult.score + valueResult.score + state.priority;
    const reasons = [
      ...keyResult.reasons,
      ...valueResult.reasons,
      `priority ${formatSigned(state.priority)}`,
    ];

    score += 10;
    reasons.unshift("key length matched 32 bytes (+10)");
    if (valueSchema.fixedLength !== null) {
      score += 10;
      reasons.push(`value length matched ${value.length} bytes (+10)`);
    }

    candidates.push({
      state,
      key: keyResult.fields,
      value: valueResult.fields,
      fieldMetadata: {
        key: collectFieldMetadata(keySchema),
        value: collectFieldMetadata(valueSchema),
      },
      score,
      reasons,
    });
  }

  if (candidates.length === 0) {
    if (options.mode === "loose") {
      candidates.push(decodeImplicitRawFallback(key, value));
    } else {
      throw new NoMatchingStateError();
    }
  }

  candidates.sort((left, right) => right.score - left.score);
  const top = candidates[0];
  const second = candidates[1];
  if (second && top.score === second.score) {
    throw new AmbiguousMatchError(
      candidates
        .filter((candidate) => candidate.score === top.score)
        .map((candidate) => ({
          state: candidate.state.name,
          score: candidate.score,
          reasons: candidate.reasons,
        })),
    );
  }

  return toDecodedState(top, input);
}

export function decodeStates(
  schema: SchemaIr,
  inputs: StateInput[],
  options: DecodeOptions = {},
): DecodedState[] {
  return inputs.map((input) => decodeState(schema, input, options));
}

export function tryDecodeStruct(
  struct: StructIr,
  input: Uint8Array,
  label: "key" | "value",
): StructResult {
  let offset = 0;
  let score = 0;
  const fields: Record<string, unknown> = {};
  const reasons: string[] = [];

  for (const field of struct.fields) {
    if (field.kind === "pattern") {
      const result = matchPattern(field.pattern, input, offset, label);
      if (!result.ok) return result;
      offset += field.length;
      score += result.score;
      reasons.push(result.reason);
      continue;
    }

    const result = decodeField(field, input, offset, fields, label);
    fields[field.name] = result.value;
    offset = result.nextOffset;
    score += result.score;
    reasons.push(result.reason);
  }

  if (struct.fixedLength !== null && offset !== input.length) {
    return {
      ok: false,
      reason: `${struct.name} expected ${offset} bytes to consume all input, got ${input.length}`,
    };
  }

  return { ok: true, fields, score, reasons };
}

function decodeField(
  field: NamedFieldIr,
  input: Uint8Array,
  offset: number,
  fields: Record<string, unknown>,
  label: "key" | "value",
): { value: unknown; nextOffset: number; score: number; reason: string } {
  const type = field.valueType;
  const length = valueLength(type, fields, input.length - offset);
  if (length < 0 || offset + length > input.length) {
    throw new DecodeError(`${field.name} exceeds input length`, { schema: label, offset });
  }

  if (type.kind === "rest") {
    const bytes = input.subarray(offset);
    return {
      value: bytesToHex(bytes),
      nextOffset: input.length,
      score: -10,
      reason: `decoded Rest ${field.name} at ${label} offset ${offset} (-10)`,
    };
  }

  const bytes = input.subarray(offset, offset + length);
  if (type.kind === "bytes" || type.kind === "bytesRef") {
    return {
      value: bytesToHex(bytes),
      nextOffset: offset + length,
      score: 1,
      reason: `decoded bytes ${field.name} at ${label} offset ${offset} (+1)`,
    };
  }

  const value = decodeNumeric(type, input, offset);
  return {
    value,
    nextOffset: offset + length,
    score: 1,
    reason: `decoded ${field.sourceTypeName ?? type.kind} ${field.name} at ${label} offset ${offset} (+1)`,
  };
}

function valueLength(
  type: ValueTypeIr,
  fields: Record<string, unknown>,
  remaining: number,
): number {
  if (type.kind === "rest") return remaining;
  if (type.kind === "bytesRef") {
    const value = fields[type.field];
    if (typeof value !== "number" || value < 0 || !Number.isInteger(value)) {
      throw new DecodeError(`Bytes($${type.field}) references a non-integer length`);
    }
    return value;
  }
  return type.length;
}

function decodeImplicitRawFallback(key: Uint8Array, value: Uint8Array): Candidate {
  return {
    state: {
      name: "__xhs_RawState",
      keySchema: "__xhs_RawKey",
      valueSchema: "__xhs_RawValue",
      priority: -1_000_000,
      metadata: { name: "__xhs_RawState" },
      implicit: true,
    },
    key: { key: bytesToHex(key) },
    value: { value: bytesToHex(value) },
    fieldMetadata: {
      key: {
        key: {
          name: "key",
          typeName: "Bytes",
          type: { kind: "bytes", length: 32 },
        },
      },
      value: {
        value: {
          name: "value",
          typeName: "Rest",
          type: { kind: "rest" },
        },
      },
    },
    score: -1_000_000,
    reasons: ["implicit Raw fallback", "priority -1000000"],
  };
}

function toDecodedState(candidate: Candidate, input: StateInput): DecodedState {
  return {
    state: candidate.state.name,
    metadata: candidate.state.metadata,
    keySchema: candidate.state.keySchema,
    valueSchema: candidate.state.valueSchema,
    key: candidate.key,
    value: candidate.value,
    fieldMetadata: candidate.fieldMetadata,
    raw: {
      key: input.key.toUpperCase(),
      value: input.value.toUpperCase(),
    },
    match: {
      score: candidate.score,
      reasons: candidate.reasons,
    },
  };
}

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

function collectFieldMetadata(struct: StructIr): Record<string, DecodedFieldMetadata> {
  const fields: Record<string, DecodedFieldMetadata> = {};
  for (const field of struct.fields) {
    if (field.kind === "field") {
      fields[field.name] = {
        ...field.metadata,
        typeName: fieldTypeName(field),
        type: field.valueType,
      };
    }
  }
  return fields;
}

function fieldTypeName(field: NamedFieldIr): string {
  const sourceTypeName = field.sourceTypeName;
  if (
    sourceTypeName &&
    (NUMERIC_TYPES.has(sourceTypeName) ||
      sourceTypeName === "Bytes" ||
      sourceTypeName === "Rest" ||
      isBuiltinType(sourceTypeName))
  ) {
    return sourceTypeName;
  }

  const type = field.valueType;
  if (type.kind === "u16" || type.kind === "u32" || type.kind === "u64") {
    return `${type.kind}${type.endian}`;
  }
  if (type.kind === "bytes" || type.kind === "bytesRef") return "Bytes";
  if (type.kind === "rest") return "Rest";
  return type.kind;
}
