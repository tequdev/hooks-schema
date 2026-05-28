import assert from "node:assert/strict";
import test from "node:test";
import { SchemaParseError } from "../src/index.js";
import { lex } from "../src/lexer.js";
import { assertDiagnosticCodes } from "./test-helpers.js";

test("lexes identifiers, punctuation, field references, numbers, and escaped strings", () => {
  const tokens = lex('State A = K -> V @priority(-10) Bytes($len) String("A\\nB\\"\\\\\\t")');

  assert.deepEqual(
    tokens.map((token) => token.kind),
    [
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
    ],
  );
  assert.equal(tokens[9]?.value, "-10");
  assert.equal(tokens[13]?.value, "len");
  assert.equal(tokens[17]?.value, 'A\nB"\\\t');
});

test("skips line and block comments while preserving following token spans", () => {
  const tokens = lex(`// ignored
StateKey /* ignored */ K {
  Null(32)
}`);

  assert.equal(tokens[0]?.value, "StateKey");
  assert.equal(tokens[0]?.span.line, 2);
  assert.equal(tokens[1]?.value, "K");
  assert.equal(tokens[1]?.span.line, 2);
});

test("reports lexical diagnostics for malformed source", () => {
  assert.throws(
    () => lex("StateKey $  @bad(`"),
    (error) => {
      assert.ok(error instanceof SchemaParseError);
      assertDiagnosticCodes(error.diagnostics, [
        "parse.invalidFieldRef",
        "parse.unexpectedCharacter",
      ]);
      return true;
    },
  );
});

test("reports unterminated block comments, strings, and invalid escapes", () => {
  assert.throws(
    () => lex("/* no close"),
    (error) => {
      assert.ok(error instanceof SchemaParseError);
      assertDiagnosticCodes(error.diagnostics, ["parse.unterminatedBlockComment"]);
      return true;
    },
  );

  assert.throws(
    () => lex('"bad\\q'),
    (error) => {
      assert.ok(error instanceof SchemaParseError);
      assertDiagnosticCodes(error.diagnostics, ["parse.invalidEscape", "parse.unterminatedString"]);
      return true;
    },
  );
});
