import { hexNamespace } from '@transia/hooks-toolkit'
import { Definition } from 'schema'
import { LotteryHash } from '../common/txn_parameter'
import { LastLedgerTime, Model } from './../common/hook_state'

const hook_account = 'rE7EjcVNHjE6JdpCoDdCXjfMoKExNiKkKi'
const lottery_start_ns = hexNamespace('lottery_start')

export const LotteryEndICDefinition: Definition = {
  name: 'Lottery End IC',
  description: 'Lottery End IC',
  hook_hash: 'F04C04B541DC0624205DB373FF4F7A2B89F3C9723E56D1DF41C6AF847DD32FEB',
  account: hook_account,
  namespace_id: hexNamespace('lottery'),
  github_url: 'https://github.com/Transia-RnD/xhs-library/blob/main/contracts/lottery/lottery_end_ic.c',
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
