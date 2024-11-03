import { Client } from '@transia/xrpl'
import type { HookState } from '@transia/xrpl/dist/npm/models/ledger'
import { EvernodeHookDefinition } from './hook-schemas/evernode'
import { GovernanceHookDefinition } from './hook-schemas/xahau-governance'
import type { hookStateParser } from './parser'

import * as fs from 'node:fs'
import { hexNamespace } from '@transia/hooks-toolkit'
import type { Definition } from '../schema'
import { EvernodeReputationHookDefinition } from './hook-schemas/evernode-reputation'
import { OracleHookDefinition } from './hook-schemas/oracle'
import { VPRABattleV2HookDefinition } from './hook-schemas/vpra/pet_battleV2'
import { VPRABreedV2HookDefinition } from './hook-schemas/vpra/pet_breedV2'
import { VPRAMintV2HookDefinition } from './hook-schemas/vpra/pet_mintv2'
import { VPRARaceV2HookDefinition } from './hook-schemas/vpra/pet_raceV2'
import { VPRARacePoolV2HookDefinition } from './hook-schemas/vpra/pet_race_poolV2'
import { VPRAUpdateV2HookDefinition } from './hook-schemas/vpra/pet_updateV2'

const client = new Client('wss://xahau.org')
// const client = new Client("wss://xahau-test.net");
const outputsDir = './outputs'

const GENESIS_ACCOUNT = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh'

type DefinitionSource = {
  name: string
  hook_account: string
  hook_namespace_id: string
  hook_definition: Definition
}

const Xahau_Governance: DefinitionSource = {
  name: 'xahau-governance',
  hook_account: GENESIS_ACCOUNT,
  hook_namespace_id: '0',
  hook_definition: GovernanceHookDefinition,
}

const Evernode: DefinitionSource = {
  name: 'evernode',
  hook_account: 'rBvKgF3jSZWdJcwSsmoJspoXLLDVLDp6jg',
  hook_namespace_id: '01EAF09326B4911554384121FF56FA8FECC215FDDE2EC35D9E59F2C53EC665A0',
  hook_definition: EvernodeHookDefinition,
}

const EvernodeReputation: DefinitionSource = {
  name: 'evernode-reputation',
  hook_account: 'rBvKgF3jSZWdJcwSsmoJspoXLLDVLDp6jg',
  hook_namespace_id: EvernodeReputationHookDefinition.namespace_id!,
  hook_definition: EvernodeReputationHookDefinition,
}

const Oracle = {
  name: 'oracle',
  hook_account: 'rsMCzsxZYSXafH3Egj1jpGemgQjagtnXEk',
  hook_namespace_id: '9202AF6CE925B26AE6B25ADFFF0B2705147E195FA38DD58AE6ECC58ED263751F',
  hook_definition: OracleHookDefinition,
}

const VPRABattleV2 = {
  name: 'vpra-battleV2',
  hook_account: 'rUYiTLYpN8M4xLhtRD9HQZFwqZ4WaKJc89',
  hook_namespace_id: hexNamespace('/battles'),
  hook_definition: VPRABattleV2HookDefinition,
}

const VPRABreedV2 = {
  name: 'vpra-breedV2',
  hook_account: 'rUYiTLYpN8M4xLhtRD9HQZFwqZ4WaKJc89',
  hook_namespace_id: hexNamespace('pets'),
  hook_definition: VPRABreedV2HookDefinition,
}

const VPRAMintV2 = {
  name: 'vpra-mintv2',
  hook_account: 'rUYiTLYpN8M4xLhtRD9HQZFwqZ4WaKJc89',
  hook_namespace_id: hexNamespace('pets'),
  hook_definition: VPRAMintV2HookDefinition,
}

const VPRARacePoolV2 = {
  name: 'vpra-racepoolV2',
  hook_account: 'rUYiTLYpN8M4xLhtRD9HQZFwqZ4WaKJc89',
  hook_namespace_id: hexNamespace('/races'),
  hook_definition: VPRARacePoolV2HookDefinition,
}

const VPRARaceV2 = {
  name: 'vpra-raceV2',
  hook_account: 'rUYiTLYpN8M4xLhtRD9HQZFwqZ4WaKJc89',
  hook_namespace_id: hexNamespace('/races'),
  hook_definition: VPRARaceV2HookDefinition,
}

const VPRAUpdateV2 = {
  name: 'vpra-updateV2',
  hook_account: 'rUYiTLYpN8M4xLhtRD9HQZFwqZ4WaKJc89',
  hook_namespace_id: hexNamespace('pets'),
  hook_definition: VPRAUpdateV2HookDefinition,
}

const definitions = [
  Xahau_Governance,
  Evernode,
  Oracle,
  EvernodeReputation,
  VPRABattleV2,
  VPRABreedV2,
  VPRAMintV2,
  VPRARacePoolV2,
  VPRARaceV2,
  VPRAUpdateV2,
]

const generateDefinitionJson = (source: DefinitionSource, dir: string) => {
  const j = JSON.stringify(source, null, 2)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(`${dir}/${source.name}-definition.json`, j)
}

const generateStateJson = (source: DefinitionSource, data: ReturnType<typeof hookStateParser>[], dir: string) => {
  const json = JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? value.toString() : value), 2)
  fs.writeFileSync(`${dir}/${source.name}-state.json`, json)
}

const fetchStateData = async (source: DefinitionSource) => {
  const response = await client.request({
    command: 'account_namespace',
    account: source.hook_account,
    namespace_id: source.hook_namespace_id,
    limit: 10000,
  })
  // @ts-ignore
  return response.result.namespace_entries as HookState[]
}

const main = async () => {
  // await client.connect()
  for (const current of definitions) {
    const definitionDir = `${outputsDir}/${current.name}`
    generateDefinitionJson(current, definitionDir)
    // const states = await fetchStateData(current)
    // const r = states.map((state) => {
    //   if (current.hook_definition.hook_states) return hookStateParser(state, current.hook_definition.hook_states)
    //   throw new Error('hook_definition.hook_states is not defined')
    // })
    // generateStateJson(current, r, definitionDir)
  }
  await client.disconnect()
}

main()
