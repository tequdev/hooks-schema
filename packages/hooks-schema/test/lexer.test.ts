import { SchemaParseError } from "../src/index.js";
import { lex } from "../src/lexer.js";
import { assertDiagnosticCodes } from "./test-helpers.js";

describe("lexer", () => {
  test("lexes identifiers, punctuation, field references, numbers, and escaped strings", () => {
    const tokens = lex('State A = K -> V @priority(-10) Bytes($len) String("A\\nB\\"\\\\\\t")');

    expect(tokens.map((token) => token.kind)).toEqual([
      "identifier",
      "identifier",
      "=",
      "identifier",
      "->",
      "identifier",
      "@",
      "identifier",
      "(",
      "number",
      ")",
      "identifier",
      "(",
      "fieldRef",
      ")",
      "identifier",
      "(",
      "string",
      ")",
      "eof",
    ]);
    expect(tokens[9]?.value).toBe("-10");
    expect(tokens[13]?.value).toBe("len");
    expect(tokens[17]?.value).toBe('A\nB"\\\t');
  });

  test("skips line and block comments while preserving following token spans", () => {
    const tokens = lex(`// ignored
StateKey /* ignored */ K {
  Null(32)
}`);

    expect(tokens[0]?.value).toBe("StateKey");
    expect(tokens[0]?.span.line).toBe(2);
    expect(tokens[1]?.value).toBe("K");
    expect(tokens[1]?.span.line).toBe(2);
  });

  test("reports lexical diagnostics for malformed source", () => {
    expect(() => lex("StateKey $  @bad(`")).toThrow(SchemaParseError);

    try {
      lex("StateKey $  @bad(`");
    } catch (error) {
      expect(error).toBeInstanceOf(SchemaParseError);
      assertDiagnosticCodes((error as SchemaParseError).diagnostics, [
        "parse.invalidFieldRef",
        "parse.unexpectedCharacter",
      ]);
    }
  });

  test("reports unterminated block comments, strings, and invalid escapes", () => {
    expect(() => lex("/* no close")).toThrow(SchemaParseError);
    try {
      lex("/* no close");
    } catch (error) {
      expect(error).toBeInstanceOf(SchemaParseError);
      assertDiagnosticCodes((error as SchemaParseError).diagnostics, [
        "parse.unterminatedBlockComment",
      ]);
    }

    expect(() => lex('"bad\\q')).toThrow(SchemaParseError);
    try {
      lex('"bad\\q');
    } catch (error) {
      expect(error).toBeInstanceOf(SchemaParseError);
      assertDiagnosticCodes((error as SchemaParseError).diagnostics, [
        "parse.invalidEscape",
        "parse.unterminatedString",
      ]);
    }
  });
});
