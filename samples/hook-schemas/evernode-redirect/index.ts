import { hexNamespace } from '@transia/hooks-toolkit'
import { Definition } from '../../../schema'
import { EvernodeRedirectHookParametersDefinition } from './hook_parameters'

export const EvernodeRedirectHookDefinition: Definition = {
  name: 'Evernode Redirect',
  description: 'Evernode Redirect',
  account: 'rGDT9QNrosskmGbzbNP4ezvuAH3KwAkghA',
  hook_hash: 'F77C439916E3FE5C8119743BA897E08BC687D661F992DE9EDDA80E4A1A47EEAA',
  namespace_id: hexNamespace('redirect'),
  github_url: 'https://github.com/MrKnowItAlll/SetEevernodeHook',
  version: [],
  hook_parameters: EvernodeRedirectHookParametersDefinition,
}
