import { Definition } from '../../../schema'

export const VoucharCreateTxnParametersDefinition: Definition['txn_parameters'] = {
  fields: [
    {
      name: ' Public Key',
      transaction_types: ['Payment'],
      otxnparam_key: [
        {
          type: 'VarString',
          name: 'Voucher Code',
          pattern: 'VC',
          byte_length: 2,
          exclude: true,
        },
      ],
      otxnparam_data: [
        {
          type: 'VarString',
          name: 'Public Key',
          byte_length: 33,
          binary: true,
        },
      ],
    },
  ],
}
