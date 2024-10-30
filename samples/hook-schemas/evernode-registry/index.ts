import { hexNamespace } from '@transia/hooks-toolkit'
import type { Definition } from '../../../schema'
import { EvernodeRegistryHookParametersDefinition } from './hook_parameters'

export const EvernodeHeartbeatHookDefinition: Definition = {
  name: 'Evernode Heartbeat',
  description: 'Evernode Heartbeat',
  account: 'rmv53yu8Wid6kj6AC6NvmiwSXNxRa8vTH',
  hook_hash: 'A524275CB35E9FF13FF048FF7BE1A23DA4F8918DF46F9C2DC1D5ECC63D4C4AFC',
  namespace_id: hexNamespace('evernode.org|registry'),
  version: [],
  hook_parameters: EvernodeRegistryHookParametersDefinition,
}
