import { SchemaParseError, parseSchema } from "../src/index.js";

describe("parser", () => {
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

    expect(ast.definitions).toHaveLength(3);
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

    expect(ast.definitions).toHaveLength(2);
    const state = ast.definitions[1];
    expect(state?.kind).toBe("State");
    if (state?.kind !== "State") return;
    expect(state.keySchema.kind).toBe("inline");
    expect(state.valueSchema.kind).toBe("inline");
    expect(state.attributes[0]?.name).toBe("priority");
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

    expect(ast.definitions).toHaveLength(3);
    const key = ast.definitions[0];
    expect(key?.kind).toBe("StateKey");
    if (key?.kind !== "StateKey") return;
    expect(key.fields[1]?.attributes[0]?.name).toBe("name");
    expect(key.fields[1]?.attributes[1]?.name).toBe("description");

    const state = ast.definitions[2];
    expect(state?.kind).toBe("State");
    if (state?.kind !== "State") return;
    expect(state.attributes[0]?.name).toBe("priority");
    expect(state.attributes[1]?.name).toBe("name");
  });

  test("keeps newline prefix attributes separate from previous fields", () => {
    const ast = parseSchema(`
StateValue ExampleValue {
  u8 first
  @name("Second")
  u8 second
}
`);

    const value = ast.definitions[0];
    expect(value?.kind).toBe("StateValue");
    if (value?.kind !== "StateValue") return;
    expect(value.fields[0]?.attributes).toEqual([]);
    expect(value.fields[1]?.attributes[0]?.name).toBe("name");
  });

  test("collects parse diagnostics", () => {
    expect(() => parseSchema("StateKey {")).toThrow(SchemaParseError);
  });
});
