// // Issuer address.
// const uint8_t CONF_ISSUER_ADDR[32] = { 'E', 'V', 'R', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 };
// // Foundation address
// const uint8_t CONF_FOUNDATION_ADDR[32] = { 'E', 'V', 'R', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2 };
// // Seconds per moment.
// const uint8_t CONF_MOMENT_SIZE[32] = { 'E', 'V', 'R', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3 };
// // No. of Evers that will be ever issued.
// const uint8_t CONF_MINT_LIMIT[32] = { 'E', 'V', 'R', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4 };
// // Portion of registration fee forfeit by the foundation.
// const uint8_t CONF_FIXED_REG_FEE[32] = { 'E', 'V', 'R', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5 };
// // Moment frequency which host should keep signaling the registry contract (which used to track host aliveness).
// const uint8_t CONF_HOST_HEARTBEAT_FREQ[32] = { 'E', 'V', 'R', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6 };
// // Lease acquire ledger window.
// const uint8_t CONF_LEASE_ACQUIRE_WINDOW[32] = { 'E', 'V', 'R', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7 };
// // Reward configuration <epoch_count(uint8_t)><first_epoch_reward_quota(uint32_t)><epoch_reward_amount(uint32_t)><reward_start_moment(uint32_t)><accumulated_reward_frequency(uint16_t)><host_reputation_threshold(uint8_t)>.
// const uint8_t CONF_REWARD_CONFIGURATION[32] = { 'E', 'V', 'R', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8 };
// // The maximum tolerable downtime for a host.
// const uint8_t CONF_MAX_TOLERABLE_DOWNTIME[32] = { 'E', 'V', 'R', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9 };
// // Scheduled moment size transition info <transition_index(uint64_t)><moment_size(uint16_t)><index_type(uint_8)>.
// const uint8_t CONF_MOMENT_TRANSIT_INFO[32] = { 'E', 'V', 'R', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10 };
// // The maximum fee Hook can bear for a transaction emission.
// // To mitigate consuming XRPs unnecessarily due to the execution of Hooks that might be in destination accounts.
// const uint8_t CONF_MAX_EMIT_TRX_FEE[32] = { 'E', 'V', 'R', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11 };
// // Heartbeat Hook address.
// const uint8_t CONF_HEARTBEAT_ADDR[32] = { 'E', 'V', 'R', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12 };
// // Registry Hook address.
// const uint8_t CONF_REGISTRY_ADDR[32] = { 'E', 'V', 'R', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13 };
// // Governance configuration for proposing/voting <eligibility_period(uint32_t)><candidate_life_period(uint32_t)><candidate_election_period(uint32_t)>
// // <candidate_support_average(uint16_t)>.
// const uint8_t CONF_GOVERNANCE_CONFIGURATION[32] = { 'E', 'V', 'R', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14 };
// // Network configuration <busyness_detect_period(uint32_t)><busyness_detect_average(uint16_t)>.
// const uint8_t CONF_NETWORK_CONFIGURATION[32] = { 'E', 'V', 'R', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15 };

import { HookStateDefinition } from 'schema/HookState'
type State = HookStateDefinition['fields'][number]

export const CONF_ISSUER_ADDR: State = {
  name: 'Issuer Address',
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
      name: 'Prefix',
      pattern: '1',
      exclude: true,
    },
    {
      type: 'VarString',
      name: '',
      byte_length: 27,
      pattern: null,
      binary: true,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '1',
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: 'AccountID',
      name: 'Address',
    },
  ],
}

export const CONF_FOUNDATION_ADDR: State = {
  name: 'Foundation Address',
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
      name: 'Prefix',
      pattern: '1',
      exclude: true,
    },
    {
      type: 'VarString',
      name: '',
      byte_length: 27,
      pattern: null,
      binary: true,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '2',
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: 'AccountID',
      name: 'Address',
    },
  ],
}

export const CONF_MOMENT_SIZE: State = {
  name: 'Moment Size',
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
      name: 'Prefix',
      pattern: '1',
      exclude: true,
    },
    {
      type: 'VarString',
      name: '',
      byte_length: 27,
      pattern: null,
      binary: true,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '3',
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: 'UInt16',
      name: 'Size',
    },
  ],
}

export const CONF_MINT_LIMIT: State = {
  name: 'Mint Limit',
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
      name: 'Prefix',
      pattern: '1',
      exclude: true,
    },
    {
      type: 'VarString',
      name: '',
      byte_length: 27,
      pattern: null,
      binary: true,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '4',
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: 'UInt64',
      name: 'Limit',
    },
  ],
}

export const CONF_FIXED_REG_FEE: State = {
  name: 'Fixed Reg Fee',
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
      name: 'Prefix',
      pattern: '1',
      exclude: true,
    },
    {
      type: 'VarString',
      name: '',
      byte_length: 27,
      pattern: null,
      binary: true,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '5',
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: 'UInt64',
      name: 'Fee',
    },
  ],
}

export const CONF_HOST_HEARTBEAT_FREQ: State = {
  name: 'Host Heartbeat Freq',
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
      name: 'Prefix',
      pattern: '1',
      exclude: true,
    },
    {
      type: 'VarString',
      name: '',
      byte_length: 27,
      pattern: null,
      binary: true,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '6',
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: 'UInt16',
      name: 'Freq',
    },
  ],
}

export const CONF_LEASE_ACQUIRE_WINDOW: State = {
  name: 'Lease Acquire Window',
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
      name: 'Prefix',
      pattern: '1',
      exclude: true,
    },
    {
      type: 'VarString',
      name: '',
      byte_length: 27,
      pattern: null,
      binary: true,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '7',
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: 'UInt16',
      name: 'Window',
    },
  ],
}

export const CONF_REWARD_CONFIGURATION: State = {
  name: 'Reward Configuration',
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
      name: 'Prefix',
      pattern: '1',
      exclude: true,
    },
    {
      type: 'VarString',
      name: '',
      byte_length: 27,
      pattern: null,
      binary: true,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '8',
      exclude: true,
    },
  ],
  // <epoch_count(uint8_t)><first_epoch_reward_quota(uint32_t)><epoch_reward_amount(uint32_t)><reward_start_moment(uint32_t)><accumulated_reward_frequency(uint16_t)><host_reputation_threshold(uint8_t)>
  hookstate_data: [
    {
      type: 'UInt8',
      name: 'Epoch Count',
    },
    {
      type: 'UInt32',
      name: 'First Epoch Reward Quota',
    },
    {
      type: 'UInt32',
      name: 'Epoch Reward Amount',
    },
    {
      type: 'UInt32',
      name: 'Reward Start Moment',
    },
    {
      type: 'UInt16',
      name: 'Accumulated Reward Frequency',
    },
    {
      type: 'UInt8',
      name: 'Host Reputation Threshold',
    },
    {
      type: 'UInt32',
      name: 'Host Min Instance Count',
    },
  ],
}

export const CONF_REWARD_CONFIGURATION_081: State = {
  name: 'Reward Configuration',
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
      name: 'Prefix',
      pattern: '1',
      exclude: true,
    },
    {
      type: 'VarString',
      name: '',
      byte_length: 27,
      pattern: null,
      binary: true,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '8',
      exclude: true,
    },
  ],
  // <epoch_count(uint8_t)><first_epoch_reward_quota(uint32_t)><epoch_reward_amount(uint32_t)><reward_start_moment(uint32_t)><accumulated_reward_frequency(uint16_t)><host_reputation_threshold(uint8_t)>
  hookstate_data: [
    {
      type: 'UInt8',
      name: 'Epoch Count',
    },
    {
      type: 'UInt32',
      name: 'First Epoch Reward Quota',
    },
    {
      type: 'UInt32',
      name: 'Epoch Reward Amount',
    },
    {
      type: 'UInt32',
      name: 'Reward Start Moment',
    },
    {
      type: 'UInt16',
      name: 'Accumulated Reward Frequency',
    },
    {
      type: 'UInt8',
      name: 'Host Reputation Threshold',
    },
  ],
}

export const CONF_MAX_TOLERABLE_DOWNTIME: State = {
  name: 'Max Tolerable Downtime',
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
      name: 'Prefix',
      pattern: '1',
      exclude: true,
    },
    {
      type: 'VarString',
      name: '',
      byte_length: 27,
      pattern: null,
      binary: true,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '9',
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: 'UInt16',
      name: 'Max Tolerable Downtime',
    },
  ],
}
export const CONF_MOMENT_TRANSIT_INFO: State = {
  name: 'Moment Transit Info',
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
      name: 'Prefix',
      pattern: '1',
      exclude: true,
    },
    {
      type: 'VarString',
      name: '',
      byte_length: 27,
      pattern: null,
      binary: true,
      exclude: true,
    },

    {
      type: 'UInt8',
      name: 'Index',
      pattern: '10',
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: 'UInt64',
      name: 'Transition Index',
    },
    {
      type: 'UInt16',
      name: 'Moment Size',
    },
    {
      type: 'UInt8',
      name: 'Index Type',
    },
  ],
}

export const CONF_MAX_EMIT_TRX_FEE: State = {
  name: 'Max Emit Trx Fee',
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
      name: 'Prefix',
      pattern: '1',
      exclude: true,
    },
    {
      type: 'VarString',
      name: '',
      byte_length: 27,
      pattern: null,
      binary: true,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '11',
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: 'UInt64',
      name: 'Max Emit Trx Fee',
    },
  ],
}

export const CONF_HEARTBEAT_ADDR: State = {
  name: 'Heartbeat Addr',
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
      name: 'Prefix',
      pattern: '1',
      exclude: true,
    },
    {
      type: 'VarString',
      name: '',
      byte_length: 27,
      pattern: null,
      binary: true,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '12',
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: 'AccountID',
      name: 'Address',
    },
  ],
}

export const CONF_REGISTRY_ADDR: State = {
  name: 'Registry Addr',
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
      name: 'Prefix',
      pattern: '1',
      exclude: true,
    },
    {
      type: 'VarString',
      name: '',
      byte_length: 27,
      pattern: null,
      binary: true,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '13',
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: 'AccountID',
      name: 'Address',
    },
  ],
}

export const CONF_GOVERNANCE_CONFIGURATION: State = {
  name: 'Governance Configuration',
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
      name: 'Prefix',
      pattern: '1',
      exclude: true,
    },
    {
      type: 'VarString',
      name: '',
      byte_length: 27,
      pattern: null,
      binary: true,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '14',
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: 'UInt32',
      name: 'Eligibility Period',
    },
    {
      type: 'UInt32',
      name: 'Candidate Life Period',
    },
    {
      type: 'UInt32',
      name: 'Candidate Election Period',
    },
    {
      type: 'UInt16',
      name: 'Candidate Support Average',
    },
  ],
}

export const CONF_NETWORK_CONFIGURATION: State = {
  name: 'Network Configuration',
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
      name: 'Prefix',
      pattern: '1',
      exclude: true,
    },
    {
      type: 'VarString',
      name: '',
      byte_length: 27,
      pattern: null,
      binary: true,
      exclude: true,
    },
    {
      type: 'UInt8',
      name: 'Index',
      pattern: '15',
      exclude: true,
    },
  ],
  hookstate_data: [
    {
      type: 'UInt32',
      name: 'Busyness Detect Period',
    },
    {
      type: 'UInt16',
      name: 'Busyness Detect Average',
    },
  ],
}

export const all = [
  CONF_ISSUER_ADDR,
  CONF_FOUNDATION_ADDR,
  CONF_MOMENT_SIZE,
  CONF_MINT_LIMIT,
  CONF_FIXED_REG_FEE,
  CONF_HOST_HEARTBEAT_FREQ,
  CONF_LEASE_ACQUIRE_WINDOW,
  CONF_REWARD_CONFIGURATION,
  CONF_REWARD_CONFIGURATION_081,
  CONF_MAX_TOLERABLE_DOWNTIME,
  CONF_MOMENT_TRANSIT_INFO,
  CONF_MAX_EMIT_TRX_FEE,
  CONF_HEARTBEAT_ADDR,
  CONF_REGISTRY_ADDR,
  CONF_GOVERNANCE_CONFIGURATION,
  CONF_NETWORK_CONFIGURATION,
]
