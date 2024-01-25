import { Field } from '../Field'

export type HookParameterDefinition = {
  name: string
  description: string
  hook_parameters: {
    name?: string
    description?: string
    hookparam_key: Field[]
    hookparam_data: Field[]
  }[]
}
