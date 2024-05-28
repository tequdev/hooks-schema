import { Definition } from '../../../schema'

export const EvernodeReputationInvokeDefinition: Definition['invoke_blobs'] = {
  fields: [
    {
      value: [
        {
          type: 'Array',
          name: 'Scores',
          byte_length: 64,
          array: [
            {
              type: 'UInt8',
              name: 'Score',
            },
          ],
          delimiter: ',',
        },
      ],
    },
  ],
}
