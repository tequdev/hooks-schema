
import { Definition } from '../../../schema'

export const EvernodeRegistryHookParametersDefinition: Definition['hook_parameters'] = {
  name: 'Evernode Registry',
  description: 'Evernode Registry',
  fields: [{
    name: 'Issuer Address',
    hookparam_key: [
      {
        type: 'VarString',
        name: 'Key',
        pattern: 'EVR',
        byte_length: 3,
        exclude: true,
      },
      {
        type: 'UInt8',
        name: 'Prefix',
        pattern: '1',
        exclude: true,
      },
      {
        type: 'VarString',
        name: '',
        byte_length: 27,
        pattern: '0'.repeat(27),
        exclude: true,
      },
      {
        type: 'UInt8',
        name: 'Index',
        pattern: '1',
        exclude: true,
      },
    ],
    hookparam_data: [
      {
        type: 'AccountID',
        name: 'Address',
      },
    ],
  }],
}
