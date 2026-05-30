export type SchemaIr = {
  version: 1;
  builtins: Record<string, TypeIr>;
  types: Record<string, TypeIr>;
  stateKeys: Record<string, StructIr>;
  stateValues: Record<string, StructIr>;
  states: StateIr[];
};

export type TypeIr =
  | { kind: "bytes"; length: number }
  | { kind: "u16"; endian: "le" | "be"; length: 2 }
  | { kind: "u32"; endian: "le" | "be"; length: 4 }
  | { kind: "u64"; endian: "le" | "be"; length: 8 };

export type MetadataIr = {
  name: string;
  description?: string;
};

export type StructIr = {
  kind: "StateKey" | "StateValue";
  name: string;
  fields: FieldIr[];
  fixedLength: number | null;
};

export type FieldIr = PatternFieldIr | NamedFieldIr;

export type PatternFieldIr = {
  kind: "pattern";
  pattern: PatternIr;
  length: number;
};

export type NamedFieldIr = {
  kind: "field";
  name: string;
  valueType: ValueTypeIr;
  sourceTypeName?: string;
  metadata: MetadataIr;
};

export type PatternIr =
  | { kind: "null"; length: number }
  | { kind: "string"; value: string; bytesHex: string }
  | { kind: "hex"; bytesHex: string }
  | { kind: "any"; length: number };

export type ValueTypeIr =
  | { kind: "u8"; length: 1 }
  | { kind: "u16"; endian: "le" | "be"; length: 2 }
  | { kind: "u32"; endian: "le" | "be"; length: 4 }
  | { kind: "u64"; endian: "le" | "be"; length: 8 }
  | { kind: "bytes"; length: number }
  | { kind: "bytesRef"; field: string }
  | { kind: "rest" };

export type StateIr = {
  name: string;
  keySchema: string;
  valueSchema: string;
  priority: number;
  metadata: MetadataIr;
  implicit?: boolean;
};
