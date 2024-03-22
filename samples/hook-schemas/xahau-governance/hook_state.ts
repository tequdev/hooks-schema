import { Definition } from '../../../schema'

export const GovernanceHookStateDefinition: Definition['hook_states'] = {
  name: 'Governance',
  description: 'Governance',
  fields: [
    {
      name: 'Current member count',
      hookstate_key: [
        {
          type: 'VarString',
          name: 'padding',
          byte_length: 30,
          pattern: null,
          binary: true,
          exclude: true,
        },
        {
          type: 'VarString',
          name: 'type',
          byte_length: 2,
          pattern: 'MC',
        },
      ],
      hookstate_data: [
        {
          type: 'UInt8',
          name: 'Count',
          byte_length: 1,
        },
      ],
    },
    {
      name: 'Current reward rate',
      hookstate_key: [
        {
          type: 'VarString',
          name: 'padding',
          byte_length: 30,
          pattern: null,
          binary: true,
          exclude: true,
        },
        {
          type: 'VarString',
          name: 'type',
          byte_length: 2,
          pattern: 'RR',
        },
      ],
      hookstate_data: [
        {
          name: 'Value',
          type: 'XFL',
        },
      ],
    },
    {
      name: 'Current reward delay',
      hookstate_key: [
        {
          type: 'VarString',
          name: 'padding',
          byte_length: 30,
          pattern: null,
          binary: true,
          exclude: true,
        },
        {
          type: 'VarString',
          name: 'type',
          byte_length: 2,
          pattern: 'RD',
        },
      ],
      hookstate_data: [
        {
          type: 'XFL',
          name: 'Value',
        },
      ],
    },
    {
      name: 'Seat Place',
      hookstate_key: [
        {
          type: 'VarString',
          name: 'padding',
          byte_length: 31,
          pattern: null,
          binary: true,
          exclude: true,
        },
        {
          // SeatID
          type: 'UInt8',
          name: 'SeatID',
        },
      ],
      hookstate_data: [
        {
          type: 'AccountID',
          name: 'Account',
        },
      ],
    },
    {
      name: 'Account Place',
      hookstate_key: [
        {
          type: 'VarString',
          name: 'padding',
          byte_length: 12,
          pattern: null,
          binary: true,
          exclude: true,
        },
        {
          type: 'AccountID',
          name: 'Account',
        },
      ],
      hookstate_data: [
        {
          type: 'UInt8',
          name: 'SeatID',
        },
      ],
    },
    {
      name: 'Vote Hook',
      hookstate_key: [
        {
          type: 'VarString',
          name: 'Type',
          pattern: 'VH',
          byte_length: 2,
        },
        {
          type: 'UInt8',
          name: 'Slot',
        },
        {
          type: 'UInt8',
          name: 'Layer',
        },
        {
          type: 'VarString',
          name: 'padding',
          byte_length: 8,
          pattern: null,
          binary: true,
          exclude: true,
        },
        {
          type: 'AccountID',
          name: 'Account',
        },
      ],
      hookstate_data: [
        {
          type: 'Hash256',
          name: 'HookHash',
        },
      ],
    },
    {
      name: 'Vote Reward Rate',
      hookstate_key: [
        {
          type: 'VarString',
          name: 'type',
          pattern: 'VRR',
          byte_length: 3,
        },
        {
          type: 'UInt8',
          name: 'Layer',
        },
        {
          type: 'VarString',
          name: 'padding',
          byte_length: 8,
          pattern: null,
          binary: true,
          exclude: true,
        },
        {
          type: 'AccountID',
          name: 'Account',
        },
      ],
      hookstate_data: [
        {
          type: 'XFL',
          name: 'Value',
        },
      ],
    },
    {
      name: 'Vote Reward Delay',
      hookstate_key: [
        {
          type: 'VarString',
          name: 'type',
          pattern: 'VRD',
          byte_length: 3,
        },
        {
          type: 'UInt8',
          name: 'Layer',
        },
        {
          type: 'VarString',
          name: 'padding',
          byte_length: 8,
          pattern: null,
          binary: true,
          exclude: true,
        },
        {
          type: 'AccountID',
          name: 'Account',
        },
      ],
      hookstate_data: [
        {
          type: 'XFL',
          name: 'Value',
        },
      ],
    },
    {
      name: 'Vote Seat',
      hookstate_key: [
        {
          type: 'VarString',
          name: 'type',
          pattern: 'VS',
          byte_length: 2,
        },
        {
          type: 'UInt8',
          name: 'SeatID',
        },
        {
          type: 'UInt8',
          name: 'Layer',
        },
        {
          type: 'VarString',
          name: 'padding',
          byte_length: 8,
          pattern: null,
          binary: true,
          exclude: true,
        },
        {
          type: 'AccountID',
          name: 'Account',
        },
      ],
      hookstate_data: [
        {
          type: 'AccountID',
          name: 'Account',
        },
      ],
    },
    {
      name: 'Count Vote Hook',
      hookstate_key: [
        {
          type: 'VarString',
          name: 'type',
          pattern: 'CH',
          byte_length: 2,
        },
        {
          type: 'UInt8',
          name: 'Slot',
        },
        {
          type: 'UInt8',
          name: 'Layer',
        },
        {
          type: 'VarString',
          byte_length: 28,
          binary: true,
          name: 'HookHash',
        },
      ],
      hookstate_data: [
        {
          type: 'UInt8',
          name: 'Count',
        },
      ],
    },
    {
      name: 'Count Vote Reward Rate',
      hookstate_key: [
        {
          type: 'VarString',
          name: 'type',
          pattern: 'CRR',
          byte_length: 3,
        },
        {
          type: 'UInt8',
          name: 'Layer',
        },
        {
          type: 'VarString',
          name: 'padding',
          byte_length: 20,
          binary: true,
          exclude: true,
        },
        {
          type: 'XFL',
          name: 'Value',
        },
      ],
      hookstate_data: [
        {
          type: 'UInt8',
          name: 'Count',
        },
      ],
    },
    {
      name: 'Count Vote Reward Delay',
      hookstate_key: [
        {
          type: 'VarString',
          name: 'type',
          pattern: 'CRD',
          byte_length: 3,
        },
        {
          type: 'UInt8',
          name: 'Layer',
        },
        {
          type: 'VarString',
          name: 'padding',
          byte_length: 20,
          binary: true,
          exclude: true,
        },
        {
          type: 'XFL',
          name: 'Value',
        },
      ],
      hookstate_data: [
        {
          type: 'UInt8',
          name: 'Count',
        },
      ],
    },
    {
      name: 'Count Vote Seat',
      hookstate_key: [
        {
          type: 'VarString',
          name: 'type',
          pattern: 'CS',
          byte_length: 2,
        },
        {
          type: 'UInt8',
          name: 'SeatID',
        },
        {
          type: 'UInt8',
          name: 'Layer',
        },
        {
          type: 'VarString',
          name: 'padding',
          byte_length: 8,
          pattern: null,
          binary: true,
          exclude: true,
        },
        {
          type: 'AccountID',
          name: 'Account',
        },
      ],
      hookstate_data: [
        {
          type: 'UInt8',
          name: 'Count',
        },
      ],
    },
  ],
}
