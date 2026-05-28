import type { PatternIr } from "../ir.js";
import { bytesToHex, hexToBytes } from "./bytes.js";

export type PatternMatch =
  | { ok: true; score: number; reason: string }
  | { ok: false; reason: string };

export function matchPattern(
  pattern: PatternIr,
  input: Uint8Array,
  offset: number,
  label: string,
): PatternMatch {
  const length = patternLength(pattern);
  if (offset + length > input.length) {
    return {
      ok: false,
      reason: `${label} expected ${length} bytes at offset ${offset}, got ${input.length - offset}`,
    };
  }

  const slice = input.subarray(offset, offset + length);
  if (pattern.kind === "null") {
    if (slice.some((byte) => byte !== 0)) {
      return { ok: false, reason: `${label} expected Null(${pattern.length}) at offset ${offset}` };
    }
    return {
      ok: true,
      score: pattern.length,
      reason: `matched Null(${pattern.length}) at ${label} offset ${offset} (+${pattern.length})`,
    };
  }

  if (pattern.kind === "any") {
    return {
      ok: true,
      score: 0,
      reason: `matched Any(${pattern.length}) at ${label} offset ${offset} (+0)`,
    };
  }

  const expected = hexToBytes(pattern.bytesHex);
  if (!equalBytes(slice, expected)) {
    return {
      ok: false,
      reason: `${label} expected ${pattern.kind} ${pattern.bytesHex} at offset ${offset}, got ${bytesToHex(slice)}`,
    };
  }

  if (pattern.kind === "string") {
    const score = 10 + length;
    return {
      ok: true,
      score,
      reason: `matched String("${pattern.value}") at ${label} offset ${offset} (+${score})`,
    };
  }

  const score = 20 + length;
  return {
    ok: true,
    score,
    reason: `matched Hex("${pattern.bytesHex}") at ${label} offset ${offset} (+${score})`,
  };
}

export function patternLength(pattern: PatternIr): number {
  if (pattern.kind === "string" || pattern.kind === "hex") return pattern.bytesHex.length / 2;
  return pattern.length;
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}
