import { Field } from '../Field'

export type InvokeBlobDefinition = {
  name: string
  description: string
  invoke_blobs: {
    name?: string
    description?: string
    value: Field[]
  }[]
}
