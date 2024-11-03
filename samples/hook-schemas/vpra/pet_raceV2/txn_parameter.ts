import type { TxnParameterDefinition } from 'schema/TxnParameter'
import { RaceModel } from '../common/RaceModel'

type TxnParam = TxnParameterDefinition

export const VPRARaceV2TxnParamreterDefinition: TxnParam = {
  fields: [
    {
      transaction_types: ['Invoke', 'Payment'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'Race Namespace',
          pattern: 'RCN',
          byte_length: 3,
        },
      ],
      otxnparam_data: [
        {
          type: 'Hash256',
          name: 'Race Namespace',
        },
      ],
    },
    {
      transaction_types: ['Invoke', 'Payment'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'Race Hash',
          pattern: 'RH',
          byte_length: 2,
        },
      ],
      otxnparam_data: [
        {
          type: 'Hash256',
          name: 'Race Hash',
        },
      ],
    },
    {
      transaction_types: ['Invoke', 'Payment'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'Race Model',
          pattern: 'RM',
          byte_length: 2,
        },
      ],
      otxnparam_data: RaceModel,
    },
    {
      transaction_types: ['Payment'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'Pet Hash',
          pattern: 'PH',
          byte_length: 2,
        },
      ],
      otxnparam_data: [
        {
          type: 'Hash256',
          name: 'Pet Hash',
        },
      ],
    },
    {
      transaction_types: ['Payment'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'Race Pool Namespace',
          pattern: 'RPN',
          byte_length: 3,
        },
      ],
      otxnparam_data: [
        {
          type: 'Hash256',
          name: 'Pet Hash',
        },
      ],
    },
  ],
}
