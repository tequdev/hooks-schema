import { Field } from '../Field'

export type TxnParameterDefinition = {
  name: string
  description: string
  txn_parameters: {
    name?: string
    description?: string
    transaction_types: string[]
    otxnparam_key: Field[]
    otxnparam_data: Field[]
  }[]
}
