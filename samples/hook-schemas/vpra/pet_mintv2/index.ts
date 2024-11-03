import { hexNamespace } from '@transia/hooks-toolkit'
import type { Definition } from '../../../../schema'
import { VPRAMintV2HookParametersDefinition } from './hook_parameters'
import { VPRAMintV2HookStateDefinition } from './hook_state'
import { VPRAMintV2TxnParamreterDefinition } from './txn_parameter'

export const VPRAMintV2HookDefinition: Definition = {
  name: 'VPRA Mint V2',
  description: '',
  account: 'rUYiTLYpN8M4xLhtRD9HQZFwqZ4WaKJc89',
  namespace_id: hexNamespace('pets'),
  hook_hash: '6376E31EA396A96B35BB65689356050FE0C2EB3C0E0EC69B2045222BA8EB31CE',
  version: [],
  hook_states: VPRAMintV2HookStateDefinition,
  github_url:
    'https://github.com/Transia-RnD/vpra-hooks/blob/d5d083d6f12ee0d67198b101a4ed0fb59ad7a1b7/contracts/pet_mintv2.c',
  hook_index: 1,
  hook_parameters: VPRAMintV2HookParametersDefinition,
  txn_parameters: VPRAMintV2TxnParamreterDefinition,
}
