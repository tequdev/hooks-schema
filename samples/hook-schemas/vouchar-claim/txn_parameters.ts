import { Definition } from '../../../schema'

export const VoucharClaimTxnParametersDefinition: Definition['txn_parameters'] = {
  fields: [
    {
      name: 'Minimum Voucher Value',
      transaction_types: ['Invoke'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'MIN',
          pattern: 'MIN',
          byte_length: 3,
        },
      ],
      otxnparam_data: [
        {
          type: 'UInt8',
          name: 'Minimum Value',
        },
      ],
    },
    {
      name: 'Maximum Voucher Value',
      transaction_types: ['Invoke'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'MAX',
          pattern: 'MAX',
          byte_length: 3,
        },
      ],
      otxnparam_data: [
        {
          type: 'UInt8',
          name: 'Maximum Value',
        },
      ],
    },
    {
      name: 'CAP on Vouchar',
      transaction_types: ['Invoke'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'CAP',
          pattern: 'CAP',
          byte_length: 3,
        },
      ],
      otxnparam_data: [
        {
          type: 'UInt8',
          name: 'CAP Value',
        },
      ],
    },
  ],
}
