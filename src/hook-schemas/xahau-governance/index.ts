import { Definition } from '../../schema'
import { GovernanceHookStateDefinition } from './hook_state'

export const GovernanceHookDefinition: Definition = {
  name: 'Governance',
  description: 'Governance',
  hook_hash: '',
  version: [],
  hook_states: GovernanceHookStateDefinition,
}
