
import { Definition } from '../../../schema'

export const GovernanceHookParametersDefinition: Definition['hook_parameters'] = {
  fields: [
    {
      hookparam_key: [{
        type: 'VarString',
        name: 'Initial Member Count',
        pattern: 'IMC',
        byte_length: 3,
      }],
      hookparam_data: [{
        type: 'UInt8',
        name: 'Count',
      }],
    },
    {
      hookparam_key: [{
        type: 'VarString',
        name: 'Initial Reward Rate',
        pattern: 'IRR',
        byte_length: 3,
      }],
      hookparam_data: [{
        type: 'XFL',
        name: 'Reward Rate',
      }],
    },
    {
      hookparam_key: [{
        type: 'VarString',
        name: 'Initial Reward Delay',
        pattern: 'IRD',
        byte_length: 3,
      }],
      hookparam_data: [{
        type: 'XFL',
        name: 'Reward Delay',
      }],
    },
    {
      hookparam_key: [{
        type: 'VarString',
        name: 'Initial Seat',
        pattern: 'IS',
        byte_length: 2,
      }, {
        type: 'UInt8',
        name: 'Index',
      }],
      hookparam_data: [{
        type: 'AccountID',
        name: 'Account',
      }],
    },
  ],
}
