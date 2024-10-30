export type Field = ArrayField | NonArrayField

type NonArrayField =
  | AccountID
  | UInt8
  | UInt16
  | UInt32
  | UInt64
  | XFL
  | VarString
  | HexBinary
  | Null
  | Hash256
  | RippleEpoch
  | TxHash
  | HookHash
  | LedgerEntryID

export interface ArrayField<T extends NonArrayField = NonArrayField> extends FieldBase {
  type: 'Array'
  array: T[]
  delimiter?: string
  array_length?: number
  byte_length?: number
  /**
   * The length prefix consists of either two or four bytes
   * (depending on the length of the string)
   * and indicates the number of raw bytes in the string
   * @default false
   */
  length_prefix?: boolean
}

/**
 * @external
 */
interface FieldBase {
  type: string
  name: string
  // field name for operation
  field?: string
  // fixed_value?: string | number;
  pattern?: string
  byte_length?: number
  /**
   * @default false
   */
  exclude?: boolean
}

interface AccountID extends FieldBase {
  type: 'AccountID'
  /**
   * @example r
   */
  fixed_value?: string
  /**
   * @default 20
   */
  byte_length?: number
}

export interface UInt8 extends FieldBase {
  type: 'UInt8'
  /**
   * @default 1
   */
  byte_length?: number
}

export interface UInt16 extends FieldBase {
  type: 'UInt16'
  /**
   * @default 2
   */
  byte_length?: number
}

export interface UInt32 extends FieldBase {
  type: 'UInt32'
  /**
   * @default 4
   */
  byte_length?: number
}

export interface UInt64 extends FieldBase {
  type: 'UInt64'
  /**
   * @default 8
   */
  byte_length?: number
}

export interface XFL extends FieldBase {
  type: 'XFL'
  /**
   * @default 8
   */
  byte_length?: number
}

export interface VarString extends FieldBase {
  type: 'VarString'
  byte_length?: number
  /**
   * @default false
   * @deprecated use instead HexBinary type
   */
  binary?: boolean
  /**
   * The length prefix consists of either two or four bytes
   * (depending on the length of the string)
   * and indicates the number of raw bytes in the string
   * @default false
   * @deprecated use instead HexBinary type
   */
  length_prefix?: boolean
  /**
   * All remaining data in Buffer is considered to be the value
   * @default false
   * @deprecated use instead HexBinary type
   */
  to_last?: boolean
}

export interface HexBinary extends FieldBase {
  type: 'HexBinary'
  byte_length?: number
  /**
   * The length prefix consists of either two or four bytes
   * (depending on the length of the string)
   * and indicates the number of raw bytes in the string
   * @default false
   */
  length_prefix?: boolean
  /**
   * All remaining data in Buffer is considered to be the value
   * @default false
   */
  to_last?: boolean
}

export interface Null extends Omit<FieldBase, 'name' | 'pattern'> {
  type: 'Null'
  byte_length: number
}

export interface Hash256 extends FieldBase {
  type: 'Hash256'
  /**
   * @default 32
   */
  byte_length?: number
}

export interface RippleEpoch extends FieldBase {
  type: 'RippleEpoch'
  /**
   * @default 4
   */
  byte_length?: number
}

export interface TxHash extends FieldBase {
  type: 'TxHash'
  /**
   * @default 64
   */
  byte_length?: number
}

export interface HookHash extends FieldBase {
  type: 'HookHash'
  /**
   * @default 64
   */
  byte_length?: number
}

export interface LedgerEntryID extends FieldBase {
  type: 'LedgerEntryID'
  /**
   * @default 64
   */
  byte_length?: number
}
