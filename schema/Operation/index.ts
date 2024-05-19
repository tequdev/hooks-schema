import { Field } from '../Field'

export interface OperationDefinition {
  write: WriteOperation
  read: ReadOperation
}

interface WriteOperation {
  [method: string]: {
    // Transaction with HookParameters Field
    // or Invoke Transaction
    // n parameters
    data: Record<string, Field['type']>
    // field name MUST match any key.name or data.name in definition
    // [field: string]: Field['type']
    txn_parameter_definition?: { key: Field[]; data: Field[] }[]
    invoke_blob_definition?: { data: Field[] }
  }
}

interface ReadOperation {
  [method: string]: {
    // HookState
    // HookStateKey
    args: {
      [field: string]: Field['type']
    }
    // HookStateData
    returns: {
      [field: string]: Field['type']
    }
    hook_state_definition: { key: Field[]; data: Field[] }
  }
}
