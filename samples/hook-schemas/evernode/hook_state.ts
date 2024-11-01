import type { Definition } from '../../../schema'
import { all as all1 } from './common/configuration'
import { all as all3 } from './common/repetitive-state-keys'
import { all as all2 } from './common/singleton-keys'

export const EvernodeHookStateDefinition: Definition['hook_states'] = {
  fields: [...all1, ...all2, ...all3],
}
