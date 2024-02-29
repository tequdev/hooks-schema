import { currencyToHex } from '@transia/hooks-toolkit/dist/npm/src/libs/binary-models'
import { decodeAccountID } from '@transia/xrpl'
import sha512h from '@transia/xrpl/dist/npm/utils/hashes/sha512Half'
import { Definition } from '../../../schema'

export const OracleInvokeDefinition: Definition['invoke_blobs'] = {
  name: 'Oracle Invoke Blob',
  description: 'Oracle Invoke Blob',
  invoke_blobs: [
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
              type: 'VarString',
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
