import type { TxnParameterDefinition } from 'schema/TxnParameter'

type TxnParam = TxnParameterDefinition['fields'][0]

export const LotteryHash: TxnParam = {
  transaction_types: ['Invoke'],
  name: 'Lottery Hash',
  otxnparam_key: [
    {
      type: 'VarString',
      name: 'LH',
      pattern: 'LH',
      exclude: true,
    },
  ],
  otxnparam_data: [
    {
      type: 'Hash256',
      name: 'Lottery Hash',
    },
  ],
}
