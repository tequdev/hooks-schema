import type { Diagnostic, SourceSpan } from "./ast.js";

export class SchemaParseError extends Error {
  readonly diagnostics: Diagnostic[];

  constructor(diagnostics: Diagnostic[]) {
    super(diagnostics.map((diagnostic) => diagnostic.message).join("\n"));
    this.name = "SchemaParseError";
    this.diagnostics = diagnostics;
  }
}

export class SchemaValidationError extends Error {
  readonly diagnostics: Diagnostic[];

  constructor(diagnostics: Diagnostic[]) {
    super(diagnostics.map((diagnostic) => diagnostic.message).join("\n"));
    this.name = "SchemaValidationError";
    this.diagnostics = diagnostics;
  }
}

export class DecodeInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DecodeInputError";
  }
}

export class DecodeError extends Error {
  readonly state?: string;
  readonly schema?: string;
  readonly offset?: number;

  constructor(message: string, details: { state?: string; schema?: string; offset?: number } = {}) {
    super(message);
    this.name = "DecodeError";
    this.state = details.state;
    this.schema = details.schema;
    this.offset = details.offset;
  }
}

export class NoMatchingStateError extends Error {
  constructor(message = "no State matched given key/value") {
    super(message);
    this.name = "NoMatchingStateError";
  }
}

export class AmbiguousMatchError extends Error {
  readonly candidates: Array<{
    state: string;
    score: number;
    reasons: string[];
  }>;

  constructor(candidates: Array<{ state: string; score: number; reasons: string[] }>) {
    super(
      `multiple States matched with the same score: ${candidates.map((c) => c.state).join(", ")}`,
    );
    this.name = "AmbiguousMatchError";
    this.candidates = candidates;
  }
}

export function diagnostic(
  code: string,
  message: string,
  span?: SourceSpan,
  severity: "error" | "warning" = "error",
): Diagnostic {
  return { severity, code, message, span };
}
