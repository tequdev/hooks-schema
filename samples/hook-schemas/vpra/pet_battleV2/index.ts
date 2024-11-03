import { hexNamespace } from '@transia/hooks-toolkit'
import type { Definition } from '../../../../schema'
import { VPRABattleV2HookStateDefinition } from './hook_state'
import { VPRABattleV2TxnParamreterDefinition } from './txn_parameter'

export const VPRABattleV2HookDefinition: Definition = {
  name: 'VPRA Battle V2',
  description: '',
  account: 'rUYiTLYpN8M4xLhtRD9HQZFwqZ4WaKJc89',
  namespace_id: hexNamespace('/battles'),
  hook_hash: '',
  version: [],
  hook_states: VPRABattleV2HookStateDefinition,
  github_url:
    'https://github.com/Transia-RnD/vpra-hooks/blob/d5d083d6f12ee0d67198b101a4ed0fb59ad7a1b7/contracts/pet_battleV2.c',
  hook_index: 4,
  txn_parameters: VPRABattleV2TxnParamreterDefinition,
}
