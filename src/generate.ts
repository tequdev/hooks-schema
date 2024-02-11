import { Client } from '@transia/xrpl'
import { HookState } from '@transia/xrpl/dist/npm/models/ledger'
import { EvernodeHookDefinition } from './hook-schemas/evernode'
import { GovernanceHookDefinition } from './hook-schemas/xahau-governance'
import { hookStateParser } from './parser'

import * as fs from 'fs'
import { OracleHookDefinition } from './hook-schemas/oracle'
import { Definition } from './schema'

const client = new Client('wss://xahau.org')
// const client = new Client("wss://xahau-test.net");
const outputsDir = './outputs'

const GENESIS_ACCOUNT = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh'

type DefinitionSource = {
  name: string
  hook_account: string
  hook_namespace_id: string
  hook_definition: Definition['hook_states']
}

const Xahau_Governance: DefinitionSource = {
  name: 'xahau-governance',
  hook_account: GENESIS_ACCOUNT,
  hook_namespace_id: '0',
  hook_definition: GovernanceHookDefinition,
}

const Evernode: DefinitionSource = {
  name: "evernode",
  hook_account: 'rBvKgF3jSZWdJcwSsmoJspoXLLDVLDp6jg',
  hook_namespace_id: '01EAF09326B4911554384121FF56FA8FECC215FDDE2EC35D9E59F2C53EC665A0',
  hook_definition: EvernodeHookDefinition,
}

const Oracle = {
  name: "oracle",
  hook_account: 'rsMCzsxZYSXafH3Egj1jpGemgQjagtnXEk',
  hook_namespace_id: '9202AF6CE925B26AE6B25ADFFF0B2705147E195FA38DD58AE6ECC58ED263751F',
  hook_definition: OracleHookDefinition,
}

const definitions = [Xahau_Governance, Evernode, Oracle]

const generateDefinitionJson = (source: DefinitionSource, dir: string) => {
  const j = JSON.stringify(source, null, 2);
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(`${dir}/${source.name}-definition.json`, j);
}

const generateStateJson = (source: DefinitionSource, data: ReturnType<typeof hookStateParser>[], dir: string) => {
  const json = JSON.stringify(data, (_, value) => typeof value === "bigint" ? value.toString() : value, 2);
  fs.writeFileSync(`${dir}/${source.name}-state.json`, json);
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
  await client.connect()
  for (const current of definitions) {
    const definitionDir = `${outputsDir}/${current.name}`
    generateDefinitionJson(current, definitionDir)
    const states = await fetchStateData(current)
    const r = states.map((state) => {
      return hookStateParser(state, current.hook_definition)
    })
    generateStateJson(current, r, definitionDir)
  }
  await client.disconnect()
}

main()
