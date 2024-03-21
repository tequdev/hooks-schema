import { OperationDefinition } from "schema/Operation";

export const XahauGovernanceOperation = {
  write: {
    voteToSeat: {
      data: {
        layer: 'UInt8',
        seatId: 'UInt8',
        value: 'AccountID',
      },
      txn_parameter_definition: [
        {
          key: [{
            type: 'VarString',
            name: 'Topic',
            pattern: 'T',
            byte_length: 1,
          }],
          data: [
            {
              type: 'VarString',
              name: 'Seat',
              pattern: 'S',
              byte_length: 1,
            },
            {
              type: 'UInt8',
              name: 'Seat ID',
              field: "seatId"
            },
          ],
        },
        {
          key: [{
            type: 'VarString',
            name: 'Layer',
            pattern: 'L',
            byte_length: 1,
          }],
          data: [{
            type: 'UInt8',
            name: 'Layer',
            field: 'layer',
          }],
        },
        {
          key: [{
            type: 'VarString',
            name: 'Vote',
            pattern: 'V',
            byte_length: 1,
          }],
          data: [{
            type: 'AccountID',
            name: 'Value',
            field: 'value',
          }],
        }
      ]
    },
    // voteToHook: {
    //   data: {},
    //   txn_parameter_definition: [
    //     {
    //       key: [],
    //       data: [],
    //     },
    //   ]
    // },
    // voteToRewardRate: {
    //   data: {},
    //   txn_parameter_definition: [
    //     {
    //       key: [],
    //       data: [],
    //     },
    //   ]
    // },
    // voteToRewardDelay: {
    //   data: {},
    //   txn_parameter_definition: [
    //     {
    //       key: [],
    //       data: [],
    //     },
    //   ]
    // }
  },
  read: {
    currentMemberCount: {
      args: {
      },
      returns: {
        count: 'UInt8',
      },
      hook_state_definition: {
        key: [
          {
            type: 'VarString',
            name: 'Empty',
            pattern: null,
            binary: true,
            byte_length: 30,
          },
          {
            type: 'VarString',
            name: 'Member Count',
            byte_length: 2,
            pattern: 'MC',
          },
        ],
        data: [{
          type: 'UInt8',
          name: 'Count',
          field: 'count',
        }]
      }
    },
  },
} as const satisfies OperationDefinition
