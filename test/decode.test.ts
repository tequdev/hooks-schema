import assert from "node:assert/strict";
import test from "node:test";
import {
  AmbiguousMatchError,
  DecodeInputError,
  NoMatchingStateError,
  SchemaValidationError,
  compileSchema,
  decodeState,
} from "../src/index.js";

const schemaText = `
type Bitmap256 = Bytes(32)
type UserId19 = Bytes(19)

StateKey UserInfoKey {
  Null(11)
  String("U")
  Account user
}

StateValue UserInfoValue {
  Bitmap256 currencySlots
}

State UserInfo = UserInfoKey -> UserInfoValue @priority(100)

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

StateKey SettingsHKey {
  String("SH")
  Null(30)
}

StateValue U64Value {
  u64le value
}

State SettingsH = SettingsHKey -> U64Value @priority(50)
`;

test("decodes UserInfo", () => {
  const schema = compileSchema(schemaText);
  const result = decodeState(schema, {
    key: "00000000000000000000005524B374EFE44FC572ED6E4DC112772C26BF754351",
    value: "0100000000000000000000000000000000000000000000000000000000000000",
  });

  assert.equal(result.state, "UserInfo");
  assert.deepEqual(result.key, {
    user: "24B374EFE44FC572ED6E4DC112772C26BF754351",
  });
  assert.deepEqual(result.value, {
    currencySlots: "0100000000000000000000000000000000000000000000000000000000000000",
  });
  assert.ok(result.match.reasons.some((reason) => reason.includes('String("U")')));
});

test("decodes UserCurrencySlot with 19-byte user id", () => {
  const schema = compileSchema(schemaText);
  const result = decodeState(schema, {
    key: "000000000000000000005501000000000000000000000004D01730E501961300",
    value: "00000000000000000000000000000000000000000000000000000000000000000000000000000000",
  });

  assert.equal(result.state, "UserCurrencySlot");
  assert.deepEqual(result.key, {
    currencySlot: 1,
    user: "000000000000000000000004D01730E5019613",
    userSlot: 0,
  });
});

test("decodes u64 as bigint", () => {
  const schema = compileSchema(schemaText);
  const result = decodeState(schema, {
    key: "5348000000000000000000000000000000000000000000000000000000000000",
    value: "0100000000000000",
  });

  assert.equal(result.state, "SettingsH");
  assert.deepEqual(result.value, { value: 1n });
});

test("uses implicit raw fallback only in loose mode", () => {
  const schema = compileSchema(schemaText);
  const input = {
    key: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
    value: "ABCD",
  };

  assert.throws(() => decodeState(schema, input), NoMatchingStateError);
  const result = decodeState(schema, input, { mode: "loose" });
  assert.equal(result.state, "__xhs_RawState");
  assert.deepEqual(result.key, { key: input.key });
  assert.deepEqual(result.value, { value: input.value });
});

test("rejects non-32-byte keys", () => {
  const schema = compileSchema(schemaText);
  assert.throws(() => decodeState(schema, { key: "00", value: "" }), DecodeInputError);
});

test("reports ambiguous matches", () => {
  const schema = compileSchema(`
StateKey AKey { Any(32) }
StateValue AValue { Rest value }
State A = AKey -> AValue
StateKey BKey { Any(32) }
StateValue BValue { Rest value }
State B = BKey -> BValue
`);
  assert.throws(
    () =>
      decodeState(schema, {
        key: "0000000000000000000000000000000000000000000000000000000000000000",
        value: "",
      }),
    AmbiguousMatchError,
  );
});

test("validates builtin aliases, ASCII strings, and state key length", () => {
  assert.throws(
    () =>
      compileSchema(`
type Account = Bytes(19)
StateKey BadKey {
  String("あ")
  Null(31)
}
StateValue BadValue { Rest value }
State Bad = BadKey -> BadValue
`),
    SchemaValidationError,
  );
});
