import type { HookParameterDefinition } from './HookParameter'
import type { HookStateDefinition } from './HookState'
import type { InvokeBlobDefinition } from './InvokeBlob'
import type { OperationDefinition } from './Operation'
import type { TxnParameterDefinition } from './TxnParameter'

export interface Definition {
  name: string
  description: string
  hook_hash: string
  version: number[]

  github_url?: string
  icon_url?: string

  account?: string
  namespace_id?: string
  hook_index?: number

  hook_states?: HookStateDefinition
  txn_parameters?: TxnParameterDefinition
  hook_parameters?: HookParameterDefinition
  invoke_blobs?: InvokeBlobDefinition
  operations?: OperationDefinition
}
