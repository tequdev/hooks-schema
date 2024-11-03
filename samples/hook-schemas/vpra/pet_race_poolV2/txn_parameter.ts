import type { TxnParameterDefinition } from 'schema/TxnParameter'

type TxnParam = TxnParameterDefinition

export const VPRARacePoolV2TxnParamreterDefinition: TxnParam = {
  fields: [
    {
      name: 'End Race',
      transaction_types: ['SetHook'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'End Race',
          pattern: 'ER',
          byte_length: 2,
        },
      ],
      otxnparam_data: [
        {
          type: 'Array',
          name: 'Race End',
          length_prefix: true,
          array: [
            {
              type: 'Hash256',
              name: 'Pet ID',
            },
            {
              type: 'Hash256',
              name: 'Pet ID',
            },
            {
              type: 'Hash256',
              name: 'Pet ID',
            },
          ],
        },
      ],
    },
    {
      name: 'End Race Bets',
      transaction_types: ['Invoke'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'End Race Bets',
          pattern: 'ERB',
          byte_length: 3,
        },
      ],
      otxnparam_data: [
        {
          type: 'Array',
          name: 'Race End Bets',
          length_prefix: true,
          array: [
            {
              type: 'Hash256',
              name: 'Pet ID',
            },
            {
              type: 'UInt8',
              name: 'Position',
            },
            // TODO
            // {
            //   type: 'Array',
            // },
          ],
        },
      ],
    },
  ],
}
