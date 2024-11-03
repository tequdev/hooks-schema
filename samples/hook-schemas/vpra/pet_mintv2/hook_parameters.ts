import type { Definition } from '../../../../schema'

export const VPRAMintV2HookParametersDefinition: Definition['hook_parameters'] = {
  fields: [
    {
      hookparam_key: [
        {
          type: 'VarString',
          name: 'Mint Price',
          pattern: 'MP',
          byte_length: 2,
        },
      ],
      hookparam_data: [
        {
          type: 'XFL',
          name: 'Price (XAH)',
        },
      ],
    },
  ],
}
