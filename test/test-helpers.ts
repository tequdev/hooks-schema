import type { Diagnostic } from "../src/ast.js";

export function diagnosticCodes(diagnostics: Diagnostic[]): string[] {
  return diagnostics.map((diagnostic) => diagnostic.code ?? "");
}

export function assertDiagnosticCodes(diagnostics: Diagnostic[], expected: string[]): void {
  expect(diagnosticCodes(diagnostics).sort()).toEqual([...expected].sort());
}

export function assertIncludesDiagnosticCodes(diagnostics: Diagnostic[], expected: string[]): void {
  const codes = new Set(diagnosticCodes(diagnostics));
  for (const code of expected) {
    expect(codes.has(code), `expected diagnostic code ${code}`).toBe(true);
  }
}
