import type { Definition } from '../../../schema'

export const EvernodeReputationInvokeDefinition: Definition['invoke_blobs'] = {
  fields: [
    {
      value: [
        {
          type: 'Array',
          name: 'Scores',
          byte_length: 64,
          array: [
            ...new Array(64).fill({
              type: 'UInt8',
              name: 'Score',
            }),
          ],
          delimiter: ',',
        },
      ],
    },
  ],
}
