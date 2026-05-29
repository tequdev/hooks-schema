import { DecodeInputError } from "../src/index.js";
import { bytesToHex, hexToBytes, isAscii, isHex } from "../src/runtime/bytes.js";
import { matchPattern, patternLength } from "../src/runtime/match.js";
import { decodeNumeric } from "../src/runtime/numeric.js";

describe("runtime bytes", () => {
  test("converts hex strings to bytes and bytes to uppercase hex", () => {
    const bytes = hexToBytes("00abCDff");

    expect(Array.from(bytes)).toEqual([0, 171, 205, 255]);
    expect(bytesToHex(bytes)).toBe("00ABCDFF");
  });

  test("rejects malformed hex input", () => {
    for (const input of ["0x00", "00 11", "ABC", "GG"]) {
      expect(() => hexToBytes(input)).toThrow(DecodeInputError);
    }
  });

  test("checks ASCII and hex helper predicates", () => {
    expect(isAscii("ABC\t")).toBe(true);
    expect(isAscii("あ")).toBe(false);
    expect(isHex("00aA")).toBe(true);
    expect(isHex("ABC")).toBe(false);
    expect(isHex("ZZ")).toBe(false);
  });
});

describe("runtime numeric decoding", () => {
  test("decodes unsigned numeric values with configured endian", () => {
    const bytes = Uint8Array.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);

    expect(decodeNumeric({ kind: "u8", length: 1 }, bytes, 0)).toBe(1);
    expect(decodeNumeric({ kind: "u16", endian: "le", length: 2 }, bytes, 0)).toBe(0x0201);
    expect(decodeNumeric({ kind: "u16", endian: "be", length: 2 }, bytes, 0)).toBe(0x0102);
    expect(decodeNumeric({ kind: "u32", endian: "le", length: 4 }, bytes, 0)).toBe(0x04030201);
    expect(decodeNumeric({ kind: "u32", endian: "be", length: 4 }, bytes, 0)).toBe(0x01020304);
    expect(decodeNumeric({ kind: "u64", endian: "le", length: 8 }, bytes, 0)).toBe(
      0x0807060504030201n,
    );
    expect(decodeNumeric({ kind: "u64", endian: "be", length: 8 }, bytes, 0)).toBe(
      0x0102030405060708n,
    );
  });
});

describe("runtime pattern matching", () => {
  test("matches null, any, string, and hex patterns with scores", () => {
    const input = hexToBytes("000041AB");

    expect(matchPattern({ kind: "null", length: 1 }, input, 0, "key")).toEqual({
      ok: true,
      score: 1,
      reason: "matched Null(1) at key offset 0 (+1)",
    });
    expect(matchPattern({ kind: "any", length: 1 }, input, 1, "key")).toEqual({
      ok: true,
      score: 0,
      reason: "matched Any(1) at key offset 1 (+0)",
    });
    expect(matchPattern({ kind: "string", value: "A", bytesHex: "41" }, input, 2, "key")).toEqual({
      ok: true,
      score: 11,
      reason: 'matched String("A") at key offset 2 (+11)',
    });
    expect(matchPattern({ kind: "hex", bytesHex: "AB" }, input, 3, "key")).toEqual({
      ok: true,
      score: 21,
      reason: 'matched Hex("AB") at key offset 3 (+21)',
    });
  });

  test("reports pattern mismatches and short input", () => {
    expect(matchPattern({ kind: "null", length: 1 }, hexToBytes("01"), 0, "key")).toEqual({
      ok: false,
      reason: "key expected Null(1) at offset 0",
    });
    expect(matchPattern({ kind: "hex", bytesHex: "ABCD" }, hexToBytes("AB"), 0, "key")).toEqual({
      ok: false,
      reason: "key expected 2 bytes at offset 0, got 1",
    });
    expect(
      matchPattern({ kind: "string", value: "B", bytesHex: "42" }, hexToBytes("41"), 0, "key"),
    ).toEqual({
      ok: false,
      reason: "key expected string 42 at offset 0, got 41",
    });
  });

  test("calculates pattern lengths", () => {
    expect(patternLength({ kind: "null", length: 4 })).toBe(4);
    expect(patternLength({ kind: "any", length: 3 })).toBe(3);
    expect(patternLength({ kind: "string", value: "AB", bytesHex: "4142" })).toBe(2);
    expect(patternLength({ kind: "hex", bytesHex: "DEAD" })).toBe(2);
  });
});
