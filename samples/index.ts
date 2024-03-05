import { Client, TxRequest, TxResponse } from '@transia/xrpl'
import { Hook } from '@transia/xrpl/dist/npm/models/common';
import { HookState } from '@transia/xrpl/dist/npm/models/ledger'
import { Definition } from '../schema'
import { EvernodeHookDefinition } from './hook-schemas/evernode'
import { EvernodeRedirectHookDefinition } from './hook-schemas/evernode-redirect/index';
import { LotteryHookDefinition } from './hook-schemas/lottery/lottery';
import { LotteryEndDefinition } from './hook-schemas/lottery/lottery_end';
import { LotteryEndICDefinition } from './hook-schemas/lottery/lottery_end_ic';
import { LotteryICDefinition } from './hook-schemas/lottery/lottery_ic';
import { LotteryStartDefinition } from './hook-schemas/lottery/lottery_start';
import { OracleHookDefinition } from './hook-schemas/oracle'
import { GovernanceHookDefinition } from './hook-schemas/xahau-governance'
import { hookParametersParser, hookStateParser, invokeBlobParser, txnParametersParser } from './parser'

const client = new Client('wss://xahau.org')
// const client = new Client("wss://xahau-test.net");

const GENESIS_ACCOUNT = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh'

type DefinitionSource = {
  hook_account: string
  hook_namespace_id: string
  hook_definition: Definition
  invoke_txnid?: string[]
  txn_parameters_txnid?: string[]
}

const Xahau_Governance: DefinitionSource = {
  hook_account: GENESIS_ACCOUNT,
  hook_namespace_id: '0',
  hook_definition: GovernanceHookDefinition,
  txn_parameters_txnid: [
    'BD826500478AB030F3E349D293FBE88163B6198202380FA57C5BBC17125C8CB4', //testnet
  ]
}

const Evernode: DefinitionSource = {
  hook_account: 'rBvKgF3jSZWdJcwSsmoJspoXLLDVLDp6jg',
  hook_namespace_id: '01EAF09326B4911554384121FF56FA8FECC215FDDE2EC35D9E59F2C53EC665A0',
  hook_definition: EvernodeHookDefinition,
}

const EvernodeRedirect: DefinitionSource = {
  hook_account: 'rNdWn1HN9ME6daRYvxXQPABTMUuTr3z1XY',
  hook_namespace_id: '',
  hook_definition: EvernodeRedirectHookDefinition,
}

const Oracle: DefinitionSource = {
  hook_account: 'rsMCzsxZYSXafH3Egj1jpGemgQjagtnXEk',
  hook_namespace_id: '9202AF6CE925B26AE6B25ADFFF0B2705147E195FA38DD58AE6ECC58ED263751F',
  hook_definition: OracleHookDefinition,
  invoke_txnid: ['0F119964E90B61FEDFD995D2E9926B8D0C2E838D72135A8600C2904A7F6C2234']
}

const Lotteries: DefinitionSource[] = [
  {
    hook_account: LotteryHookDefinition.account!,
    hook_namespace_id: LotteryHookDefinition.namespace_id!,
    hook_definition: LotteryHookDefinition,
  },
  {
    hook_account: LotteryEndDefinition.account!,
    hook_namespace_id: LotteryEndDefinition.namespace_id!,
    hook_definition: LotteryEndDefinition,
  },
  {
    hook_account: LotteryEndICDefinition.account!,
    hook_namespace_id: LotteryEndICDefinition.namespace_id!,
    hook_definition: LotteryEndICDefinition,
  },
  {
    hook_account: LotteryICDefinition.account!,
    hook_namespace_id: LotteryICDefinition.namespace_id!,
    hook_definition: LotteryICDefinition,
  },
  {
    hook_account: LotteryStartDefinition.account!,
    hook_namespace_id: LotteryStartDefinition.namespace_id!,
    hook_definition: LotteryStartDefinition,
  },
]

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

const test_txn_parameters = async (source: DefinitionSource) => {
  if (!source.txn_parameters_txnid || source.txn_parameters_txnid.length === 0) return

  for (const id of source.txn_parameters_txnid) {
    const response = await client.request<TxRequest, TxResponse>({
      command: 'tx',
      transaction: id,
    })
    if (!response.result.HookParameters) throw new Error('HookParameters is not defined')
    if (!source.hook_definition.txn_parameters) throw new Error('hook_definition.txn_parameters is not defined')

    for (const param of response.result.HookParameters) {
      const result = txnParametersParser(param, source.hook_definition.txn_parameters)
      console.log(JSON.stringify(result, null, 2))
    }
  }
}

const test_hook_parameters = async (source: DefinitionSource) => {
  if (!source.hook_definition.hook_parameters) throw new Error('hook_definition.hook_parameters is not defined')

  const response = await client.request({
    command: 'ledger_entry',
    hook: { account: source.hook_account }
  })
  const hooks: Hook[] = response.result.node!.Hooks

  for (const hook of hooks) {
    const result = hook.Hook.HookParameters?.map((param) => hookParametersParser(param, source.hook_definition.hook_parameters!))
    console.log(JSON.stringify(result, null, 2))
  }
}


const main = async () => {
  await client.connect()

  const current = Lotteries

  const targets = Array.isArray(current) ? current : [current]

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    await test_hookstate(target)
    // await test_invoke_blob(target)
    // await test_txn_parameters(target)
    // await test_hook_parameters(target)
  }

  await client.disconnect()
}

main()
