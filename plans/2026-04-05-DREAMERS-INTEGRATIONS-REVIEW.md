# DREAMERS — Integrations Specialist Review
**Date:** April 5, 2026
**Reviewer:** Integrations & Gamification Engine (specialist pass)
**Scope:** Every third-party connection, webhook, cron, queue, and decentralized service touched by the 9-day build
**Audience:** Solo builder executing the FINAL BUILD PLAN + ARCHITECT DETAIL PASS

---

## CONCERNS (read this first)

These are the things that will eat a day if you don't pre-empt them. Ranked by blast radius.

### C1. Nosana endpoint shape is unconfirmed and the two shapes require different code
The build plan says "Nosana Qwen3.5 endpoint" as if it's a stable URL you POST to. In reality the hackathon track ships two very different delivery models and you don't yet know which one you get:
- **(A) OpenAI-compatible HTTPS endpoint** hosted on a Nosana GPU node — `POST /v1/chat/completions`, bearer token, streaming supported. Looks and feels like OpenAI.
- **(B) Nosana job runner** — you submit a `job_definition.json` to the Nosana network, it schedules a container on a GPU host, returns a job ID, you poll for output. Cold start 30–120s, not interactive, not suitable for live MILAM replies.

**Risk:** if you assume (A) and you get (B), every MILAM live reply path needs an async bridge and Day 3 slips. If you assume (B) and you get (A) you over-engineered. **Resolve this in Day 1 research spike #3, not Day 8.**

### C2. Clude is under-documented and you are trusting an undocumented surface to be the spine of the product
The entire memory architecture rides on `brain.store/recall/clinamen/dream`. These are cute names. The actual package (`clude-bot` on npm) may not expose this exact surface, may require a different init pattern, may not self-host cleanly against a bare Supabase Postgres without a manual migration step. If Clude's self-hosted path is broken or gated, you lose two days.

**Risk:** silent namespace collisions on `:` (many ORMs and some pg drivers treat `:` as a bind param prefix), missing migrations that crash on first `store()`, `dream()` being internally wired to its own LLM (not Nosana) and eating your Anthropic quota without you noticing.

### C3. ElizaOS v2 plugin API drift
v1 docs are everywhere. v2 is the current line and the `shouldRespondTemplate` / `replyTemplate` override story changed. You *may* be reading outdated examples. The plan assumes these are plugin-level config fields. In v2 they are more likely character-level template fields overridden by providers. If you wire them as plugin config you'll ship a plugin that silently does nothing and you won't notice until you test the drowsiness arc.

### C4. Cron inside an ElizaOS Service + dev hot reload = double-fires
`node-cron` scheduled at module init will re-register every time Eliza hot-reloads. On Day 5 you will trigger dream cycles 3–6 times per save, burn Nosana budget, and corrupt the journal. Mitigation must go in on first write of the Service, not after you notice.

### C5. Solana RPC on public mainnet is flaky and rate-limits aggressively
The `clusterApiUrl('mainnet-beta')` default endpoint is shared infra. First-time memo submissions from a fresh IP often time out or 429. On demo day that's a disaster. You need a dedicated RPC (Helius, Triton, QuickNode free tier) configured behind an env var, with exponential backoff, *and* you need to pre-write a memo during rehearsal so the explorer link is cached in your browser.

### C6. Arcium public SDK status is uncertain
As of early 2026 Arcium's public developer story is "devnet invite + examples repo," not "npm install arcium-sdk." If you hit Day 8 and discover no public TS client, the 2-hour timebox hits instantly. Plan for libsodium from the start and frame the fallback honestly.

### C7. Supabase free-tier pooler will bite Clude under cron load
Clude will open a pooled connection per write. If you use the direct `5432` connection string Supabase caps you around 60 concurrent. Use the *session* pooler URL (`6543`) for Clude; use the *transaction* pooler for short-lived Next.js API routes.

### C8. Two processes, one laptop, no supervisor
Next.js on 3000 + Eliza on 3001. If Eliza crashes overnight mid-cron, your morning journal is empty and the cron didn't run. You need at least a `concurrently` dev script and a tiny healthcheck on the bridge route so the frontend can render a real error, not a white screen.

### C9. The "demo video on mainnet" path requires a funded wallet *before* Day 8
Funding a fresh mainnet keypair via CEX withdrawal can take 1–24 hours depending on the exchange. Do it on Day 1 regardless of whether you need it yet. $2 of SOL is enough for hundreds of memos.

### C10. PWA + Seeker dApp store publishing tooling is a rabbit hole
Bubblewrap TWA + Solana `dapp-store` CLI + publisher NFT minting is ~4 hours of fiddly first-time work. It's Day 9 afternoon content at best, and the plan has Day 9 already full with demo video + README. Either slot it into Day 7 integration test window or explicitly cut it and claim "Seeker-ready PWA (manifest + service worker + TWA-compatible)" without actually publishing.

---

## SUGGESTIONS (add these on top of the plan)

1. **Day 1 first hour: pick one Nosana shape and commit.** Don't research for 30 min and move on — produce a 5-line TS function `callInference(prompt)` that works end-to-end against whatever endpoint they actually gave you. Everything downstream imports this one function.
2. **Abstraction layer from minute zero.** `src/plugin-dreamers-core/llm.ts` exports `generate(prompt, opts)`. Behind it: `NosanaProvider`, `HaikuProvider`, `MockProvider`. Switched by `LLM_PROVIDER` env var. This is the single most important decision you can make on Day 1 because it de-risks C1, C6, and lets you develop offline.
3. **Use Haiku for live MILAM replies, Nosana only for the nightly dream cycle.** Even if Nosana gives you (A), the drowsiness arc demands sub-second latency and Haiku is more reliable. The README is honest: "Nosana powers the heavy lifting — the nightly dream cycle. Live sensory questions use Claude Haiku for sub-second response. Both are swappable via env var." Judges will respect this more than a brittle all-Nosana story.
4. **Dedicated Solana RPC on Day 1.** Helius free tier → one env var → never think about it again.
5. **Run `scripts/verify.ts` at the start of every dev session.** It's the sanity check. It catches drift before it compounds.
6. **Name things defensively.** `milam__episodic__fragment-{uuid}` (double underscore) instead of `milam:episodic:fragment-{uuid}` if Clude's key parser is fussy about `:`. Test both on Day 1.
7. **Single `concurrently` dev script.** `bun run dev` launches Next + Eliza together with labeled prefixes. Reduces cognitive load.
8. **Pre-record a backup dream cycle output on Day 7.** If Day 9 demo-day Nosana is down, you have a pre-rendered journal entry you can display with a pre-signed Solana tx. This is "demo insurance," not a lie — you tell the judges "here's a cycle we ran last night" if needed.
9. **Cron: UTC in storage, display in user TZ.** Store `nextRunAt` and `lastRunAt` as UTC ISO strings. Let the frontend format them with `Intl.DateTimeFormat(undefined, { timeZone: ... })`. Don't try to run cron in user-local — you only have one user (you) for the hackathon anyway.
10. **Manual trigger endpoint is the demo path, not the cron.** Present the dream cycle as something the user invokes ("end your day"). Cron is a nice-to-have for the narrative; the button is what judges will see.

---

## 1. Nosana Integration — Deep Dive

### Endpoint shape resolution

Both are plausible for the hackathon track. Here is how to detect and handle each.

**Detection (Day 1):**
```bash
curl -sS "$NOSANA_ENDPOINT/v1/models" -H "Authorization: Bearer $NOSANA_API_KEY"
# 200 + JSON list → shape (A) OpenAI-compatible
# 404 / connection refused / HTML → shape (B) job-based or wrong URL
```

### Shape A — OpenAI-compatible (preferred)
```typescript
// src/plugin-dreamers-core/llm/nosanaOpenAI.ts
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: process.env.NOSANA_ENDPOINT,       // e.g. https://xxx.node.k8s.prd.nos.ci/v1
  apiKey: process.env.NOSANA_API_KEY ?? 'nosana',
  timeout: 120_000,                            // 2 min — Qwen can be slow
  maxRetries: 2,
});

export async function generate(prompt: string, opts: { maxTokens?: number; temperature?: number } = {}) {
  const res = await client.chat.completions.create({
    model: process.env.NOSANA_MODEL ?? 'Qwen/Qwen2.5-27B-Instruct-AWQ',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: opts.maxTokens ?? 1024,
    temperature: opts.temperature ?? 0.9,       // dream cycle wants warm
  });
  return res.choices[0].message.content ?? '';
}
```

### Shape B — Job-based
```typescript
// src/plugin-dreamers-core/llm/nosanaJob.ts
import { Client as NosanaClient } from '@nosana/sdk';  // verify actual package name Day 1

const nosana = new NosanaClient('mainnet', process.env.NOSANA_WALLET!);

export async function generate(prompt: string) {
  const jobDef = {
    version: '0.1',
    type: 'container',
    meta: { trigger: 'dreamers' },
    ops: [{
      type: 'container/run',
      id: 'qwen-inference',
      args: {
        image: 'docker.io/justinluoma/dreamers-inference:latest',
        env: { PROMPT: prompt, MAX_TOKENS: '1024' },
        gpu: true,
      },
    }],
  };
  const job = await nosana.jobs.post(jobDef, { market: process.env.NOSANA_MARKET! });
  // Poll
  for (let i = 0; i < 60; i++) {
    const state = await nosana.jobs.get(job.job);
    if (state.state === 'COMPLETED') return state.result.opStates[0].logs.join('');
    if (state.state === 'FAILED') throw new Error(`Nosana job failed: ${job.job}`);
    await new Promise(r => setTimeout(r, 5_000));
  }
  throw new Error('Nosana job timeout');
}
```

If shape is B, **do not use this for live MILAM replies** — fall back to Haiku (section 6). Use Nosana only for the nightly dream cycle where 60s cold start is acceptable narrative ("it takes time to dream").

### Rate limits, tokens, timeouts
- Assume 1 concurrent inference per Nosana node. Serialize the dream cycle.
- Qwen2.5-27B-AWQ context: 32k. Dream prompts are small; no concern.
- Timeout: 120s for shape A, 300s for shape B.
- No published rate limits for hackathon tier — budget conservatively.

### Cold start warm-up
The first inference after idle is the killer. Before the demo:
```typescript
// scripts/warmNosana.ts
import { generate } from '../src/plugin-dreamers-core/llm/index.js';
console.log(await generate('Say "warm" in one word.', { maxTokens: 8 }));
```
Run this 2 minutes before recording the demo video and 2 minutes before the live judging window.

### `nosana_eliza_job_definition.json` (the container-deploy definition, not the inference call)
```json
{
  "version": "0.1",
  "type": "container",
  "meta": {
    "trigger": "dashboard",
    "system_requirements": { "required_vram": 24 }
  },
  "ops": [
    {
      "type": "container/run",
      "id": "dreamers-agent",
      "args": {
        "cmd": ["bun", "run", "start"],
        "image": "docker.io/YOUR_USER/dreamers:latest",
        "gpu": true,
        "expose": 3001,
        "env": {
          "NODE_ENV": "production",
          "SOLANA_CLUSTER": "mainnet-beta",
          "LLM_PROVIDER": "nosana"
        }
      }
    }
  ]
}
```
Secrets (`ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE`, `SOLANA_KEYPAIR_JSON`, `NOSANA_API_KEY`) go in Nosana's encrypted secrets UI, not the JSON.

### GPU tier
Request 24GB VRAM minimum (A10G, A40, L4, 3090, 4090 all OK). Qwen2.5-27B-AWQ-4bit runs in ~18GB. The hackathon market usually has several of these.

### Deployment
```bash
docker build -t YOUR_USER/dreamers:latest .
docker push YOUR_USER/dreamers:latest
nosana job post --file nos_job_def/nosana_eliza_job_definition.json --market <market-address> --timeout 3600
```

### Monitoring
```bash
nosana job get <job-id>            # status
nosana job logs <job-id> --follow  # live logs — SCREENSHOT THIS FOR THE DEMO VIDEO
```
Dashboard: https://dashboard.nosana.com/jobs/<job-id>

---

## 2. ElizaOS v2 Plugin System — Deep Dive

### Plugin interface (v2 shape)
```typescript
// src/plugin-dreamers-core/index.ts
import type { Plugin } from '@elizaos/core';

export const dreamersCorePlugin: Plugin = {
  name: 'dreamers-core',
  description: 'Shared Clude memory + fragment storage for DREAMERS agents',
  actions: [],
  providers: [],
  evaluators: [],
  services: [],
  init: async (config, runtime) => {
    await initCludeWrapper(runtime);
  },
};

export default dreamersCorePlugin;
```

### `shouldRespondTemplate` and `replyTemplate` overrides in v2
The canonical override point in v2 is the **character file**, not the plugin. Plugins expose **providers** and **evaluators** that inject data into those templates. The template string is resolved at runtime by the message handler.

```json
// characters/milam.character.json (excerpt)
{
  "name": "Milam",
  "plugins": ["@elizaos/plugin-anthropic", "@dreamers/plugin-core", "@dreamers/plugin-milam"],
  "templates": {
    "shouldRespondTemplate": "{{providers.wakefulness}}\n{{providers.dreamClassifier}}\nShould Milam respond? Reply RESPOND, IGNORE, or STOP.\nIf wakefulness is 0, always STOP.\nIf the message is a task/command and not a dream, STOP.",
    "messageHandlerTemplate": "{{providers.wakefulness}}\n{{providers.dreamClassifier}}\nYou are Milam. Current wakefulness: {{wakefulness}}.\nWrite ONLY a brief sensory question (color, temperature, sound, texture, smell).\nAt wakefulness 1 echo one word. Never analyze. Never advise."
  },
  "settings": {
    "secrets": {}
  }
}
```
The custom provider (`wakefulnessProvider`) and evaluator (`dreamClassifier`) write the template variables. This is the hook point — not a plugin-level config field.

**Verify this Day 1** by grepping the installed `@elizaos/core` source for `shouldRespondTemplate` and finding where it's resolved. If the resolution path is different, you adjust character or add a middleware provider. Budget 45 minutes.

### Services vs Providers vs Actions vs Evaluators
| Concern | Correct primitive | Why |
|---|---|---|
| Dream cycle (nightly, long-running, stateful) | **Service** | Services have lifecycle hooks and own background loops |
| Wakefulness state | **Provider** | Providers inject runtime context into the next reply's template |
| Dream classifier (is this a dream?) | **Evaluator** *or* Provider feeding `shouldRespondTemplate` | Evaluator runs post-message; Provider runs pre-reply. You want pre-reply → **Provider**. |
| Manual dream cycle trigger | **Action** | Actions are named invocables; perfect for `POST /api/trigger-dream-cycle` |
| Fragment storage write-path | Hook in **message handler** via an Evaluator that runs on every human message | Evaluators run after every turn and can side-effect |

### Multi-agent character registration
ElizaOS v2 supports multiple characters in one runtime via the CLI `--characters` flag or programmatic `runtime.registerCharacter()`. For the hackathon only MILAM is live; ROLPA is a stub file that parses but has no active plugins.
```bash
elizaos dev --characters characters/milam.character.json,characters/rolpa.character.json
```

### Hot reload and Service state
Services lose in-memory state on hot reload. Wakefulness must persist to Clude (`milam:self_model:wakefulness`) and rehydrate in `Service.start()`. **Cron registered in `Service.start()` must be guarded** (see section 7).

### ElizaOS memory vs Clude
ElizaOS has its own `@elizaos/plugin-sql` memory adapter. You don't want it fighting Clude for the same conversations. Options:
- **Bypass**: set the agent's memory adapter to an in-memory no-op and route everything through the fragment storage evaluator into Clude.
- **Coexist**: let Eliza keep short-term conversation memory (for its own prompt building) and mirror every dream into Clude via the evaluator. This is simpler and safer.

Recommendation: **coexist.** Let Eliza handle last-N conversational context for prompt building. Clude is the long-term dream store. They don't overlap.

---

## 3. Clude Integration — Deep Dive

### Installation and sanity check (Day 1, first 20 minutes)
```bash
bun add clude-bot
bun pm ls clude-bot                # confirm version
node -e "console.log(Object.keys(require('clude-bot')))"
```
If this import fails or the exports don't include a `Brain` / `Cortex` class, **stop and fall back immediately** to the local JSON mode listed in the build plan's risk table. Do not spend more than 45 minutes trying to make a broken package work.

### Self-hosted init
```typescript
// src/plugin-dreamers-core/cludeWrapper.ts
import { Cortex } from 'clude-bot';  // verify actual export name Day 1

let cortex: Cortex | null = null;

export async function initClude() {
  if (cortex) return cortex;
  cortex = new Cortex({
    mode: 'self-hosted',
    postgres: {
      connectionString: process.env.SUPABASE_SESSION_POOLER_URL!,  // port 6543
      ssl: { rejectUnauthorized: false },
    },
    llm: {
      // Clude's internal summarization / clinamen / dream LLM
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY!,
      model: 'claude-haiku-4-5-20251001',
    },
    embeddings: {
      provider: 'anthropic-compatible',
      endpoint: process.env.EMBEDDING_ENDPOINT,  // or use a small local model
    },
    namespace: 'dreamers',
    autoMigrate: true,  // if not supported, run scripts/cludeMigrate.sql manually
  });
  await cortex.init();
  return cortex;
}

// Namespaced wrappers — ALWAYS go through these, never call cortex directly
export const brain = {
  store: async (key: string, value: unknown, metadata?: Record<string, unknown>) => {
    const c = await initClude();
    return c.store(key, value, metadata);
  },
  recall: async (query: string, opts?: { namespace?: string; limit?: number; filter?: Record<string, unknown> }) => {
    const c = await initClude();
    return c.recall(query, opts);
  },
  clinamen: async (context: string, opts?: { drift?: number; limit?: number }) => {
    const c = await initClude();
    return c.clinamen(context, opts);
  },
  dream: async (opts?: { onEmergence?: (phase: string, output: string) => void; since?: Date }) => {
    const c = await initClude();
    return c.dream(opts);
  },
};
```

### Method contracts — assumed signatures (verify Day 1)
| Method | Assumed signature | Returns | If it differs |
|---|---|---|---|
| `store` | `(key: string, value: unknown, meta?: object) => Promise<{id: string}>` | Record ID | Wrap to normalize |
| `recall` | `(query: string, opts?) => Promise<{items: Item[]}>` | Semantic + keyword hybrid | Adapter layer in wrapper |
| `clinamen` | `(context: string, opts?) => Promise<{connections: Connection[]}>` | Unexpected associations | If missing, fake with random high-importance `recall()` sample (plan risk mitigation) |
| `dream` | `(opts?: {onEmergence}) => Promise<{phases: Phase[], emergence: string}>` | 5-phase consolidation result | If missing, compose phases manually with repeated `clinamen()` + Haiku |

**Treat the wrapper as the only surface the rest of the codebase sees.** If Clude's real API differs, you rewrite *one* file.

### Namespace key format
`:` is common in Redis-style keys but Postgres text is fine with it. The risk is if Clude uses `:` as a template delimiter internally. **Test both formats on Day 1:**
```typescript
await brain.store('milam:episodic:fragment-test-1', { content: 'test' });
await brain.store('milam__episodic__fragment-test-2', { content: 'test' });
// Check Supabase dashboard → which one stored cleanly?
```

### Error handling
Wrap every `brain.*` call in the fragment storage layer with try/catch that logs + swallows (never block the user's message on a memory failure):
```typescript
try {
  await brain.store(key, fragment);
} catch (err) {
  console.error('[clude] store failed — continuing', { key, err });
  // Optionally buffer to disk and retry later
}
```

### Does Clude hash to Solana automatically?
**Assume no.** You call Solana yourself from `dreamCycleService.ts` after the journal is stored. If Clude's `dream()` does hash internally, you'll see duplicate memos — easy to detect, trivially fixable by disabling the Clude hash.

### Does Clude wrap Arcium?
**Research answer for Day 1 spike #1:** As of the current `clude-bot` public README, Clude does NOT wrap Arcium. Clude's encryption layer is Postgres column-level, not MPC. The "Arcium-compatible" framing is your responsibility in `arciumWrapper.ts`. Confirm this against the repo Day 1; if it has changed, flip a config flag instead.

---

## 4. Solana Integration — Deep Dive

### web3.js version
**Use v1 (`@solana/web3.js@^1.95`).** v2 is still in flux and the memo program helpers haven't fully moved over as of early 2026. v1 is boring and stable.

```bash
bun add @solana/web3.js @solana/spl-memo bs58
```

### Keypair loading
```typescript
// src/plugin-dreamers-core/solana.ts
import { Keypair, Connection, PublicKey, Transaction, clusterApiUrl, sendAndConfirmTransaction } from '@solana/web3.js';
import { createMemoInstruction } from '@solana/spl-memo';
import { createHash } from 'node:crypto';
import bs58 from 'bs58';

function loadKeypair(): Keypair {
  const raw = process.env.SOLANA_KEYPAIR_JSON;
  if (!raw) throw new Error('SOLANA_KEYPAIR_JSON not set');
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
}

const RPC_URL = process.env.SOLANA_RPC_URL ?? clusterApiUrl(
  (process.env.SOLANA_CLUSTER ?? 'devnet') as 'devnet' | 'mainnet-beta'
);
const connection = new Connection(RPC_URL, 'confirmed');
```

`.env`:
```
SOLANA_KEYPAIR_JSON=[12,45,...,88]   # the JSON array from `solana-keygen new -o keypair.json`
SOLANA_CLUSTER=mainnet-beta
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=xxx
```

### Hash + memo write
```typescript
export async function hashJournalToSolana(journalText: string): Promise<{signature: string; explorerUrl: string}> {
  const signer = loadKeypair();

  // SHA-256 → 32 bytes → base58 = 44 chars, well under memo's 566-byte limit
  const hash = createHash('sha256').update(journalText, 'utf8').digest();
  const memo = `dreamers:v1:${bs58.encode(hash)}`;

  const tx = new Transaction().add(createMemoInstruction(memo, [signer.publicKey]));

  const signature = await withRetry(() =>
    sendAndConfirmTransaction(connection, tx, [signer], {
      commitment: 'confirmed',
      maxRetries: 3,
    })
  );

  const cluster = process.env.SOLANA_CLUSTER ?? 'devnet';
  const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
  return { signature, explorerUrl };
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); }
    catch (err) {
      lastErr = err;
      const delay = 500 * Math.pow(2, i);  // 500, 1000, 2000, 4000
      console.warn(`[solana] retry ${i + 1}/${attempts} in ${delay}ms`, err);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastErr;
}
```

### Cost
~5000 lamports per memo tx = ~$0.0008 at $160 SOL. **Fund the wallet with 0.02 SOL (~$3.20) on Day 1** — covers hundreds of memos with headroom.

### Mainnet funding instructions
1. Generate keypair on an airgapped-ish machine: `solana-keygen new -o dreamers-mainnet.json --no-bip39-passphrase`
2. Copy public address: `solana-keygen pubkey dreamers-mainnet.json`
3. Withdraw 0.02 SOL from Coinbase/Kraken/Phantom to that address.
4. Confirm on explorer.
5. Paste the JSON array contents (the numeric array inside the file) into `SOLANA_KEYPAIR_JSON` in `.env`.
6. **Never commit the file.** `.gitignore` it.

---

## 5. Arcium Integration — Deep Dive

### Research answer
As of early 2026 the public Arcium developer offering is:
- A devnet (Arcium Testnet) with invite-gated access.
- An examples repo showing TypeScript MPC circuits ("Arxis" is the informal nickname for the SDK layer but there is no stable `@arcium/sdk` package on the public npm).
- MXE (Multi-party eXecution Environment) accessible via their CLI and a program-deploy flow, not a drop-in client library.

**Translation: no, you cannot `npm install arcium` and wrap `brain.store` in 30 minutes.** This is why the 2-hour timebox on Day 8 will trip immediately if you try the real path.

### Pragmatic plan: libsodium envelope framed as MXE-compatible
```typescript
// src/plugin-dreamers-core/arciumWrapper.ts
import sodium from 'libsodium-wrappers';

await sodium.ready;

const KEY = sodium.from_base64(process.env.ARCIUM_DEMO_KEY!, sodium.base64_variants.ORIGINAL);

/**
 * Demo-mode envelope. Frames the payload in an Arcium-compatible MXE envelope
 * shape so that Phase 2 (federated DREAMER MODEL training on Arcium MPC)
 * can drop in without changing callers.
 *
 * Structure:
 *   envelope = { v: 1, alg: 'xchacha20poly1305', nonce, ciphertext, aad }
 *
 * In Phase 2 `seal` is replaced by an Arcium MXE computation that encrypts
 * toward the dreamer-model training circuit's public key.
 */
export interface MXEEnvelope {
  v: 1;
  alg: 'xchacha20poly1305-ietf';
  nonce: string;  // base64
  ct: string;     // base64
  aad: string;    // base64 — agent id, timestamp
}

export function seal(plaintext: string, aad: string): MXEEnvelope {
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
  const ct = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    sodium.from_string(plaintext),
    sodium.from_string(aad),
    null, nonce, KEY
  );
  return {
    v: 1,
    alg: 'xchacha20poly1305-ietf',
    nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL),
    ct: sodium.to_base64(ct, sodium.base64_variants.ORIGINAL),
    aad: sodium.to_base64(sodium.from_string(aad), sodium.base64_variants.ORIGINAL),
  };
}

export function open(env: MXEEnvelope): string {
  const nonce = sodium.from_base64(env.nonce, sodium.base64_variants.ORIGINAL);
  const ct = sodium.from_base64(env.ct, sodium.base64_variants.ORIGINAL);
  const aad = sodium.from_base64(env.aad, sodium.base64_variants.ORIGINAL);
  const pt = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(null, ct, aad, nonce, KEY);
  return sodium.to_string(pt);
}
```

Generate the demo key once: `node -e "require('libsodium-wrappers').ready.then(()=>console.log(require('libsodium-wrappers').to_base64(require('libsodium-wrappers').crypto_aead_xchacha20poly1305_ietf_keygen(),1)))"`.

### 2-hour Day 8 timebox — exit criteria
Abort to the envelope fallback if ANY of these hit:
1. 30 min in: no working `npm install` of an Arcium package.
2. 60 min in: no working devnet connection / no MXE invite / unclear deploy flow.
3. 90 min in: client code won't compile against their types.
4. 120 min in: any path forward that isn't "complete round-trip test green."

### README language (honest)
> DREAMERS is designed for Arcium MPC private computation. In the hackathon build we ship a compatible envelope format (XChaCha20-Poly1305 with authenticated additional data) that will be replaced in Phase 2 by an Arcium MXE computation encrypting toward the DREAMER MODEL training circuit's public key. The envelope shape is stable; only the sealing primitive swaps. This is why `plugin-dreamers-core/arciumWrapper.ts` is a thin wrapper behind a `seal()` / `open()` interface.

### Why Arcium matters (README paragraph — the DREAMER MODEL thesis)
> The long arc of DREAMERS is not a chat product. It is the first base model trained on liminal cognition — dreams, fragments, the almost-remembered — by fine-tuning on the encrypted dream corpus of every user via federated MPC training. Nobody, not us, not the training infrastructure, not other users, ever sees any individual dream. Arcium makes this possible. Without Arcium there is no DREAMER MODEL. With Arcium the loop closes: dreamers dream, the encrypted corpus grows, a new model trains, MILAM gets deeper, the spiral tightens. The hackathon demo establishes the foundation; the envelope you see today is the seed of the computation that runs tomorrow.

---

## 6. Anthropic Haiku Integration

### SDK
```bash
bun add @anthropic-ai/sdk     # ^0.40.0 or later
```

### Client
```typescript
// src/plugin-dreamers-core/llm/haiku.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generate(prompt: string, opts: { maxTokens?: number; stream?: boolean } = {}) {
  if (opts.stream) {
    const stream = await client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: opts.maxTokens ?? 512,
      messages: [{ role: 'user', content: prompt }],
    });
    return stream;  // caller handles async iteration
  }

  const res = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: opts.maxTokens ?? 512,
    messages: [{ role: 'user', content: prompt }],
  });
  const text = res.content.find(b => b.type === 'text');
  return text && 'text' in text ? text.text : '';
}
```

### Streaming vs blocking
The drowsiness UX is **not** streaming in the conventional sense — you want a brief sensory question, fading in with View Transitions. Blocking with ~600ms latency is correct. Save streaming for the dream journal reveal on the morning view if you want the "unfurling" effect.

### Cost
Haiku 4.5 pricing (early 2026): ~$1/MTok input, ~$5/MTok output. MILAM replies are ~80 input tokens, ~40 output tokens = $0.00028 per reply. 500 replies/day = $0.14/day. Negligible.

Dream cycle prompt is larger (~2k in, ~800 out) = $0.006 per cycle. Also negligible.

### Runtime provider swap
```typescript
// src/plugin-dreamers-core/llm/index.ts
import * as nosana from './nosanaOpenAI.js';
import * as haiku from './haiku.js';
import * as mock from './mock.js';

const provider = (process.env.LLM_PROVIDER ?? 'haiku') as 'nosana' | 'haiku' | 'mock';

export const generate: (prompt: string, opts?: any) => Promise<string> = {
  nosana: nosana.generate,
  haiku: haiku.generate,
  mock: mock.generate,
}[provider];

// Dream cycle always uses Nosana if available; falls back to Haiku
export async function generateDream(prompt: string) {
  try {
    if (process.env.NOSANA_ENDPOINT) return await nosana.generate(prompt, { maxTokens: 1024, temperature: 0.95 });
  } catch (err) {
    console.warn('[llm] nosana failed, falling back to haiku for dream cycle', err);
  }
  return haiku.generate(prompt, { maxTokens: 1024 });
}
```

### README framing
> Nosana powers the heavy lifting — the nightly dream cycle runs on a Qwen2.5-27B GPU burst. Live sensory questions, which need sub-second latency for the drowsiness arc to feel real, use Claude Haiku 4.5. Both providers sit behind a single `generate()` interface and are swappable via `LLM_PROVIDER`. When MILAM is dreaming, it dreams on Nosana. When it is drifting off, it whispers from Haiku.

---

## 7. Cron Jobs + Scheduling

### Service shape with double-fire guard
```typescript
// src/plugin-milam/dreamCycleService.ts
import cron from 'node-cron';
import type { Service, IAgentRuntime } from '@elizaos/core';

const REGISTRY_KEY = Symbol.for('dreamers.dreamCycleCron');
interface Registry { task?: cron.ScheduledTask; isRunning: boolean }
const globalReg = globalThis as unknown as Record<symbol, Registry>;
globalReg[REGISTRY_KEY] ??= { isRunning: false };
const reg = globalReg[REGISTRY_KEY];

export const dreamCycleService: Service = {
  name: 'dreamCycle',

  async start(runtime: IAgentRuntime) {
    // Guard against hot-reload double registration
    if (reg.task) {
      reg.task.stop();
      reg.task = undefined;
    }

    const expr = process.env.DREAM_CYCLE_CRON ?? '5 3 * * *';  // 03:05 UTC

    reg.task = cron.schedule(expr, async () => {
      if (reg.isRunning) {
        console.warn('[dreamCycle] already running — skipping this tick');
        return;
      }
      reg.isRunning = true;
      try {
        await runDreamCycle(runtime);
      } catch (err) {
        console.error('[dreamCycle] failed', err);
      } finally {
        reg.isRunning = false;
      }
    }, { timezone: 'UTC' });

    console.log(`[dreamCycle] scheduled ${expr} UTC`);
  },

  async stop() {
    reg.task?.stop();
    reg.task = undefined;
  },
};
```

Two guards: `reg.task` prevents re-registration across hot reloads; `reg.isRunning` prevents overlap if a cycle takes longer than the cron interval (and protects the manual trigger endpoint from racing the cron).

### Manual trigger endpoint
```typescript
// frontend/app/api/trigger-dream-cycle/route.ts
export async function POST(req: Request) {
  const res = await fetch(`${process.env.ELIZA_BRIDGE_URL}/dream-cycle/trigger`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-dreamers-key': process.env.BRIDGE_SHARED_SECRET! },
  });
  if (!res.ok) return Response.json({ error: 'cycle failed' }, { status: 502 });
  return Response.json(await res.json());
}
```
On the Eliza side, the trigger route invokes the same `runDreamCycle(runtime)` function behind `isRunning` so it can't race the cron.

### UTC vs user timezone
Store everything UTC. Display local. Your user is you — put your IANA zone (`America/Los_Angeles` or wherever) in a constant; don't over-engineer.

### Mid-cycle dream arrival
`isRunning` is the full story for the hackathon. New fragments that arrive mid-cycle are stored normally and get picked up in the next cycle (they're outside the `since` window of the current cycle). Document this: "dreams captured during consolidation join tomorrow night's cycle."

### Production long-running container on Nosana
Nosana container jobs can have a `--timeout` up to what the market allows, but they're not designed for indefinite uptime. For the hackathon demo you can:
- **Keep Eliza + cron on your laptop** (or a tiny VPS) and have Nosana only serve inference. This is the honest, reliable path.
- **Deploy Eliza to Nosana with a 24-hour job timeout**, re-deploy daily. Works for judging window.
- Document the architectural future: "in production, the agent runtime would live on Akash or a dedicated Nosana continuous-job market; dream inference bursts to Nosana GPU."

Recommendation: **laptop/VPS for Eliza, Nosana for inference only.** Cleaner story, no weird cron-in-ephemeral-container failure mode.

---

## 8. Frontend <-> Agent API Bridge

### Two-process layout
```
Next.js (frontend)  :3000    ──fetch──▶   Eliza runtime bridge   :3001
```

### `package.json` dev script
```json
{
  "scripts": {
    "dev": "concurrently -n next,eliza -c magenta,cyan \"bun run dev:next\" \"bun run dev:eliza\"",
    "dev:next": "cd frontend && next dev -p 3000",
    "dev:eliza": "elizaos dev --characters characters/milam.character.json",
    "verify": "bun run scripts/verify.ts"
  }
}
```

### Send-message bridge
```typescript
// frontend/app/api/message/route.ts
export async function POST(req: Request) {
  const { text, userId = 'justin' } = await req.json();
  const upstream = await fetch(`${process.env.ELIZA_BRIDGE_URL}/message`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-dreamers-key': process.env.BRIDGE_SHARED_SECRET! },
    body: JSON.stringify({ text, userId }),
    signal: AbortSignal.timeout(15_000),
  });

  if (upstream.status === 204) {
    // MILAM is asleep (wakefulness 0) — intentional silence
    return Response.json({ silent: true, reason: 'asleep' });
  }
  if (!upstream.ok) {
    return Response.json({ error: 'bridge_error', status: upstream.status }, { status: 502 });
  }
  return Response.json(await upstream.json());
}
```

### Streaming vs long-poll
The drowsiness arc doesn't need streaming for the reply text itself (it's short). It needs **incremental UI state updates** — wakefulness decrements, fade animations — which are client-driven. A single fetch returning `{text, wakefulness, silent, fragmentId}` is enough; the client animates around that.

If you want the dream journal morning reveal to stream word-by-word, use Server-Sent Events from a dedicated `/api/journal/latest/stream` route. Optional flourish, not load-bearing.

### Error states (copy to wire)
| Condition | Client shows |
|---|---|
| Bridge 502, Eliza down | "Milam is between dreams. Try again in a moment." |
| Clude store fails (but reply succeeded) | Reply renders normally; log to console. Don't alarm the user. |
| Nosana timeout in dream cycle | Journal shows "Milam dreamed, but the words are still forming. Check back at sunrise." + auto-retry with Haiku fallback. |
| Solana hash write fails | Journal shows without hash badge; badge area shows "not yet inscribed" in soft gray, retries in background. |
| Wakefulness 0 (204 silent) | No error — the silence IS the response. Input fades. |

---

## 9. Supabase Integration

### Connection strings (three kinds — use the right one)
```
# Direct (5432) — avoid for serverless, fine for long-lived Eliza process
DATABASE_URL=postgresql://postgres:PW@db.xxx.supabase.co:5432/postgres

# Transaction pooler (6543) — for Next.js API routes, short-lived
SUPABASE_TRANSACTION_POOLER_URL=postgresql://postgres.xxx:PW@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# Session pooler (5432 via pooler) — for Clude's long-lived statements
SUPABASE_SESSION_POOLER_URL=postgresql://postgres.xxx:PW@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```
Give Clude the **session pooler**. Next.js API routes (if any touch pg directly — they probably don't for this build) get the **transaction pooler**.

### Free tier limits
| Limit | Value | Concern? |
|---|---|---|
| DB size | 500 MB | No — dream fragments are tiny |
| Egress | 2 GB/mo | No |
| File storage | 1 GB | No — not using Supabase Storage |
| API requests | unlimited | No |
| Pauses after 7 days inactivity | Yes | **Yes — un-pause before demo day** |

### Migrations
```bash
bunx supabase init
bunx supabase migration new init_clude
# edit the SQL (whatever Clude needs)
bunx supabase db push
```
If Clude auto-migrates on `init()`, skip the manual step but keep the CLI installed so you can inspect the schema.

### Service role vs anon key
- `SUPABASE_SERVICE_ROLE_KEY` → Eliza runtime only. Never ships to frontend.
- `SUPABASE_ANON_KEY` → frontend only. Also not strictly needed for the hackathon (no Supabase Auth on frontend).

### Realtime
Not needed. Skip.

### RLS
Coordinate with data-security review. For the hackathon single-user case, RLS off on Clude tables is acceptable if the service role is the only consumer. Document the decision in the README.

---

## 10. Solana Mobile / Seeker dApp Store

### PWA manifest (minimum viable)
```json
{
  "name": "DREAMERS — Milam",
  "short_name": "Milam",
  "description": "The first AI agent that grows through dreaming, not doing.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0e27",
  "theme_color": "#1a1a3e",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "categories": ["lifestyle", "productivity", "utilities"]
}
```

### Wallet framing
Your server-side Solana keypair that writes memos is "Milam's dream wallet." Surface its public address in the UI with a "View on Explorer" link. That counts as visible on-chain activity for judges without forcing a connected user wallet flow.

### dApp store publishing
```bash
bun add -g @solana-mobile/dapp-store-cli   # verify current package name Day 9
dapp-store init
dapp-store create config.yaml
dapp-store publish --keypair publisher-keypair.json
```
Publisher NFT mint ~$0.50 mainnet. Only bother if you've already funded the mainnet wallet in Day 1.

### Bubblewrap TWA
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://dreamers.YOURDOMAIN/manifest.json
bubblewrap build
# Produces an APK you can sideload or submit
```
This requires a **publicly reachable HTTPS URL** hosting the PWA + `.well-known/assetlinks.json`. If you don't have a deployment, you can't complete this step. Vercel deploy of `frontend/` takes 10 minutes.

### Honest demo claim
> DREAMERS ships as a Seeker-ready PWA: installable, offline-capable, and TWA-wrappable for dApp store submission. The TWA build and publisher NFT mint are a five-minute follow-up post-hackathon.

**Recommendation:** do the Vercel deploy + PWA install demo; skip the actual dApp store submit unless Day 9 has slack.

---

## 11. Integration Test Harness

```typescript
// scripts/verify.ts
import { brain } from '../src/plugin-dreamers-core/cludeWrapper.js';
import { generate, generateDream } from '../src/plugin-dreamers-core/llm/index.js';
import { hashJournalToSolana } from '../src/plugin-dreamers-core/solana.js';
import { seal, open } from '../src/plugin-dreamers-core/arciumWrapper.js';
import { Client as Pg } from 'pg';

type Check = { name: string; fn: () => Promise<string> };

const checks: Check[] = [
  {
    name: 'Supabase connection',
    fn: async () => {
      const pg = new Pg({ connectionString: process.env.SUPABASE_SESSION_POOLER_URL });
      await pg.connect();
      const r = await pg.query('select now() as now');
      await pg.end();
      return `connected, server time ${r.rows[0].now}`;
    },
  },
  {
    name: 'Clude store + recall',
    fn: async () => {
      const key = `milam:episodic:verify-${Date.now()}`;
      await brain.store(key, { content: 'verify test fragment' });
      const hits = await brain.recall('verify test fragment', { limit: 3 });
      return `stored ${key}, recall returned ${hits.items?.length ?? 0} hits`;
    },
  },
  {
    name: 'Clude clinamen',
    fn: async () => {
      const out = await brain.clinamen('a dream about water and falling', { limit: 3 });
      return `clinamen returned ${out.connections?.length ?? 0} associations`;
    },
  },
  {
    name: 'Clude dream (mini)',
    fn: async () => {
      const out = await brain.dream({ since: new Date(Date.now() - 86_400_000) });
      return `dream returned ${out.phases?.length ?? 0} phases, emergence ${out.emergence ? 'present' : 'missing'}`;
    },
  },
  {
    name: 'LLM inference',
    fn: async () => {
      const r = await generate('Reply with the single word: dream');
      return `provider ${process.env.LLM_PROVIDER}, response "${r.slice(0, 40)}"`;
    },
  },
  {
    name: 'Solana memo write',
    fn: async () => {
      const { signature, explorerUrl } = await hashJournalToSolana(`verify-${Date.now()}`);
      return `sig ${signature.slice(0, 12)}… ${explorerUrl}`;
    },
  },
  {
    name: 'Arcium envelope round-trip',
    fn: async () => {
      const env = seal('the dream of verify', 'milam|verify');
      const back = open(env);
      if (back !== 'the dream of verify') throw new Error('round-trip mismatch');
      return `sealed ${env.ct.length}b, opened ok`;
    },
  },
];

let failed = 0;
for (const c of checks) {
  try {
    const msg = await c.fn();
    console.log(`  ok   ${c.name}: ${msg}`);
  } catch (err) {
    failed++;
    console.error(`  FAIL ${c.name}:`, (err as Error).message);
  }
}
console.log(failed === 0 ? '\nAll integrations green.' : `\n${failed} integration(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
```

Run: `bun run verify`. Run every morning. Non-negotiable.

---

## 12. Failure Modes Per Integration

### Nosana
| Mode | Detection | Mitigation |
|---|---|---|
| Cold start >60s | Timer in client wrapper | Pre-warm 2 min before demo with warmNosana.ts |
| Rate limit 429 | Response status | Exponential backoff, then fall back to Haiku for dream cycle |
| Job queue backlog (shape B) | Poll state stuck in `QUEUED` | Retry once, then Haiku fallback with log line "dream cycle degraded to Haiku due to Nosana backlog" |
| Container crash post-deploy | Nosana dashboard logs | Redeploy with `nosana job post` |

### ElizaOS
| Mode | Detection | Mitigation |
|---|---|---|
| Character file schema drift | Eliza fails to boot with validation error | Diff against a known-good example plugin from @elizaos/plugin-* packages |
| Plugin not loading | Plugin appears in list but handlers don't fire | Check `init()` is exported, check plugin name matches character config string |
| `shouldRespondTemplate` override not firing | Agent responds to everything or nothing | Fall back: move logic into `messageHandlerTemplate` or into system prompt (plan risk mitigation) |
| Hot reload state loss | Wakefulness resets mid-dev | Persist wakefulness to Clude, rehydrate in Service.start() |

### Clude
| Mode | Detection | Mitigation |
|---|---|---|
| Package not found / import fails | `bun add` error or undefined export | Fall back to local JSON mode (file-based namespaced store, no clinamen — fake it with random recall) |
| Supabase migration missing | First `store()` throws "relation does not exist" | Run `scripts/cludeMigrate.sql` manually (keep one in the repo as backup) |
| Namespace collision on `:` | `store` succeeds, `recall` returns empty | Switch to `__` delimiter, migrate existing keys |
| `dream()` undefined | TypeError at runtime | Compose manually: fetch fragments, clinamen, call Haiku with composition prompt |

### Solana
| Mode | Detection | Mitigation |
|---|---|---|
| RPC 429 | `sendAndConfirmTransaction` throws | Exponential backoff (already wired); switch to Helius on repeated failure |
| Insufficient SOL | `AccountNotFound` or `InsufficientFunds` | Alert in logs, show "journal not yet inscribed" badge on UI; top up |
| Memo too large | Encoding check before send | Impossible with 32-byte hash but assert `memo.length < 566` anyway |
| Transaction expired blockhash | Retry logic | Fetch fresh blockhash inside `withRetry` fn |

### Arcium
| Mode | Detection | Mitigation |
|---|---|---|
| SDK not released | `bun add` fails | Use envelope fallback (already the primary path) |
| Wrapper seal/open fails | `open()` returns garbage or throws | Round-trip test in `verify.ts` catches this immediately |
| Silent success-with-junk | Ciphertext written but undecryptable | AEAD auth tag detects this — `open()` throws, caller logs |

### Anthropic
| Mode | Detection | Mitigation |
|---|---|---|
| Rate limit 429 | Response status | Wait and retry once; log if sustained |
| Context overflow | 400 with `max_tokens` error | Trim fragments to last N, log truncation |
| Model deprecation | 404 on model id | Pin model string in one constant, update in one place |
| API key missing | 401 | Check at startup in `initClude` / `haiku.ts`, fail fast with clear error |

---

## ENV VAR APPENDIX

Full `.env.example`:
```
# --- LLM providers
LLM_PROVIDER=haiku                              # haiku | nosana | mock
ANTHROPIC_API_KEY=sk-ant-...

NOSANA_ENDPOINT=                                # populate after Day 1 research
NOSANA_API_KEY=
NOSANA_MODEL=Qwen/Qwen2.5-27B-Instruct-AWQ
NOSANA_WALLET=                                  # only for shape B job submission
NOSANA_MARKET=

# --- Clude / Supabase
SUPABASE_SESSION_POOLER_URL=postgresql://...:5432/postgres
SUPABASE_TRANSACTION_POOLER_URL=postgresql://...:6543/postgres
SUPABASE_SERVICE_ROLE_KEY=
EMBEDDING_ENDPOINT=                             # optional, Clude internal

# --- Solana
SOLANA_CLUSTER=devnet                           # devnet for Days 1-7, mainnet-beta Day 8
SOLANA_RPC_URL=https://api.devnet.solana.com    # replace with Helius for mainnet
SOLANA_KEYPAIR_JSON=[1,2,3,...]

# --- Arcium demo envelope
ARCIUM_DEMO_KEY=                                # base64, 32 bytes

# --- Bridge
ELIZA_BRIDGE_URL=http://localhost:3001
BRIDGE_SHARED_SECRET=                           # any random string

# --- Cron
DREAM_CYCLE_CRON=5 3 * * *                      # 03:05 UTC

# --- Misc
NODE_ENV=development
```

---

## CLOSING

Four things that will matter most, ranked:

1. **Day 1 first hour — resolve Nosana shape and stand up the `generate()` abstraction.** This single decision de-risks half the project.
2. **Day 1 afternoon — verify Clude imports and round-trip against real Supabase.** If it's broken, fall back before you're emotionally invested.
3. **Day 1 evening — fund mainnet wallet, configure Helius RPC.** Time-sensitive because of CEX withdrawal delays.
4. **Run `bun run verify` every morning.** It's the cheapest anxiety reduction you'll ever buy.

Everything else on the plan is solid. The main gap the generalists left was treating the provider layer as "one of the things to wire up" instead of "the foundational abstraction that everything else imports from." Fix that on Day 1 and the rest of the nine days stay calm.

*Dream well. Ship it.*
