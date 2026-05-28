import assert from "node:assert/strict";
import type { Diagnostic } from "../src/ast.js";

export function diagnosticCodes(diagnostics: Diagnostic[]): string[] {
  return diagnostics.map((diagnostic) => diagnostic.code ?? "");
}

export function assertDiagnosticCodes(diagnostics: Diagnostic[], expected: string[]): void {
  assert.deepEqual(diagnosticCodes(diagnostics).sort(), [...expected].sort());
}

export function assertIncludesDiagnosticCodes(diagnostics: Diagnostic[], expected: string[]): void {
  const codes = new Set(diagnosticCodes(diagnostics));
  for (const code of expected) {
    assert.ok(codes.has(code), `expected diagnostic code ${code}`);
  }
}
