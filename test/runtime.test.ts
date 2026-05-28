import assert from "node:assert/strict";
import test from "node:test";
import { DecodeInputError } from "../src/index.js";
import { bytesToHex, hexToBytes, isAscii, isHex } from "../src/runtime/bytes.js";
import { matchPattern, patternLength } from "../src/runtime/match.js";
import { decodeNumeric } from "../src/runtime/numeric.js";

test("converts hex strings to bytes and bytes to uppercase hex", () => {
  const bytes = hexToBytes("00abCDff");

  assert.deepEqual(Array.from(bytes), [0, 171, 205, 255]);
  assert.equal(bytesToHex(bytes), "00ABCDFF");
});

test("rejects malformed hex input", () => {
  for (const input of ["0x00", "00 11", "ABC", "GG"]) {
    assert.throws(() => hexToBytes(input), DecodeInputError);
  }
});

test("checks ASCII and hex helper predicates", () => {
  assert.equal(isAscii("ABC\t"), true);
  assert.equal(isAscii("あ"), false);
  assert.equal(isHex("00aA"), true);
  assert.equal(isHex("ABC"), false);
  assert.equal(isHex("ZZ"), false);
});

test("decodes unsigned numeric values with configured endian", () => {
  const bytes = Uint8Array.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);

  assert.equal(decodeNumeric({ kind: "u8", length: 1 }, bytes, 0), 1);
  assert.equal(decodeNumeric({ kind: "u16", endian: "le", length: 2 }, bytes, 0), 0x0201);
  assert.equal(decodeNumeric({ kind: "u16", endian: "be", length: 2 }, bytes, 0), 0x0102);
  assert.equal(decodeNumeric({ kind: "u32", endian: "le", length: 4 }, bytes, 0), 0x04030201);
  assert.equal(decodeNumeric({ kind: "u32", endian: "be", length: 4 }, bytes, 0), 0x01020304);
  assert.equal(
    decodeNumeric({ kind: "u64", endian: "le", length: 8 }, bytes, 0),
    0x0807060504030201n,
  );
  assert.equal(
    decodeNumeric({ kind: "u64", endian: "be", length: 8 }, bytes, 0),
    0x0102030405060708n,
  );
});

test("matches null, any, string, and hex patterns with scores", () => {
  const input = hexToBytes("000041AB");

  assert.deepEqual(matchPattern({ kind: "null", length: 1 }, input, 0, "key"), {
    ok: true,
    score: 1,
    reason: "matched Null(1) at key offset 0 (+1)",
  });
  assert.deepEqual(matchPattern({ kind: "any", length: 1 }, input, 1, "key"), {
    ok: true,
    score: 0,
    reason: "matched Any(1) at key offset 1 (+0)",
  });
  assert.deepEqual(matchPattern({ kind: "string", value: "A", bytesHex: "41" }, input, 2, "key"), {
    ok: true,
    score: 11,
    reason: 'matched String("A") at key offset 2 (+11)',
  });
  assert.deepEqual(matchPattern({ kind: "hex", bytesHex: "AB" }, input, 3, "key"), {
    ok: true,
    score: 21,
    reason: 'matched Hex("AB") at key offset 3 (+21)',
  });
});

test("reports pattern mismatches and short input", () => {
  assert.deepEqual(matchPattern({ kind: "null", length: 1 }, hexToBytes("01"), 0, "key"), {
    ok: false,
    reason: "key expected Null(1) at offset 0",
  });
  assert.deepEqual(matchPattern({ kind: "hex", bytesHex: "ABCD" }, hexToBytes("AB"), 0, "key"), {
    ok: false,
    reason: "key expected 2 bytes at offset 0, got 1",
  });
  assert.deepEqual(
    matchPattern({ kind: "string", value: "B", bytesHex: "42" }, hexToBytes("41"), 0, "key"),
    {
      ok: false,
      reason: "key expected string 42 at offset 0, got 41",
    },
  );
});

test("calculates pattern lengths", () => {
  assert.equal(patternLength({ kind: "null", length: 4 }), 4);
  assert.equal(patternLength({ kind: "any", length: 3 }), 3);
  assert.equal(patternLength({ kind: "string", value: "AB", bytesHex: "4142" }), 2);
  assert.equal(patternLength({ kind: "hex", bytesHex: "DEAD" }), 2);
});
