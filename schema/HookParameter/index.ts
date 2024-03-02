import { Field } from '../Field'

export interface HookParameterDefinition {
  name: string
  description: string
  fields: {
    name?: string
    description?: string
    hookparam_key: Field[]
    hookparam_data: Field[]
  }[]
}
