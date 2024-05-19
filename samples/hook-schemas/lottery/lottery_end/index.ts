import { hexNamespace } from '@transia/hooks-toolkit'
import { Definition } from 'schema'
import { Model } from '../common/hook_state'
import { LotteryHash } from '../common/txn_parameter'
import { LastLedgerTime } from './../common/hook_state'

const hook_account = 'rE7EjcVNHjE6JdpCoDdCXjfMoKExNiKkKi'
const lottery_start_ns = hexNamespace('lottery_start')

export const LotteryEndDefinition: Definition = {
  name: 'Lottery End',
  description: 'Lottery End',
  hook_hash: 'B20CBEC28912E58E06B75E07C65176D879E283D99C909D5CB1465988560AB28C',
  account: hook_account,
  namespace_id: hexNamespace('lottery'),
  github_url: 'https://github.com/Transia-RnD/xhs-library/blob/main/contracts/lottery/lottery_end.c',
  version: [],
  hook_states: {
    fields: [
      // state, state_set, foreign_state_set
      Model,
      {
        ...LastLedgerTime,
        foreign_state: {
          account: hook_account,
          namespace_id: lottery_start_ns,
        },
      },
    ],
  },
  txn_parameters: {
    fields: [LotteryHash],
  },
}
