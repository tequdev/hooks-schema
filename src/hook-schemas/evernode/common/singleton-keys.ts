import type { Definition } from '../../../schema';
type State = Definition["hook_states"]["hook_states"][number]

export const STK_HOST_COUNT: State = {
  name: "Host Count",
  hookstate_key: [
    {
      type: "VarString",
      name: "Key",
      pattern: "EVR",
      byte_length: 3,
      exclude: true,
    },
    {
      type: "UInt8",
      name: "Index",
      pattern: "50",
      exclude: true,
    },
    {
      type: "VarString",
      name: "padding",
      byte_length: 28,
      pattern: "0".repeat(28),
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: "UInt32",
      name: "host_count",
    },
  ],
}

export const STK_MOMENT_BASE_INFO: State = {
  name: "Moment Base Info",
  hookstate_key: [
    {
      type: "VarString",
      name: "Key",
      pattern: "EVR",
      byte_length: 3,
      exclude: true,
    },
    {
      type: "UInt8",
      name: "Index",
      pattern: "51",
      exclude: true,
    },
    {
      type: "VarString",
      name: "padding",
      byte_length: 28,
      pattern: "0".repeat(28),
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: "UInt64",
      name: "transition_index",
    },
    {
      type: "UInt32",
      name: "transition_moment",
    },

    {
      type: "UInt8",
      name: "index_type",
    },
  ],
}

export const STK_HOST_REG_FEES: State = {
  name: "Host Reg Fees",
  hookstate_key: [
    {
      type: "VarString",
      name: "Key",
      pattern: "EVR",
      byte_length: 3,
      exclude: true,
    },
    {
      type: "UInt8",
      name: "Index",
      pattern: "52",
      exclude: true,
    },
    {
      type: "VarString",
      name: "padding",
      byte_length: 28,
      pattern: "0".repeat(28),
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: "UInt64",
      name: "Host Fee",
    },
  ],
}

export const STK_MAX_REG: State = {
  name: "Max Reg",
  hookstate_key: [
    {
      type: "VarString",
      name: "Key",
      pattern: "EVR",
      byte_length: 3,
      exclude: true,
    },
    {
      type: "UInt8",
      name: "Index",
      pattern: "53",
      exclude: true,
    },
    {
      type: "VarString",
      name: "padding",
      byte_length: 28,
      pattern: "0".repeat(28),
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: "UInt64",
      name: "Max Regs",
    },
  ],
}

export const STK_REWARD_INFO: State = {
  name: "Reward Info",
  hookstate_key: [
    {
      type: "VarString",
      name: "Key",
      pattern: "EVR",
      byte_length: 3,
      exclude: true,
    },
    {
      type: "UInt8",
      name: "Index",
      pattern: "54",
      exclude: true,
    },
    {
      type: "VarString",
      name: "padding",
      byte_length: 28,
      pattern: "0".repeat(28),
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: "UInt8",
      name: "Epoch",
    },
    {
      type: "UInt32",
      name: "Saved Moment",
    },
    {
      type: "UInt32",
      name: "Prev Moment Active Host Count",
    },
    {
      type: "UInt32",
      name: "Cur Moment Active Host Count",
    },
    {
      type: "XFL",
      name: "Epoch Pool",
    },
  ],
}

export const STK_GOVERNANCE_INFO: State = {
  name: "Governance Info",
  hookstate_key: [
    {
      type: "VarString",
      name: "Key",
      pattern: "EVR",
      byte_length: 3,
      exclude: true,
    },
    {
      type: "UInt8",
      name: "Index",
      pattern: "55",
      exclude: true,
    },
    {
      type: "VarString",
      name: "padding",
      byte_length: 28,
      pattern: "0".repeat(28),
      exclude: true,
    },
  ],
  // <governance_mode(1)><last_candidate_idx(4)><voter_base_count(4)><voter_base_count_changed_timestamp(8)><foundation_last_voted_candidate_idx(4)><foundation_last_voted_timestamp(8)><elected_proposal_unique_id(32)>
  // <proposal_elected_timestamp(8)><updated_hook_count(1)>
  hookstate_data: [
    {
      type: "UInt8",
      name: "Governance Mode",
    },
    {
      type: "UInt32",
      name: "Last Candidate Idx",
    },
    {
      type: "UInt32",
      name: "Voter Base Count",
    },
    {
      type: "UInt64",
      name: "Voter Base Count Changed Timestamp",
    },
    {
      type: "UInt32",
      name: "Foundation Last Voted Candidate Idx",
    },
    {
      type: "UInt64",
      name: "Foundation Last Voted Timestamp",
    },
    {
      type: "Hash256",
      name: "Elected Proposal Unique Id",
    },
    {
      type: "UInt64",
      name: "Proposal Elected Timestamp",
    },
    {
      type: "UInt8",
      name: "Updated Hook Count",
    },
  ],
}

export const STK_TRX_FEE_BASE_INFO: State = {
  name: "Trx Fee Base Info",
  hookstate_key: [
    {
      type: "VarString",
      name: "Key",
      pattern: "EVR",
      byte_length: 3,
      exclude: true,
    },
    {
      type: "UInt8",
      name: "Index",
      pattern: "56",
      exclude: true,
    },
    {
      type: "VarString",
      name: "padding",
      byte_length: 28,
      pattern: "0".repeat(28),
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: "UInt32",
      name: "Fee Base Avg",
    },
    {
      type: "UInt64",
      name: "Avg Changed Idx",
    },
    {
      type: "UInt32",
      name: "Avg Accumulator",
    },
    {
      type: "UInt16",
      name: "Counter",
    },
  ],
}

export const all = [
  STK_HOST_COUNT,
  STK_MOMENT_BASE_INFO,
  STK_HOST_REG_FEES,
  STK_MAX_REG,
  STK_REWARD_INFO,
  STK_GOVERNANCE_INFO,
  STK_TRX_FEE_BASE_INFO
]
