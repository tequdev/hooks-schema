import { Definition } from '../../../schema'

const config_ns = 'F43437FCA1D5F3D0381073ED3EEC9AE42BF86988559E98009795A969919CBECA'
const limit_ns = 'B044C7A1647AB9065F685DAE11B8E3FCDD1194F88C2119002BD898D2913F29C0'
const total_ns = '5D8FF9C282E7D968D440BE7702A55A42491E3A7E56DFA206B2E6EAD790BEB710'

export const VoucharClaimHookStateDefinition: Definition['hook_states'] = {
  fields: [
    {
      name: 'Configurations',
      hookstate_key: [
        {
          type: 'VarString',
          name: 'LIMIT',
          byte_length: 5,
        },
        {
          type: 'Null',
          byte_length: 27,
        },
      ],
      hookstate_data: [
        {
          type: 'UInt8',
          name: 'Minimum Voucher',
        },
        {
          type: 'UInt8',
          name: 'Maxmum Voucher',
        },
        {
          type: 'UInt8',
          name: 'CAP',
        },
      ],
      foreign_state: {
        account: '',
        namespace_id: config_ns,
      },
    },
    {
      name: 'Vouchar Total',
      hookstate_key: [
        {
          type: 'VarString',
          name: 'TOTAL',
          byte_length: 5,
        },
        {
          type: 'Null',
          byte_length: 27,
        },
      ],
      hookstate_data: [
        {
          type: 'UInt64',
          name: 'Created',
        },
        {
          type: 'UInt64',
          name: 'Claimed',
        },
      ],
      foreign_state: {
        account: '',
        namespace_id: total_ns,
      },
    },
    {
      name: 'Vouchar State',
      hookstate_key: [
        {
          type: 'AccountID',
          name: 'Vouchar Creator',
        },
        {
          type: 'Null',
          byte_length: 12,
        },
      ],
      hookstate_data: [
        {
          type: 'UInt64',
          name: 'Total Sent',
        },
        {
          type: 'UInt64',
          name: 'Total Received',
        },
        {
          type: 'UInt64',
          name: 'Sent',
        },
        {
          type: 'UInt64',
          name: 'Received',
        },
        {
          type: 'UInt32',
          name: 'Ledger Create',
        },
        {
          type: 'UInt32',
          name: 'Ledger Claim',
        },
      ],
      foreign_state: {
        account: '',
        namespace_id: limit_ns,
      },
    },
    {
      name: 'Vouchar Amount',
      hookstate_key: [
        {
          type: 'Hash256',
          name: 'Public Key',
        },
      ],
      hookstate_data: [
        {
          type: 'XFL',
          name: 'Amount',
        },
      ],
    },
    {
      name: 'Emited TxnID',
      hookstate_key: [
        {
          type: 'Hash256',
          name: 'Emit Hash',
        },
      ],
      hookstate_data: [
        {
          type: 'XFL',
          name: 'Amount',
        },
        {
          type: 'Hash256',
          name: 'Public Key',
        },
      ],
    },
  ],
}
