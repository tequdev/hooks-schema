import { Definition } from '../../../schema'
import { OracleHookStateDefinition } from './hook_state'
import { OracleInvokeDefinition } from './invoke_blob'

export const OracleHookDefinition: Definition = {
  name: 'Oracle',
  description: 'Denis Oracle',
  hook_hash: '',
  version: [],
  hook_states: OracleHookStateDefinition,
  invoke_blobs: OracleInvokeDefinition
}
