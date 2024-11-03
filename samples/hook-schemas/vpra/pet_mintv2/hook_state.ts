import type { Definition } from '../../../../schema'
import { PetModel } from '../common/PetModel'

export const VPRAMintV2HookStateDefinition: Definition['hook_states'] = {
  fields: [
    {
      name: 'Pet',
      hookstate_key: [
        {
          type: 'Hash256',
          name: 'Pet ID',
        },
      ],
      hookstate_data: PetModel,
    },
    {
      name: 'Pet Count',
      hookstate_key: [
        {
          type: 'Null',
          byte_length: 12,
        },
        {
          type: 'AccountID',
          name: 'hook account',
        },
      ],
      hookstate_data: [
        {
          type: 'UInt64',
          name: 'Pet Count',
        },
      ],
    },
  ],
}
