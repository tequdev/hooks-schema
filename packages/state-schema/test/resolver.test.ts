import {
  BUILTIN_TYPES,
  SchemaValidationError,
  astToIr,
  compileSchema,
  parseSchema,
  validateSchema,
} from "../src/index.js";

describe("resolver", () => {
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

    expect(ir.version).toBe(1);
    expect(ir.types.UserId).toEqual({ kind: "bytes", length: 19 });
    expect(ir.stateKeys.__xhs_InlineKey?.fixedLength).toBe(32);
    expect(ir.stateValues.__xhs_InlineValue?.fixedLength).toBe(null);
    expect(ir.states).toEqual([
      {
        name: "Inline",
        keySchema: "__xhs_InlineKey",
        valueSchema: "__xhs_InlineValue",
        priority: -5,
        metadata: { name: "Inline" },
      },
    ]);

    expect(ir.stateKeys.__xhs_InlineKey?.fields.slice(0, 4)).toEqual([
      { kind: "pattern", pattern: { kind: "hex", bytesHex: "ABCD" }, length: 2 },
      { kind: "pattern", pattern: { kind: "any", length: 1 }, length: 1 },
      { kind: "pattern", pattern: { kind: "null", length: 8 }, length: 8 },
      {
        kind: "pattern",
        pattern: { kind: "string", value: "Z", bytesHex: "5A" },
        length: 1,
      },
    ]);
    expect(ir.stateValues.__xhs_InlineValue?.fields).toEqual([
      {
        kind: "field",
        name: "length",
        valueType: { kind: "u8", length: 1 },
        sourceTypeName: "u8",
        metadata: { name: "length" },
      },
      {
        kind: "field",
        name: "data",
        valueType: { kind: "bytesRef", field: "length" },
        sourceTypeName: "Bytes",
        metadata: { name: "data" },
      },
      {
        kind: "field",
        name: "user",
        valueType: { kind: "bytes", length: 19 },
        sourceTypeName: "UserId",
        metadata: { name: "user" },
      },
      {
        kind: "field",
        name: "tail",
        valueType: { kind: "rest" },
        sourceTypeName: "Rest",
        metadata: { name: "tail" },
      },
    ]);
  });

  test("defaults State priority to zero and resolves referenced structs", () => {
    const ir = compileSchema(`
StateKey Key { Null(32) }
StateValue Value { u16be value }
State Ref = Key -> Value
`);

    expect(ir.stateKeys.Key?.fixedLength).toBe(32);
    expect(ir.stateValues.Value?.fixedLength).toBe(2);
    expect(ir.states[0]).toEqual({
      name: "Ref",
      keySchema: "Key",
      valueSchema: "Value",
      priority: 0,
      metadata: { name: "Ref" },
    });
  });

  test("resolves builtin byte types in schema IR", () => {
    const ir = compileSchema(`
StateKey Key { Null(32) }
StateValue Value {
  Account account
  Currency currency
  Issuer issuer
}
State Builtins = Key -> Value
`);

    expect(ir.builtins).toEqual(BUILTIN_TYPES);
    expect(ir.stateValues.Value?.fixedLength).toBe(60);
    expect(ir.stateValues.Value?.fields).toEqual([
      {
        kind: "field",
        name: "account",
        valueType: { kind: "bytes", length: 20 },
        sourceTypeName: "Account",
        metadata: { name: "account" },
      },
      {
        kind: "field",
        name: "currency",
        valueType: { kind: "bytes", length: 20 },
        sourceTypeName: "Currency",
        metadata: { name: "currency" },
      },
      {
        kind: "field",
        name: "issuer",
        valueType: { kind: "bytes", length: 20 },
        sourceTypeName: "Issuer",
        metadata: { name: "issuer" },
      },
    ]);
  });

  test("resolves all numeric builtin types in schema IR", () => {
    const ir = compileSchema(`
StateKey Key { Null(32) }
StateValue Value {
  u8 a
  u16le b
  u16be c
  u32le d
  u32be e
  u64le f
  u64be g
}
State Numerics = Key -> Value
`);

    expect(ir.stateValues.Value?.fixedLength).toBe(29);
    expect(
      ir.stateValues.Value?.fields.map((field) =>
        field.kind === "field" ? field.valueType : null,
      ),
    ).toEqual([
      { kind: "u8", length: 1 },
      { kind: "u16", endian: "le", length: 2 },
      { kind: "u16", endian: "be", length: 2 },
      { kind: "u32", endian: "le", length: 4 },
      { kind: "u32", endian: "be", length: 4 },
      { kind: "u64", endian: "le", length: 8 },
      { kind: "u64", endian: "be", length: 8 },
    ]);
  });

  test("compiles State and field metadata to IR", () => {
    const ir = compileSchema(`
StateKey Key {
  Null(31)
  @name("Slot") @description("Key slot")
  u8 slot
}
StateValue Value {
  @name("Age")
  @description("User age")
  u8 age
}
@priority(100)
@name("User Info")
@description("User profile data")
State UserInfo = Key -> Value
`);

    expect(ir.states[0]?.metadata).toEqual({
      name: "User Info",
      description: "User profile data",
    });
    expect(ir.stateKeys.Key?.fields[1]).toEqual({
      kind: "field",
      name: "slot",
      valueType: { kind: "u8", length: 1 },
      sourceTypeName: "u8",
      metadata: { name: "Slot", description: "Key slot" },
    });
    expect(ir.stateValues.Value?.fields[0]).toEqual({
      kind: "field",
      name: "age",
      valueType: { kind: "u8", length: 1 },
      sourceTypeName: "u8",
      metadata: { name: "Age", description: "User age" },
    });
  });

  test("astToIr revalidates ASTs before resolving", () => {
    const ast = parseSchema(`
StateKey BadKey { Null(31) }
StateValue Value { Rest value }
State Bad = BadKey -> Value
`);

    expect(validateSchema(ast).length).toBeGreaterThan(0);
    expect(() => astToIr(ast)).toThrow(SchemaValidationError);
  });
});
