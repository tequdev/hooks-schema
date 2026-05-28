export type SourceSpan = {
  start: number;
  end: number;
  line: number;
  column: number;
};

export type SchemaAst = {
  kind: "Schema";
  definitions: DefinitionAst[];
};

export type DefinitionAst = TypeAliasAst | StateKeyAst | StateValueAst | StateAst;

export type TypeAliasAst = {
  kind: "TypeAlias";
  name: string;
  target: TypeExprAst;
  span: SourceSpan;
};

export type StateKeyAst = {
  kind: "StateKey";
  name: string;
  fields: FieldAst[];
  span: SourceSpan;
};

export type StateValueAst = {
  kind: "StateValue";
  name: string;
  fields: FieldAst[];
  span: SourceSpan;
};

export type StateAst = {
  kind: "State";
  name: string;
  keySchema: string;
  valueSchema: string;
  attributes: AttributeAst[];
  span: SourceSpan;
};

export type FieldAst = {
  kind: "Field";
  type: TypeExprAst;
  name?: string;
  attributes: AttributeAst[];
  span: SourceSpan;
};

export type TypeExprAst = {
  kind: "TypeExpr";
  name: string;
  args: TypeArgAst[];
  span: SourceSpan;
};

export type TypeArgAst =
  | { kind: "number"; value: number; span: SourceSpan }
  | { kind: "string"; value: string; span: SourceSpan }
  | { kind: "fieldRef"; name: string; span: SourceSpan };

export type AttributeAst = {
  name: string;
  args: TypeArgAst[];
  span: SourceSpan;
};

export type Diagnostic = {
  severity: "error" | "warning";
  code?: string;
  message: string;
  span?: SourceSpan;
};
