import { hexNamespace } from '@transia/hooks-toolkit'
import type { Definition } from '../../../../schema'
import { VPRAUpdateV2HookParametersDefinition } from './hook_parameters'
import { VPRAUpdateV2HookStateDefinition } from './hook_state'
import { VPRAUpdateV2TxnParamreterDefinition } from './txn_parameter'

export const VPRAUpdateV2HookDefinition: Definition = {
  name: 'VPRA Update V2',
  description: '',
  account: 'rUYiTLYpN8M4xLhtRD9HQZFwqZ4WaKJc89',
  namespace_id: hexNamespace('pets'),
  hook_hash: '',
  version: [],
  hook_states: VPRAUpdateV2HookStateDefinition,
  github_url:
    'https://github.com/Transia-RnD/vpra-hooks/blob/d5d083d6f12ee0d67198b101a4ed0fb59ad7a1b7/contracts/pet_updateV2.c',
  hook_index: 2,
  hook_parameters: VPRAUpdateV2HookParametersDefinition,
  txn_parameters: VPRAUpdateV2TxnParamreterDefinition,
}
