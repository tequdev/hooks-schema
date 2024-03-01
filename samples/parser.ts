import { hexToXfl } from '@transia/hooks-toolkit/dist/npm/src/libs/binary-models'
import { HookParameter } from '@transia/xrpl/dist/npm/models/common'
import { HookState } from '@transia/xrpl/dist/npm/models/ledger'
import { encodeAccountID } from '@transia/xrpl/dist/npm/utils'
import { HookParameterDefinition } from 'schema/HookParameter'
import { Field } from '../schema/Field'
import { HookStateDefinition } from '../schema/HookState'
import { InvokeBlobDefinition } from '../schema/InvokeBlob'
import { TxnParameterDefinition } from '../schema/TxnParameter'

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
    Array: undefined,
    VarString: undefined,
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
  nullReplaceTo = '0',
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
    case 'UInt64':
      return buffer.readBigUint64LE()
    case 'XFL':
      return hexToXfl(buffer.toString('hex'))
    case 'VarString':
      if (state.binary === true) return buffer.toString('hex').toUpperCase()
      return buffer.toString('utf-8').replace(/\0/g, nullReplaceTo)
    case 'Hash256':
      return buffer.toString('hex').toUpperCase()
    case 'Array': {
      let from = 0
      const a = state.array.map((s: Field) => {
        const length = getByteLength(s, buffer.subarray(from))
        const buf = buffer.subarray(from, from + length)
        from += length
        return { name: s.name, value: bufferToReadableData(buf, s, nullReplaceTo) as string | number | bigint }
      })
      if (state.delimiter) a.map((_a) => _a.value).join(state.delimiter)
      // @ts-ignore
      return a
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
    const readableForComp = bufferToReadableData(currentBuffer, d, '0')
    const readable = bufferToReadableData(currentBuffer, d, '')

    if (d.pattern && !new RegExp(d.pattern).test(readableForComp.toString())) return false
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

type KeyValueDefs = HookStateDefinition['hook_states'] | TxnParameterDefinition['txn_parameters'] | HookParameterDefinition['hook_parameters']

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

type SingleDataDefs = InvokeBlobDefinition['invoke_blobs']

const parseSingleData = (buffer: Buffer, definition: any) => {
  const readableArr = parseBuffer(buffer, definition.value)
  if (readableArr) return { name: definition.name, values: readableArr }
  return undefined
}


const wrapper = <T extends KeyValueDefs | SingleDataDefs>(definition: T, fn: (def: T[number]) => any) => {
  return definition
    .map(fn)
    .filter((d): d is NonNullable<typeof d> => typeof d !== 'undefined')
    .find((_) => true)
}

export const hookStateParser = (value: HookState, definition: HookStateDefinition) => {
  const key = Buffer.from(value.HookStateKey, 'hex')
  const data = Buffer.from(value.HookStateData, 'hex')

  return wrapper(definition.hook_states, (state) => parseKeyValue(key, data, state, 'hookstate_key', 'hookstate_data'))
}

export const invokeBlobParser = (blob: string, definition: InvokeBlobDefinition) => {
  const data = Buffer.from(blob, 'hex')

  return wrapper(definition.invoke_blobs, (def) => parseSingleData(data, def))
}

export const txnParametersParser = (parameters: HookParameter, definition: TxnParameterDefinition) => {
  const { HookParameterName, HookParameterValue } = parameters.HookParameter
  const name = Buffer.from(HookParameterName, 'hex')
  const value = Buffer.from(HookParameterValue, 'hex')

  return wrapper(definition.txn_parameters, (state) => parseKeyValue(name, value, state, 'otxnparam_key', 'otxnparam_data'))
}

export const hookParametersParser = (parameters: HookParameter, definition: HookParameterDefinition) => {
  const { HookParameterName, HookParameterValue } = parameters.HookParameter
  const name = Buffer.from(HookParameterName, 'hex')
  const value = Buffer.from(HookParameterValue, 'hex')

  return wrapper(definition.hook_parameters, (state) => parseKeyValue(name, value, state, 'hookparam_key', 'hookparam_data'))
}
