import { DecodeInputError } from "../src/index.js";
import { bytesToHex, hexToBytes, isAscii, isHex } from "../src/runtime/bytes.js";
import { matchPattern, patternLength } from "../src/runtime/match.js";
import { decodeNumeric, decodeXflDecimal } from "../src/runtime/numeric.js";

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
  test.each([
    ["u8", { kind: "u8", length: 1 }, 1],
    ["u16 little-endian", { kind: "u16", endian: "le", length: 2 }, 0x0201],
    ["u16 big-endian", { kind: "u16", endian: "be", length: 2 }, 0x0102],
    ["u32 little-endian", { kind: "u32", endian: "le", length: 4 }, 0x04030201],
    ["u32 big-endian", { kind: "u32", endian: "be", length: 4 }, 0x01020304],
    ["u64 little-endian", { kind: "u64", endian: "le", length: 8 }, 0x0807060504030201n],
    ["u64 big-endian", { kind: "u64", endian: "be", length: 8 }, 0x0102030405060708n],
  ] as const)("decodes %s", (_label, type, expected) => {
    const bytes = Uint8Array.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);

    expect(decodeNumeric(type, bytes, 0)).toBe(expected);
  });

  test.each([
    [0n, "0"],
    [6089866696204910592n, "1"],
    [1478180677777522688n, "-1"],
    [6092008288858500385n, "3.141592653589793"],
    [1480322270431112481n, "-3.141592653589793"],
    [1n << 63n, "Invalid XFL"],
  ])("formats XFL %s as %s", (input, expected) => {
    expect(decodeXflDecimal(input)).toBe(expected);
  });
});

describe("runtime pattern matching", () => {
  test.each([
    [
      "Null",
      { kind: "null", length: 1 },
      0,
      { ok: true, score: 1, reason: "matched Null(1) at key offset 0 (+1)" },
    ],
    [
      "Any",
      { kind: "any", length: 1 },
      1,
      { ok: true, score: 0, reason: "matched Any(1) at key offset 1 (+0)" },
    ],
    [
      "String",
      { kind: "string", value: "A", bytesHex: "41" },
      2,
      { ok: true, score: 11, reason: 'matched String("A") at key offset 2 (+11)' },
    ],
    [
      "Hex",
      { kind: "hex", bytesHex: "AB" },
      3,
      { ok: true, score: 21, reason: 'matched Hex("AB") at key offset 3 (+21)' },
    ],
  ] as const)("matches %s patterns with scores", (_label, pattern, offset, expected) => {
    const input = hexToBytes("000041AB");

    expect(matchPattern(pattern, input, offset, "key")).toEqual(expected);
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

  test.each([
    ["Null", { kind: "null", length: 4 }, 4],
    ["Any", { kind: "any", length: 3 }, 3],
    ["String", { kind: "string", value: "AB", bytesHex: "4142" }, 2],
    ["Hex", { kind: "hex", bytesHex: "DEAD" }, 2],
  ] as const)("calculates %s pattern length", (_label, pattern, expected) => {
    expect(patternLength(pattern)).toBe(expected);
  });
});
