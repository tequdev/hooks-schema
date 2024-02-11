import { Field } from '../Field'

export interface InvokeBlobDefinition {
  name: string
  description: string
  invoke_blobs: {
    name?: string
    description?: string
    value: Field[]
  }[]
}
