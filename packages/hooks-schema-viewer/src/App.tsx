import {
  type DecodedFieldMetadata,
  type DecodedState,
  type MetadataIr,
  type SchemaIr,
  compileSchema,
  decodeState,
  jsonReplacer,
} from "hooks-schema";
import { useEffect, useMemo, useRef, useState } from "react";
import { encodeAccountID } from "xahau-address-codec";
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
  metadata?: MetadataIr;
  entries: DecodedEntry[];
  failed: boolean;
};

type LoadState =
  | { kind: "idle" }
  | { kind: "loading"; message: string }
  | { kind: "success"; ledgerIndex: number; validated: boolean; entries: DecodedEntry[] }
  | { kind: "error"; message: string };

type SchemaStatus =
  | { kind: "idle" }
  | { kind: "loading"; url: string }
  | { kind: "error"; message: string };

const DEFAULT_ACCOUNT = "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh";
const DEFAULT_NAMESPACE_ID = "0000000000000000000000000000000000000000000000000000000000000000";

function normalizeHex(value: string): string {
  return value.trim().replace(/^0x/i, "").toUpperCase();
}

function normalizeNetwork(value: string | null): Network {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "test" || normalized === "testnet") return "testnet";
  return "mainnet";
}

function networkToQueryValue(network: Network): "main" | "test" {
  return network === "testnet" ? "test" : "main";
}

function readUrlState() {
  const params = new URLSearchParams(window.location.search);
  return {
    network: normalizeNetwork(params.get("network")),
    account: params.get("account")?.trim() || DEFAULT_ACCOUNT,
    namespaceId: params.get("namespaceid")?.trim() || DEFAULT_NAMESPACE_ID,
    schemaUrl: params.get("schema")?.trim() || null,
  };
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

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function toDisplayValue(value: unknown, metadata?: DecodedFieldMetadata): string {
  if (metadata?.typeName === "Account" && typeof value === "string" && value.length === 40) {
    try {
      return encodeAccountID(hexToBytes(value));
    } catch {
      return value;
    }
  }

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

function isDecodeFailed(entry: DecodedEntry): boolean {
  return !entry.decoded;
}

function getEntryLabel(entry: DecodedEntry): string {
  return entry.decoded?.metadata.name ?? getEntryState(entry);
}

function compareEntries(left: DecodedEntry, right: DecodedEntry): number {
  const failedComparison = Number(isDecodeFailed(left)) - Number(isDecodeFailed(right));
  if (failedComparison !== 0) return failedComparison;

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
      metadata: entry.decoded?.metadata,
      entries: [entry],
      failed: isDecodeFailed(entry),
    });
  }

  return Array.from(groups.values());
}

function App() {
  const [schemaText, setSchemaText] = useState(governanceSchema);
  const [schemaStatus, setSchemaStatus] = useState<SchemaStatus>({ kind: "idle" });
  const [schemaSourceUrl, setSchemaSourceUrl] = useState<string | null>(
    () => readUrlState().schemaUrl,
  );
  const schemaLoadToken = useRef(0);
  const [network, setNetwork] = useState<Network>(() => readUrlState().network);
  const [account, setAccount] = useState(() => readUrlState().account);
  const [namespaceId, setNamespaceId] = useState(() => readUrlState().namespaceId);
  const [loadState, setLoadState] = useState<LoadState>({ kind: "idle" });

  useEffect(() => {
    if (!schemaSourceUrl) return;

    const controller = new AbortController();
    const loadToken = ++schemaLoadToken.current;
    setSchemaStatus({ kind: "loading", url: schemaSourceUrl });

    void (async () => {
      try {
        const response = await fetch(schemaSourceUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to fetch schema (${response.status} ${response.statusText})`);
        }
        const text = await response.text();
        if (controller.signal.aborted || loadToken !== schemaLoadToken.current) return;
        setSchemaText(text);
        setSchemaStatus({ kind: "idle" });
      } catch (error) {
        if (controller.signal.aborted || loadToken !== schemaLoadToken.current) return;
        setSchemaStatus({
          kind: "error",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    })();

    return () => controller.abort();
  }, [schemaSourceUrl]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (network !== "mainnet") params.set("network", networkToQueryValue(network));
    if (account.trim() !== DEFAULT_ACCOUNT) params.set("account", account.trim());
    if (namespaceId.trim() !== DEFAULT_NAMESPACE_ID) params.set("namespaceid", namespaceId.trim());
    if (schemaSourceUrl) params.set("schema", schemaSourceUrl);

    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, [account, network, namespaceId, schemaSourceUrl]);

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
    if (schemaStatus.kind === "loading") {
      setLoadState({ kind: "error", message: "Schema URL is still loading." });
      return;
    }

    if (schemaStatus.kind === "error") {
      setLoadState({ kind: "error", message: schemaStatus.message });
      return;
    }

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

  function handleSchemaChange(value: string) {
    schemaLoadToken.current += 1;
    setSchemaText(value);
    setSchemaSourceUrl(null);
    if (schemaStatus.kind !== "idle") {
      setSchemaStatus({ kind: "idle" });
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
            onChange={(event) => handleSchemaChange(event.target.value)}
          />
          {schemaStatus.kind === "loading" ? (
            <p className="mt-2 text-xs font-bold text-[#60716b]">
              Loading schema from {schemaStatus.url}
            </p>
          ) : null}
          {schemaStatus.kind === "error" ? (
            <p className="mt-2 text-xs font-bold text-[#8f2f25]">{schemaStatus.message}</p>
          ) : null}
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
                {stats && stats.failed > 0 ? ` (${stats.failed} failed)` : ""}
              </span>
            </div>

            <div className="grid gap-6">
              {entryGroups.map((group) => (
                <section className="grid gap-3" key={group.state}>
                  <div className="flex items-center justify-between gap-3 border-b border-[#18221f1a] pb-2">
                    <div>
                      <h3 className="font-black text-[#12211c]">
                        <MetadataLabel metadata={group.metadata}>{group.label}</MetadataLabel>
                      </h3>
                      {group.failed ? null : (
                        <p className="mt-0.5 font-mono text-xs font-bold text-[#60716b]">
                          {group.state}
                        </p>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        group.failed ? "bg-[#fff3ef] text-[#8f2f25]" : "bg-[#dff1ec] text-[#245048]"
                      }`}
                    >
                      {group.failed ? `${group.entries.length} failed` : group.entries.length}
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
      {entry.error ? (
        <div className="rounded-md bg-[#fff3ef] p-3 text-sm font-bold text-[#8f2f25]">
          {entry.error}
        </div>
      ) : (
        <div className="grid gap-3">
          <ValueGroup
            title="Key"
            values={entry.decoded?.key ?? {}}
            fieldMetadata={entry.decoded?.fieldMetadata.key ?? {}}
            first
          />
          <ValueGroup
            title="Value"
            values={entry.decoded?.value ?? {}}
            fieldMetadata={entry.decoded?.fieldMetadata.value ?? {}}
          />
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

function ValueGroup({
  title,
  values,
  fieldMetadata,
  first = false,
}: {
  title: string;
  values: Record<string, unknown>;
  fieldMetadata: Record<string, DecodedFieldMetadata>;
  first?: boolean;
}) {
  const entries = Object.entries(values);

  return (
    <div className={first ? "" : "border-t border-[#18221f1a] pt-3"}>
      <h3 className="mb-2 text-xs font-black text-[#60716b] uppercase">{title}</h3>
      {entries.length === 0 ? (
        <div className="rounded-md bg-[#f4f7f5] p-3 text-sm font-bold text-[#60716b]">
          No fields
        </div>
      ) : (
        entries.map(([key, value]) => (
          <div className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3 py-2" key={key}>
            <span className="text-sm font-black text-[#50635d]">
              <MetadataLabel
                metadata={fieldMetadata[key]}
                type={formatFieldType(fieldMetadata[key])}
              >
                {fieldMetadata[key]?.name ?? key}
              </MetadataLabel>
            </span>
            <code className="break-all whitespace-pre-wrap font-mono text-xs text-[#16231f]">
              {toDisplayValue(value, fieldMetadata[key])}
            </code>
          </div>
        ))
      )}
    </div>
  );
}

function formatFieldType(metadata?: DecodedFieldMetadata): string | undefined {
  if (!metadata) return undefined;

  if (metadata.type.kind === "bytes") {
    return `${metadata.typeName} (${metadata.type.length} bytes)`;
  }
  if (metadata.type.kind === "bytesRef") {
    return `${metadata.typeName} ($${metadata.type.field})`;
  }

  return metadata.typeName;
}

function MetadataLabel({
  children,
  metadata,
  type,
}: {
  children: string;
  metadata?: MetadataIr;
  type?: string;
}) {
  if (!metadata) return children;

  return (
    <button className="group/metadata relative inline-flex cursor-help text-left" type="button">
      {children}
      <span className="invisible absolute top-full left-0 z-20 mt-2 w-max max-w-72 rounded-md bg-[#16231f] px-3 py-2 text-left text-xs leading-relaxed font-bold text-[#ecf7f4] opacity-0 shadow-xl transition group-hover/metadata:visible group-hover/metadata:opacity-100 group-focus/metadata:visible group-focus/metadata:opacity-100">
        <span className="block text-[#8dd7c9]">{metadata.name}</span>
        {type ? <span className="mt-1 block font-mono text-[#d5e9e4]">Type: {type}</span> : null}
        {metadata.description ? (
          <span className="mt-1 block text-[#ecf7f4]">{metadata.description}</span>
        ) : null}
      </span>
    </button>
  );
}

export { App };
