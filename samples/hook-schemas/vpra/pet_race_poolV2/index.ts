import { hexNamespace } from '@transia/hooks-toolkit'
import type { Definition } from '../../../../schema'
import { VPRARacePoolV2HookParametersDefinition } from './hook_parameters'
import { VPRARacePoolV2HookStateDefinition } from './hook_state'
import { VPRARacePoolV2TxnParamreterDefinition } from './txn_parameter'

export const VPRARacePoolV2HookDefinition: Definition = {
  name: 'VPRA Race Pool V2',
  description: '',
  account: 'rUYiTLYpN8M4xLhtRD9HQZFwqZ4WaKJc89',
  namespace_id: hexNamespace('/races'),
  hook_hash: '',
  version: [],
  hook_states: VPRARacePoolV2HookStateDefinition,
  github_url:
    'https://github.com/Transia-RnD/vpra-hooks/blob/d5d083d6f12ee0d67198b101a4ed0fb59ad7a1b7/contracts/pet_race_poolV2.c',
  hook_index: 1,
  hook_parameters: VPRARacePoolV2HookParametersDefinition,
  // TOOD:
  // txn_parameters: VPRARacePoolV2TxnParamreterDefinition,
}
