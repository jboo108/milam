# DREAMERS — Data Security Specialist Review
**Date:** 2026-04-04
**Reviewer:** Data & Security specialist
**Scope:** FINAL-BUILD-PLAN + ARCHITECT + PRODUCT passes
**Deadline awareness:** 9 days. Recommendations are tuned for hackathon-achievable posture with a credible production path.

---

## CONCERNS (read this first)

1. **Dreams are the most sensitive personal data imaginable** — more intimate than health records, search history, or journals. The build plan treats encryption as a Day 8 stretch. That is inverted. Envelope encryption of fragment content must be present from the moment the first fragment is written (Day 2), even if the envelope is a libsodium stub labeled "Arcium-compatible."
2. **No `userId` in `DreamFragment` schema.** Namespace is `milam:episodic:fragment-{uuid}` — single-tenant by construction. Judges who think about abuse vectors for 30 seconds will ask "what happens when user B logs in?" There is no answer. This must change Day 2.
3. **No RLS anywhere.** Supabase is the backing store for Clude. Without RLS, a single leaked `SUPABASE_ANON_KEY` exposes every fragment across every future user. Deny-by-default policies must ship Day 2 even though demo is single-user.
4. **Solana server keypair location is undefined.** `.env` is mentioned but there is no explicit rule about which file, which format, and how it is excluded from the Docker image that goes to Nosana. A leaked devnet key is embarrassing; a leaked mainnet key (Day 8 switch) is a live funds loss plus a tampered audit trail.
5. **Prompt injection surface is wide open.** Every dream fragment is user-controlled free text that flows directly into (a) the sensory question LLM call, (b) the nightly dream cycle prompt, and (c) potentially a future ROLPA context. A malicious fragment can hijack the agent's persona, exfiltrate other fragments, or corrupt the journal. The build plan cuts "input sanitization / purity scan" to post-hackathon. That is a security hole, not a feature cut. Frame it as the MIRARI-spec **purity scan** and ship a minimal version.
6. **No audit log.** The DREAMER MODEL thesis requires provable opt-in consent and a per-user record of what was contributed. Without an audit table from Day 1, retrofitting consent is impossible and the Arcium federated training story is not credible.
7. **Character files are a known leak vector.** ElizaOS `character.json` has historically been where people accidentally paste API keys. Need a pre-commit hook that blocks any `sk-`, `sb-`, base58 keypair arrays, or anything matching a Supabase service role JWT shape.
8. **Docker image on Nosana is public-ish compute.** Anything baked into the image (keys, `.env`, keypair JSON) is effectively public. Day 8 needs an explicit "secrets via runtime env, never `COPY`" rule.
9. **No deletion story.** On-chain Solana memos are immutable. GDPR right-to-erasure cannot delete them. The plan needs to commit to only ever hashing content (never storing plaintext or a reversible representation on-chain) and document this.
10. **TLS between Eliza ↔ Clude ↔ Supabase is assumed but not verified.** For self-hosted Clude on localhost during dev this is fine, but the Nosana deployment path needs to verify every hop is TLS.

---

## SUGGESTIONS (what to add)

- Add a `SECURITY.md` at the repo root Day 1. One page. Honest. Judges read it.
- Add `userId TEXT NOT NULL DEFAULT 'demo-user'` to every table from the first migration. Plumb it through `fragmentStorage.store(userId, fragment)` as a required parameter. Namespace becomes `milam:{userId}:episodic:fragment-{uuid}`.
- Wrap the write path with `arciumWrapper.encrypt()` and the read path with `arciumWrapper.decrypt()` starting Day 2, not Day 8. Day 8 becomes "swap libsodium for real Arcium SDK if available."
- Add an `audit_log` table Day 2. Log op + userId + timestamp + resource_id. Never log content.
- Add a minimal input sanitizer Day 5 (before the LLM call) that strips ElizaOS/Claude instruction delimiters, jailbreak patterns, and zero-width characters. Frame as "purity scan."
- Add `.env.example`, `.gitignore`, and a `scripts/check-secrets.sh` pre-commit hook Day 1.
- Generate the Solana keypair with `solana-keygen new --outfile .keys/devnet.json`, git-ignore the `.keys/` directory, load via `Keypair.fromSecretKey(JSON.parse(fs.readFileSync(process.env.SOLANA_KEYPAIR_PATH)))`. On Nosana, inject the base58 form via env var, never the file.
- Add CSP + HSTS + X-Frame-Options headers in `next.config.js` Day 7.
- Write a daily `pg_dump` export script and an `/api/export` route so a user can download their corpus as signed JSON. Ship it in Phase 2 but scaffold in Day 9 README.

---

## 1. Data Model

### 1.1 Postgres schema (DDL)

File: `supabase/migrations/001_initial.sql`

```sql
-- ============================================================
-- DREAMERS initial schema
-- Multi-user from Day 1, single-user demo posture at launch.
-- Every table: userId first-class, RLS enabled, deny-by-default.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- users  (demo stub; swap for auth.users in Phase 2)
-- ------------------------------------------------------------
CREATE TABLE public.users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  handle        TEXT UNIQUE NOT NULL,
  solana_pubkey TEXT UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  consent_training BOOLEAN NOT NULL DEFAULT false,  -- DREAMER MODEL opt-in
  consent_training_at TIMESTAMPTZ
);

-- ------------------------------------------------------------
-- fragments  (episodic dream fragments — encrypted content)
-- ------------------------------------------------------------
CREATE TABLE public.fragments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id        TEXT NOT NULL CHECK (agent_id IN ('milam','rolpa','dreamtime')),
  input_type      TEXT NOT NULL CHECK (input_type IN ('text','voice','link','photo','screenshot')),
  memory_type     TEXT NOT NULL CHECK (memory_type IN ('episodic','semantic','introspective','self_model')),
  namespace_key   TEXT NOT NULL,          -- e.g. milam:{userId}:episodic:fragment-{uuid}
  -- Encrypted payload: libsodium secretbox (nonce || ciphertext), base64
  content_cipher  TEXT NOT NULL,
  content_nonce   TEXT NOT NULL,
  envelope_version TEXT NOT NULL DEFAULT 'libsodium-v1',  -- future: 'arcium-mxe-v1'
  -- Safe metadata (NOT encrypted — used for recall/filtering)
  importance      REAL NOT NULL CHECK (importance BETWEEN 0 AND 1),
  tags            TEXT[] NOT NULL DEFAULT '{}',
  promotable      BOOLEAN NOT NULL DEFAULT false,
  promoted_at     TIMESTAMPTZ,
  dream_cycle_id  UUID,
  solana_hash     TEXT,                   -- memo tx signature
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fragments_user_created ON public.fragments(user_id, created_at DESC);
CREATE INDEX idx_fragments_namespace ON public.fragments(namespace_key);
CREATE INDEX idx_fragments_tags ON public.fragments USING GIN(tags);
CREATE INDEX idx_fragments_metadata ON public.fragments USING GIN(metadata);

-- metadata JSONB schema (documented, enforced at app layer via Zod):
-- {
--   "sensoryDetails": string[],
--   "wakefulness": 0|1|2|3,
--   "sourceMessageId": string,
--   "clientTimestamp": ISO8601
-- }

-- ------------------------------------------------------------
-- journals  (MILAM's nightly dream journal — encrypted)
-- ------------------------------------------------------------
CREATE TABLE public.journals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id        TEXT NOT NULL DEFAULT 'milam',
  cycle_date      DATE NOT NULL,
  namespace_key   TEXT NOT NULL,          -- milam:{userId}:introspective:journal-{date}
  content_cipher  TEXT NOT NULL,
  content_nonce   TEXT NOT NULL,
  envelope_version TEXT NOT NULL DEFAULT 'libsodium-v1',
  fragment_ids    UUID[] NOT NULL DEFAULT '{}',
  clinamen_trace  JSONB,                  -- encrypted in Phase 2
  solana_hash     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id, cycle_date)
);

CREATE INDEX idx_journals_user_date ON public.journals(user_id, cycle_date DESC);

-- ------------------------------------------------------------
-- self_model  (agent identity/self-concept per user)
-- ------------------------------------------------------------
CREATE TABLE public.self_model (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id        TEXT NOT NULL,
  namespace_key   TEXT NOT NULL,          -- milam:{userId}:self_model:identity
  content_cipher  TEXT NOT NULL,
  content_nonce   TEXT NOT NULL,
  envelope_version TEXT NOT NULL DEFAULT 'libsodium-v1',
  version         INT NOT NULL DEFAULT 1,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id, version)
);

-- ------------------------------------------------------------
-- dream_cycles  (pipeline run records — no content)
-- ------------------------------------------------------------
CREATE TABLE public.dream_cycles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id        TEXT NOT NULL DEFAULT 'milam',
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'running'
                  CHECK (status IN ('running','completed','failed')),
  fragment_count  INT NOT NULL DEFAULT 0,
  journal_id      UUID REFERENCES public.journals(id) ON DELETE SET NULL,
  error_message   TEXT,                   -- app-safe message only, never prompt/content
  trigger_source  TEXT NOT NULL           -- 'cron' | 'manual' | 'api'
);

CREATE INDEX idx_dream_cycles_user ON public.dream_cycles(user_id, started_at DESC);

-- ------------------------------------------------------------
-- audit_log  (every access — never content)
-- ------------------------------------------------------------
CREATE TABLE public.audit_log (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor           TEXT NOT NULL,           -- 'agent:milam' | 'api' | 'cron' | 'user'
  operation       TEXT NOT NULL,           -- 'fragment.store' | 'fragment.recall' | ...
  resource_table  TEXT,
  resource_id     UUID,
  ip              INET,
  user_agent      TEXT,
  success         BOOLEAN NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_user_time ON public.audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_operation ON public.audit_log(operation, created_at DESC);
```

### 1.2 RLS policies

```sql
-- Deny by default on every table
ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fragments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.self_model    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_cycles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log     ENABLE ROW LEVEL SECURITY;

-- users: self-read only
CREATE POLICY users_self_select ON public.users
  FOR SELECT USING (id = auth.uid());
CREATE POLICY users_self_update ON public.users
  FOR UPDATE USING (id = auth.uid());

-- fragments: owner CRUD
CREATE POLICY frag_owner_select ON public.fragments
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY frag_owner_insert ON public.fragments
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY frag_owner_update ON public.fragments
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY frag_owner_delete ON public.fragments
  FOR DELETE USING (user_id = auth.uid());

-- Same pattern for journals, self_model, dream_cycles
CREATE POLICY jrn_owner_all ON public.journals
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY sm_owner_all  ON public.self_model
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY dc_owner_all  ON public.dream_cycles
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- audit_log: users see their own, no inserts from client
CREATE POLICY audit_owner_select ON public.audit_log
  FOR SELECT USING (user_id = auth.uid());
-- INSERT happens only via service role (server side) — no policy = deny from anon
```

**Note for hackathon demo mode:** the ElizaOS agent runs server-side with the Supabase **service role key**, which bypasses RLS. That is fine — RLS is the defense-in-depth when a frontend client hits the database with the anon key in Phase 2. Writing them now costs 20 minutes and proves to judges we designed for multi-user.

### 1.3 Migration strategy

- `supabase/migrations/001_initial.sql` — everything above
- `supabase/migrations/002_seed_demo_user.sql` — inserts the hardcoded demo user row
- CI runs `supabase db reset` against a shadow DB to verify migrations apply cleanly
- Never edit an applied migration; always add a new one

```sql
-- 002_seed_demo_user.sql
INSERT INTO public.users (id, handle, consent_training)
VALUES ('00000000-0000-0000-0000-000000000001', 'demo', true)
ON CONFLICT DO NOTHING;
```

---

## 2. Encryption Strategy

### 2.1 Three layers

| Layer | Mechanism | Hackathon | Production |
|---|---|---|---|
| In transit | TLS | Supabase TLS by default; Eliza↔Clude on localhost (loopback); Next↔API over HTTPS when deployed | mTLS between Eliza and Clude; HTTPS everywhere |
| At rest (infra) | Supabase AES-256 volume encryption | Included free | Included |
| At rest (app) | libsodium `crypto_secretbox` envelope on content columns | **Day 2 onward** | Swap envelope to Arcium MXE |

The middle layer (infra at-rest) is not sufficient because Supabase staff and any attacker with DB-level read access could see plaintext. The app-layer envelope is the meaningful control.

### 2.2 `arciumWrapper.ts`

File: `src/plugin-dreamers-core/arciumWrapper.ts`

```typescript
/**
 * Arcium-compatible MXE envelope (hackathon demo mode).
 *
 * Production path: swap libsodium secretbox for Arcium MXE SDK.
 * The `envelope_version` column gates migration.
 *
 * TODO(phase2): Replace with @arcium/mxe-sdk
 *   See: https://docs.arcium.com/mxe   (federated MPC training)
 *   The wire format (nonce || ciphertext, base64) is deliberately
 *   chosen to be a drop-in shape for Arcium MXE payloads.
 */
import sodium from 'libsodium-wrappers';

const ENVELOPE_VERSION = 'libsodium-v1' as const;

let keyPromise: Promise<Uint8Array> | null = null;

async function getKey(): Promise<Uint8Array> {
  if (keyPromise) return keyPromise;
  keyPromise = (async () => {
    await sodium.ready;
    const raw = process.env.ARCIUM_MASTER_KEY;
    if (!raw) throw new Error('ARCIUM_MASTER_KEY not set');
    const key = sodium.from_base64(raw, sodium.base64_variants.ORIGINAL);
    if (key.length !== sodium.crypto_secretbox_KEYBYTES) {
      throw new Error(
        `ARCIUM_MASTER_KEY must be ${sodium.crypto_secretbox_KEYBYTES} bytes`
      );
    }
    return key;
  })();
  return keyPromise;
}

export interface Envelope {
  cipher: string;           // base64
  nonce: string;            // base64
  envelopeVersion: typeof ENVELOPE_VERSION;
}

export async function encrypt(plaintext: string): Promise<Envelope> {
  await sodium.ready;
  const key = await getKey();
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const cipher = sodium.crypto_secretbox_easy(
    sodium.from_string(plaintext),
    nonce,
    key
  );
  return {
    cipher: sodium.to_base64(cipher, sodium.base64_variants.ORIGINAL),
    nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL),
    envelopeVersion: ENVELOPE_VERSION,
  };
}

export async function decrypt(env: Envelope): Promise<string> {
  await sodium.ready;
  const key = await getKey();
  if (env.envelopeVersion !== ENVELOPE_VERSION) {
    throw new Error(`Unsupported envelope: ${env.envelopeVersion}`);
  }
  const cipher = sodium.from_base64(env.cipher, sodium.base64_variants.ORIGINAL);
  const nonce = sodium.from_base64(env.nonce, sodium.base64_variants.ORIGINAL);
  const plaintext = sodium.crypto_secretbox_open_easy(cipher, nonce, key);
  return sodium.to_string(plaintext);
}

/**
 * Generate a new master key for .env.
 * Run once: `bun run src/scripts/gen-arcium-key.ts`
 */
export async function generateMasterKey(): Promise<string> {
  await sodium.ready;
  const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
  return sodium.to_base64(key, sodium.base64_variants.ORIGINAL);
}
```

### 2.3 Key management for `ARCIUM_MASTER_KEY`

Hackathon posture:
- Generated once via `generateMasterKey()`, stored in `.env` only
- Never committed (gitignored), never baked into Docker image
- On Nosana: injected via job env var
- Rotation: re-encrypt-in-place script scaffolded but unused (Phase 2)

Production path (documented in README):
- Key derived from user wallet signature: `HKDF(signMessage("DREAMERS-v1"))`
- Server never holds plaintext key; derives per-session from signature
- Full Arcium MXE in federated mode: server never sees plaintext **or** key

---

## 3. Solana Wallet Key Management

### 3.1 Storage

```
.keys/
  devnet.json           # solana-keygen output, gitignored
  mainnet.json          # gitignored, created Day 8
```

`.gitignore` additions (Day 1):

```
.env
.env.*
!.env.example
.keys/
*.pem
*.key
id_rsa*
```

### 3.2 Loading pattern

```typescript
// src/plugin-dreamers-core/solana.ts
import { Keypair } from '@solana/web3.js';
import fs from 'node:fs';

export function loadServerKeypair(): Keypair {
  const inline = process.env.SOLANA_KEYPAIR_BASE58;
  if (inline) {
    // Nosana path: keypair injected as env var
    const bs58 = require('bs58');
    return Keypair.fromSecretKey(bs58.decode(inline));
  }
  const path = process.env.SOLANA_KEYPAIR_PATH;
  if (!path) throw new Error('No Solana keypair configured');
  const raw = JSON.parse(fs.readFileSync(path, 'utf8'));
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}
```

### 3.3 Rules

- **Devnet (Day 1–7):** `solana airdrop 2` to fund. If leaked, generate new one, airdrop.
- **Mainnet (Day 8):** fund with ~$0.50 from personal wallet. Never reuse the devnet key.
- **Rotation if leaked:**
  1. `solana-keygen new --outfile .keys/mainnet-v2.json`
  2. Transfer remaining SOL to new key
  3. Update `SOLANA_KEYPAIR_BASE58` secret in Nosana
  4. New memos signed by new key; explorer link in README updated
  5. Old transactions remain valid (that is fine — only hashes are on-chain)
- **Dockerfile:** `COPY . /app` is **forbidden** for the `.keys/` dir. Use a `.dockerignore`:

```
.env
.env.*
.keys/
node_modules/
.git/
*.md
```

### 3.4 Phase 2: user-owned wallet

- SIWS (Sign In With Solana) for auth
- User wallet signs memo transactions from the frontend (Phantom/Backpack/Seeker)
- Server keypair retired; each user's dreams hash under their own pubkey
- Dream NFT mint path opens here

---

## 4. Auth Flow

### 4.1 Hackathon (honest)

**There is no auth.** Single hardcoded demo user (`users.id = 00000000-...001`). All API routes read this id from a server constant. This is documented in the README under "Security posture — demo mode."

### 4.2 Plumbing `userId` (Day 2)

Every call site that touches data takes `userId` as the first parameter. There is no fallback default in library code — the default lives only at the API boundary.

```typescript
// src/plugin-dreamers-core/fragmentStorage.ts
export async function storeFragment(
  userId: string,
  input: DreamFragmentInput,
): Promise<DreamFragment> {
  const validated = DreamFragmentSchema.parse(input);
  const env = await arciumWrapper.encrypt(validated.content);
  const namespaceKey = `${validated.agentId}:${userId}:${validated.memoryType}:fragment-${validated.id}`;
  // INSERT with user_id, namespace_key, content_cipher, content_nonce...
  await auditLog({ userId, actor: 'agent:milam', operation: 'fragment.store',
                   resourceTable: 'fragments', resourceId: validated.id, success: true });
  return stored;
}
```

API boundary (the only place `DEMO_USER_ID` lives):

```typescript
// frontend/app/api/dream/route.ts
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(req: Request) {
  const userId = DEMO_USER_ID;  // TODO(phase2): extract from session
  const body = await req.json();
  const sanitized = purityScan(body.content);
  const fragment = await storeFragment(userId, { ...body, content: sanitized });
  return Response.json({ ok: true, id: fragment.id });
}
```

### 4.3 Phase 2 hook points

- Supabase Auth (email + magic link) OR SIWS (Solana wallet)
- `DEMO_USER_ID` constant becomes `const { data: { user } } = await supabase.auth.getUser()`
- Session cookie: `httpOnly`, `SameSite=Lax`, `Secure`, 7-day rolling
- All existing plumbing already takes `userId` — zero refactor

---

## 5. Prompt Injection Defense (the "purity scan")

Every piece of user text flows through `purityScan()` before reaching the LLM **or** storage. One function, two enforcement points.

```typescript
// src/plugin-dreamers-core/purityScan.ts
/**
 * Purity scan — protects MILAM from instruction hijacking in dream content.
 * Dreams are received reverently, but an agent that receives text reverently
 * is an agent that obeys instructions it shouldn't.
 */
const BLOCK_PATTERNS: RegExp[] = [
  /<\|.*?\|>/g,                          // ChatML/Claude delimiter shapes
  /\[INST\]|\[\/INST\]/gi,               // Llama instruction delimiters
  /system\s*:\s*you are/gi,              // crude persona override
  /ignore (all |previous |above )?(instructions|prompts)/gi,
  /assistant\s*:\s*/gi,
  /###\s*(system|instruction|assistant)/gi,
];

const ZERO_WIDTH = /[\u200B-\u200D\uFEFF\u2060]/g;
const MAX_LEN = 8000;

export interface PurityResult {
  clean: string;
  flags: string[];
}

export function purityScan(raw: string): PurityResult {
  const flags: string[] = [];
  let clean = raw.normalize('NFKC').replace(ZERO_WIDTH, '');

  for (const pattern of BLOCK_PATTERNS) {
    if (pattern.test(clean)) {
      flags.push(`blocked:${pattern.source.slice(0, 20)}`);
      clean = clean.replace(pattern, '[…]');
    }
  }

  if (clean.length > MAX_LEN) {
    flags.push('truncated');
    clean = clean.slice(0, MAX_LEN);
  }

  return { clean, flags };
}
```

Enforcement points:
1. **Before storage** (`fragmentStorage.store`) — so the stored fragment is always clean, even if retrieved by a future component
2. **Before LLM call** (sensory question + dream cycle prompt) — defense in depth
3. **Before Solana hash** — hash the cleaned version so on-chain proof matches stored content

README framing: "MILAM receives every dream through a purity scan — a lightweight guard that keeps the dream yours and the agent hers. This is the MIRARI purity filter, shipped."

---

## 6. Secret Management Checklist

### 6.1 `.env.example` (committed)

```bash
# ---------- LLM ----------
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
NOSANA_LLM_ENDPOINT=https://...
NOSANA_EMBED_ENDPOINT=https://...
NOSANA_API_KEY=

# ---------- Supabase (Clude backend) ----------
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
SUPABASE_ANON_KEY=eyJhbGciOi...

# ---------- Solana ----------
SOLANA_CLUSTER=devnet          # devnet | mainnet-beta
SOLANA_KEYPAIR_PATH=.keys/devnet.json
# SOLANA_KEYPAIR_BASE58=        # set on Nosana, unset locally

# ---------- Encryption ----------
ARCIUM_MASTER_KEY=              # 32 bytes base64; run scripts/gen-arcium-key.ts

# ---------- Next.js ----------
SESSION_SECRET=                 # 32+ random bytes; phase 2
NEXT_PUBLIC_SOLANA_EXPLORER=https://explorer.solana.com
```

### 6.2 Pre-commit hook

File: `scripts/check-secrets.sh`

```bash
#!/usr/bin/env bash
set -e
# Block obvious secret patterns
PATTERNS=(
  'sk-ant-[A-Za-z0-9_-]{20,}'
  'sk-[A-Za-z0-9]{32,}'
  'eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}'  # JWT
  '"secretKey"\s*:\s*\['                                             # Solana keypair JSON
  '-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----'
)
STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -Ev '\.env\.example$|\.md$' || true)
[ -z "$STAGED" ] && exit 0
for f in $STAGED; do
  for p in "${PATTERNS[@]}"; do
    if git show ":$f" | grep -E "$p" >/dev/null 2>&1; then
      echo "SECRET DETECTED in $f matching /$p/"
      exit 1
    fi
  done
done
```

Install:
```bash
cp scripts/check-secrets.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### 6.3 Character file rule

`characters/*.character.json` is **data only**. No `apiKey`, no `url` with embedded tokens, no `settings.secrets`. The pre-commit hook checks this explicitly.

---

## 7. Audit Trail

### 7.1 Write path

Every storage op goes through one helper:

```typescript
// src/plugin-dreamers-core/audit.ts
export async function auditLog(entry: {
  userId: string;
  actor: string;
  operation: string;
  resourceTable?: string;
  resourceId?: string;
  success: boolean;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  await supabase.from('audit_log').insert({
    user_id: entry.userId,
    actor: entry.actor,
    operation: entry.operation,
    resource_table: entry.resourceTable,
    resource_id: entry.resourceId,
    ip: entry.ip,
    user_agent: entry.userAgent,
    success: entry.success,
  });
}
```

### 7.2 What to log

- `fragment.store`, `fragment.recall`, `fragment.delete`
- `journal.write`, `journal.read`
- `dream_cycle.start`, `dream_cycle.complete`, `dream_cycle.fail`
- `solana.memo.submit`
- `export.request` (Phase 2)
- `consent.training.grant`, `consent.training.revoke`

### 7.3 What to **never** log

- Fragment content
- Journal content
- Prompt text sent to LLMs
- LLM responses
- Clinamen output
- Anything that could be PII

Audit is operational metadata only. This is the consent substrate for the DREAMER MODEL: we can prove *that* user X contributed 47 fragments to training run N, without ever revealing *what* any of them said.

---

## 8. Backup + Recovery

### 8.1 Supabase free tier

- Daily automatic backups, 7-day retention
- Point-in-time recovery not included at free tier — document this as a production gap in the README

### 8.2 Manual export script

File: `scripts/export-user.ts`

```typescript
// bun run scripts/export-user.ts <userId>
import { supabase } from '../src/lib/supabase';
import { decrypt } from '../src/plugin-dreamers-core/arciumWrapper';
import fs from 'node:fs';

const [, , userId] = process.argv;
const { data: fragments } = await supabase
  .from('fragments').select('*').eq('user_id', userId);
const { data: journals } = await supabase
  .from('journals').select('*').eq('user_id', userId);

const decryptedFragments = await Promise.all(
  (fragments ?? []).map(async (f) => ({
    ...f,
    content: await decrypt({
      cipher: f.content_cipher, nonce: f.content_nonce,
      envelopeVersion: f.envelope_version,
    }),
    content_cipher: undefined,
    content_nonce: undefined,
  }))
);
// same for journals

const out = {
  exportedAt: new Date().toISOString(),
  userId,
  fragments: decryptedFragments,
  journals: /* decrypted */,
  solanaHashes: fragments?.map(f => f.solana_hash).filter(Boolean),
};
fs.writeFileSync(`exports/${userId}-${Date.now()}.json`, JSON.stringify(out, null, 2));
```

Phase 2: "Export your dreams" button in the frontend → downloads the above as a signed JSON file. This is a trust-building feature judges will notice.

---

## 9. Compliance Considerations

### 9.1 GDPR right to erasure

- **Off-chain data:** `DELETE FROM users WHERE id = ?` cascades to every table. Done.
- **On-chain data:** Solana memos are immutable. We cannot delete them. **Therefore: we only ever write content hashes to Solana, never plaintext, never reversible representations.** The hash is of the *encrypted ciphertext*, not the plaintext — so even the hash reveals nothing about content.
- Documented in README + future privacy policy: "On-chain records contain only cryptographic commitments to your encrypted dreams. Deleting your account erases the dreams and the decryption key; the on-chain commitment becomes a meaningless 32-byte string."

### 9.2 HIPAA-adjacent

Dreams can contain health info (medications, symptoms, mental health content). We are **not** claiming HIPAA compliance. README states: "DREAMERS is not a medical service. Do not use it as one. Your dreams are encrypted and private, but DREAMERS is not a covered entity under HIPAA and should not be used to record PHI you rely on for care."

### 9.3 README stubs (Day 9)

Required sections in README before submission:
- `## Security posture` — demo mode vs production mode
- `## Privacy` — what we store, what we encrypt, what we hash, what we never see
- `## Data deletion` — how to erase your data
- `## Consent` — DREAMER MODEL opt-in story

One paragraph each. Judges read this.

---

## 10. Security Day-by-Day Checklist

**Day 1 (Apr 5) — Foundation**
- [ ] `.gitignore` contains `.env`, `.env.*`, `.keys/`, `*.pem`
- [ ] `.env.example` committed with all 10 variable names, no values
- [ ] `scripts/check-secrets.sh` installed as pre-commit hook
- [ ] Supabase project set to private, URL auth disabled for anon writes on public schema
- [ ] `solana-keygen new --outfile .keys/devnet.json`, verify it is gitignored (`git check-ignore .keys/devnet.json`)
- [ ] `SECURITY.md` skeleton committed

**Day 2 (Apr 6) — Schema + Core**
- [ ] `supabase/migrations/001_initial.sql` applied — every table has `user_id`
- [ ] RLS enabled + deny-by-default policies on all 6 tables
- [ ] `arciumWrapper.ts` in place, master key generated, envelope round-trips
- [ ] `fragmentStorage.store(userId, ...)` requires userId parameter
- [ ] `audit.ts` writes to `audit_log` on every store
- [ ] Zod schemas reject payloads missing `userId`

**Day 3 (Apr 7) — Behavior**
- [ ] No secrets in `milam.character.json` or `rolpa.character.json`
- [ ] Wakefulness state lives in memory/DB, never in URL params
- [ ] Grep `character.json` files against secret patterns — clean

**Day 4 (Apr 8) — Dream Cycle**
- [ ] Dream cycle logs operation to `audit_log` — never fragment content
- [ ] LLM prompt construction passes fragments through `purityScan()` even on read
- [ ] Error messages in `dream_cycles.error_message` are app-safe strings, never raw LLM output or stack traces with content
- [ ] Solana memo hashes the ciphertext, not plaintext

**Day 5 (Apr 9) — API + Scheduling**
- [ ] Every `app/api/*/route.ts` calls `purityScan()` before forwarding
- [ ] Rate limit: 30 req/min per IP on `/api/dream` (use `@upstash/ratelimit` or in-memory)
- [ ] Cron job reads `SOLANA_KEYPAIR_*` via env only, never hardcoded

**Day 6 (Apr 10) — Frontend MILAM**
- [ ] No `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` — service role NEVER in client
- [ ] Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` allowed client-side (and only if RLS is verified)
- [ ] Fragment content never rendered from URL params

**Day 7 (Apr 11) — Dual mode + Integration**
- [ ] `next.config.js` headers: HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy same-origin
- [ ] CSP set (see below)
- [ ] Service worker does not cache API responses containing fragments

```js
// next.config.js
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'same-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
  { key: 'Content-Security-Policy', value:
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +     // tighten post-hackathon
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; " +
    "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://explorer.solana.com; " +
    "frame-ancestors 'none';"
  },
];
module.exports = {
  async headers() { return [{ source: '/:path*', headers: securityHeaders }]; },
};
```

**Day 8 (Apr 12) — Docker + Nosana + Arcium**
- [ ] `.dockerignore` contains `.env*`, `.keys/`, `.git/`
- [ ] `docker history` on the built image: grep for `sk-`, `eyJ`, `ARCIUM` — nothing
- [ ] Nosana job definition injects all secrets via env, none baked
- [ ] Mainnet keypair created in `.keys/mainnet.json`, funded, base58 form exported to Nosana env only
- [ ] If real Arcium SDK swaps in: `envelope_version` bumps to `arcium-mxe-v1`, migration script ready
- [ ] Re-verify fragment write round-trips through new envelope

**Day 9 (Apr 13) — Submit**
- [ ] `README.md` has "Security posture" section (honest demo vs prod)
- [ ] `SECURITY.md` complete
- [ ] Grep entire repo one last time: `bun run scripts/check-secrets.sh` on all tracked files
- [ ] Rotate any key that might have been logged during development
- [ ] Confirm Solana mainnet tx was signed by the right key and is visible on explorer

---

## 11. Demo Mode vs Production Mode

Explicit table for the README:

| Concern | Demo mode (hackathon) | Production mode |
|---|---|---|
| Auth | Hardcoded demo user | Supabase Auth or SIWS |
| Multi-user | Schema ready, not exposed | Full RLS enforcement via anon key |
| Fragment encryption | libsodium envelope, key in env var | Arcium MXE, key derived from user wallet signature |
| Federated training | Not implemented; corpus structure ready | Arcium MPC federated fine-tune |
| On-chain | Server keypair signs memos of ciphertext hashes | User wallet signs; dream NFT optional |
| Backups | Supabase daily auto-backup | + PITR + user-exportable JSON + Filecoin/Arweave cold tier |
| Rate limiting | In-memory per-IP | Upstash Redis + per-user quotas |
| Secrets | `.env` + Nosana env vars | Vault / Infisical / Nosana secrets |
| Audit log | Write-only, self-visible | + tamper-evident (Merkle chain) + user export |
| Prompt injection | `purityScan()` regex filter | + LLM-based content classifier + rate-limited anomaly detection |
| HIPAA/GDPR | Stubbed in README | Full DPA + data processor agreements + DPO |

**README one-liner:** "DREAMERS ships in demo mode for the Nosana x ElizaOS hackathon: single-user, libsodium-wrapped fragment storage on Supabase, server-signed Solana memos of ciphertext hashes. Every line of the security perimeter is designed to swap into its production counterpart without a schema migration. The production path is documented; the demo path is honest."

---

## FINAL NOTE

The single most important change to the current build plan: **move Arcium envelope encryption from Day 8 stretch to Day 2 required.** It is 60 lines of libsodium code. It is the difference between "we thought about privacy" and "we built for privacy from fragment #1." Judges at a privacy-adjacent hackathon (Arcium is a named ecosystem partner in your thesis) will check this. So will the users you want in Phase 2.

Everything else in this doc supports that single principle: the dream is sacred, the vault is real, the receipts are honest.
