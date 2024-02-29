import { Definition } from '../../../schema'
import { EvernodeHookStateDefinition } from './hook_state'

export const EvernodeHookDefinition: Definition = {
  name: 'Evernode',
  description: 'Evernode',
  hook_hash: '',
  version: [],
  hook_states: EvernodeHookStateDefinition,
}
