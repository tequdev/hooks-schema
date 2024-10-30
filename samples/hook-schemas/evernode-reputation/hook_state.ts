import type { Definition } from 'schema'

export const EvernodeReputationHookStateDefinition: Definition['hook_states'] = {
  fields: [
    {
      name: 'Cleanup Moment',
      hookstate_key: [
        {
          type: 'Null',
          byte_length: 24,
        },
        {
          type: 'VarString',
          name: 'Special',
          pattern: 'FFFFFFFFFFFFFFFF',
          binary: true,
          byte_length: 8,
        },
      ],
      hookstate_data: [
        {
          type: 'UInt64',
          name: 'Cleanup Moment',
        },
      ],
    },
    {
      name: 'Host Count in that moment',
      hookstate_key: [
        {
          type: 'Null',
          byte_length: 24,
        },
        {
          type: 'UInt64',
          name: 'Moment',
        },
      ],
      hookstate_data: [
        {
          type: 'UInt64',
          name: 'Host Count',
        },
      ],
    },
    {
      name: 'Reputation Account',
      hookstate_key: [
        {
          type: 'Null',
          byte_length: 16,
        },
        {
          type: 'UInt64',
          name: 'Moment',
        },
        {
          type: 'UInt64',
          name: 'Ordered HostID',
        },
      ],
      hookstate_data: [
        {
          type: 'AccountID',
          name: 'Reputation Account',
        },
      ],
    },
    {
      name: 'Reputation',
      hookstate_key: [
        {
          type: 'Null',
          byte_length: 12,
        },
        {
          type: 'AccountID',
          name: 'Reputation Account',
        },
      ],
      hookstate_data: [
        {
          type: 'UInt64',
          name: 'Last Registered Moment',
        },
        {
          type: 'UInt64',
          name: 'Score Numerator',
        },
        {
          type: 'UInt64',
          name: 'Score Denominator',
        },
      ],
    },
    {
      name: 'Ordered HostID',
      hookstate_key: [
        {
          type: 'Null',
          byte_length: 4,
        },
        {
          type: 'UInt64',
          name: 'Next Moment',
        },
        {
          type: 'AccountID',
          name: 'Reputation Account',
        },
      ],
      hookstate_data: [
        {
          type: 'UInt64',
          name: 'Ordered HostID',
        },
      ],
    },
  ],
}
