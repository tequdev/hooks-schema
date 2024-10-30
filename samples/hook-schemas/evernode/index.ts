import { hexNamespace } from '@transia/hooks-toolkit'
import type { Definition } from '../../../schema'
import { EvernodeHookStateDefinition } from './hook_state'

export const EvernodeHookDefinition: Definition = {
  name: 'Evernode',
  description: 'Evernode',
  account: 'rBvKgF3jSZWdJcwSsmoJspoXLLDVLDp6jg',
  namespace_id: hexNamespace('evernode.org|registry'),
  hook_hash: '01EAF09326B4911554384121FF56FA8FECC215FDDE2EC35D9E59F2C53EC665A0',
  version: [],
  hook_states: EvernodeHookStateDefinition,
}
