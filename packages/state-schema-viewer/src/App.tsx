import { useMemo, useState } from "react";
import {
  type DecodedState,
  type SchemaIr,
  compileSchema,
  decodeState,
  jsonReplacer,
} from "state-schema";
import governanceSchema from "../../../examples/governance.xhs?raw";

const ENDPOINTS = {
  mainnet: "wss://xahau.network",
  testnet: "wss://xahau-test.net",
} as const;

type Network = keyof typeof ENDPOINTS;

type AccountNamespaceRequest = {
  command: "account_namespace";
  account: string;
  namespace_id: string;
};

type HookStateEntry = {
  LedgerEntryType: "HookState";
  OwnerNode: string;
  HookStateKey: string;
  HookStateData: string;
  index: string;
};

type AccountNamespaceResponse = {
  result: {
    account: string;
    namespace_id: string;
    namespace_entries: HookStateEntry[];
    ledger_current_index: number;
    validated: boolean;
  };
};

type DecodedEntry = {
  ledgerIndex: string;
  raw: HookStateEntry;
  decoded?: DecodedState;
  error?: string;
};

type EntryGroup = {
  state: string;
  label: string;
  entries: DecodedEntry[];
};

type LoadState =
  | { kind: "idle" }
  | { kind: "loading"; message: string }
  | { kind: "success"; ledgerIndex: number; validated: boolean; entries: DecodedEntry[] }
  | { kind: "error"; message: string };

function normalizeHex(value: string): string {
  return value.trim().replace(/^0x/i, "").toUpperCase();
}

function validateInputs(schemaText: string, account: string, namespaceId: string): string | null {
  if (!schemaText.trim()) return "XHS schema is required.";
  if (!account.trim()) return "Account address is required.";
  if (!namespaceId.trim()) return "Namespace ID is required.";

  const normalizedNamespace = normalizeHex(namespaceId);
  if (!/^[0-9A-F]+$/.test(normalizedNamespace)) return "Namespace ID must be hex.";
  if (normalizedNamespace.length !== 64) return "Namespace ID must be 32 bytes / 64 hex chars.";

  return null;
}

function toDisplayValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value, jsonReplacer, 2);
}

function decodeEntries(schema: SchemaIr, entries: HookStateEntry[]): DecodedEntry[] {
  return entries.map((entry) => {
    try {
      return {
        ledgerIndex: entry.index,
        raw: entry,
        decoded: decodeState(schema, {
          key: entry.HookStateKey,
          value: entry.HookStateData,
        }),
      };
    } catch (error) {
      return {
        ledgerIndex: entry.index,
        raw: entry,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });
}

function getEntryState(entry: DecodedEntry): string {
  return entry.decoded?.state ?? "Decode failed";
}

function getEntryLabel(entry: DecodedEntry): string {
  return entry.decoded?.metadata.name ?? getEntryState(entry);
}

function compareEntries(left: DecodedEntry, right: DecodedEntry): number {
  const stateComparison = getEntryState(left).localeCompare(getEntryState(right));
  if (stateComparison !== 0) return stateComparison;
  return left.ledgerIndex.localeCompare(right.ledgerIndex);
}

function groupEntries(entries: DecodedEntry[]): EntryGroup[] {
  const groups = new Map<string, EntryGroup>();

  for (const entry of [...entries].sort(compareEntries)) {
    const state = getEntryState(entry);
    const existingGroup = groups.get(state);
    if (existingGroup) {
      existingGroup.entries.push(entry);
      continue;
    }
    groups.set(state, {
      state,
      label: getEntryLabel(entry),
      entries: [entry],
    });
  }

  return Array.from(groups.values());
}

function App() {
  const [schemaText, setSchemaText] = useState(governanceSchema);
  const [network, setNetwork] = useState<Network>("mainnet");
  const [account, setAccount] = useState("rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh");
  const [namespaceId, setNamespaceId] = useState(
    "0000000000000000000000000000000000000000000000000000000000000000",
  );
  const [loadState, setLoadState] = useState<LoadState>({ kind: "idle" });

  const stats = useMemo(() => {
    if (loadState.kind !== "success") return null;
    const decoded = loadState.entries.filter((entry) => entry.decoded).length;
    return {
      total: loadState.entries.length,
      decoded,
      failed: loadState.entries.length - decoded,
    };
  }, [loadState]);

  const entryGroups = useMemo(() => {
    if (loadState.kind !== "success") return [];
    return groupEntries(loadState.entries);
  }, [loadState]);

  async function handleDecode() {
    const validationError = validateInputs(schemaText, account, namespaceId);
    if (validationError) {
      setLoadState({ kind: "error", message: validationError });
      return;
    }

    let schema: SchemaIr;
    try {
      schema = compileSchema(schemaText);
    } catch (error) {
      setLoadState({
        kind: "error",
        message: error instanceof Error ? error.message : String(error),
      });
      return;
    }

    setLoadState({ kind: "loading", message: "Fetching HookState entries" });

    let client:
      | { connect(): Promise<void>; disconnect(): Promise<void>; isConnected(): boolean }
      | undefined;
    try {
      const { Client } = await import("xahau");
      const xahauClient = new Client(ENDPOINTS[network]);
      client = xahauClient;
      await client.connect();
      const request = {
        command: "account_namespace",
        account: account.trim(),
        namespace_id: normalizeHex(namespaceId),
      } satisfies AccountNamespaceRequest;
      const response = (await xahauClient.request(request)) as AccountNamespaceResponse;
      setLoadState({
        kind: "success",
        ledgerIndex: response.result.ledger_current_index,
        validated: response.result.validated,
        entries: decodeEntries(schema, response.result.namespace_entries),
      });
    } catch (error) {
      setLoadState({
        kind: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      if (client?.isConnected()) {
        await client.disconnect();
      }
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1440px] bg-[#f6f4ee] p-4 text-[#18221f] md:p-6">
      <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-h-[620px] rounded-lg border border-[#18221f1f] bg-white/80 p-5 shadow-[0_24px_70px_rgba(33,43,39,0.08)]">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-black tracking-normal text-[#60716b] uppercase">
                XHS
              </p>
              <h1 className="text-[1.65rem] leading-tight font-black text-[#12211c]">
                HookState Decoder
              </h1>
            </div>
            <button
              className="min-h-11 rounded-md bg-[#116a5b] px-4 font-black whitespace-nowrap text-white transition hover:-translate-y-px hover:bg-[#0d5549] sm:w-auto"
              type="button"
              onClick={handleDecode}
            >
              {loadState.kind === "loading" ? "Decoding..." : "Fetch & Decode"}
            </button>
          </div>

          <label className="mb-2 block text-xs font-black text-[#40514b]" htmlFor="schema">
            Schema
          </label>
          <textarea
            id="schema"
            className="min-h-[520px] w-full resize-y rounded-lg border border-[#18221f29] bg-[#16231f] p-4 font-mono text-[0.92rem] leading-relaxed text-[#f4fbf8] outline-none focus:border-[#159b83] focus:ring-3 focus:ring-[#159b8324] md:min-h-[560px]"
            spellCheck={false}
            value={schemaText}
            onChange={(event) => setSchemaText(event.target.value)}
          />
        </div>

        <aside className="grid gap-4">
          <div className="rounded-lg border border-[#18221f1f] bg-white/80 p-5 shadow-[0_24px_70px_rgba(33,43,39,0.08)]">
            <label className="mb-2 block text-xs font-black text-[#40514b]" htmlFor="network">
              Network
            </label>
            <select
              id="network"
              className="min-h-11 w-full rounded-md border border-[#18221f26] bg-white px-3 text-[#15221e] outline-none focus:border-[#159b83] focus:ring-3 focus:ring-[#159b8324]"
              value={network}
              onChange={(event) => setNetwork(event.target.value as Network)}
            >
              <option value="mainnet">Xahau Mainnet</option>
              <option value="testnet">Xahau Testnet</option>
            </select>

            <label className="mt-4 mb-2 block text-xs font-black text-[#40514b]" htmlFor="account">
              Account
            </label>
            <input
              id="account"
              className="min-h-11 w-full rounded-md border border-[#18221f26] bg-white px-3 text-[#15221e] outline-none focus:border-[#159b83] focus:ring-3 focus:ring-[#159b8324]"
              value={account}
              onChange={(event) => setAccount(event.target.value)}
              placeholder="r..."
            />

            <label
              className="mt-4 mb-2 block text-xs font-black text-[#40514b]"
              htmlFor="namespace"
            >
              Namespace ID
            </label>
            <input
              id="namespace"
              className="min-h-11 w-full rounded-md border border-[#18221f26] bg-white px-3 font-mono text-[#15221e] outline-none focus:border-[#159b83] focus:ring-3 focus:ring-[#159b8324]"
              value={namespaceId}
              onChange={(event) => setNamespaceId(event.target.value)}
              placeholder="64 hex chars"
            />

            <div className="mt-4 rounded-md bg-[#dff1ec] px-3 py-2 text-sm font-black break-all text-[#245048]">
              {ENDPOINTS[network]}
            </div>
          </div>

          {stats ? (
            <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-[#18221f1f] bg-white/80 shadow-[0_24px_70px_rgba(33,43,39,0.08)]">
              <div className="border-r border-[#18221f1a] p-4">
                <span className="block text-2xl font-black">{stats.total}</span>
                <p className="mt-1 text-xs font-black text-[#60716b] uppercase">Entries</p>
              </div>
              <div className="border-r border-[#18221f1a] p-4">
                <span className="block text-2xl font-black">{stats.decoded}</span>
                <p className="mt-1 text-xs font-black text-[#60716b] uppercase">Decoded</p>
              </div>
              <div className="p-4">
                <span className="block text-2xl font-black">{stats.failed}</span>
                <p className="mt-1 text-xs font-black text-[#60716b] uppercase">Failed</p>
              </div>
            </div>
          ) : null}
        </aside>
      </section>

      <section className="mt-5">
        {loadState.kind === "idle" ? (
          <div className="flex min-h-28 items-center justify-center rounded-lg border border-[#18221f1f] bg-white/80 p-6 font-black text-[#60716b] shadow-[0_24px_70px_rgba(33,43,39,0.08)]">
            Decoded HookState entries will appear here.
          </div>
        ) : null}

        {loadState.kind === "loading" ? (
          <div className="flex min-h-28 items-center justify-center gap-3 rounded-lg border border-[#18221f1f] bg-white/80 p-6 font-black text-[#60716b] shadow-[0_24px_70px_rgba(33,43,39,0.08)]">
            <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-[#116a5b2e] border-t-[#116a5b]" />
            <span>{loadState.message}</span>
          </div>
        ) : null}

        {loadState.kind === "error" ? (
          <div className="flex min-h-28 items-center rounded-lg border border-[#18221f1f] bg-[#fff3ef] p-6 font-black text-[#8f2f25] shadow-[0_24px_70px_rgba(33,43,39,0.08)]">
            {loadState.message}
          </div>
        ) : null}

        {loadState.kind === "success" ? (
          <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-black tracking-normal text-[#60716b] uppercase">
                  Ledger {loadState.ledgerIndex}
                </p>
                <h2 className="text-xl font-black">
                  {loadState.validated ? "Validated Results" : "Current Ledger Results"}
                </h2>
              </div>
              <span className="text-sm font-black text-[#60716b]">
                {loadState.entries.length} HookState entries
              </span>
            </div>

            <div className="grid gap-6">
              {entryGroups.map((group) => (
                <section className="grid gap-3" key={group.state}>
                  <div className="flex items-center justify-between gap-3 border-b border-[#18221f1a] pb-2">
                    <div>
                      <h3 className="font-black text-[#12211c]">{group.label}</h3>
                      <p className="mt-0.5 font-mono text-xs font-bold text-[#60716b]">
                        {group.state}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#dff1ec] px-3 py-1 text-xs font-black text-[#245048]">
                      {group.entries.length}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {group.entries.map((entry) => (
                      <ResultCard entry={entry} key={entry.ledgerIndex} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}

function ResultCard({ entry }: { entry: DecodedEntry }) {
  return (
    <article
      className={`rounded-lg border bg-white/80 p-4 shadow-[0_24px_70px_rgba(33,43,39,0.08)] ${
        entry.error ? "border-[#b33d4c4d]" : "border-[#18221f1f]"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="mb-0.5 font-black">{getEntryLabel(entry)}</p>
          <span className="text-sm font-black text-[#60716b]">{getEntryState(entry)}</span>
        </div>
        <code className="rounded-full bg-[#eef5f2] px-2 py-1 font-mono text-xs text-[#36574f]">
          {entry.raw.OwnerNode}
        </code>
      </div>

      {entry.error ? (
        <div className="rounded-md bg-[#fff3ef] p-3 text-sm font-bold text-[#8f2f25]">
          {entry.error}
        </div>
      ) : (
        <div className="grid gap-3">
          <ValueGroup title="Key" values={entry.decoded?.key ?? {}} />
          <ValueGroup title="Value" values={entry.decoded?.value ?? {}} />
        </div>
      )}

      <details className="mt-3 border-t border-[#18221f1a] pt-3">
        <summary className="cursor-pointer text-sm font-black text-[#60716b]">
          Raw HookState
        </summary>
        <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-[#16231f] p-3 font-mono text-xs leading-relaxed text-[#ecf7f4]">
          {JSON.stringify(entry.raw, jsonReplacer, 2)}
        </pre>
      </details>
    </article>
  );
}

function ValueGroup({ title, values }: { title: string; values: Record<string, unknown> }) {
  const entries = Object.entries(values);

  return (
    <div className="border-t border-[#18221f1a] pt-3">
      <h3 className="mb-2 text-xs font-black text-[#60716b] uppercase">{title}</h3>
      {entries.length === 0 ? (
        <div className="rounded-md bg-[#f4f7f5] p-3 text-sm font-bold text-[#60716b]">
          No fields
        </div>
      ) : (
        entries.map(([key, value]) => (
          <div className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3 py-2" key={key}>
            <span className="text-sm font-black text-[#50635d]">{key}</span>
            <code className="break-all whitespace-pre-wrap font-mono text-xs text-[#16231f]">
              {toDisplayValue(value)}
            </code>
          </div>
        ))
      )}
    </div>
  );
}

export { App };
