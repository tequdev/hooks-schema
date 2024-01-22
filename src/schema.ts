export type HookStateDefinition = {
  name: string;
  description: string;
  hook_states: {
    name?: string;
    description?: string;
    hookstate_key: HookStateKeyType[];
    hookstate_data: HookStateDataType[];
  }[];
};

export type HookStateKeyType = (AccountID | UInt8 | UInt16 | UInt32 | UInt64 | XFL | VarString | Hash256) & {
  name: string;
  fixed_value?: string | number;
  /**
   * @default false
   */
  exclude?: boolean;
};

export type HookStateDataType = (AccountID | UInt8 | UInt16 | UInt32 | UInt64 | XFL | VarString | Hash256) & {
  name: string;
  fixed_value?: string | number;
  /**
   * @default false
   */
  exclude?: boolean;
};

export type AccountID = {
  type: "AccountID";
  /**
   * @default 20
   */
  byte_length?: number;
};

export type UInt8 = {
  type: "UInt8";
  /**
   * @default 1
   */
  byte_length?: number;
};

export type UInt16 = {
  type: "UInt16";
  /**
   * @default 2
   */
  byte_length?: number;
};

export type UInt32 = {
  type: "UInt32";
  /**
   * @default 4
   */
  byte_length?: number;
};

export type UInt64 = {
  type: "UInt64";
  /**
   * @default 8
   */
  byte_length?: number;
};

export type XFL = {
  type: "XFL";
  /**
   * @default 8
   */
  byte_length?: number;
};

export type VarString = {
  type: "VarString";
  byte_length: number;
  /**
   * @default false
   */
  binary?: boolean;
};

export type Hash256 = {
  type: "Hash256";
  /**
   * @default 32
   */
  byte_length?: number;
};
