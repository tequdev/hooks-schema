import assert from "node:assert/strict";
import test from "node:test";
import {
  SchemaValidationError,
  astToIr,
  compileSchema,
  parseSchema,
  validateSchema,
} from "../src/index.js";

test("compiles aliases, inline structs, patterns, priorities, and dynamic value fields to IR", () => {
  const ir = compileSchema(`
type UserId = Bytes(19)
State Inline = {
  Hex("abcd")
  Any(1)
  Null(8)
  String("Z")
  Account account
} -> {
  u8 length
  Bytes($length) data
  UserId user
  Rest tail
} @priority(-5)
`);

  assert.equal(ir.version, 1);
  assert.deepEqual(ir.types.UserId, { kind: "bytes", length: 19 });
  assert.equal(ir.stateKeys.__xhs_InlineKey?.fixedLength, 32);
  assert.equal(ir.stateValues.__xhs_InlineValue?.fixedLength, null);
  assert.deepEqual(ir.states, [
    {
      name: "Inline",
      keySchema: "__xhs_InlineKey",
      valueSchema: "__xhs_InlineValue",
      priority: -5,
    },
  ]);

  assert.deepEqual(ir.stateKeys.__xhs_InlineKey?.fields.slice(0, 4), [
    { kind: "pattern", pattern: { kind: "hex", bytesHex: "ABCD" }, length: 2 },
    { kind: "pattern", pattern: { kind: "any", length: 1 }, length: 1 },
    { kind: "pattern", pattern: { kind: "null", length: 8 }, length: 8 },
    {
      kind: "pattern",
      pattern: { kind: "string", value: "Z", bytesHex: "5A" },
      length: 1,
    },
  ]);
  assert.deepEqual(ir.stateValues.__xhs_InlineValue?.fields, [
    {
      kind: "field",
      name: "length",
      valueType: { kind: "u8", length: 1 },
      sourceTypeName: "u8",
    },
    {
      kind: "field",
      name: "data",
      valueType: { kind: "bytesRef", field: "length" },
      sourceTypeName: "Bytes",
    },
    {
      kind: "field",
      name: "user",
      valueType: { kind: "bytes", length: 19 },
      sourceTypeName: "UserId",
    },
    {
      kind: "field",
      name: "tail",
      valueType: { kind: "rest" },
      sourceTypeName: "Rest",
    },
  ]);
});

test("defaults State priority to zero and resolves referenced structs", () => {
  const ir = compileSchema(`
StateKey Key { Null(32) }
StateValue Value { u16be value }
State Ref = Key -> Value
`);

  assert.equal(ir.stateKeys.Key?.fixedLength, 32);
  assert.equal(ir.stateValues.Value?.fixedLength, 2);
  assert.deepEqual(ir.states[0], {
    name: "Ref",
    keySchema: "Key",
    valueSchema: "Value",
    priority: 0,
  });
});

test("astToIr revalidates ASTs before resolving", () => {
  const ast = parseSchema(`
StateKey BadKey { Null(31) }
StateValue Value { Rest value }
State Bad = BadKey -> Value
`);

  assert.ok(validateSchema(ast).length > 0);
  assert.throws(() => astToIr(ast), SchemaValidationError);
});
