import type { Field } from 'schema'

export const BattleModel: Field[] = [
  {
    type: 'VarString',
    name: 'ID',
    byte_length: 32,
    length_prefix: true,
  },
  {
    type: 'UInt8',
    name: 'Battle Type',
    // 0: Attribute
    // 1: Pet
  },
  {
    type: 'Hash256',
    name: 'Defender Hash',
  },
  {
    type: 'AccountID',
    name: 'Defender Address',
  },
  {
    type: 'UInt8',
    name: 'Defender Roll',
  },
  {
    type: 'Hash256',
    name: 'Attacker Hash',
  },
  {
    type: 'AccountID',
    name: 'Attacker Address',
  },
  {
    type: 'UInt8',
    name: 'Attacker Roll',
  },
]
