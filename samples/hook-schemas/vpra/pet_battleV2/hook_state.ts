import type { Definition } from '../../../../schema'
import { BattleModel } from '../common/BattleModel'

export const VPRABattleV2HookStateDefinition: Definition['hook_states'] = {
  fields: [
    {
      name: 'Battle Model',
      hookstate_key: [
        {
          type: 'Hash256',
          name: 'Battle Hash',
        },
      ],
      hookstate_data: BattleModel,
    },
  ],
}
