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
  u64 value
}

State SettingsH = SettingsHKey -> U64Value @priority(50)
`;

describe("decode schema samples", () => {
  test("decodes UserInfo", () => {
    const schema = compileSchema(schemaText);
    const result = decodeState(schema, {
      key: "00000000000000000000005524B374EFE44FC572ED6E4DC112772C26BF754351",
      value: "0100000000000000000000000000000000000000000000000000000000000000",
    });

    expect(result.state).toBe("UserInfo");
    expect(result.key).toEqual({
      user: "24B374EFE44FC572ED6E4DC112772C26BF754351",
    });
    expect(result.value).toEqual({
      currencySlots: "0100000000000000000000000000000000000000000000000000000000000000",
    });
    expect(result.match.reasons.some((reason) => reason.includes('String("U")'))).toBe(true);
  });

  test("decodes UserCurrencySlot with 19-byte user id", () => {
    const schema = compileSchema(schemaText);
    const result = decodeState(schema, {
      key: "000000000000000000005501000000000000000000000004D01730E501961300",
      value: "00000000000000000000000000000000000000000000000000000000000000000000000000000000",
    });

    expect(result.state).toBe("UserCurrencySlot");
    expect(result.key).toEqual({
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

    expect(result.state).toBe("SettingsH");
    expect(result.value).toEqual({ value: 1n });
  });

  test("decodes builtin byte types", () => {
    const schema = compileSchema(`
StateKey Key { Null(32) }
StateValue Value {
  Account account
  Currency currency
  Issuer issuer
  XFL xfl
}
State Builtins = Key -> Value
`);
    const account = "1111111111111111111111111111111111111111";
    const currency = "2222222222222222222222222222222222222222";
    const issuer = "3333333333333333333333333333333333333333";
    const xfl = "0080C6A47E8D8354";

    const result = decodeState(schema, {
      key: "0000000000000000000000000000000000000000000000000000000000000000",
      value: `${account}${currency}${issuer}${xfl}`,
    });

    expect(result.state).toBe("Builtins");
    expect(result.value).toEqual({
      account: account.toUpperCase(),
      currency: currency.toUpperCase(),
      issuer: issuer.toUpperCase(),
      xfl: "1",
    });
  });

  test("decodes all numeric builtin types through schemas", () => {
    const schema = compileSchema(`
StateKey Key { Null(32) }
StateValue Value {
  u8 a
  u16 b
  u16 c @BE
  u32 d
  u32 e @BE
  u64 f
  u64 g @BE
}
State Numerics = Key -> Value
`);

    const result = decodeState(schema, {
      key: "0000000000000000000000000000000000000000000000000000000000000000",
      value: "01030204050A0908070B0C0D0E0C0D0E0F1011121A1A1B1C1D1E1F2021",
    });

    expect(result.state).toBe("Numerics");
    expect(result.value).toEqual({
      a: 1,
      b: 0x0203,
      c: 0x0405,
      d: 0x0708090a,
      e: 0x0b0c0d0e,
      f: 0x1a1211100f0e0d0cn,
      g: 0x1a1b1c1d1e1f2021n,
    });
  });
});

describe("decode error handling", () => {
  test("uses implicit raw fallback only in loose mode", () => {
    const schema = compileSchema(schemaText);
    const input = {
      key: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
      value: "ABCD",
    };

    expect(() => decodeState(schema, input)).toThrow(NoMatchingStateError);
    const result = decodeState(schema, input, { mode: "loose" });
    expect(result.state).toBe("__xhs_RawState");
    expect(result.key).toEqual({ key: input.key });
    expect(result.value).toEqual({ value: input.value });
  });

  test("rejects non-32-byte keys", () => {
    const schema = compileSchema(schemaText);
    expect(() => decodeState(schema, { key: "00", value: "" })).toThrow(DecodeInputError);
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
    expect(() =>
      decodeState(schema, {
        key: "0000000000000000000000000000000000000000000000000000000000000000",
        value: "",
      }),
    ).toThrow(AmbiguousMatchError);
  });

  test("validates builtin aliases, ASCII strings, and state key length", () => {
    expect(() =>
      compileSchema(`
type Account = Bytes(19)
StateKey BadKey {
  String("あ")
  Null(31)
}
StateValue BadValue { Rest value }
State Bad = BadKey -> BadValue
`),
    ).toThrow(SchemaValidationError);
  });
});
