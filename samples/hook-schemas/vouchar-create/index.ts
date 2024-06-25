import { Definition } from '../../../schema'
import { VoucharCreateHookStateDefinition } from './hook_state'
import { VoucharCreateTxnParametersDefinition } from './txn_parameters'

export const VoucharCreateHookDefinition: Definition = {
  name: 'Vouchar Create',
  description: '',
  hook_hash: '78753F1802C38D96286ACB9DB2E9CAA2A394ECBEBFA5D82537E61B38478DB146',
  namespace_id: '5B85492F93FF99C3D72A121F2BF28BC9858EE7209AC3DA5C1079B529F4A6CAF0',
  account: 'rvoucheredGC1mB4yd2CBjs7jGMRTLexe',
  version: [],
  hook_states: VoucharCreateHookStateDefinition,
  txn_parameters: VoucharCreateTxnParametersDefinition,
}
