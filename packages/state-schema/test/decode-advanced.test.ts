import {
  DecodeError,
  NoMatchingStateError,
  compileSchema,
  decodeState,
  decodeStates,
  jsonReplacer,
} from "../src/index.js";
import { tryDecodeStruct } from "../src/runtime/decode.js";

describe("decode scoring and output", () => {
  test("chooses the highest-scoring matching State", () => {
    const schema = compileSchema(`
StateKey GenericKey { Any(32) }
StateKey SpecificKey {
  String("AA")
  Null(30)
}
StateValue Value { Rest value }
State Generic = GenericKey -> Value
State Specific = SpecificKey -> Value
`);

    const result = decodeState(schema, {
      key: "4141000000000000000000000000000000000000000000000000000000000000",
      value: "DEAD",
    });

    expect(result.state).toBe("Specific");
    expect(result.keySchema).toBe("SpecificKey");
    expect(result.value).toEqual({ value: "DEAD" });
    expect(result.match.score).toBeGreaterThan(0);
  });

  test("uses State priority as a deterministic tie breaker", () => {
    const schema = compileSchema(`
StateKey AKey { Any(32) }
StateValue AValue { Rest value }
State A = AKey -> AValue @priority(1)
StateKey BKey { Any(32) }
StateValue BValue { Rest value }
State B = BKey -> BValue @priority(2)
`);

    const result = decodeState(schema, {
      key: "0000000000000000000000000000000000000000000000000000000000000000",
      value: "",
    });

    expect(result.state).toBe("B");
    expect(result.match.reasons).toContain("priority +2");
  });
});

describe("decode value handling", () => {
  test("decodes variable-length bytes and rest fields in values", () => {
    const schema = compileSchema(`
StateKey Key { Null(32) }
StateValue Value {
  u8 length
  Bytes($length) data
  Rest tail
}
State Dynamic = Key -> Value
`);

    const result = decodeState(schema, {
      key: "0000000000000000000000000000000000000000000000000000000000000000",
      value: "03AABBCCDD",
    });

    expect(result.value).toEqual({
      length: 3,
      data: "AABBCC",
      tail: "DD",
    });
  });

  test("decodes batches with decodeStates", () => {
    const schema = compileSchema(`
StateKey Key { Null(32) }
StateValue Value { u8 value }
State One = Key -> Value
`);

    const results = decodeStates(schema, [
      {
        key: "0000000000000000000000000000000000000000000000000000000000000000",
        value: "01",
      },
      {
        key: "0000000000000000000000000000000000000000000000000000000000000000",
        value: "02",
      },
    ]);

    expect(results.map((result) => result.value)).toEqual([{ value: 1 }, { value: 2 }]);
  });

  test("returns State and field metadata in decoded output", () => {
    const schema = compileSchema(`
StateKey Key {
  Null(31)
  @name("Slot")
  u8 slot
}
StateValue Value {
  @name("Age")
  @description("User age")
  u8 age
}
@name("User Info")
@description("User profile data")
State UserInfo = Key -> Value
`);

    const result = decodeState(schema, {
      key: "0000000000000000000000000000000000000000000000000000000000000007",
      value: "2A",
    });

    expect(result.metadata).toEqual({
      name: "User Info",
      description: "User profile data",
    });
    expect(result.fields).toEqual({
      key: { slot: { name: "Slot" } },
      value: { age: { name: "Age", description: "User age" } },
    });
    expect(result.key).toEqual({ slot: 7 });
    expect(result.value).toEqual({ age: 42 });
  });

  test("returns default metadata names when attributes are omitted", () => {
    const schema = compileSchema(`
StateKey Key { Null(31) u8 slot }
StateValue Value { u8 age }
State UserInfo = Key -> Value
`);

    const result = decodeState(schema, {
      key: "0000000000000000000000000000000000000000000000000000000000000007",
      value: "2A",
    });

    expect(result.metadata).toEqual({ name: "UserInfo" });
    expect(result.fields).toEqual({
      key: { slot: { name: "slot" } },
      value: { age: { name: "age" } },
    });
  });

  test("returns uppercase raw input in decoded output", () => {
    const schema = compileSchema(`
StateKey Key { Null(32) }
StateValue Value { Rest value }
State S = Key -> Value
`);

    const result = decodeState(schema, {
      key: "0000000000000000000000000000000000000000000000000000000000000000",
      value: "abcd",
    });

    expect(result.raw).toEqual({
      key: "0000000000000000000000000000000000000000000000000000000000000000",
      value: "ABCD",
    });
  });
});

describe("decode errors", () => {
  test("disqualifies fixed-length value candidates when trailing bytes remain", () => {
    const schema = compileSchema(`
StateKey Key { Null(32) }
StateValue Value { u16be value }
State S = Key -> Value
`);

    expect(() =>
      decodeState(schema, {
        key: "0000000000000000000000000000000000000000000000000000000000000000",
        value: "000102",
      }),
    ).toThrow(NoMatchingStateError);
  });

  test("throws DecodeError when a field exceeds the available input", () => {
    const schema = compileSchema(`
StateKey Key { Null(32) }
StateValue Value { u16be value }
State S = Key -> Value
`);

    expect(() =>
      decodeState(schema, {
        key: "0000000000000000000000000000000000000000000000000000000000000000",
        value: "00",
      }),
    ).toThrow(DecodeError);
  });

  test("throws DecodeError when Bytes($field) does not reference an integer length", () => {
    expect(() =>
      tryDecodeStruct(
        {
          kind: "StateValue",
          name: "BadRuntimeValue",
          fixedLength: null,
          fields: [
            {
              kind: "field",
              name: "length",
              valueType: { kind: "bytes", length: 1 },
              sourceTypeName: "Bytes",
              metadata: { name: "length" },
            },
            {
              kind: "field",
              name: "data",
              valueType: { kind: "bytesRef", field: "length" },
              sourceTypeName: "Bytes",
              metadata: { name: "data" },
            },
          ],
        },
        Uint8Array.from([1, 2]),
        "value",
      ),
    ).toThrow(DecodeError);
  });
});

describe("json serialization", () => {
  test("serializes bigint values with jsonReplacer", () => {
    expect(JSON.stringify({ value: 1n }, jsonReplacer)).toBe('{"value":"1"}');
  });
});
