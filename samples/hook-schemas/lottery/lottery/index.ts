import { hexNamespace } from '@transia/hooks-toolkit'
import { Definition } from 'schema'
import { LastLedgerTime, Model, ReverseTicketCount, Ticket, TicketCount } from '../common/hook_state'
import { LotteryHash } from '../common/txn_parameter'

const hook_account = 'rE7EjcVNHjE6JdpCoDdCXjfMoKExNiKkKi'

export const LotteryHookDefinition: Definition = {
  name: 'Lottery',
  description: 'Lottery',
  hook_hash: 'CFFFA11775796EE0A4B89641AA62841CDA9CEB0DF58A73833ACB38902D85F976',
  account: hook_account,
  namespace_id: hexNamespace('lottery'),
  github_url: 'https://github.com/Transia-RnD/xhs-library/blob/main/contracts/lottery/lottery.c',
  version: [],
  hook_states: {
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
    fields: [{
      ...LotteryHash,
      transaction_types: ['Payment'],
    }]
  }
}
