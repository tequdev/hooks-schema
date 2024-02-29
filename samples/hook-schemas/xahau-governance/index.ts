import { Definition } from '../../../schema'
import { GovernanceHookStateDefinition } from './hook_state'
import { GovernanceTxnParametersDefinition } from './txn_parameters'

export const GovernanceHookDefinition: Definition = {
  name: 'Governance',
  description: 'Governance',
  hook_hash: '',
  version: [],
  hook_states: GovernanceHookStateDefinition,
  txn_parameters: GovernanceTxnParametersDefinition
}