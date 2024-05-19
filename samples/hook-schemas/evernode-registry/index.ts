import { Definition } from '../../../schema'
import { EvernodeRegistryHookParametersDefinition } from './hook_parameters'

export const EvernodeHeartbeatHookDefinition: Definition = {
  name: 'Evernode Heartbeat',
  description: 'Evernode Heartbeat',
  hook_hash: 'FB7159503D2F6572B539B65994028B1E945871A5BCC7BB2ECDF63CE34ECB2945',
  version: [],
  hook_parameters: EvernodeRegistryHookParametersDefinition,
}
