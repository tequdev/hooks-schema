import { Client } from '@transia/xrpl'
import { HookState } from '@transia/xrpl/dist/npm/models/ledger'
import { EvernodeHookDefinition } from './hook-schemas/evernode'
import { GovernanceHookDefinition } from './hook-schemas/xahau-governance'
import { hookStateParser } from './parser'

import * as fs from 'fs'

const client = new Client('wss://xahau.org')
// const client = new Client("wss://xahau-test.net");

const GENESIS_ACCOUNT = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh'

const Xahau_Governance = {
  name: 'xahau-governance',
  hook_account: GENESIS_ACCOUNT,
  hook_namespace_id: '0',
  hook_definition: GovernanceHookDefinition,
}

const Evernode = {
  name: "evernode",
  hook_account: 'rBvKgF3jSZWdJcwSsmoJspoXLLDVLDp6jg',
  hook_namespace_id: '01EAF09326B4911554384121FF56FA8FECC215FDDE2EC35D9E59F2C53EC665A0',
  hook_definition: EvernodeHookDefinition,
}


const current = Evernode
const outputsDir = './outputs'
const definitionDir = `${outputsDir}/${current.name}`

const main = async () => {
  await client.connect()

  // output definition
  const j = JSON.stringify(current, null, 2);

  fs.mkdirSync(definitionDir, { recursive: true })

  fs.writeFileSync(`${definitionDir}/${current.name}-definition.json`, j);

  const response = await client.request({
    command: 'account_namespace',
    account: current.hook_account,
    namespace_id: current.hook_namespace_id,
    limit: 10000,
  })
  // @ts-ignore
  const entries = response.result.namespace_entries as HookState[]

  const r = entries.map((entry) => {
    return hookStateParser(entry, current.hook_definition)
  })

  const json = JSON.stringify(r, (_, value) => typeof value === "bigint" ? value.toString() : value, 2);

  // output parsed state data
  fs.writeFileSync(`${definitionDir}/${current.name}-state.json`, json);

  await client.disconnect()
}

main()
