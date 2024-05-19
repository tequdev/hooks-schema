import { Field } from '../Field'

export interface InvokeBlobDefinition {
  fields: {
    name?: string
    description?: string
    value: Field[]
  }[]
}
