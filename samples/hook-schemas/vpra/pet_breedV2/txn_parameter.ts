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

export const VPRABreedeV2TxnParamreterDefinition: TxnParam = {
  fields: [
    {
      transaction_types: ['Payment'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'Male Pet',
          pattern: 'PM',
          byte_length: 2,
        },
      ],
      otxnparam_data: [
        {
          type: 'Hash256',
          name: 'Male Pet Hash',
        },
      ],
    },
    {
      transaction_types: ['Payment'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'Female Pet',
          pattern: 'PF',
          byte_length: 2,
        },
      ],
      otxnparam_data: [
        {
          type: 'Hash256',
          name: 'Female Pet Hash',
        },
      ],
    },
    {
      transaction_types: ['Payment'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'Pet Name',
          pattern: 'PN',
          byte_length: 2,
        },
      ],
      otxnparam_data: [
        {
          type: 'HexBinary',
          name: 'Name',
          byte_length: 32,
          length_prefix: true,
        },
      ],
    },
  ],
}
