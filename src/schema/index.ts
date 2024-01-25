import { HookParameterDefinition } from './HookParameter'
import { HookStateDefinition } from './HookState'
import { TxnParameterDefinition } from './TxnParameter'

export type Definition = {
  name: string
  description: string
  hook_hash: string
  version: number[]

  github_url?: string
  icon_url?: string

  account?: string
  namespace_id?: string
  hook_index?: number

  hook_states: HookStateDefinition
  txn_parameters: TxnParameterDefinition
  hook_parameters: HookParameterDefinition
}
