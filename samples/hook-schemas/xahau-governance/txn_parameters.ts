import { Definition } from '../../../schema'

export const GovernanceTxnParametersDefinition: Definition['txn_parameters'] = {
  fields: [
    {
      name: 'Layer',
      transaction_types: ['Invoke'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'topic',
          pattern: 'L',
          byte_length: 1,
          exclude: true,
        },
      ],
      otxnparam_data: [
        {
          type: 'UInt8',
          name: 'Layer',
        },
      ],
    },
    {
      name: 'Vote for',
      transaction_types: ['Invoke'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'topic',
          pattern: 'T',
          byte_length: 1,
          exclude: true,
        },
      ],
      otxnparam_data: [
        {
          type: 'VarString',
          name: 'Seat',
          pattern: 'S',
          byte_length: 1,
          exclude: true,
        },
        {
          type: 'UInt8',
          name: "Seat ID"
        },
      ],
    },
    {
      name: 'Vote for',
      transaction_types: ['Invoke'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'topic',
          pattern: 'T',
          byte_length: 1,
          exclude: true,
        },
      ],
      otxnparam_data: [
        {
          type: 'VarString',
          name: 'Hook',
          pattern: 'H',
          byte_length: 1,
          exclude: true,
        },
        {
          type: 'UInt8',
          name: "Hook Index"
        },
      ],
    },

    {
      name: 'Vote for',
      transaction_types: ['Invoke'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'topic',
          pattern: 'T',
          byte_length: 1,
          exclude: true,
        },
      ],
      otxnparam_data: [
        {
          type: 'VarString',
          name: 'RewardRate',
          pattern: 'RR',
          byte_length: 2,
        },
      ],
    },
    {
      name: 'Vote for',
      transaction_types: ['Invoke'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'topic',
          pattern: 'T',
          byte_length: 1,
          exclude: true,
        },
      ],
      otxnparam_data: [
        {
          type: 'VarString',
          name: 'RewardDelay',
          pattern: 'RD',
          byte_length: 2,
        },
      ],
    },
    {
      name: 'Vote value',
      transaction_types: ['Invoke'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'value',
          pattern: 'V',
          byte_length: 1,
          exclude: true,
        },
      ],
      otxnparam_data: [
        {
          type: 'AccountID',
          name: 'Account',
        },
      ],
    },
    {
      name: 'Vote value',
      transaction_types: ['Invoke'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'value',
          pattern: 'V',
          byte_length: 1,
          exclude: true,
        },
      ],
      otxnparam_data: [
        {
          type: 'Hash256',
          name: 'HookHash',
        },
      ],
    },
    {
      name: 'Vote value',
      transaction_types: ['Invoke'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'value',
          pattern: 'V',
          byte_length: 1,
          exclude: true,
        },
      ],
      otxnparam_data: [
        {
          type: 'XFL',
          name: 'value',
        },
      ],
    },
  ],
}
