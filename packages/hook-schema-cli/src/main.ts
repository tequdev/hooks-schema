#!/usr/bin/env node
import { readFileSync } from "node:fs";
import {
  SchemaParseError,
  SchemaValidationError,
  compileSchema,
  decodeState,
  jsonReplacer,
} from "state-schema";

type CliArgs = {
  command?: string;
  schema?: string;
  key?: string;
  value?: string;
  mode?: "strict" | "loose";
  pretty: boolean;
  ir: boolean;
};

function main(argv: string[]): void {
  const args = parseArgs(argv);
  if (args.command !== "decode") {
    usage();
    process.exitCode = 1;
    return;
  }
  if (!args.schema) fail("missing --schema");

  const schemaText = readFileSync(args.schema, "utf8");
  const schema = compileSchema(schemaText);

  if (args.ir) {
    printJson(schema, args.pretty);
    return;
  }

  if (!args.key) fail("missing --key");
  if (args.value === undefined) fail("missing --value");

  const result = decodeState(
    schema,
    { key: args.key, value: args.value },
    { mode: args.mode ?? "strict" },
  );
  printJson(result, args.pretty);
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { pretty: false, ir: false };
  args.command = argv[0];
  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--schema") args.schema = argv[++index];
    else if (arg === "--key") args.key = argv[++index];
    else if (arg === "--value") args.value = argv[++index];
    else if (arg === "--mode") args.mode = argv[++index] as "strict" | "loose";
    else if (arg === "--pretty") args.pretty = true;
    else if (arg === "--ir") args.ir = true;
    else fail(`unknown argument ${arg}`);
  }
  return args;
}

function printJson(value: unknown, pretty: boolean): void {
  console.log(JSON.stringify(value, jsonReplacer, pretty ? 2 : undefined));
}

function fail(message: string): never {
  throw new Error(message);
}

function usage(): void {
  console.error(
    "usage: hook-schema decode --schema schema.xhs --key HEX --value HEX [--mode strict|loose] [--pretty] [--ir]",
  );
}

try {
  main(process.argv.slice(2));
} catch (error) {
  if (error instanceof SchemaParseError || error instanceof SchemaValidationError) {
    console.error(
      JSON.stringify(
        error.diagnostics.map((diagnostic) => ({
          file: undefined,
          line: diagnostic.span?.line,
          column: diagnostic.span?.column,
          severity: diagnostic.severity,
          code: diagnostic.code,
          message: diagnostic.message,
        })),
        null,
        2,
      ),
    );
  } else {
    console.error(error instanceof Error ? error.message : String(error));
  }
  process.exitCode = 1;
}
