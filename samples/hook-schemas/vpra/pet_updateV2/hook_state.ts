import type { Definition } from '../../../../schema'
import { PetModel } from '../common/PetModel'

export const VPRAUpdateV2HookStateDefinition: Definition['hook_states'] = {
  fields: [
    {
      name: 'Pet',
      hookstate_key: [
        {
          type: 'Hash256',
          name: 'Pet Digest',
        },
      ],
      hookstate_data: PetModel,
    },
  ],
}
