import { hexNamespace } from '@transia/hooks-toolkit'
import type { Definition } from '../../../schema'
import { OracleHookStateDefinition } from './hook_state'
import { OracleInvokeDefinition } from './invoke_blob'

export const OracleHookDefinition: Definition = {
  name: 'Oracle',
  description: 'Denis Oracle',
  account: 'rsMCzsxZYSXafH3Egj1jpGemgQjagtnXEk',
  hook_hash: '9BF3BA2E4DB59A9577961B0C3CC1F4866124006D007F73AF1402A7E98C1A2A7A',
  namespace_id: hexNamespace('oracle'),
  version: [],
  hook_states: OracleHookStateDefinition,
  invoke_blobs: OracleInvokeDefinition,
}
