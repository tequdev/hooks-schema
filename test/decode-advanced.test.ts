import assert from "node:assert/strict";
import test from "node:test";
import {
  DecodeError,
  NoMatchingStateError,
  compileSchema,
  decodeState,
  decodeStates,
  jsonReplacer,
} from "../src/index.js";
import { tryDecodeStruct } from "../src/runtime/decode.js";

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

  assert.equal(result.state, "Specific");
  assert.equal(result.keySchema, "SpecificKey");
  assert.deepEqual(result.value, { value: "DEAD" });
  assert.ok(result.match.score > 0);
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

  assert.equal(result.state, "B");
  assert.ok(result.match.reasons.includes("priority +2"));
});

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

  assert.deepEqual(result.value, {
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

  assert.deepEqual(
    results.map((result) => result.value),
    [{ value: 1 }, { value: 2 }],
  );
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

  assert.deepEqual(result.raw, {
    key: "0000000000000000000000000000000000000000000000000000000000000000",
    value: "ABCD",
  });
});

test("disqualifies fixed-length value candidates when trailing bytes remain", () => {
  const schema = compileSchema(`
StateKey Key { Null(32) }
StateValue Value { u16be value }
State S = Key -> Value
`);

  assert.throws(
    () =>
      decodeState(schema, {
        key: "0000000000000000000000000000000000000000000000000000000000000000",
        value: "000102",
      }),
    NoMatchingStateError,
  );
});

test("throws DecodeError when a field exceeds the available input", () => {
  const schema = compileSchema(`
StateKey Key { Null(32) }
StateValue Value { u16be value }
State S = Key -> Value
`);

  assert.throws(
    () =>
      decodeState(schema, {
        key: "0000000000000000000000000000000000000000000000000000000000000000",
        value: "00",
      }),
    DecodeError,
  );
});

test("throws DecodeError when Bytes($field) does not reference an integer length", () => {
  assert.throws(
    () =>
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
            },
            {
              kind: "field",
              name: "data",
              valueType: { kind: "bytesRef", field: "length" },
              sourceTypeName: "Bytes",
            },
          ],
        },
        Uint8Array.from([1, 2]),
        "value",
      ),
    DecodeError,
  );
});

test("serializes bigint values with jsonReplacer", () => {
  assert.equal(JSON.stringify({ value: 1n }, jsonReplacer), '{"value":"1"}');
});
