import { Definition } from '../../../schema'
import { GovernanceHookParametersDefinition } from './hook_parameters'
import { GovernanceHookStateDefinition } from './hook_state'
import { GovernanceTxnParametersDefinition } from './txn_parameters'

export const GovernanceHookDefinition: Definition = {
  name: 'Governance',
  description: 'Governance',
  hook_hash: '5EDF6439C47C423EAC99C1061EE2A0CE6A24A58C8E8A66E4B3AF91D76772DC77',
  namespace_id: '0'.repeat(32),
  account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
  version: [],
  hook_states: GovernanceHookStateDefinition,
  txn_parameters: GovernanceTxnParametersDefinition,
  hook_parameters: GovernanceHookParametersDefinition,
}
