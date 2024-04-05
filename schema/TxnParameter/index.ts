import { Field } from '../Field'

export interface TxnParameterDefinition {
  fields: {
    name?: string
    description?: string
    transaction_types: string[]
    otxnparam_key: Field[]
    otxnparam_data: Field[]
  }[]
}
