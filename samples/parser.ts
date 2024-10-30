import { floatToXfl } from '@transia/hooks-toolkit'
import { hexToXfl } from '@transia/hooks-toolkit/dist/npm/src/libs/binary-models'
import type { HookParameter } from '@transia/xrpl/dist/npm/models/common'
import type { HookState } from '@transia/xrpl/dist/npm/models/ledger'
import {
  decodeAccountID,
  encodeAccountID,
  isoTimeToRippleTime,
  rippleTimeToISOTime,
  rippleTimeToUnixTime,
} from '@transia/xrpl/dist/npm/utils'
import sha512Half from '@transia/xrpl/dist/npm/utils/hashes/sha512Half'
import type { HookParameterDefinition } from 'schema/HookParameter'
import type { OperationDefinition } from 'schema/Operation'
import type { Field } from '../schema/Field'
import type { HookStateDefinition } from '../schema/HookState'
import type { InvokeBlobDefinition } from '../schema/InvokeBlob'
import type { TxnParameterDefinition } from '../schema/TxnParameter'

const getLengthPrefix = (buffer: Buffer) => {
  let len = buffer.readUInt8(0)
  if (len > 192) {
    len = 193 + (len - 193) * 256 + buffer.readUInt8(1)
  }
  return len
}

const getTypeByteLength = (type: Field['type']) => {
  const typeToLength: Record<Field['type'], number | undefined> = {
    AccountID: 20,
    UInt8: 1,
    UInt16: 2,
    UInt32: 4,
    UInt64: 8,
    XFL: 8,
    Hash256: 32,
    RippleEpoch: 8,
    TxHash: 32,
    HookHash: 32,
    LedgerEntryID: 32,
    Array: undefined,
    VarString: undefined,
    HexBinary: undefined,
    Null: undefined,
  }
  return typeToLength[type]
}

const getByteLength = (state: Field, buffer: Buffer) => {
  if (state.byte_length) return state.byte_length
  if (state.type === 'Array' && state.length_prefix) return getLengthPrefix(buffer)
  const fixedLength = getTypeByteLength(state.type)
  if (fixedLength) return fixedLength
  throw new Error(`${state.type}: length_prefix, byte_length, or a valid fixed length type must be defined`)
}

const bufferToReadableData = (
  buffer: Buffer,
  state: Field,
  nullReplaceTo = '00',
): string | number | bigint | Array<string | number | bigint> => {
  switch (state.type) {
    case 'AccountID':
      return encodeAccountID(buffer)
    case 'UInt8':
      return buffer.readUInt8()
    case 'UInt16':
      return buffer.readUInt16LE()
    case 'UInt32':
      return buffer.readUint32LE()
    case 'RippleEpoch':
      return rippleTimeToISOTime(Number(buffer.readUint32LE()))
    case 'UInt64':
      return buffer.readBigUint64LE()
    case 'XFL':
      return hexToXfl(buffer.toString('hex'))
    case 'VarString':
      if (state.binary === true) return buffer.toString('hex').toUpperCase()
      return buffer.toString('utf-8').replace(/\0/g, nullReplaceTo)
    case 'HexBinary':
      return buffer.toString('hex').toUpperCase()
    case 'Null':
      return nullReplaceTo.repeat(state.byte_length)
    case 'Hash256':
    case 'TxHash':
    case 'HookHash':
    case 'LedgerEntryID':
      return buffer.toString('hex').toUpperCase()
    case 'Array': {
      let from = 0
      const a = state.array.map((s: Field) => {
        const length = getByteLength(s, buffer.subarray(from))
        const buf = buffer.subarray(from, from + length)
        from += length
        return {
          name: s.type === 'Null' ? '' : s.name,
          value: bufferToReadableData(buf, s, nullReplaceTo) as string | number | bigint,
        }
      })
      if (state.delimiter) a.map((_a) => _a.value).join(state.delimiter)
      // @ts-ignore
      return a
    }
    default:
      console.log(state)
      throw new Error('Invalid type')
  }
}

const toHex = (state: Field, value: null | string | number | bigint | Array<string | number | bigint>): string => {
  switch (state.type) {
    case 'AccountID':
      return decodeAccountID(value as string)
        .toString('hex')
        .toUpperCase()
    case 'UInt8':
      return Buffer.from(new Uint8Array([value as number]).buffer)
        .toString('hex')
        .toUpperCase()
    case 'UInt16':
      return Buffer.from(new Uint16Array([value as number]).buffer)
        .toString('hex')
        .toUpperCase()
    case 'UInt32':
      return Buffer.from(new Uint32Array([value as number]).buffer)
        .toString('hex')
        .toUpperCase()
    case 'RippleEpoch': {
      const rippleEpoch = isoTimeToRippleTime(value as string)
      return Buffer.from(new Uint32Array([rippleEpoch]).buffer)
        .toString('hex')
        .toUpperCase()
    }
    case 'UInt64':
      return Buffer.from(new BigUint64Array([value as bigint]).buffer)
        .toString('hex')
        .toUpperCase()
    case 'XFL':
      return Buffer.from(new BigUint64Array([floatToXfl(value as bigint) as bigint]).buffer)
        .toString('hex')
        .toUpperCase()
    case 'VarString':
      if (state.binary === true) {
        return (value as string).toUpperCase()
      }
      return Buffer.from(value as string)
        .toString('hex')
        .toUpperCase()
    case 'HexBinary':
      return (value as string).toUpperCase()
    case 'Null':
      return '00'.repeat(state.byte_length)
    case 'Hash256':
    case 'TxHash':
    case 'HookHash':
    case 'LedgerEntryID':
      return (value as string).toUpperCase()
    case 'Array': {
      const a = value as Array<string | number | bigint>
      return a.map((v, i) => toHex(state.array[i], v)).join('')
    }
    default:
      throw new Error('Invalid type')
  }
}

const fieldsTotalLength = (fields: Field[], buffer: Buffer) => {
  return fields.reduce((total, cur) => total + getByteLength(cur, buffer.subarray(total)), 0)
}

type ReadableData = {
  [key: string]: string | number | bigint | Array<string | number | bigint>
}

const parseBuffer = (buffer: Buffer, definitions: Field[]) => {
  let lastIndex = 0
  let lastBuffer = buffer
  const readableArr: ReadableData[] = []

  const check = definitions.every((d) => {
    const currentIndex = getByteLength(d, lastBuffer)
    const currentBuffer = buffer.subarray(lastIndex, lastIndex + currentIndex)
    lastIndex += currentIndex
    lastBuffer = currentBuffer
    const readableForComp = bufferToReadableData(currentBuffer, d, '00')
    const readable = bufferToReadableData(currentBuffer, d, '')

    if (d.type === 'Null') {
      if (new RegExp('00'.repeat(d.byte_length)).test(readableForComp.toString())) return true
      return false
    }

    if (d.pattern !== undefined) {
      if (!new RegExp(d.pattern).test(readableForComp.toString())) return false
    }
    if (!d.exclude) {
      readableArr.push({
        name: d.name,
        value: readable,
      })
    }
    return true
  })

  return check ? readableArr : undefined
}

const parseBufferAsOperationField = (buffer: Buffer, definitions: Field[]) => {
  let lastIndex = 0
  let lastBuffer = buffer
  const readableArr: ReadableData[] = []

  const check = definitions.every((d) => {
    const currentIndex = getByteLength(d, lastBuffer)
    const currentBuffer = buffer.subarray(lastIndex, lastIndex + currentIndex)
    lastIndex += currentIndex
    lastBuffer = currentBuffer
    const readableForComp = bufferToReadableData(currentBuffer, d, '00')
    const readable = bufferToReadableData(currentBuffer, d, '')

    if (d.type === 'Null') {
      if (new RegExp('00'.repeat(d.byte_length)).test(readableForComp.toString())) return true
      return false
    }

    if (d.pattern !== undefined) {
      if (!new RegExp(d.pattern).test(readableForComp.toString())) return false
    }
    if (!d.exclude) {
      if (!d.field) throw new Error(`field is not defined: ${d.name}`)
      readableArr.push({
        field: d.field,
        value: readable,
      })
    }
    return true
  })

  return check ? readableArr : undefined
}

type KeyValueDefs = HookStateDefinition | TxnParameterDefinition | HookParameterDefinition

const parseKeyValue = (
  keyBuffer: Buffer,
  dataBuffer: Buffer,
  definition: any,
  keyDefinition: string,
  dataDefinition: string,
) => {
  if (keyBuffer.length !== fieldsTotalLength(definition[keyDefinition], keyBuffer)) return undefined
  if (dataBuffer.length !== fieldsTotalLength(definition[dataDefinition], dataBuffer)) return undefined

  const keyArr = parseBuffer(keyBuffer, definition[keyDefinition])
  const dataArr = parseBuffer(dataBuffer, definition[dataDefinition])

  if (!keyArr || !dataArr) return undefined

  return { name: definition.name, key: keyArr, data: dataArr }
}

type SingleDataDefs = InvokeBlobDefinition

const parseSingleData = (buffer: Buffer, definition: any) => {
  const readableArr = parseBuffer(buffer, definition.value)
  if (readableArr) return { name: definition.name, values: readableArr }
  return undefined
}

const wrapper = <T extends KeyValueDefs | SingleDataDefs>(definition: T, fn: (def: T['fields'][number]) => any) => {
  return definition.fields
    .map(fn)
    .filter((d): d is NonNullable<typeof d> => typeof d !== 'undefined')
    .find((_) => true)
}

export const hookStateParser = (value: HookState, definition: HookStateDefinition) => {
  const key = Buffer.from(value.HookStateKey, 'hex')
  const data = Buffer.from(value.HookStateData, 'hex')

  return wrapper(definition, (state) => parseKeyValue(key, data, state, 'hookstate_key', 'hookstate_data'))
}

export const invokeBlobParser = (blob: string, definition: InvokeBlobDefinition) => {
  const data = Buffer.from(blob, 'hex')

  return wrapper(definition, (def) => parseSingleData(data, def))
}

export const txnParametersParser = (parameters: HookParameter, definition: TxnParameterDefinition) => {
  const { HookParameterName, HookParameterValue } = parameters.HookParameter
  const name = Buffer.from(HookParameterName, 'hex')
  const value = Buffer.from(HookParameterValue, 'hex')

  return wrapper(definition, (state) => parseKeyValue(name, value, state, 'otxnparam_key', 'otxnparam_data'))
}

export const hookParametersParser = (parameters: HookParameter, definition: HookParameterDefinition) => {
  const { HookParameterName, HookParameterValue } = parameters.HookParameter
  const name = Buffer.from(HookParameterName, 'hex')
  const value = Buffer.from(HookParameterValue, 'hex')

  return wrapper(definition, (state) => parseKeyValue(name, value, state, 'hookparam_key', 'hookparam_data'))
}

type FieldTypeToType<T extends Field['type']> = T extends 'AccountID' | 'VarString' | 'Hash256'
  ? string
  : T extends 'UInt8' | 'UInt16' | 'UInt32' | 'UInt64' | 'XFL'
    ? number
    : T extends 'Array'
      ? any[]
      : never

type WriteMethods<T extends OperationDefinition> = Extract<keyof T['write'], string>
type ReadMethods<T extends OperationDefinition> = Extract<keyof T['read'], string>
type WriteData<
  T extends OperationDefinition,
  U extends T['write'][keyof T['write']]['data'] = T['write'][keyof T['write']]['data'],
> = { [K in keyof U]: FieldTypeToType<U[K]> }
type ReadArgs<
  T extends OperationDefinition,
  U extends T['read'][keyof T['read']]['args'] = T['read'][keyof T['read']]['args'],
> = { [K in keyof U]: FieldTypeToType<U[K]> }
type ReadReturns<
  T extends OperationDefinition,
  U extends T['read'][keyof T['read']]['returns'] = T['read'][keyof T['read']]['returns'],
> = { [K in keyof U]: FieldTypeToType<U[K]> }

export const writeOperation = <T extends OperationDefinition>(definition: T) => {
  const methods = Object.keys(definition.write) as WriteMethods<T>[]

  return methods.reduce(
    (prev, method) => {
      prev[method] = (data: WriteData<T>) => {
        const parseHex = (fields: Field[]) =>
          fields.reduce(
            (prev, curr) =>
              prev + toHex(curr, curr.field ? data[curr.field] : curr.type === 'Null' ? null : curr.pattern!),
            '',
          )
        if (definition.write[method].txn_parameter_definition) {
          const param_definition = definition.write[method].txn_parameter_definition!
          const HookParameters = param_definition.map(
            (param): HookParameter => ({
              HookParameter: {
                HookParameterName: parseHex(param.key),
                HookParameterValue: parseHex(param.data),
              },
            }),
          )
          return { HookParameters, Blob: null }
        }
        const blob_definition = definition.write[method].invoke_blob_definition!
        const Blob = parseHex(blob_definition.data)
        return { HookParameters: null, Blob }
      }
      return prev
    },
    {} as Record<
      WriteMethods<T>,
      (data: WriteData<T>) => { HookParameters: HookParameter[] | null; Blob: string | null }
    >,
  )
}

export const readOperation = <T extends OperationDefinition>(definition: T, account: string, namespace_id: string) => {
  const methods = Object.keys(definition.read) as ReadMethods<T>[]

  return methods.reduce(
    (prev, method) => {
      prev[method] = (args: ReadArgs<T>) => {
        const parseHex = (fields: Field[]) =>
          fields.reduce(
            (prev, curr) =>
              prev + toHex(curr, curr.field ? args[curr.field] : curr.type === 'Null' ? null : curr.pattern!),
            '',
          )
        const hook_state_definition = definition.read[method].hook_state_definition!
        const hookStateKey = parseHex(hook_state_definition.key)
        const prefix = '0076'
        const index = sha512Half(
          `${prefix}${decodeAccountID(account).toString('hex').toUpperCase()}${hookStateKey}${namespace_id}`,
        )

        const decodeHookStateData = (hookStateValue: string): ReadReturns<T> => {
          const buffer = Buffer.from(hookStateValue, 'hex')
          const readableArr = parseBufferAsOperationField(buffer, hook_state_definition.data)
          if (!readableArr) throw new Error('Invalid hook state value')
          return Object.keys(definition.read[method].returns).reduce(
            // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
            (prev, curr) => ({ ...prev, [curr]: readableArr.find((r) => r.field === curr)!.value }),
            {} as ReadReturns<T>,
          )
        }
        return { index, decodeHookStateData }
      }
      return prev
    },
    {} as Record<
      ReadMethods<T>,
      (args: ReadArgs<T>) => { index: string; decodeHookStateData: (value: string) => ReadReturns<T> }
    >,
  )
}
