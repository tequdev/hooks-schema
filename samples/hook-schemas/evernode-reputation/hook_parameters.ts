import { Definition } from '../../../schema'

export const EvernodeReputationHookParametersDefinition: Definition['hook_parameters'] = {
  fields: [
    {
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
          pattern: null,
          binary: true,
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
          name: 'Governance Account',
        },
      ],
    },
  ],
}
