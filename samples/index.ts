import { Client, TxRequest, TxResponse } from '@transia/xrpl'
import { Hook } from '@transia/xrpl/dist/npm/models/common'
import { HookDefinition, HookState } from '@transia/xrpl/dist/npm/models/ledger'
import { Definition } from '../schema'
import { EvernodeHookDefinition } from './hook-schemas/evernode'
import { EvernodeRedirectHookDefinition } from './hook-schemas/evernode-redirect/index'
import { EvernodeReputationHookDefinition } from './hook-schemas/evernode-reputation'
import { LotteryHookDefinition } from './hook-schemas/lottery/lottery'
import { LotteryEndDefinition } from './hook-schemas/lottery/lottery_end'
import { LotteryEndICDefinition } from './hook-schemas/lottery/lottery_end_ic'
import { LotteryICDefinition } from './hook-schemas/lottery/lottery_ic'
import { LotteryStartDefinition } from './hook-schemas/lottery/lottery_start'
import { OracleHookDefinition } from './hook-schemas/oracle'
import { VoucharClaimHookDefinition } from './hook-schemas/vouchar-claim'
import { VoucharCreateHookDefinition } from './hook-schemas/vouchar-create'
import { GovernanceHookDefinition } from './hook-schemas/xahau-governance'
import { XahauGovernanceOperation } from './hook-schemas/xahau-governance/operation'
import {
  hookParametersParser,
  hookStateParser,
  invokeBlobParser,
  readOperation,
  txnParametersParser,
  writeOperation,
} from './parser'

const client = new Client('wss://xahau.org')
// const client = new Client("wss://xahau-test.net");

type DefinitionSource = {
  hook_account: string
  hook_namespace_id: string
  hook_definition: Definition
  invoke_txnid?: string[]
  txn_parameters_txnid?: string[]
}

const Xahau_Governance: DefinitionSource = {
  hook_account: GovernanceHookDefinition.account!,
  hook_namespace_id: GovernanceHookDefinition.namespace_id!,
  hook_definition: GovernanceHookDefinition,
  txn_parameters_txnid: [
    'BD826500478AB030F3E349D293FBE88163B6198202380FA57C5BBC17125C8CB4', //testnet
  ],
}

const Evernode: DefinitionSource = {
  hook_account: EvernodeHookDefinition.account!,
  hook_namespace_id: EvernodeHookDefinition.namespace_id!,
  hook_definition: EvernodeHookDefinition,
}

const EvernodeRedirect: DefinitionSource = {
  hook_account: EvernodeRedirectHookDefinition.account!,
  hook_namespace_id: EvernodeRedirectHookDefinition.namespace_id!,
  hook_definition: EvernodeRedirectHookDefinition,
}

const EvernodeReputation: DefinitionSource = {
  hook_account: EvernodeReputationHookDefinition.account!,
  hook_namespace_id: EvernodeReputationHookDefinition.namespace_id!,
  hook_definition: EvernodeReputationHookDefinition,
  invoke_txnid: ['1E57100CB463BFF5B5EAC4F72334A947787DBC317B479A159AAE45C31B0F5105'],
  txn_parameters_txnid: ['619C6FAAD15669C9DC5A904E8AC06AFECE3B0C1F69C1833AC5C167AA20E9CF04'],
}

const Oracle: DefinitionSource = {
  hook_account: OracleHookDefinition.account!,
  hook_namespace_id: OracleHookDefinition.namespace_id!,
  hook_definition: OracleHookDefinition,
  invoke_txnid: ['0F119964E90B61FEDFD995D2E9926B8D0C2E838D72135A8600C2904A7F6C2234'],
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

const VoucharCreate: DefinitionSource = {
  hook_account: VoucharCreateHookDefinition.account!,
  hook_namespace_id: VoucharCreateHookDefinition.namespace_id!,
  hook_definition: VoucharCreateHookDefinition,
  txn_parameters_txnid: ['CF9C9B917776992F70922685D20B52882694A10C28E25A4120FBBC20D9F27F2E'],
}
const VoucharClaim: DefinitionSource = {
  hook_account: VoucharClaimHookDefinition.account!,
  hook_namespace_id: VoucharClaimHookDefinition.namespace_id!,
  hook_definition: VoucharClaimHookDefinition,
  txn_parameters_txnid: ['639B85A71BD20A56E8846F737A123593AFB45ABB85E39711A4BF49D0DF7D2260'],
  invoke_txnid: ['639B85A71BD20A56E8846F737A123593AFB45ABB85E39711A4BF49D0DF7D2260'],
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
    if (source.hook_definition.hook_states) return hookStateParser(entry, source.hook_definition.hook_states) // || console.log(i)
    throw new Error('hook_definition.hook_states is not defined')
  })

  const json = JSON.stringify(
    r,
    (key, value) => {
      return typeof value === 'bigint' ? value.toString() : value
    },
    2,
  )

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
    console.log(response.result.Blob)
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
    if (!response.result.HookParameters) throw new Error('HookParameters(OTXN) is not defined')
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
    hook: { account: source.hook_account },
  })
  const hooks: Hook[] = response.result.node!.Hooks
  const hashes: string[] = []
  for (const hook of hooks) {
    if (!hook.Hook.HookHash) continue
    const result = hook.Hook.HookParameters?.map((param) =>
      hookParametersParser(param, source.hook_definition.hook_parameters!),
    )
    console.log(JSON.stringify(result, null, 2))
    hashes.push(hook.Hook.HookHash)
  }
  console.log(hashes)
  for (const hash of hashes) {
    const response = await client.request({
      command: 'ledger_entry',
      hook_definition: hash,
    })
    const result = (response.result.node as HookDefinition).HookParameters?.map((param) =>
      hookParametersParser(param, source.hook_definition.hook_parameters!),
    )
    console.log(JSON.stringify(result, null, 2))
  }
}

const test_write_operation = async () => {
  const { HookParameters } = writeOperation(XahauGovernanceOperation).voteToSeat({
    layer: 2,
    seatId: 8,
    value: 'rJeoxs1fZW78sMeamwJ27CVcXZNpQZR3t',
  })

  console.log(HookParameters)
}

const test_read_operation = async () => {
  const account = GovernanceHookDefinition.account!
  const namespace_id = GovernanceHookDefinition.namespace_id!
  const definition = XahauGovernanceOperation

  const { index, decodeHookStateData } = readOperation(definition, account, namespace_id).currentMemberCount({})

  const response = await client.request({
    command: 'ledger_entry',
    index,
  })
  const hookStateData = (response.result.node as HookState).HookStateData

  console.log(decodeHookStateData(hookStateData))
}

const main = async () => {
  await client.connect()

  const current = Xahau_Governance

  const targets = Array.isArray(current) ? current : [current]

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    await test_hookstate(target)
    await test_invoke_blob(target)
    await test_txn_parameters(target)
    await test_hook_parameters(target)
  }
  // await test_write_operation()
  // await test_read_operation()

  await client.disconnect()
}

main()
