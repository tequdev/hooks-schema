import type { Field } from 'schema'
import type { TxnParameterDefinition } from 'schema/TxnParameter'
import { BattleModel } from '../common/BattleModel'

type TxnParam = TxnParameterDefinition

const OP_KEY = [
  {
    type: 'VarString',
    name: 'Operation',
    pattern: 'OP',
    byte_length: 2,
    exclude: true,
  },
] as Field[]

export const VPRABattleV2TxnParamreterDefinition: TxnParam = {
  fields: [
    {
      transaction_types: ['Payment'],
      otxnparam_key: OP_KEY,
      otxnparam_data: [
        {
          type: 'VarString',
          name: 'Create Battle',
          pattern: 'C',
          byte_length: 1,
        },
      ],
    },
    {
      transaction_types: ['Payment'],
      otxnparam_key: OP_KEY,
      otxnparam_data: [
        {
          type: 'VarString',
          name: 'Join Battle',
          pattern: 'J',
          byte_length: 1,
        },
      ],
    },
    {
      transaction_types: ['Invoke'],
      otxnparam_key: OP_KEY,
      otxnparam_data: [
        {
          type: 'VarString',
          name: 'Roll Dice',
          pattern: 'R',
          byte_length: 1,
        },
      ],
    },
    {
      transaction_types: ['Invoke'],
      otxnparam_key: OP_KEY,
      otxnparam_data: [
        {
          type: 'UInt8',
          name: 'Battle Start/End',
          pattern: 'E',
          byte_length: 1,
        },
      ],
    },
    {
      transaction_types: ['Payment', 'Invoke'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'Battle Hash',
          pattern: 'BH',
          byte_length: 2,
          exclude: true,
        },
      ],
      otxnparam_data: [
        {
          type: 'Hash256',
          name: 'Battle Hash',
        },
      ],
    },
    {
      transaction_types: ['Payment', 'Invoke'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'Pet Hash',
          pattern: 'PH',
          byte_length: 2,
          exclude: true,
        },
      ],
      otxnparam_data: [
        {
          type: 'Hash256',
          name: 'Pet ID',
        },
      ],
    },
    {
      name: 'Battle Model',
      transaction_types: ['Payment'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'Battle Model',
          pattern: 'BM',
          byte_length: 2,
          exclude: true,
        },
      ],
      otxnparam_data: BattleModel,
    },
  ],
}
