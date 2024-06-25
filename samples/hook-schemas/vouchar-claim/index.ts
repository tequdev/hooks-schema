import { Definition } from '../../../schema'
import { VoucharClaimHookStateDefinition } from './hook_state'
import { VoucharClaimInvokeDefinition } from './invoke_blob'
import { VoucharClaimTxnParametersDefinition } from './txn_parameters'

export const VoucharClaimHookDefinition: Definition = {
  name: 'Vouchar Claim',
  description: '',
  hook_hash: '9C83ABDEC707117F29E8E8D0BD16597D33147560939749B177AD102105522708',
  namespace_id: '5B85492F93FF99C3D72A121F2BF28BC9858EE7209AC3DA5C1079B529F4A6CAF0',
  account: 'rvoucheredGC1mB4yd2CBjs7jGMRTLexe',
  version: [],
  hook_states: VoucharClaimHookStateDefinition,
  txn_parameters: VoucharClaimTxnParametersDefinition,
  invoke_blobs: VoucharClaimInvokeDefinition,
}
