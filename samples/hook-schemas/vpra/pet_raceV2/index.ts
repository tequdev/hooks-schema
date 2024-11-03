import { hexNamespace } from '@transia/hooks-toolkit'
import type { Definition } from '../../../../schema'
import { VPRARaceV2HookParametersDefinition } from './hook_parameters'
import { VPRARaceV2HookStateDefinition } from './hook_state'
import { VPRARaceV2TxnParamreterDefinition } from './txn_parameter'

export const VPRARaceV2HookDefinition: Definition = {
  name: 'VPRA Race V2',
  description: '',
  account: 'rUYiTLYpN8M4xLhtRD9HQZFwqZ4WaKJc89',
  namespace_id: hexNamespace('/races'),
  hook_hash: '4F4D2D41E55B9D15BB24DCC0EEC62CB0B647E05774C7FCA704349C164B343B83',
  version: [],
  hook_states: VPRARaceV2HookStateDefinition,
  github_url:
    'https://github.com/Transia-RnD/vpra-hooks/blob/d5d083d6f12ee0d67198b101a4ed0fb59ad7a1b7/contracts/pet_raceV2.c',
  hook_index: 5,
  hook_parameters: VPRARaceV2HookParametersDefinition,
  txn_parameters: VPRARaceV2TxnParamreterDefinition,
}
