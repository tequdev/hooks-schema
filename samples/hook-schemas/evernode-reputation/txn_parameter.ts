import { TxnParameterDefinition } from 'schema/TxnParameter'

type TxnParam = TxnParameterDefinition

export const EvernodeReputationTxnParamreterDefinition: TxnParam = {
  fields: [
    {
      transaction_types: ['Payment'],
      otxnparam_key: [
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
      otxnparam_data: [
        {
          type: 'VarString',
          name: 'Event Type: Hook Update',
          pattern: 'evnHookUpdate',
        },
      ],
    },
    {
      transaction_types: ['Invoke'],
      otxnparam_key: [
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
      otxnparam_data: [
        {
          type: 'VarString',
          name: 'Event Type: Host Send Reputation',
          pattern: 'evnHostSendReputation',
        },
      ],
    },
  ],
}
