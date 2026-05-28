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

test("parses inline State key and value schemas", () => {
  const ast = parseSchema(`
type UserId19 = Bytes(19)
State UserCurrencySlot = {
  Null(10)
  String("U")
  u8 currencySlot
  UserId19 user
  u8 userSlot
} -> {
  Currency currency
  Issuer issuer
} @priority(100)
`);

  assert.equal(ast.definitions.length, 2);
  const state = ast.definitions[1];
  assert.equal(state?.kind, "State");
  if (state?.kind !== "State") return;
  assert.equal(state.keySchema.kind, "inline");
  assert.equal(state.valueSchema.kind, "inline");
  assert.equal(state.attributes[0]?.name, "priority");
});

test("parses prefix attributes on fields and States", () => {
  const ast = parseSchema(`
StateKey ExampleKey {
  Null(31)
  @name("Slot")
  @description("Key slot")
  u8 slot
}
StateValue ExampleValue { Rest value }
@priority(100)
@name("Example")
State Example = ExampleKey -> ExampleValue
`);

  assert.equal(ast.definitions.length, 3);
  const key = ast.definitions[0];
  assert.equal(key?.kind, "StateKey");
  if (key?.kind !== "StateKey") return;
  assert.equal(key.fields[1]?.attributes[0]?.name, "name");
  assert.equal(key.fields[1]?.attributes[1]?.name, "description");

  const state = ast.definitions[2];
  assert.equal(state?.kind, "State");
  if (state?.kind !== "State") return;
  assert.equal(state.attributes[0]?.name, "priority");
  assert.equal(state.attributes[1]?.name, "name");
});

test("collects parse diagnostics", () => {
  assert.throws(() => parseSchema("StateKey {"), SchemaParseError);
});
