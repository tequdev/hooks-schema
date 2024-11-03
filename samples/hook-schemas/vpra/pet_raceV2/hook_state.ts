import type { Definition } from '../../../../schema'
import { RaceModel } from '../common/RaceModel'

export const VPRARaceV2HookStateDefinition: Definition['hook_states'] = {
  fields: [
    {
      name: 'Pet',
      hookstate_key: [
        {
          type: 'Hash256',
          name: 'Race Hash',
        },
      ],
      hookstate_data: RaceModel,
      foreign_state: {
        account: 'rUYiTLYpN8M4xLhtRD9HQZFwqZ4WaKJc89',
        namespace_id: '', // dynamic
      },
    },
    {
      name: 'Pet participation status',
      hookstate_key: [
        {
          type: 'Hash256',
          name: 'Pet Hash',
        },
      ],
      hookstate_data: [
        {
          type: 'UInt8',
          name: 'Participated',
        },
      ],
      foreign_state: {
        account: 'rUYiTLYpN8M4xLhtRD9HQZFwqZ4WaKJc89',
        namespace_id: '', // dynamic
      },
    },
    {
      name: 'Race Participation status',
      hookstate_key: [
        {
          type: 'Null',
          byte_length: 12,
        },
        {
          type: 'AccountID',
          name: 'Hook Account',
        },
      ],
      hookstate_data: [
        {
          type: 'UInt8',
          name: 'Participated',
        },
      ],
      foreign_state: {
        account: 'rUYiTLYpN8M4xLhtRD9HQZFwqZ4WaKJc89',
        namespace_id: '', // dynamic
      },
    },
    {
      name: 'Prize Pool',
      hookstate_key: [
        {
          type: 'Hash256',
          name: 'Race Namespace',
        },
      ],
      hookstate_data: [
        {
          type: 'XFL',
          name: 'Prize Pool',
        },
      ],
      foreign_state: {
        account: 'rUYiTLYpN8M4xLhtRD9HQZFwqZ4WaKJc89',
        namespace_id: '', // dynamic
      },
    },
  ],
}
