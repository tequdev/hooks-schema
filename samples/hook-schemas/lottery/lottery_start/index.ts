import { hexNamespace } from '@transia/hooks-toolkit'
import { Definition } from '../../../../schema'
import { LotteryHash } from '../common/txn_parameter';
import { LastLedgerTime, Model } from './../common/hook_state';

const hook_account = 'rE7EjcVNHjE6JdpCoDdCXjfMoKExNiKkKi'
const lottery_ns = hexNamespace("lottery")

export const LotteryStartDefinition: Definition = {
  name: 'Lottery Start',
  description: 'Lottery Start',
  hook_hash: '80F5BD0BF1504484C29ECA34F61745EE8FDEB38D3A9B38DA6C4C3BD47236667A',
  account: hook_account,
  namespace_id: hexNamespace('lottery_start'),
  github_url: 'https://github.com/Transia-RnD/xhs-library/blob/main/contracts/lottery/lottery_start.c',
  version: [],
  hook_states: {
    name: '',
    description: '',
    fields: [
      // state, state_set, foreign_state_set
      {
        ...Model,
        foreign_state: {
          account: hook_account,
          namespace_id: lottery_ns,
        }
      },
      LastLedgerTime,
    ]
  },
  txn_parameters: {
    name: '',
    description: '',
    fields: [
      LotteryHash
    ]
  }
}
