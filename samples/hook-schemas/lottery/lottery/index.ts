import { hexNamespace } from '@transia/hooks-toolkit'
import { Definition } from 'schema'
import { LastLedgerTime, Model, ReverseTicketCount, Ticket, TicketCount } from '../common/hook_state'
import { LotteryHash } from '../common/txn_parameter'

const hook_account = 'rE7EjcVNHjE6JdpCoDdCXjfMoKExNiKkKi'

export const LotteryHookDefinition: Definition = {
  name: 'Lottery',
  description: 'Lottery',
  hook_hash: '7A16488EBCDB2C16E2A733FF4FF524FDE1CFDB293CF352801C41CFE1A8B0231B',
  account: hook_account,
  namespace_id: hexNamespace('lottery'),
  github_url: 'https://github.com/Transia-RnD/xhs-library/blob/main/contracts/lottery/lottery.c',
  version: [],
  hook_states: {
    name: '',
    description: '',
    fields: [
      // state, state_set, foreign_state_set
      {
        ...LastLedgerTime,
        name: 'End Ledger Time',
        foreign_state: {
          account: hook_account,
          namespace_id: '', // TODO: lottery_hash (hash(Lottery ID))
        },
      },
      Model,
      {
        ...Ticket,
        foreign_state: {
          account: hook_account,
          namespace_id: '' // TODO: lottery_hash (hash(Lottery ID))
        }
      },
      {
        ...ReverseTicketCount,
        foreign_state: {
          account: hook_account,
          namespace_id: '' // TODO: lottery_hash (hash(Lottery ID))
        }
      },
      {
        ...TicketCount,
        foreign_state: {
          account: hook_account,
          namespace_id: '' // TODO: lottery_hash (hash(Lottery ID))
        }
      },
    ]
  },
  txn_parameters: {
    name: '',
    description: '',
    fields: [{
      ...LotteryHash,
      transaction_types: ['Payment'],
    }]
  }
}
