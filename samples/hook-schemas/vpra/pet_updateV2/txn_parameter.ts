import type { TxnParameterDefinition } from 'schema/TxnParameter'

type TxnParam = TxnParameterDefinition

export const VPRAUpdateV2TxnParamreterDefinition: TxnParam = {
  fields: [
    {
      name: 'Pet',
      transaction_types: ['Invoke'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'Pet',
          pattern: 'P',
          byte_length: 1,
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
      name: 'Breed Price',
      transaction_types: ['Invoke'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'Breed Price',
          pattern: 'BP',
          byte_length: 2,
          exclude: true,
        },
      ],
      otxnparam_data: [
        {
          type: 'XFL',
          name: 'Breed Price',
        },
      ],
    },
    {
      name: 'Pet Name',
      transaction_types: ['Invoke'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'Pet Name',
          pattern: 'PN',
          byte_length: 2,
          exclude: true,
        },
      ],
      otxnparam_data: [
        {
          type: 'VarString',
          name: 'Pet Name',
          byte_length: 32,
          length_prefix: true,
        },
      ],
    },
  ],
}
