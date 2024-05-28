import { hexNamespace } from '@transia/hooks-toolkit'
import { Definition } from '../../../schema'
import { EvernodeReputationHookParametersDefinition } from './hook_parameters'
import { EvernodeReputationHookStateDefinition } from './hook_state'
import { EvernodeReputationTxnParamreterDefinition } from './txn_parameter'

export const EvernodeReputationHookDefinition: Definition = {
  name: 'Evernode Reputation',
  description: 'Evernode Reputation',
  hook_hash: 'F3D61A99804C8A825611427E3BC9070CEA2F0E26EFB5702D984202EB10A0AFF8',
  namespace_id: hexNamespace('evernode.org|registry'),
  version: [],
  hook_parameters: EvernodeReputationHookParametersDefinition,
  hook_states: EvernodeReputationHookStateDefinition,
  txn_parameters: EvernodeReputationTxnParamreterDefinition,
}
