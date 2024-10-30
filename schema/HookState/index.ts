import type { Field } from '../Field'

export interface HookStateDefinition {
  fields: {
    name?: string
    description?: string
    hookstate_key: Field[]
    hookstate_data: Field[]
    foreign_state?: {
      account: string
      namespace_id: string
    }
  }[]
}
