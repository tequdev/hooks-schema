import { Field } from '../Field'

export interface InvokeBlobDefinition {
  name: string
  description: string
  fields: {
    name?: string
    description?: string
    value: Field[]
  }[]
}
