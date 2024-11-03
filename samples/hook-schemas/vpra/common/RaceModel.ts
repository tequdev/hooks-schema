import type { Field } from 'schema'

export const RaceModel: Field[] = [
  {
    type: 'UInt64',
    name: 'Race ID',
  },
  {
    type: 'VarString',
    name: 'Race Name',
    byte_length: 32,
    length_prefix: true,
  },
  {
    type: 'UInt8',
    name: 'Status',
    // 0: Pending, 1: Started, 2: Ended, 3: Cancelled
  },
  {
    type: 'UInt8',
    name: 'Weight Class',
  },
  {
    type: 'UInt8',
    name: 'Weather',
  },
  {
    type: 'UInt8',
    name: 'Soil',
  },
  {
    type: 'UInt8',
    name: 'Stalls',
  },
  {
    type: 'UInt32',
    name: 'Length',
  },
  {
    type: 'UInt32',
    name: 'Start',
  },
  {
    type: 'XFL',
    name: 'Entry Fee',
  },
  {
    type: 'XFL',
    name: 'Pool Fee',
  },
  {
    type: 'XFL',
    name: 'Track Fee',
  },
]
