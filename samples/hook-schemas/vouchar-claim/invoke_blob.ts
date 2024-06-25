import { Definition } from '../../../schema'

export const VoucharClaimInvokeDefinition: Definition['invoke_blobs'] = {
  fields: [
    {
      name: 'Claim Data',
      value: [
        {
          type: 'VarString',
          name: 'Signature',
          binary: true,
          byte_length: 64,
        },
        {
          type: 'VarString',
          binary: true,
          name: 'Public Key',
          byte_length: 33,
        },
        {
          type: 'AccountID',
          name: 'Destination',
        },
      ],
    },
  ],
}
