// // Token id keys (Host registration entries for token id-based lookup).
// uint8_t STP_TOKEN_ID[32] = { 'E', 'V', 'R', 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};

// // Host address keys (Host registration entries for xrpl address-based lookup). Last 20 bytes will be replaced by host address in runtime.
// uint8_t STP_HOST_ADDR[32] = { 'E', 'V', 'R', 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};

// // Pending Transfers (Host transfer initiations for transferee address-based lookup)
// uint8_t STP_TRANSFEREE_ADDR[32] = { 'E', 'V', 'R', 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};

// // Candidate owner keys. (Hook candidate proposal info for xrpl address-based lookup). Last 20 bytes will be replaced by owner address in runtime.
// uint8_t STP_CANDIDATE_OWNER[32] = { 'E', 'V', 'R', 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};

// // Hook Candidate Id keys. (Hook candidate proposal entries for candidate id-based lookup).
// uint8_t STP_CANDIDATE_ID[32] = { 'E', 'V', 'R', 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
import type { HookStateDefinition } from 'schema/HookState'
type State = HookStateDefinition['fields'][number]

export const STP_TOKEN_ID: State = {
  name: 'Token Id',
  hookstate_key: [
    {
      type: 'VarString',
      name: 'Key',
      pattern: 'EVR',
      byte_length: 3,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '2',
      exclude: true,
    },
    {
      type: 'HexBinary',
      name: 'TokenID',
      byte_length: 28,
    },
  ],
  // <host_address(20)><cpu_model_name(40)><cpu_count(2)><cpu_speed(2)><cpu_microsec(4)><ram_mb(4)><disk_mb(4)><email(40)><accumulated_reward_amount(8)>
  hookstate_data: [
    {
      type: 'AccountID',
      name: 'Host Address',
    },
    {
      type: 'VarString',
      name: 'CPU Model Name',
      byte_length: 40,
    },
    {
      type: 'UInt16',
      name: 'CPU Count',
    },
    {
      type: 'UInt16',
      name: 'CPU Speed',
    },
    {
      type: 'UInt32',
      name: 'CPU Microsec',
    },
    {
      type: 'UInt32',
      name: 'RAM MB',
    },
    {
      type: 'UInt32',
      name: 'Disk MB',
    },
    {
      type: 'VarString',
      name: 'Email',
      byte_length: 40,
    },
    {
      type: 'XFL',
      name: 'Accumulated Reward Amount',
    },
  ],
}

export const STP_HOST_ADDR: State = {
  name: 'Host Address',
  hookstate_key: [
    {
      type: 'VarString',
      name: 'Key',
      pattern: 'EVR',
      byte_length: 3,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '3',
      exclude: true,
    },
    {
      type: 'Null',
      byte_length: 8,
    },
    {
      type: 'AccountID',
      name: 'Account',
    },
  ],
  // <token_id(32)><country_code(2)><reserved(8)><description(26)><registration_ledger(8)><registration_fee(8)><no_of_total_instances(4)><no_of_active_instances(4)>
  // <last_heartbeat_index(8)><version(3)><registration_timestamp(8)><transfer_flag(1)><last_vote_candidate_idx(4)><last_vote_timestamp(8)><support_vote_sent(1)><host_reputation(1)><flags(1)><transfer_timestamp(8)><host_lease_amount(8,xfl)>
  hookstate_data: [
    {
      type: 'LedgerEntryID',
      name: 'TokenID',
    },
    {
      type: 'VarString',
      name: 'Country Code',
      byte_length: 2,
    },
    {
      type: 'VarString',
      name: 'Reserved',
      byte_length: 8,
    },
    {
      type: 'VarString',
      name: 'Description',
      byte_length: 26,
    },
    {
      type: 'UInt64',
      name: 'Registration Ledger',
    },
    {
      type: 'UInt64',
      name: 'Registration Fee',
    },
    {
      type: 'UInt32',
      name: 'No of Total Instances',
    },
    {
      type: 'UInt32',
      name: 'No of Active Instances',
    },
    {
      type: 'UInt64',
      name: 'Last Heartbeat Index',
    },
    {
      type: 'Array',
      name: 'Version',
      array: [
        {
          type: 'UInt8',
          name: 'major',
        },
        {
          type: 'UInt8',
          name: 'minor',
        },
        {
          type: 'UInt8',
          name: 'patch',
        },
      ],
      array_length: 3,
      byte_length: 3,
      delimiter: '.',
    },
    {
      type: 'DateTime64',
      name: 'Registration Timestamp',
      epoch: 'unix',
    },
    {
      type: 'UInt8',
      name: 'Transfer Flag',
    },
    {
      type: 'UInt32',
      name: 'Last Vote Candidate Idx',
    },
    {
      type: 'DateTime64',
      name: 'Last Vote Timestamp',
      epoch: 'unix',
    },
    {
      type: 'UInt8',
      name: 'Support Vote Sent',
    },
    {
      type: 'UInt8',
      name: 'Host Reputation',
    },
    {
      type: 'UInt8',
      name: 'Flags',
    },
    {
      type: 'DateTime64',
      name: 'Transfer Timestamp',
      epoch: 'unix',
    },
    {
      type: 'XFL',
      name: 'Host Lease Amount',
    },
  ],
}

export const STP_HOST_ADDR_081: State = {
  name: 'Host Address',
  hookstate_key: [
    {
      type: 'VarString',
      name: 'Key',
      pattern: 'EVR',
      byte_length: 3,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '3',
      exclude: true,
    },
    {
      type: 'Null',
      byte_length: 8,
    },
    {
      type: 'AccountID',
      name: 'Account',
    },
  ],
  // <token_id(32)><country_code(2)><reserved(8)><description(26)><registration_ledger(8)><registration_fee(8)><no_of_total_instances(4)><no_of_active_instances(4)>
  // <last_heartbeat_index(8)><version(3)><registration_timestamp(8)><transfer_flag(1)><last_vote_candidate_idx(4)><last_vote_timestamp(8)><support_vote_sent(1)><host_reputation(1)><flags(1)><transfer_timestamp(8)>
  hookstate_data: [
    {
      type: 'LedgerEntryID',
      name: 'TokenID',
      byte_length: 32,
    },
    {
      type: 'VarString',
      name: 'Country Code',
      byte_length: 2,
    },
    {
      type: 'VarString',
      name: 'Reserved',
      byte_length: 8,
    },
    {
      type: 'VarString',
      name: 'Description',
      byte_length: 26,
    },
    {
      type: 'UInt64',
      name: 'Registration Ledger',
    },
    {
      type: 'UInt64',
      name: 'Registration Fee',
    },
    {
      type: 'UInt32',
      name: 'No of Total Instances',
    },
    {
      type: 'UInt32',
      name: 'No of Active Instances',
    },
    {
      type: 'UInt64',
      name: 'Last Heartbeat Index',
    },
    {
      type: 'Array',
      name: 'Version',
      array: [
        {
          type: 'UInt8',
          name: 'major',
        },
        {
          type: 'UInt8',
          name: 'minor',
        },
        {
          type: 'UInt8',
          name: 'patch',
        },
      ],
      array_length: 3,
      byte_length: 3,
      delimiter: '.',
    },
    {
      type: 'DateTime64',
      name: 'Registration Timestamp',
      epoch: 'unix',
    },
    {
      type: 'UInt8',
      name: 'Transfer Flag',
    },
    {
      type: 'UInt32',
      name: 'Last Vote Candidate Idx',
    },
    {
      type: 'DateTime64',
      name: 'Last Vote Timestamp',
      epoch: 'unix',
    },
    {
      type: 'UInt8',
      name: 'Support Vote Sent',
    },
    {
      type: 'UInt8',
      name: 'Host Reputation',
    },
    {
      type: 'UInt8',
      name: 'Flags',
    },
    {
      type: 'DateTime64',
      name: 'Transfer Timestamp',
      epoch: 'unix',
    },
  ],
}

export const STP_HOST_ADDR_080: State = {
  name: 'Host Address',
  hookstate_key: [
    {
      type: 'VarString',
      name: 'Key',
      pattern: 'EVR',
      byte_length: 3,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '3',
      exclude: true,
    },
    {
      type: 'Null',
      byte_length: 8,
    },
    {
      type: 'AccountID',
      name: 'Account',
    },
  ],
  // <token_id(32)><country_code(2)><reserved(8)><description(26)><registration_ledger(8)><registration_fee(8)><no_of_total_instances(4)><no_of_active_instances(4)>
  // <last_heartbeat_index(8)><version(3)><registration_timestamp(8)><transfer_flag(1)><last_vote_candidate_idx(4)><last_vote_timestamp(8)><support_vote_sent(1)><host_reputation(1)><flags(1)>
  hookstate_data: [
    {
      type: 'LedgerEntryID',
      name: 'TokenID',
    },
    {
      type: 'VarString',
      name: 'Country Code',
      byte_length: 2,
    },
    {
      type: 'VarString',
      name: 'Reserved',
      byte_length: 8,
    },
    {
      type: 'VarString',
      name: 'Description',
      byte_length: 26,
    },
    {
      type: 'UInt64',
      name: 'Registration Ledger',
    },
    {
      type: 'UInt64',
      name: 'Registration Fee',
    },
    {
      type: 'UInt32',
      name: 'No of Total Instances',
    },
    {
      type: 'UInt32',
      name: 'No of Active Instances',
    },
    {
      type: 'UInt64',
      name: 'Last Heartbeat Index',
    },
    {
      type: 'Array',
      name: 'Version',
      array: [
        {
          type: 'UInt8',
          name: 'major',
        },
        {
          type: 'UInt8',
          name: 'minor',
        },
        {
          type: 'UInt8',
          name: 'patch',
        },
      ],
      array_length: 3,
      byte_length: 3,
      delimiter: '.',
    },
    {
      type: 'DateTime64',
      name: 'Registration Timestamp',
      epoch: 'unix',
    },
    {
      type: 'UInt8',
      name: 'Transfer Flag',
    },
    {
      type: 'UInt32',
      name: 'Last Vote Candidate Idx',
    },
    {
      type: 'DateTime64',
      name: 'Last Vote Timestamp',
      epoch: 'unix',
    },
    {
      type: 'UInt8',
      name: 'Support Vote Sent',
    },
    {
      type: 'UInt8',
      name: 'Host Reputation',
    },
    {
      type: 'UInt8',
      name: 'Flags',
    },
  ],
}

export const STP_TRANSFEREE_ADDR: State = {
  name: 'Transferee Address',
  hookstate_key: [
    {
      type: 'VarString',
      name: 'Key',
      pattern: 'EVR',
      byte_length: 3,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '4',
      exclude: true,
    },
    {
      type: 'Null',
      byte_length: 8,
    },
    {
      type: 'AccountID',
      name: 'Account',
    },
  ],
  // <transferring_host_address(20)><registration_ledger(8)><token_id(32)>
  hookstate_data: [
    {
      type: 'AccountID',
      name: 'Transferring Host Address',
    },
    {
      type: 'UInt64',
      name: 'Registration Ledger',
    },
    {
      type: 'LedgerEntryID',
      name: 'TokenID',
    },
  ],
}

export const STP_CANDIDATE_OWNER: State = {
  name: 'Candidate Owner',
  hookstate_key: [
    {
      type: 'VarString',
      name: 'Key',
      pattern: 'EVR',
      byte_length: 3,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '5',
      exclude: true,
    },
    {
      type: 'Null',
      byte_length: 8,
    },
    {
      type: 'AccountID',
      name: 'Account',
    },
  ],
  // <GOVERNOR_HASH(32)><REGISTRY_HASH(32)><HEARTBEAT_HASH(32)>
  hookstate_data: [
    {
      type: 'Hash256',
      name: 'Governor Hash',
    },
    {
      type: 'Hash256',
      name: 'Registry Hash',
    },
    {
      type: 'Hash256',
      name: 'Heartbeat Hash',
    },
    {
      type: 'Hash256',
      name: 'Reputation Hash',
    },
  ],
}

export const STP_CANDIDATE_ID: State = {
  name: 'Candidate ID',
  hookstate_key: [
    {
      type: 'VarString',
      name: 'Key',
      pattern: 'EVR',
      byte_length: 3,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '6',
      exclude: true,
    },
    {
      type: 'VarString',
      name: 'CandidateID',
      byte_length: 28,
    },
  ],
  // <owner_address(20)><candidate_idx(4)><short_name(20)><created_timestamp(8)><proposal_fee(8)><positive_vote_count(4)>
  // <last_vote_timestamp(8)><status(1)><status_change_timestamp(8)><foundation_vote_status(1)>
  hookstate_data: [
    {
      type: 'AccountID',
      name: 'Owner Address',
    },
    {
      type: 'UInt32',
      name: 'Candidate Idx',
    },
    {
      type: 'VarString',
      name: 'Short Name',
      byte_length: 20,
    },
    {
      type: 'DateTime64',
      name: 'Created Timestamp',
      epoch: 'unix',
    },
    {
      type: 'XFL',
      name: 'Proposal Fee',
    },
    {
      type: 'UInt32',
      name: 'Positive Vote Count',
    },
    {
      type: 'DateTime64',
      name: 'Last Vote Timestamp',
      epoch: 'unix',
    },
    {
      type: 'UInt8',
      name: 'Status',
    },
    {
      type: 'DateTime64',
      name: 'Status Change Timestamp',
      epoch: 'unix',
    },
    {
      type: 'UInt8',
      name: 'Foundation Vote Status',
    },
  ],
}

export const all = [
  STP_TOKEN_ID,
  STP_HOST_ADDR,
  STP_HOST_ADDR_081,
  STP_HOST_ADDR_080,
  STP_TRANSFEREE_ADDR,
  STP_CANDIDATE_OWNER,
  STP_CANDIDATE_ID,
]
