import assert from "node:assert/strict";
import test from "node:test";
import { parseSchema, validateSchema } from "../src/index.js";
import { assertIncludesDiagnosticCodes } from "./test-helpers.js";

function diagnosticsFor(schemaText: string) {
  return validateSchema(parseSchema(schemaText));
}

test("accepts fixed 32-byte keys and variable-length values", () => {
  const diagnostics = diagnosticsFor(`
type Blob3 = Bytes(3)
StateKey GoodKey {
  String("ID")
  Null(7)
  Blob3 shard
  Account account
}
StateValue GoodValue {
  u8 length
  Bytes($length) data
  Rest tail
}
State Good = GoodKey -> GoodValue @priority(7)
`);

  assert.deepEqual(diagnostics, []);
});

test("accepts State and field metadata attributes", () => {
  const diagnostics = diagnosticsFor(`
StateKey Key {
  Null(31)
  @name("Slot")
  @description("Key slot")
  u8 slot
}
StateValue Value {
  @name("Age") @description("User age")
  u8 age
}
@priority(7)
@name("User Info")
@description("User profile data")
State Good = Key -> Value
`);

  assert.deepEqual(diagnostics, []);
});

test("reports duplicate, reserved, and conflicting definitions", () => {
  const diagnostics = diagnosticsFor(`
type Account = Bytes(20)
type __xhs_Private = Bytes(1)
type Same = Bytes(1)
StateKey Same { Null(32) }
`);

  assertIncludesDiagnosticCodes(diagnostics, [
    "schema.builtinAlias",
    "schema.reservedName",
    "schema.duplicateDefinition",
  ]);
});

test("validates aliases and length arguments", () => {
  const diagnostics = diagnosticsFor(`
type BadTarget = u8
type Negative = Bytes(-1)
StateKey BadKey {
  Negative value
  Null(32)
}
StateValue BadValue { Rest value }
State Bad = BadKey -> BadValue
`);

  assertIncludesDiagnosticCodes(diagnostics, [
    "schema.invalidAlias",
    "schema.negativeLength",
    "schema.stateKeyLength",
  ]);
});

test("validates field names, patterns, and dynamic bytes references", () => {
  const diagnostics = diagnosticsFor(`
StateKey BadKey {
  u8 duplicate
  u8 duplicate
  Rest rest
  Bytes($later) bad
  u8 later
}
StateValue BadValue {
  Null(1)
  String("あ")
  Hex("ABC")
  Any("x")
  Rest first
  u8 afterRest
  Bytes($afterRest) ok
  Bytes($first) badRef
  Account(1) account
  u16le(1) number
  Unknown field
}
State Bad = BadKey -> BadValue
`);

  assertIncludesDiagnosticCodes(diagnostics, [
    "schema.duplicateField",
    "schema.stateKeyRest",
    "schema.stateKeyDynamicBytes",
    "schema.bytesRefUnknown",
    "schema.stateKeyLength",
    "schema.stateKeyVariable",
    "schema.stringAscii",
    "schema.hexInvalid",
    "schema.lengthArg",
    "schema.restMustBeLast",
    "schema.bytesRefInvalidType",
    "schema.builtinArgs",
    "schema.numericArgs",
    "schema.unknownType",
  ]);
});

test("validates state references and attributes", () => {
  const diagnostics = diagnosticsFor(`
StateKey GoodKey { Null(32) }
StateValue GoodValue { Rest value }
State Bad = MissingKey -> MissingValue @other @priority("high") @priority(1)
@name(1)
State BadMetadata = GoodKey -> GoodValue
State InlineBad = {
  Null(31)
  Rest rest
} -> {
  Rest value
}
`);

  assertIncludesDiagnosticCodes(diagnostics, [
    "schema.unknownStateKey",
    "schema.unknownStateValue",
    "schema.unsupportedStateAttribute",
    "schema.invalidPriority",
    "schema.duplicatePriority",
    "schema.invalidStateMetadata",
    "schema.stateKeyRest",
    "schema.stateKeyLength",
    "schema.stateKeyVariable",
  ]);
});

test("reports unsupported field attributes", () => {
  const diagnostics = diagnosticsFor(`
StateKey Key {
  Null(31)
  u8 slot @format("decimal")
}
StateValue Value { Rest value }
State S = Key -> Value
`);

  assertIncludesDiagnosticCodes(diagnostics, ["schema.unsupportedFieldAttribute"]);
});
