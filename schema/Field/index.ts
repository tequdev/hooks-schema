export type Field = ArrayField | NonArrayField

type NonArrayField = AccountID | UInt8 | UInt16 | UInt32 | UInt64 | XFL | VarString | Hash256

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

export interface VarString extends Omit<FieldBase, 'pattern'> {
  type: 'VarString'
  byte_length?: number
  pattern?: string | null
  /**
   * @default false
   */
  binary?: boolean
  /**
   * The length prefix consists of either two or four bytes 
   * (depending on the length of the string) 
   * and indicates the number of raw bytes in the string
   * @default false
   */
  length_prefix?: boolean
}

export interface Hash256 extends FieldBase {
  type: 'Hash256'
  /**
   * @default 32
   */
  byte_length?: number
}
