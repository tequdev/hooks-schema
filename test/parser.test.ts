import assert from "node:assert/strict";
import test from "node:test";
import { SchemaParseError, parseSchema } from "../src/index.js";

test("parses field attributes and comments", () => {
  const ast = parseSchema(`
// line comment
StateKey ExampleKey {
  Null(31)
  u8 slot @format("decimal")
}
/*
 block comment
*/
StateValue ExampleValue { Rest value }
State Example = ExampleKey -> ExampleValue @priority(-1)
`);

  assert.equal(ast.definitions.length, 3);
});

test("collects parse diagnostics", () => {
  assert.throws(() => parseSchema("StateKey {"), SchemaParseError);
});
