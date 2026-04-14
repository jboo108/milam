/**
 * Clude memory store wrapper for encrypted dreams.
 *
 * Clude (clude-bot) is Stanford-Generative-Agents-style cognitive memory
 * backed by Supabase + pgvector. We store each dream as an `episodic`
 * memory whose `content` is the base64 libsodium envelope — Clude's
 * Supabase never sees plaintext.
 *
 * Env:
 *   CORTEX_API_KEY     clk_... from `npx clude-bot register`
 *
 * Local fallback: if CORTEX_API_KEY is unset, memories are written to
 *   data/local-dreams.json so the UI is developable offline. The demo
 *   run MUST set CORTEX_API_KEY so judges see real Clude memories.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import type { Envelope } from "../crypto/envelope";

// clude-bot is CJS-only (no ESM export map). Turbopack can't resolve the
// bare `import` — load via createRequire, same pattern as envelope.ts.
const require = createRequire(import.meta.url);
type CortexCtor = new (config: {
  hosted?: { apiKey: string };
  supabase?: { url: string; serviceKey: string };
  anthropic?: { apiKey: string };
}) => {
  init: () => Promise<void>;
  // clude-bot v2.7: store returns a numeric id (or null).
  store: (m: Record<string, unknown>) => Promise<number | null>;
  recall: (q: Record<string, unknown>) => Promise<Array<Record<string, unknown>>>;
};
const { Cortex } = require("clude-bot") as { Cortex: CortexCtor };
type Cortex = InstanceType<typeof Cortex>;

export interface DreamerReply {
  envelope: Envelope;
  createdAt: string;
  solanaTx?: string;
  cludeMemoryId?: string;
}

export interface DreamRecord {
  id: string;
  createdAt: string;
  envelope: Envelope;
  milamResponse: string;
  inputType: "sleeping_dream" | "daydream" | "fragment";
  solanaTx?: string;
  nosanaJobUrl?: string;
  cludeMemoryId?: string;
  /** Optional dreamer reply that enriches the original dream context. */
  reply?: DreamerReply;
}

interface CludeMemoryMetadata {
  envelope_version: string;
  envelope_ciphertext: string;
  envelope_nonce: string;
  milam_response: string;
  source: "milam";
  input_type: DreamRecord["inputType"];
  solana_tx?: string;
  nosana_job_url?: string;
  /** Populated on the child `semantic` memory for a dreamer reply. */
  parent_dream_id?: string;
  reply_envelope_version?: string;
  reply_envelope_ciphertext?: string;
  reply_envelope_nonce?: string;
  reply_solana_tx?: string;
}

let cortexPromise: Promise<Cortex | null> | null = null;

async function getCortex(): Promise<Cortex | null> {
  if (cortexPromise) return cortexPromise;
  cortexPromise = (async () => {
    const apiKey = process.env.CORTEX_API_KEY;
    if (!apiKey) return null;
    const brain = new Cortex({ hosted: { apiKey } });
    await brain.init();
    return brain;
  })();
  return cortexPromise;
}

export async function isCludeConnected(): Promise<boolean> {
  return (await getCortex()) !== null;
}

export async function storeDream(record: DreamRecord): Promise<{ memoryId?: string }> {
  const brain = await getCortex();
  if (!brain) {
    await writeLocalFallback(record);
    return {};
  }

  const metadata: CludeMemoryMetadata = {
    envelope_version: record.envelope.envelopeVersion,
    envelope_ciphertext: record.envelope.ciphertext,
    envelope_nonce: record.envelope.nonce,
    milam_response: record.milamResponse,
    source: "milam",
    input_type: record.inputType,
    solana_tx: record.solanaTx,
    nosana_job_url: record.nosanaJobUrl,
  };

  let numericId: number | null = null;
  try {
    numericId = await brain.store({
      type: "episodic",
      content: `[encrypted dream ${record.id}] ${record.envelope.ciphertext.slice(0, 48)}…`,
      summary: record.milamResponse,
      tags: ["dream", "milam", record.inputType],
      importance: 0.85,
      source: "milam",
      metadata: metadata as unknown as Record<string, unknown>,
    });
  } catch (err) {
    console.error("[clude.storeDream] failed:", err);
  }

  const memoryId = numericId != null ? String(numericId) : undefined;
  await writeLocalFallback({ ...record, cludeMemoryId: memoryId });
  return { memoryId };
}

/**
 * Record a dreamer's reply to MILAM's question as a sibling `semantic`
 * memory bonded to the original dream. MILAM does NOT respond — the
 * reply enriches the dream context. Clude's Hebbian bond graph
 * automatically links co-retrieved dream + reply pairs.
 */
export async function storeDreamerReply(
  parentId: string,
  reply: DreamerReply,
): Promise<{ memoryId?: string }> {
  // Always update local fallback so the UI sees the reply immediately.
  const existing = await readLocalFallback(1000);
  const parent = existing.find((r) => r.id === parentId);
  if (parent) {
    parent.reply = reply;
    await writeAllLocalFallback(existing);
  }

  const brain = await getCortex();
  if (!brain) return {};

  const metadata: CludeMemoryMetadata = {
    envelope_version: reply.envelope.envelopeVersion,
    envelope_ciphertext: reply.envelope.ciphertext,
    envelope_nonce: reply.envelope.nonce,
    milam_response: "",
    source: "milam",
    input_type: parent?.inputType ?? "sleeping_dream",
    parent_dream_id: parentId,
    reply_envelope_version: reply.envelope.envelopeVersion,
    reply_envelope_ciphertext: reply.envelope.ciphertext,
    reply_envelope_nonce: reply.envelope.nonce,
    reply_solana_tx: reply.solanaTx,
  };

  let numericId: number | null = null;
  try {
    numericId = await brain.store({
      type: "semantic",
      content: `[encrypted reply for dream ${parentId}] ${reply.envelope.ciphertext.slice(0, 48)}…`,
      summary: "a dreamer reflection",
      tags: ["dream", "milam", "reply", `parent:${parentId}`],
      importance: 0.75,
      source: "milam",
      metadata: metadata as unknown as Record<string, unknown>,
    });
  } catch (err) {
    console.error("[clude.storeDreamerReply] failed:", err);
  }

  const memoryId = numericId != null ? String(numericId) : undefined;
  if (parent) {
    parent.reply = { ...reply, cludeMemoryId: memoryId };
    await writeAllLocalFallback(existing);
  }
  return { memoryId };
}

export async function recallDreams(limit = 50): Promise<DreamRecord[]> {
  const brain = await getCortex();
  if (!brain) {
    return readLocalFallback(limit);
  }

  let memories: Array<Record<string, unknown>> = [];
  try {
    memories = await brain.recall({
      query: "dream",
      limit,
      tags: ["milam"],
    });
  } catch (err) {
    console.error("[clude.recallDreams] failed:", err);
  }

  const results: DreamRecord[] = [];
  const repliesByParent = new Map<string, DreamerReply>();

  for (const m of memories) {
    const meta = (m.metadata ?? {}) as Partial<CludeMemoryMetadata> & Record<string, unknown>;
    // Reply memory: has parent_dream_id, belongs to a parent dream.
    if (meta.parent_dream_id && meta.reply_envelope_ciphertext && meta.reply_envelope_nonce) {
      repliesByParent.set(String(meta.parent_dream_id), {
        envelope: {
          ciphertext: meta.reply_envelope_ciphertext,
          nonce: meta.reply_envelope_nonce,
          envelopeVersion: (meta.reply_envelope_version ?? "libsodium-v1") as Envelope["envelopeVersion"],
        },
        createdAt: String(m.createdAt ?? m.created_at ?? new Date().toISOString()),
        solanaTx: meta.reply_solana_tx,
        cludeMemoryId: String(m.id ?? ""),
      });
      continue;
    }
    if (!meta.envelope_ciphertext || !meta.envelope_nonce) continue;
    results.push({
      id: String(m.id ?? ""),
      createdAt: String(m.createdAt ?? m.created_at ?? new Date().toISOString()),
      envelope: {
        ciphertext: meta.envelope_ciphertext,
        nonce: meta.envelope_nonce,
        envelopeVersion: (meta.envelope_version ?? "libsodium-v1") as Envelope["envelopeVersion"],
      },
      milamResponse: String(meta.milam_response ?? m.summary ?? ""),
      inputType: (meta.input_type ?? "sleeping_dream") as DreamRecord["inputType"],
      solanaTx: meta.solana_tx,
      nosanaJobUrl: meta.nosana_job_url,
      cludeMemoryId: String(m.id ?? ""),
    });
  }

  for (const r of results) {
    const reply = repliesByParent.get(r.id);
    if (reply) r.reply = reply;
  }

  // Merge in anything we wrote locally that Clude hasn't returned yet
  // (Clude indexing can lag a few seconds on a fresh write).
  const localOnly = (await readLocalFallback(limit)).filter(
    (r) => !results.some((x) => x.id === r.id),
  );
  return [...results, ...localOnly]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}

/* -------------------- local JSON fallback -------------------- */

function fallbackPath(): string {
  return path.join(process.cwd(), "data", "local-dreams.json");
}

async function readLocalFallback(limit: number): Promise<DreamRecord[]> {
  try {
    const raw = await fs.readFile(fallbackPath(), "utf8");
    const arr = JSON.parse(raw) as DreamRecord[];
    return arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, limit);
  } catch {
    return [];
  }
}

async function writeLocalFallback(record: DreamRecord): Promise<void> {
  const existing = await readLocalFallback(1000);
  // Preserve an existing reply if the caller is just updating other fields.
  const prior = existing.find((r) => r.id === record.id);
  const merged = prior?.reply ? { ...record, reply: record.reply ?? prior.reply } : record;
  const next = [merged, ...existing.filter((r) => r.id !== record.id)];
  await writeAllLocalFallback(next);
}

async function writeAllLocalFallback(records: DreamRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(fallbackPath()), { recursive: true });
  await fs.writeFile(fallbackPath(), JSON.stringify(records, null, 2), "utf8");
}
