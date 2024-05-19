import { Field } from '../Field'

export interface HookParameterDefinition {
  fields: {
    name?: string
    description?: string
    hookparam_key: Field[]
    hookparam_data: Field[]
  }[]
}
