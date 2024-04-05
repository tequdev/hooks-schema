import { Definition } from '../../../schema'

export const EvernodeRedirectHookParametersDefinition: Definition['hook_parameters'] = {
  fields: [{
    hookparam_key: [{
      type: 'VarString',
      name: 'Account',
      pattern: 'A',
      byte_length: 1,
      exclude: true,
    }],
    hookparam_data: [{
      type: 'AccountID',
      name: 'Account',
    }],
  }],
}
