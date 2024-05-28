import { Definition } from '../../../schema'

export const EvernodeReputationInvokeDefinition: Definition['invoke_blobs'] = {
  fields: [
    {
      value: [
        {
          type: 'Array',
          name: 'Scores',
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
