import { hexNamespace } from '@transia/hooks-toolkit'
import { Definition } from 'schema'
import { Model } from '../common/hook_state'
import { LotteryHash } from '../common/txn_parameter';
import { ReverseTicketCount, Ticket, TicketCount } from './../common/hook_state';

const hook_account = 'rE7EjcVNHjE6JdpCoDdCXjfMoKExNiKkKi'
const lottery_start_ns = hexNamespace('lottery_start')

export const LotteryICDefinition: Definition = {
  name: 'Lottery IC',
  description: 'Lottery IC',
  hook_hash: '26A0593BA5309C8EF5921AEF6D829B02830635E311B6DFAA4E9F333C68FCA17C',
  account: hook_account,
  namespace_id: hexNamespace('lottery'),
  github_url: 'https://github.com/Transia-RnD/xhs-library/blob/main/contracts/lottery/lottery_ic.c',
  version: [],
  hook_states: {
    name: '',
    description: '',
    fields: [
      // state, state_set, foreign_state_set
      Model,
      {
        ...Ticket,
        foreign_state: {
          account: hook_account,
          namespace_id: '' // lottery_hash
        }
      },
      {
        ...ReverseTicketCount,
        foreign_state: {
          account: hook_account,
          namespace_id: '' // lottery_hash
        }
      },
      {
        ...TicketCount,
        foreign_state: {
          account: hook_account,
          namespace_id: '' // lottery_hash
        }
      },
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
