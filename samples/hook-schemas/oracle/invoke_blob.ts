import type { Definition } from '../../../schema'

export const OracleInvokeDefinition: Definition['invoke_blobs'] = {
  fields: [
    {
      name: 'Oracle Set',
      value: [
        {
          type: 'Array',
          name: 'Oracles',
          array: [
            {
              type: 'AccountID',
              name: 'issuer',
            },
            {
              type: 'Currency',
              byte_length: 20,
              name: 'currency',
            },
            {
              type: 'XFL',
              name: 'value',
            },
          ],
          length_prefix: true,
        },
      ],
    },
  ],
}
