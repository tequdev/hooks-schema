import { hexNamespace } from '@transia/hooks-toolkit'
import { Definition } from '../../../../schema'
import { LotteryHash } from '../common/txn_parameter'
import { LastLedgerTime, Model } from './../common/hook_state'

const hook_account = 'rE7EjcVNHjE6JdpCoDdCXjfMoKExNiKkKi'
const lottery_ns = hexNamespace('lottery')

export const LotteryStartDefinition: Definition = {
  name: 'Lottery Start',
  description: 'Lottery Start',
  hook_hash: '6EDD0BB75960203E157E63628E34B908C76D2FFCEF243BB1398378CA945E6092',
  account: hook_account,
  namespace_id: hexNamespace('lottery_start'),
  github_url: 'https://github.com/Transia-RnD/xhs-library/blob/main/contracts/lottery/lottery_start.c',
  version: [],
  hook_states: {
    fields: [
      // state, state_set, foreign_state_set
      {
        ...Model,
        foreign_state: {
          account: hook_account,
          namespace_id: lottery_ns,
        },
      },
      LastLedgerTime,
    ],
  },
  txn_parameters: {
    fields: [LotteryHash],
  },
}
