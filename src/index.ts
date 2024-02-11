import { Client, TxRequest, TxResponse } from '@transia/xrpl'
import { HookState } from '@transia/xrpl/dist/npm/models/ledger'
import { EvernodeHookDefinition } from './hook-schemas/evernode'
import { OracleHookDefinition } from './hook-schemas/oracle'
import { GovernanceHookDefinition } from './hook-schemas/xahau-governance'
import { hookStateParser, invokeBlobParser } from './parser'
import { Definition } from './schema'

const client = new Client('wss://xahau.org')
// const client = new Client("wss://xahau-test.net");

const GENESIS_ACCOUNT = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh'

type DefinitionSource = {
  hook_account: string
  hook_namespace_id: string
  hook_definition: Definition
  invoke_txnid?: string[]
}

const Xahau_Governance: DefinitionSource = {
  hook_account: GENESIS_ACCOUNT,
  hook_namespace_id: '0',
  hook_definition: GovernanceHookDefinition,
}

const Evernode: DefinitionSource = {
  hook_account: 'rBvKgF3jSZWdJcwSsmoJspoXLLDVLDp6jg',
  hook_namespace_id: '01EAF09326B4911554384121FF56FA8FECC215FDDE2EC35D9E59F2C53EC665A0',
  hook_definition: EvernodeHookDefinition,
}

const Oracle: DefinitionSource = {
  hook_account: 'rsMCzsxZYSXafH3Egj1jpGemgQjagtnXEk',
  hook_namespace_id: '9202AF6CE925B26AE6B25ADFFF0B2705147E195FA38DD58AE6ECC58ED263751F',
  hook_definition: OracleHookDefinition,
  invoke_txnid: ['0F119964E90B61FEDFD995D2E9926B8D0C2E838D72135A8600C2904A7F6C2234']
}

const test_hookstate = async (source: DefinitionSource) => {
  const response = await client.request({
    command: 'account_namespace',
    account: source.hook_account,
    namespace_id: source.hook_namespace_id,
    limit: 10000,
  })
  // @ts-ignore
  const entries = response.result.namespace_entries as HookState[]

  const r = entries.map((entry, i) => {
    if (source.hook_definition.hook_states)
      return hookStateParser(entry, source.hook_definition.hook_states)// || console.log(i)
    throw new Error('hook_definition.hook_states is not defined')
  })

  const json = JSON.stringify(r, (key, value) => {
    return typeof value === "bigint" ? value.toString() : value;
  }, 2);

  console.log(json)
}

const test_invoke_blob = async (source: DefinitionSource) => {
  if (!source.invoke_txnid || source.invoke_txnid.length === 0) return

  for (const id of source.invoke_txnid) {
    const response = await client.request<TxRequest, TxResponse>({
      command: 'tx',
      transaction: id,
    })
    if (response.result.TransactionType !== 'Invoke') throw new Error('Invalid transaction type')
    if (!response.result.Blob) throw new Error('Blob is not defined')
    if (!source.hook_definition.invoke_blobs) throw new Error('hook_definition.invoke_blobs is not defined')
    const result = invokeBlobParser(response.result.Blob, source.hook_definition.invoke_blobs)
    console.log(JSON.stringify(result, null, 2))
  }
}


const main = async () => {
  await client.connect()

  const current = Oracle

  // await test_hookstate(current)
  await test_invoke_blob(current)

  await client.disconnect()
}

main()
