import { HookStateDefinition } from "../../schema";

export const GovernanceHookDefinition: HookStateDefinition = {
  name: "Governance",
  description: "Governance",
  hook_states: [
    {
      name: "Current member count",
      hookstate_key: [
        {
          type: "VarString",
          name: "padding",
          fixed_value: "0".repeat(30),
          byte_length: 30,
          exclude: true,
        },
        {
          type: "VarString",
          name: "type",
          byte_length: 2,
          fixed_value: "MC",
        },
      ],
      hookstate_data: [
        {
          type: "UInt8",
          name: "Count",
          byte_length: 1,
        },
      ],
    },
    {
      name: "Current reward rate",
      hookstate_key: [
        {
          type: "VarString",
          name: "padding",
          fixed_value: "0".repeat(30),
          byte_length: 30,
          exclude: true,
        },
        {
          type: "VarString",
          name: "type",
          byte_length: 2,
          fixed_value: "RR",
        },
      ],
      hookstate_data: [
        {
          name: "Value",
          type: "XFL",
        },
      ],
    },
    {
      name: "Current reward delay",
      hookstate_key: [
        {
          type: "VarString",
          name: "padding",
          fixed_value: "0".repeat(30),
          byte_length: 30,
          exclude: true,
        },
        {
          type: "VarString",
          name: "type",
          byte_length: 2,
          fixed_value: "RD",
        },
      ],
      hookstate_data: [
        {
          type: "XFL",
          name: "Value",
        },
      ],
    },
    {
      name: "Seat Place",
      hookstate_key: [
        {
          type: "VarString",
          name: "padding",
          fixed_value: "0".repeat(31),
          byte_length: 31,
          exclude: true,
        },
        {
          // SeatID
          type: "UInt8",
          name: "SeatID",
        },
      ],
      hookstate_data: [
        {
          type: "AccountID",
          name: "Account",
        },
      ],
    },
    {
      name: "Account Place",
      hookstate_key: [
        {
          type: "VarString",
          name: "padding",
          fixed_value: "0".repeat(12),
          byte_length: 12,
          exclude: true,
        },
        {
          type: "AccountID",
          name: "Account",
        },
      ],
      hookstate_data: [
        {
          type: "UInt8",
          name: "SeatID",
        },
      ],
    },
    {
      name: "Vote Hook",
      hookstate_key: [
        {
          type: "VarString",
          name: "Type",
          fixed_value: "VH",
          byte_length: 2,
        },
        {
          type: "UInt8",
          name: "Slot",
        },
        {
          type: "UInt8",
          name: "Layer",
        },
        {
          type: "VarString",
          name: "padding",
          byte_length: 8,
          fixed_value: "0".repeat(8),
          exclude: true,
        },
        {
          type: "AccountID",
          name: "Account",
        },
      ],
      hookstate_data: [
        {
          type: "Hash256",
          name: "HookHash",
        },
      ],
    },
    {
      name: "Vote Reward Rate",
      hookstate_key: [
        {
          type: "VarString",
          name: "type",
          fixed_value: "VRR",
          byte_length: 3,
        },
        {
          type: "UInt8",
          name: "Layer",
        },
        {
          type: "VarString",
          name: "padding",
          byte_length: 8,
          fixed_value: "0".repeat(8),
          exclude: true,
        },
        {
          type: "AccountID",
          name: "Account",
        },
      ],
      hookstate_data: [
        {
          type: "XFL",
          name: "Value",
        },
      ],
    },
    {
      name: "Vote Reward Delay",
      hookstate_key: [
        {
          type: "VarString",
          name: "type",
          fixed_value: "VRD",
          byte_length: 3,
        },
        {
          type: "UInt8",
          name: "Layer",
        },
        {
          type: "VarString",
          name: "padding",
          byte_length: 8,
          fixed_value: "0".repeat(8),
          exclude: true,
        },
        {
          type: "AccountID",
          name: "Account",
        },
      ],
      hookstate_data: [
        {
          type: "XFL",
          name: "Value",
        },
      ],
    },
    {
      name: "Vote Seat",
      hookstate_key: [
        {
          type: "VarString",
          name: "type",
          fixed_value: "VS",
          byte_length: 2,
        },
        {
          type: "UInt8",
          name: "SeatID",
        },
        {
          type: "UInt8",
          name: "Layer",
        },
        {
          type: "VarString",
          name: "padding",
          byte_length: 8,
          fixed_value: "0".repeat(8),
          exclude: true,
        },
        {
          type: "AccountID",
          name: "Account",
        },
      ],
      hookstate_data: [
        {
          type: "AccountID",
          name: "Account",
        },
      ],
    },
    {
      name: "Count Vote Hook",
      hookstate_key: [
        {
          type: "VarString",
          name: "type",
          fixed_value: "CH",
          byte_length: 2,
        },
        {
          type: "UInt8",
          name: "Slot",
        },
        {
          type: "UInt8",
          name: "Layer",
        },
        {
          type: "VarString",
          byte_length: 28,
          binary: true,
          name: "HookHash",
        },
      ],
      hookstate_data: [
        {
          type: "UInt8",
          name: "Count",
        },
      ],
    },
    {
      name: "Count Vote Reward Rate",
      hookstate_key: [
        {
          type: "VarString",
          name: "type",
          fixed_value: "CRR",
          byte_length: 3,
        },
        {
          type: "UInt8",
          name: "Layer",
        },
        {
          type: "VarString",
          name: "padding",
          byte_length: 20,
          binary: true,
          exclude: true,
        },
        {
          type: "XFL",
          name: "Value",
        },
      ],
      hookstate_data: [
        {
          type: "UInt8",
          name: "Count",
        },
      ],
    },
    {
      name: "Count Vote Reward Delay",
      hookstate_key: [
        {
          type: "VarString",
          name: "type",
          fixed_value: "CRD",
          byte_length: 3,
        },
        {
          type: "UInt8",
          name: "Layer",
        },
        {
          type: "VarString",
          name: "padding",
          byte_length: 20,
          binary: true,
          exclude: true,
        },
        {
          type: "XFL",
          name: "Value",
        },
      ],
      hookstate_data: [
        {
          type: "UInt8",
          name: "Count",
        },
      ],
    },
    {
      name: "Count Vote Seat",
      hookstate_key: [
        {
          type: "VarString",
          name: "type",
          fixed_value: "CS",
          byte_length: 2,
        },
        {
          type: "UInt8",
          name: "SeatID",
        },
        {
          type: "UInt8",
          name: "Layer",
        },
        {
          type: "VarString",
          name: "padding",
          byte_length: 8,
          fixed_value: "0".repeat(8),
          exclude: true,
        },
        {
          type: "AccountID",
          name: "Account",
        },
      ],
      hookstate_data: [
        {
          type: "UInt8",
          name: "Count",
        },
      ],
    },
  ],
};
