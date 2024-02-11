import { currencyToHex } from '@transia/hooks-toolkit/dist/npm/src/libs/binary-models'
import { decodeAccountID } from '@transia/xrpl'
import sha512h from '@transia/xrpl/dist/npm/utils/hashes/sha512Half'
import { Definition } from '../../schema'

const toHash = (issuer: string, currency: string) => {
  const _issuer = decodeAccountID(issuer).toString('hex')
  const _currency = currencyToHex(currency)
  return sha512h(_issuer + _currency)
}

export const OracleHookStateDefinition: Definition['hook_states'] = {
  name: 'Oracle',
  description: 'Denis Oracle',
  hook_states: [
    {
      name: 'EVR/XAH Oracle',
      hookstate_key: [
        {
          type: 'Hash256',
          name: 'EVR/XAH',
          pattern: toHash('rEvernodee8dJLaFsujS6q1EiXvZYmHXr8', 'EVR')
        },
      ],
      hookstate_data: [
        {
          type: 'XFL',
          name: 'price',
        },
      ],
    },
    {
      name: 'unknown oracle',
      hookstate_key: [
        {
          type: 'Hash256',
          name: 'hash(issuer,currency)',
        },
      ],
      hookstate_data: [
        {
          type: 'XFL',
          name: 'price',
        },
      ],
    },
  ],
}
