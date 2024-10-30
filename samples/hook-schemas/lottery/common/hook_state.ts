import type { HookStateDefinition } from 'schema/HookState'

type HookState = HookStateDefinition['fields'][number]

export const LastLedgerTime: HookState = {
  name: 'Last Ledger Time',
  hookstate_key: [
    {
      type: 'Null',
      byte_length: 24,
    },
    {
      type: 'UInt64',
      name: 'Lottery ID',
    },
  ],
  hookstate_data: [
    {
      type: 'UInt64',
      name: 'Last Ledger Time',
    },
  ],
}

export const Model: HookState = {
  name: 'Lottery Data',
  hookstate_key: [
    {
      type: 'Null',
      byte_length: 24,
    },
    {
      type: 'UInt64',
      name: 'Lottery ID',
    },
  ],
  hookstate_data: [
    {
      type: 'Array',
      name: 'Lottery Data',
      array: [
        {
          type: 'UInt64',
          name: 'Lottery ID',
        },
        {
          type: 'XFL',
          name: 'Price',
        },
        {
          type: 'XFL',
          name: 'Fee',
        },
        {
          type: 'AccountID',
          name: 'Fee Address',
        },
        {
          type: 'XFL',
          name: 'Max Amount',
        },
        {
          type: 'UInt64',
          name: 'Max Tickets',
        },
        {
          type: 'UInt64',
          name: 'Duration',
        },
      ],
      byte_length: 68,
    },
  ],
}

export const Ticket: HookState = {
  name: 'Ticket',
  hookstate_key: [
    {
      type: 'Hash256',
      name: 'Ticket Hash',
    },
  ],
  hookstate_data: [
    {
      type: 'AccountID',
      name: 'Account',
    },
  ],
}

export const ReverseTicketCount: HookState = {
  name: 'Reverse Ticket Count',
  hookstate_key: [
    {
      type: 'Null',
      byte_length: 24,
    },
    {
      type: 'UInt64',
      name: 'Count',
    },
  ],
  hookstate_data: [
    {
      type: 'AccountID',
      name: 'Account',
    },
  ],
}

export const TicketCount: HookState = {
  name: 'Ticket Count',
  hookstate_key: [
    {
      type: 'Null',
      byte_length: 12,
    },
    {
      type: 'AccountID',
      name: 'Hook Account',
    },
  ],
  hookstate_data: [
    {
      type: 'UInt64',
      name: 'Count',
    },
  ],
}
