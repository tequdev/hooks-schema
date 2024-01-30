import { hexToXfl } from '@transia/hooks-toolkit/dist/npm/src/libs/binary-models'
import { HookState } from '@transia/xrpl/dist/npm/models/ledger'
import { encodeAccountID } from '@transia/xrpl/dist/npm/utils'
import { Definition } from './schema'
import { Field } from './schema/Field'

type HookStateDefinition = Definition['hook_states']
type HookStateDataType = HookStateDefinition['hook_states'][number]['hookstate_data'][number]
type HookStateKeyType = HookStateDefinition['hook_states'][number]['hookstate_key'][number]

const getByteLength = (state: HookStateKeyType | HookStateDataType) => {
  switch (state.type) {
    case 'Array':
      return state.byte_length
    case 'AccountID':
      return 20
    case 'UInt8':
      return 1
    case 'UInt16':
      return 2
    case 'UInt32':
      return 4
    case 'UInt64':
      return 8
    case 'XFL':
      return 8
    case 'VarString':
      return state.byte_length
    case 'Hash256':
      return 32
    default:
      throw new Error('Invalid type')
  }
}

const bufferToReadableData = (buffer: Buffer, state: Field, nullReplaceTo = '0'): string | number | bigint | Array<string | number | bigint> => {
  switch (state.type) {
    case 'Array': {
      let from = 0
      const a = state.array.map((s) => {
        const to = from + getByteLength(s)
        const buf = buffer.subarray(from, to)
        from = to
        return bufferToReadableData(buf, s as Field, nullReplaceTo) as string | number | bigint
      })
      if (state.delimiter) return a.join(state.delimiter)
      return a
    }
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
      return buffer.toString('hex')
    default:
      throw new Error('Invalid type')
  }
}

const stateDataTotalLength = (data: HookStateDefinition['hook_states'][number]) => {
  return data.hookstate_data.reduce((total, cur) => total + getByteLength(cur), 0)
}

type ReadableData = {
  [key: string]: string | number | bigint | Array<string | number | bigint>
}

export const hookStateParser = (value: HookState, definition: HookStateDefinition) => {
  const key = Buffer.from(value.HookStateKey, 'hex')
  const data = Buffer.from(value.HookStateData, 'hex')
  // console.log(value)
  const state = definition.hook_states
    .map((state) => {
      // console.log(data.length, stateDataTotalLength(state))
      if (data.length !== stateDataTotalLength(state)) return undefined

      let lastKeyIndex = 0
      const keyArr: ReadableData[] = []
      // console.log(state.hookstate_key)
      const checkKey = state.hookstate_key.every((k) => {
        // Retrieve info matching HookStateKey and length with definition
        const currentKeyIndex = getByteLength(k)
        const currentBuffer = key.subarray(lastKeyIndex, lastKeyIndex + currentKeyIndex)
        lastKeyIndex += currentKeyIndex
        const readableForComp = bufferToReadableData(currentBuffer, k, "0")
        const readable = bufferToReadableData(currentBuffer, k, "")
        // console.log(lastKeyIndex, lastKeyIndex + currentKeyIndex, readable)
        // console.log(k.pattern, readable.toString(), !new RegExp(k.pattern!).test(readable.toString()))
        if (k.pattern && !new RegExp(k.pattern).test(readableForComp.toString())) return false
        if (k.exclude === true) return true
        keyArr.push({
          name: k.name,
          value: readable,
        })
        return true
      })
      // console.log({ checkKey })
      if (checkKey === false) return undefined
      let lastDataIndex = 0
      const dataArr: ReadableData[] = []
      const checkData = state.hookstate_data.every((d) => {
        // Retrieve info matching HookStateData and length with definition
        const currentDataIndex = getByteLength(d)
        const currentBuffer = data.subarray(lastDataIndex, lastDataIndex + currentDataIndex)
        lastDataIndex += currentDataIndex
        const readableForComp = bufferToReadableData(currentBuffer, d, "0")
        const readable = bufferToReadableData(currentBuffer, d, "")
        // console.log(lastDataIndex - currentDataIndex, lastDataIndex, readable, currentBuffer)
        // console.log(d.pattern, readable.toString(), !new RegExp(d.pattern!).test(readable.toString()))

        if (d.pattern && !new RegExp(d.pattern).test(readableForComp.toString())) return false
        if (d.exclude === true) return true
        dataArr.push({
          name: d.name,
          value: readable,
        })
        return true
      })

      return checkData ? { name: state.name, key: keyArr, data: dataArr } : undefined
    })
    .filter((d): d is NonNullable<typeof d> => typeof d !== 'undefined')
    .find((_) => true)
  return state
}
