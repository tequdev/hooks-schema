import { hexNamespace } from '@transia/hooks-toolkit'
import type { Definition } from '../../../../schema'
import { VPRABreedV2HookStateDefinition } from './hook_state'
import { VPRABreedeV2TxnParamreterDefinition } from './txn_parameter'

export const VPRABreedV2HookDefinition: Definition = {
  name: 'VPRA Breed V2',
  description: '',
  account: 'rUYiTLYpN8M4xLhtRD9HQZFwqZ4WaKJc89',
  namespace_id: hexNamespace('pets'),
  hook_hash: 'AF67797FCEBEAE6DAA9C1A7E9B4D8C8B79F1AA8032EBC2D30AB82D9FEBBC5CE9',
  version: [],
  hook_states: VPRABreedV2HookStateDefinition,
  github_url:
    'https://github.com/Transia-RnD/vpra-hooks/blob/d5d083d6f12ee0d67198b101a4ed0fb59ad7a1b7/contracts/pet_breedV2.c',
  hook_index: 3,
  txn_parameters: VPRABreedeV2TxnParamreterDefinition,
}
