# DREAMERS — Architect Detail Pass (Companion to Final Build Plan)
**Date:** April 5, 2026
**Companion to:** `2026-04-05-DREAMERS-FINAL-BUILD-PLAN.md`
**Purpose:** Step through the 9-day build literally. Surface every dependency, account, hosting decision, trap, and verification step a smart developer will hit.

---

## CONCERNS & OPEN QUESTIONS (decide before Day 1)

1. **Arcium SDK reality check.** Arcium's "Arxis" / MPC SDK has historically been invite-gated on devnet (MXE testnet). Before Day 1, confirm: is there a public TypeScript/Rust SDK we can import today, or is it gated? If gated, the Day 8 "demo-mode Arcium wrapper" must be explicitly simulated (envelope-encrypt with libsodium, label it "Arcium-compatible MXE envelope"). Do not claim live Arcium compute unless a job actually lands on their network.
   - **Decision needed:** Is "Arcium-compatible encrypted envelope with documented MXE migration path" acceptable framing for the judges, or must we stand up a real MXE node?

2. **Clude + Arcium overlap.** The plan assumes Clude *might* already wrap Arcium. If it doesn't, are we willing to fork Clude to add the wrapper, or do we wrap at the `fragmentStorage.ts` layer above Clude? Recommend the latter — do not fork upstream.

3. **Nosana endpoint access model.** Nosana's hackathon Qwen3.5 endpoint: is it an OpenAI-compatible base URL + token, or a job-submission model where every inference spawns a job? This drastically changes the MILAM reply latency (sub-second vs 30+ seconds). **Must confirm Day 1 morning.** If it's job-based, MILAM's live replies need a fallback inference path (local Ollama, or Anthropic Haiku) and Nosana is used only for the nightly dream cycle burst.

4. **Seeker dApp Store.** The Solana dApp Store requires a native Android APK signed by a registered publisher. A PWA alone does NOT qualify. Claim must be softened to: "PWA installable on Seeker today; native APK wrapper (Bubblewrap/TWA) in preparation for dApp Store submission." Do not claim "coming to Seeker soon" without a TWA build in the repo.

5. **ElizaOS v2 stability.** v2 was still shifting in early 2026. Pin the exact commit of `nosana-ci/agent-challenge` we fork. Do not `bun update` mid-build.

6. **Supabase vs Clude's own DB.** Clude self-hosted may bring its own Postgres requirement. Verify on Day 1 whether Clude expects a Supabase-style Postgres URL or a bundled SQLite. This changes the signup list.

7. **Next.js inside the ElizaOS repo.** The agent-challenge template is an ElizaOS runtime, not a Next.js app. Colocating `frontend/` inside the same repo is fine, but the Dockerfile for Nosana must only build the agent runtime, not the Next.js app. Two separate deployment targets.

8. **Demo video screen recording.** Phone-frame recording of a PWA is notoriously hard to make look premium. Pre-decide: scrcpy from Android, iOS QuickTime mirror, or desktop browser at mobile viewport. Do not leave this for Day 9.

9. **Mainnet switch on Day 8.** Mainnet memo hashing is trivial but requires real SOL. Fund the wallet Day 1 to avoid a Day 8 KYC/exchange scramble.

10. **Domain / deploy URL.** If we use Vercel, decide the subdomain now (`dreamers.vercel.app` vs custom). Judges will click the link — it should not be a random hash URL.

---

## SUGGESTIONS TO IMPROVE THE PLAN

1. **Split the repo into two packages from Day 1.** `apps/agent` (ElizaOS runtime, Dockerized for Nosana) and `apps/web` (Next.js, Vercel). Use a pnpm/bun workspace. This avoids a Day 5 scramble when Next.js collides with the agent's tsconfig and Docker context.

2. **Move frontend scaffold from Day 5 to Day 1 evening.** Thirty minutes of `create-next-app` + Tailwind + tokens.css on Day 1 buys you parallelism the rest of the week. Frontend design is the hard requirement; don't stack it all at the end.

3. **Introduce a "Haiku fallback" for MILAM live replies.** Anthropic Haiku is cheap, fast, and deterministic. If Nosana inference is job-based or flaky, MILAM's live sensory questions should hit Haiku; Nosana Qwen3.5 handles only the nightly dream cycle (the real GPU burst, where judges care). This also mirrors your existing Clude architecture.

4. **Record a 30-second "silence demo" on Day 3.** The moment the drowsiness arc works, record it. Phone camera, one take. This is your insurance policy — if Day 9 burns down, you still have a clip.

5. **Pre-commit the demo dream inputs.** Have 5-7 real dream paragraphs written in a `demo/scripts.md` file by Day 4. Don't improvise on camera Day 9.

6. **Add a `scripts/verify.ts` harness.** One command that: stores a fragment, recalls it, runs clinamen, triggers a mini dream cycle, hashes to Solana devnet, prints every result. Run it daily. Catches regressions instantly.

7. **Drop `shadcn/ui`.** It conflicts with a truly custom aesthetic. You want this to look like nothing else in the hackathon. Use Tailwind + Framer Motion + hand-built components. shadcn is for shipping SaaS dashboards.

8. **Use `next-pwa` or a hand-rolled service worker, not both.** Decide Day 5.

9. **Day 7 is the real checkpoint, not Day 3.** By Day 3 you still have 6 days. By Day 7 you have 2. Add a hard "freeze features" gate at end of Day 7 — only bugs, polish, demo prep after that.

10. **Cache the Nosana Qwen3.5 dream cycle output.** For the demo video, you cannot afford a flaky live inference. Run the cycle the morning of Day 9, cache the journal locally, and serve it deterministically during recording. Note in README that cached output is for demo; live pipeline is in `dreamCycleService.ts`.

---

## GLOBAL: ACCOUNTS & API KEYS (exhaustive)

| Service | Needed by | Signup URL | Notes |
|---|---|---|---|
| GitHub | Day 1 | github.com | Fork `nosana-ci/agent-challenge`. Private repo OK until submission. |
| Nosana | Day 1 | nosana.com / docs.nosana.io | Hackathon endpoint access — check Discord #hackathon channel for the Qwen3.5 base URL + token. Separate account for job deployment Day 8 (NOS tokens — request from hackathon organizers). |
| Supabase | Day 1 | supabase.com | Free tier. One project for Clude. Note: 500MB DB, 2GB bandwidth — plenty for demo. Save `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`. |
| Anthropic | Day 1 (fallback) / Day 2 (Clude Haiku) | console.anthropic.com | Clude uses Haiku for metadata/clinamen. ~$5 credit is plenty. |
| Solana devnet wallet | Day 1 | — | `solana-keygen new`. Airdrop: `solana airdrop 2 --url devnet`. Save keypair JSON. |
| Solana mainnet funding | Day 8 | any exchange / bridge | ~0.01 SOL (~$1.50 at expected price) covers hundreds of memo txs. Fund Day 1 to avoid Day 8 scramble. |
| Docker Hub | Day 8 | hub.docker.com | For pushing the agent image Nosana will pull. Free tier fine. |
| Vercel | Day 5 | vercel.com | Free hobby tier. Connect GitHub repo. Auto-deploy `apps/web`. |
| Arcium (if gated) | Day 1 research, Day 8 build | arcium.com | Check if devnet MXE is public. If invite-only, request access Day 1 — do not wait until Day 8. |
| Solana Mobile dApp Publisher | Day 9 (optional) | docs.solanamobile.com/dapp-publishing | Requires 0.001 SOL publisher registration tx. Only needed if we genuinely intend to submit. For hackathon, acceptable to have the publisher keypair generated + one submission PR prepared but not yet submitted. |
| X / Twitter | Day 9 | — | For the submission announcement post. |

---

## GLOBAL: HOSTING DECISIONS

| Piece | Where it runs | Why |
|---|---|---|
| ElizaOS agent runtime (MILAM) | **Local Day 1–7, Nosana Day 8+** | Develop fast locally. Nosana is the deployment target, not the dev loop. |
| Next.js frontend | **Vercel** (with local `bun dev` during build) | Free, fast, handles PWA + View Transitions well. Seeker device reads via HTTPS. |
| Clude backend | **Local self-hosted + Supabase Postgres** | Self-hosted Clude process inside the agent runtime container. Supabase provides the Postgres. Decentralization-friendly exit path: any Postgres works. |
| Vector store | **Supabase pgvector** (via Clude) | Same Postgres. One service, one bill. |
| Nightly dream cycle inference | **Nosana Qwen3.5 endpoint** | This is the GPU burst judges care about. |
| Live MILAM sensory reply inference | **Anthropic Haiku** (recommended fallback) OR Nosana if sub-second | Latency-critical path. Don't gamble on Nosana for live UX. |
| Solana memo writes | **Devnet during dev, mainnet-beta Day 8+** | Mainnet is the "real hash" judges click. |
| Arcium MPC (demo mode) | **Local envelope encryption, documented as MXE-compatible** | Unless Arcium devnet is unblocked and trivial. |
| PWA service worker | **Vercel-served** | Seeker installs the PWA from HTTPS URL. |

---

## GLOBAL: MCP SERVER RECOMMENDATIONS

Already have: `compound-engineering:context7` — use this aggressively. It should be your first move for every library question. Per its system instructions, prefer it over web search for all library docs.

**Additional MCPs worth installing:**

1. **`@modelcontextprotocol/server-filesystem`** — scoped to `~/dreamers`. Gives Claude Code structured read/write without constantly re-reading. High value for frontend component iteration.
2. **`@modelcontextprotocol/server-github`** — issue + PR + commit browsing. Useful for inspecting `nosana-ci/agent-challenge` history and any ElizaOS plugin examples.
3. **`@modelcontextprotocol/server-postgres`** — point at Supabase. Lets Claude query the Clude DB directly for verification ("is fragment X stored?"). Huge time saver Days 2–4.
4. **`puppeteer` or `playwright` MCP** — lets Claude visually verify the frontend. Critical Days 6–7 when judging is aesthetic.
5. **`context7`** — use for: Next.js 15, React 19 View Transitions, ElizaOS v2, `@solana/web3.js`, Framer Motion, Tailwind 4, Zod, node-cron, `@supabase/supabase-js`, Bubblewrap TWA, Arcium (if docs exist). This is your documentation hotline.

**Unlikely to exist as MCPs** (verify, fall back to context7 or web): ElizaOS-specific, Clude-specific, Arcium-specific, Nosana-specific. For these, use context7 with the library name; if it can't find them, fall back to direct repo reads.

---

## GLOBAL: SKILL → DAY MAP

| Day | Skills to invoke |
|---|---|
| Day 1 | `superpowers:brainstorming` (if research spikes surface ambiguity), `compound-engineering:framework-docs-researcher` (ElizaOS v2 API, Clude, Nosana), `compound-engineering:best-practices-researcher` (Seeker dApp submission) |
| Day 2 | `claude-api` (Clude wrapper, Haiku integration), `superpowers:test-driven-development` (schemas + fragmentStorage), `superpowers:verification-before-completion` (end-of-day harness) |
| Day 3 | `superpowers:systematic-debugging` (ElizaOS override mechanics), `superpowers:verification-before-completion`, `superpowers:test-driven-development` (drowsiness state machine tests) |
| Day 4 | `claude-api`, `superpowers:brainstorming` (dream prompt tuning — run it as a prompt-iteration loop), `superpowers:verification-before-completion` |
| Day 5 | `vercel-react-best-practices`, `vercel-composition-patterns`, `frontend-design`, `typography`, `better-icons` |
| Day 6 | `bencium-innovative-ux-designer`, `bencium-impact-designer`, `frontend-design`, `vercel-react-view-transitions`, `vercel-composition-patterns`, `typography`, `better-icons`, `web-design-guidelines` |
| Day 7 | `design-audit`, `web-design-guidelines`, `vercel-react-view-transitions`, `superpowers:systematic-debugging` (integration bugs), `superpowers:verification-before-completion` |
| Day 8 | `deploy`, `security-hardening`, `solana-patterns`, `superpowers:systematic-debugging` (Nosana deploy), `claude-api` (if Arcium wrapper needs LLM metadata) |
| Day 9 | `design-audit` (final pass), `web-design-guidelines`, `typography` (README), `compound-engineering:best-practices-researcher` (submission checklist) |

---

## GLOBAL: CLAUDE-CODE HOOKS TO INSTALL DAY 1

1. **`PostToolUse` on Edit/Write in `src/**/*.ts`** → run `bun tsc --noEmit` silently. Catches type errors instantly.
2. **`PostToolUse` on Edit/Write in `apps/web/**/*.tsx`** → run `bun lint` on that file only.
3. **`Stop` hook** → run `scripts/verify.ts` (the harness from suggestion #6) once per session close.
4. **`PreToolUse` on Bash `git commit`** → block if `.env`, `*.key`, `*.pem`, or `id_*` are staged. (CLAUDE.md rule.)
5. **`PostToolUse` on Bash `git commit`** → auto-push to `origin` if commit succeeded and branch tracks a remote. (You want visible progress for judges.)
6. **`UserPromptSubmit` on keywords "deploy", "ship", "submit"** → inject a checklist reminder (tests pass? .env clean? README updated?).

Do not add hooks that slow the dev loop — skip auto-format on save, do that in the editor.

---

## GLOBAL: ECOSYSTEM INTEGRATION CHECKLIST (what judges must be able to verify)

| Ecosystem | Minimum observable proof | Where it appears in submission |
|---|---|---|
| **ElizaOS v2** | Runs as an ElizaOS agent with custom plugin; `elizaos dev` starts MILAM; character file is loaded; shouldRespond + reply overrides demonstrably fire | Repo `plugin-milam/`, demo video shows agent responding, README architecture diagram |
| **Nosana** | Dockerfile + `nosana_eliza_job_definition.json` in repo; deployed job ID referenced in README; Nosana dashboard screenshot in demo video; dream cycle inference logs showing Qwen3.5 endpoint calls | Repo `nos_job_def/`, README "Deployment" section, demo video 1:50 |
| **Clude** | `plugin-dreamers-core/cludeWrapper.ts` visibly calls `brain.store / recall / clinamen / dream`; Supabase dashboard shows namespaced rows; README credits Clude | Repo, README, optional Supabase screenshot in submission |
| **Arcium** | `plugin-dreamers-core/arciumWrapper.ts` (even demo-mode) clearly marked; README explains MXE-compatible envelope path and the DREAMER MODEL thesis; if real devnet tx exists, link it | Repo, README "Encrypted Compute" section, demo video 2:35 |
| **Solana** | Mainnet-beta memo transaction hash clickable in UI (`SolanaHashBadge`); Explorer link in demo video; `solana-patterns` skill applied | Live UI, demo video 2:05, README |
| **Solana Seeker / Mobile** | PWA `manifest.json` + service worker; installable; Bubblewrap TWA scaffold (even unsigned) in `apps/web/android/`; README "Seeker" section honest about submission status | Repo `manifest.json`, `apps/web/android/`, README |
| **Supabase** | Connection string in `.env.example`, schema migration in `supabase/migrations/`, RLS policies applied | Repo |

---

## DAY-BY-DAY DETAIL PASS

---

### DAY 1 — April 5 — Foundation + Research

**Dependencies to install:**
- Windows-side: WSL2 (Ubuntu 22.04 or 24.04), Docker Desktop (with WSL2 backend), VS Code + Remote-WSL extension
- Inside WSL2: `nvm` → Node 23.x (`nvm install 23`), `bun` (`curl -fsSL https://bun.sh/install | bash`), `git`, `build-essential`
- `@solana/web3.js@^1.95.0`, `@solana-developers/helpers` (for airdrop), `solana-cli` (via official installer script — this installs `solana`, `solana-keygen`)
- `supabase` CLI (optional, nice to have): `npm i -g supabase`
- Fork target: pin the commit hash. Run `git log -1 --format=%H` after fork and record it in README.

**Accounts needed today:** GitHub, Nosana, Supabase, Anthropic, Solana (wallet), Docker Hub (create account but don't push yet), Vercel (create, connect repo).

**Known traps:**
- **WSL2 path issues.** Never edit files from Windows Explorer / VS Code Windows mode — edit inside WSL. File watchers break on `/mnt/c/...`. Clone to `~/dreamers` (Linux FS), not `/mnt/c/Users/JBOO/dreamers`.
- **Node 23 + bun edge cases.** Some native modules (sharp, canvas, better-sqlite3) don't have Node 23 prebuilts yet. If `bun install` fails, downgrade to Node 22 LTS. Record the chosen version in `.nvmrc`.
- **bun vs npm lockfile.** `nosana-ci/agent-challenge` may ship a `package-lock.json`. Delete it. Commit `bun.lockb` only. Do NOT mix.
- **Docker Desktop WSL integration.** Verify `docker ps` works inside WSL. If not, enable WSL integration in Docker Desktop settings before wasting time Day 8.
- **Nosana endpoint shape.** If OpenAI-compatible, set `OPENAI_BASE_URL` + `OPENAI_API_KEY` env. If custom, you'll need a shim. Confirm before Day 2.
- **Clude self-hosted install.** Read `clude-bot` README carefully — verify whether it needs Supabase connection string OR embedded SQLite. If Supabase, run its migration SQL through Supabase dashboard SQL editor.
- **Solana airdrop rate limits.** Devnet faucet is flaky. If `solana airdrop 2` fails, use web faucet or QuickNode faucet.

**Exit criteria — verification commands:**
```bash
# Inside WSL2, in ~/dreamers
node -v                                           # should show v23.x or v22.x
bun -v                                            # should show 1.x
docker ps                                         # should not error
bun install && bun run dev                        # or: npx elizaos dev
# in another terminal:
curl localhost:3000/health                        # or whatever the agent exposes
solana config get                                 # devnet
solana balance                                    # > 0 SOL
# Clude verification — a tiny TS script:
bun run scripts/smoke-clude.ts                    # stores + recalls one fragment, exits 0
```

**End-of-day git:** `feat: dreamers repo scaffold + Clude backend live`. Push to GitHub (private repo OK).

---

### DAY 2 — April 6 — Shared Core + MILAM Character

**Dependencies to add:**
- `zod@^3.23.0` (schemas)
- `@anthropic-ai/sdk@^0.30.0` (Haiku, via Clude)
- `@solana/web3.js` (memo writes — not used yet but available)
- `uuid@^10.0.0`

**Skills:** `claude-api`, `superpowers:test-driven-development`, `superpowers:verification-before-completion`.

**MCP use:** context7 for Zod v3 patterns, ElizaOS v2 Plugin interface shape.

**Known traps:**
- **Zod + ElizaOS type overlap.** ElizaOS ships its own Zod version. Check `bun pm ls zod` — if two versions, dedupe or you'll get weird runtime type errors.
- **Character file schema drift.** v2 character.json format changed from v1 (`plugins` array structure, `settings.secrets` handling). Use `compound-engineering:framework-docs-researcher` to confirm exact current shape before writing milam.character.json.
- **Namespace collisions.** If Clude's `brain.store(key, value)` treats `:` specially, your namespace convention will break. Test with a literal `milam:episodic:fragment-abc` key Day 2 morning.

**Exit criteria:**
```bash
bun test plugin-dreamers-core                     # schemas + fragmentStorage unit tests pass
bun run scripts/verify.ts                         # stores 5 fragments, recalls them, prints them
bun run dev                                       # agent boots
# Chat UI / curl:
# send "I dreamed I was flying over a burning city"
# → MILAM replies in-character (sensory, dreamy, brief) — no generic assistant voice
```

**Commit:** `feat: shared core plugin with Clude + namespaced schema + both character files`.

---

### DAY 3 — April 7 — MILAM Behavior (CHECKPOINT DAY)

**Dependencies:** none new (except maybe `@paralleldrive/cuid2` if you want deterministic IDs for testing).

**Skills:** `superpowers:systematic-debugging` (override wiring is where time dies), `superpowers:test-driven-development` (state machine deserves unit tests), `superpowers:verification-before-completion`.

**Known traps:**
- **`shouldRespondTemplate` vs `shouldRespond` evaluator.** ElizaOS v2 distinguishes template (LLM prompt for yes/no) from evaluator (code). For a keyword fallback you want the evaluator, not just a template override. Confirm via framework-docs-researcher.
- **Wakefulness persistence.** State machine MUST persist per-room/conversation, not globally. If it's a single global `let wakefulness = 3`, the demo dies when two messages come from different rooms. Store in Clude under `milam:self_model:wakefulness-{roomId}`.
- **Dream classifier false positives.** "I dreamed of quitting my job" is ambiguous — dream recall or aspiration? Don't overthink Day 3 — ship heuristic (keyword "dreamed/dream/last night") + LLM fallback on ambiguity.
- **Reply template vs raw response.** If ElizaOS wraps all replies in a persona system prompt, your "silence at wakefulness 0" may still produce output. Intercept at the action/handler layer, not template layer.
- **Fragment double-write.** Make sure fragment storage isn't called twice per message (once in evaluator, once in handler).

**Exit criteria (the silence demo):**
```bash
# Manual chat test, scripted:
> "I dreamed I was falling through soft white sand"
  → MILAM: full sensory question                 # wakefulness 3→2
> "The sand was warm, almost sugary"
  → MILAM: shorter question or mirror            # wakefulness 2→1
> "yes"
  → MILAM: one-word echo                         # wakefulness 1→0
> "what time is it"
  → MILAM: (silence / nothing)                   # wakefulness 0, stored as silent-feeling
> "last night I dreamed of a river of eyes"
  → MILAM: wakes, full sensory question          # reset to 3
```
And: `bun run scripts/verify.ts` shows 5 fragments in Clude with correct importance + tags.

**⚠️ RECORD THIS DEMO NOW.** Phone camera. One take. Save to `demo/raw/day3-silence-demo.mp4`. This is your insurance.

**Commit:** `feat: MILAM full conversational arc with drowsiness + sensory questions + fragment storage`.

---

### DAY 4 — April 8 — Dream Cycle Pipeline

**Dependencies:**
- `node-cron@^3.0.3` (scheduling Day 5, install now)
- `@solana/web3.js` memo helper: `@solana/spl-memo@^0.2.5` (or raw TransactionInstruction to the memo program)
- `date-fns@^4.0.0` (date filtering)

**Skills:** `claude-api`, `superpowers:brainstorming` (prompt iteration loop), `superpowers:verification-before-completion`.

**Known traps:**
- **Nosana Qwen3.5 latency.** Dream cycle calls the heavy model — expect 20–60s per generation. Do NOT run synchronously inside a request handler. Service method, await, log duration.
- **Token limits.** If you pass 100 fragments + clinamen + emergence, you'll blow context. Truncate + summarize fragments beyond ~30.
- **Clinamen/dream output shape.** Clude's `brain.clinamen()` and `brain.dream()` return... what exactly? Confirm Day 2 during wrapper build. If it's free text, you may need to parse structured sections out. Don't discover this Day 4.
- **Solana memo size limit.** Memo program accepts ~566 bytes. Hash the journal (SHA-256 → base58) and store the hash, not the journal text.
- **Prompt tuning loop.** The dream prompt is 60% of the win. Budget 3 hours, not 30 minutes. Run the cycle 10+ times. Read aloud. Iterate.

**Exit criteria:**
```bash
curl -X POST localhost:3000/api/trigger-dream-cycle
# → returns { journal: "...", solanaHash: "..." }
# → journal reads as actual dream prose, not a report
# → hash resolves on explorer.solana.com/?cluster=devnet
bun run scripts/verify.ts                         # now includes dream cycle in harness
```

**Commit:** `feat: dream cycle pipeline + manual trigger endpoint`.

---

### DAY 5 — April 9 — Scheduling + Journal Provider + Frontend Scaffold

**Dependencies (frontend):**
- `next@^15.0.0`, `react@^19.0.0`, `react-dom@^19.0.0`
- `tailwindcss@^4.0.0` (v4 has a new config story — verify with context7 on Day 5 morning)
- `framer-motion@^11.11.0`
- `clsx@^2.1.0`, `class-variance-authority@^0.7.0`
- `lucide-react@^0.460.0` (plus `better-icons` skill for curated icon usage)
- `next-pwa@^5.6.0` OR hand-rolled SW — decide once, don't mix
- NO shadcn/ui (per suggestion #7)

**Accounts:** Vercel (if not done Day 1).

**Skills:** `vercel-react-best-practices`, `vercel-composition-patterns`, `frontend-design`, `typography`, `better-icons`.

**MCP use:** context7 for Next.js 15 App Router, React 19 `<ViewTransition>`, Tailwind 4.

**Known traps:**
- **Monorepo tsconfig.** `apps/web/tsconfig.json` must not inherit from the agent's strict settings or Next will complain. Keep them siblings, not nested.
- **API route → ElizaOS bridge.** Next.js API routes cannot `import` the ElizaOS runtime if the agent is a separate process. Use HTTP: Next calls `http://localhost:3001/agent/message` where the agent runs on 3001. Do NOT try to embed.
- **node-cron in ElizaOS Service.** Confirm Services survive hot-reload in dev. If not, cron doubles. Guard with a module-level flag.
- **Tailwind v4.** Config format changed (CSS-based). Use context7.
- **next-pwa + App Router.** Historically flaky. Verify compatibility with Next 15.

**Exit criteria:**
```bash
# agent:
bun run dev                                       # ElizaOS on :3001
# web:
cd apps/web && bun dev                            # Next on :3000
# visit http://localhost:3000                     # loads, shows MILAM skeleton
# visit http://localhost:3000/rolpa               # loads ROLPA placeholder
# POST http://localhost:3000/api/message          # relays to :3001 agent, returns reply
# Wait for cron tick (or trigger manually) → journal written in Clude
```

**Commit:** `feat: nightly scheduling + journal provider + Next.js scaffold`.

---

### DAY 6 — April 10 — MILAM Night Mode Frontend (the win-condition day)

**Dependencies:** already installed. Maybe add `@react-three/fiber` if canvas starfield gets complex — probably overkill, plain `<canvas>` is fine.

**Skills (stack them):** `bencium-innovative-ux-designer`, `bencium-impact-designer`, `frontend-design`, `vercel-react-view-transitions`, `vercel-composition-patterns`, `typography`, `better-icons`, `web-design-guidelines`.

**MCP use:** context7 for Framer Motion latest API, React 19 `useOptimistic` (if used), View Transitions browser compatibility.

**Known traps:**
- **React 19 View Transitions API is new.** Browser support: Chromium yes, Firefox partial, Safari iOS 18+. The PWA on a non-Chromium Seeker could fall back ungracefully. Use `@vercel/react-view-transitions` or feature-detect and fall back to Framer crossfade.
- **Canvas animation on mobile.** `requestAnimationFrame` + particles can pin a phone CPU. Cap to 60–80 stars, use `visibility: hidden` when tab hidden, respect `prefers-reduced-motion`.
- **`prefers-reduced-motion`.** Hard requirement for accessibility — static starfield fallback.
- **PWA on iOS.** iOS PWA behavior differs (no background sync, limited notifications). Seeker is Android, so this is lower priority — but if you test on an iPhone, expect weirdness.
- **Font loading.** Serif display font (Fraunces? Cormorant? GT Sectra?) — use `next/font` to avoid CLS. Decide font Day 5 evening.
- **Local-network phone test.** Vite/Next dev server needs `--hostname 0.0.0.0`. Find your WSL2 IP (not localhost). Windows firewall may block — allow Node through.

**Exit criteria:** open `http://<your-ip>:3000` on your phone. The starfield breathes. A dream submits. The reply fades. The typography is actually nice. You'd show this to a designer without flinching.

**Commit:** `feat: MILAM night mode frontend — stunning`.

---

### DAY 7 — April 11 — ROLPA Placeholder + Mode Toggle + Integration Test (real checkpoint)

**Dependencies:** none new.

**Skills:** `design-audit`, `web-design-guidelines`, `vercel-react-view-transitions`, `superpowers:systematic-debugging`, `superpowers:verification-before-completion`.

**Known traps:**
- **View transition between routes vs within.** Sun/moon toggle is a state change, not necessarily a route change. `/` with mode state OR `/` and `/rolpa` — the latter is cleaner for View Transitions API but requires both atmospheres to animate via `view-transition-name` CSS.
- **Background z-layer management.** Two backgrounds crossfading while foreground stays pinned — use a dedicated `<AtmosphereLayer>` with `position: fixed`, isolate from the content layer.
- **Integration bugs cluster here.** Every seam breaks Day 7. Budget the afternoon for "fix things that should have worked."

**Exit criteria:** full scripted walkthrough on phone without touching the keyboard mid-flow:
1. App opens on MILAM
2. Type dream → sensory reply
3. Three more turns → silence
4. Type task → silence
5. New dream → wake
6. Tap "Dream now" button → journal appears with Solana hash
7. Tap sun icon → etheric warmth fades in, ROLPA placeholder visible
8. Tap moon icon → midnight fades back
9. No console errors in Chrome DevTools remote inspection

**FEATURE FREEZE.** After Day 7 commit, only bugs + polish + demo prep.

**Commit:** `feat: dual-mode UI with view transitions + full integration`.

---

### DAY 8 — April 12 — Docker + Nosana Deploy + Arcium

**Dependencies:**
- Docker (already installed)
- Nosana CLI: `npm i -g @nosana/cli` (verify name via context7 / Nosana docs)
- Arcium SDK (if available): unknown package name — research Day 1 spike result

**Accounts:** Docker Hub (push), Nosana (deploy — may need NOS tokens from hackathon organizers).

**Skills:** `deploy`, `security-hardening`, `solana-patterns`, `superpowers:systematic-debugging`.

**Known traps:**
- **Dockerfile for ElizaOS v2.** Base image: `oven/bun:1.1-slim` or `node:22-slim`. Copy `package.json` + `bun.lockb` first, `bun install --frozen-lockfile`, then copy source. Multi-stage for smaller image.
- **Secrets at runtime.** Do NOT bake `.env` into the image. Nosana job definition injects env vars.
- **Nosana job definition schema.** Check `nosana-ci/agent-challenge` for the template. Required: image URL, env list, GPU spec, timeout.
- **Mainnet switch.** Change `SOLANA_CLUSTER=mainnet-beta`. Verify wallet has SOL. Single memo tx = ~5000 lamports (~$0.0005). You need maybe 0.005 SOL total for the demo.
- **Arcium SDK reality.** If not publicly available, abort cleanly — do NOT spend more than 2 hours. Fall back to `arciumWrapper.ts` that does envelope encryption with `libsodium-wrappers` and a clearly-commented TODO: "swap for Arcium MXE client when devnet opens." README frames this as "Arcium-compatible, MXE migration ready."
- **Healthcheck endpoint.** Nosana job may require `/health`. Add one Day 5 if not already.

**Exit criteria:**
```bash
docker build -t yourhub/dreamers-agent:v0.1 .
docker run --env-file .env yourhub/dreamers-agent:v0.1      # works locally
docker push yourhub/dreamers-agent:v0.1
nosana job post -f nos_job_def/nosana_eliza_job_definition.json
# → returns job URL
# Visit URL → agent running on Nosana infra → can send it a message
# Mainnet memo visible on explorer.solana.com (no ?cluster param = mainnet)
```

**Commit:** `feat: Nosana deployment + mainnet Solana[ + Arcium envelope]`.

---

### DAY 9 — April 13 — Demo Video + README + Submit

**Dependencies:** OBS Studio or scrcpy for screen capture, CapCut / DaVinci Resolve for editing.

**Skills:** `design-audit`, `web-design-guidelines`, `typography`, `compound-engineering:best-practices-researcher`.

**Known traps:**
- **Live inference flakiness during recording.** Pre-cache the dream cycle output (suggestion #10). Run the cycle at 9am, save the journal, serve it for the video. Label honestly in README.
- **Phone screen mirror quality.** scrcpy is free and crisp. Use `scrcpy --max-size 1080 --video-bit-rate 12M`. QuickTime iOS mirror is fine if you're on iPhone.
- **README is judged.** It should include: hero image, 3-minute video embed/link, architecture diagram, dual-mode explanation, ecosystem integrations table, setup instructions, Day-1-reproducible quickstart, credits (ElizaOS, Nosana, Clude, Arcium, Solana, Nous Research inspiration, Watts quote).
- **Submission form surprises.** Read the hackathon submission form Day 8 evening so you know every field Day 9.
- **Video length.** 3:00 is a soft ceiling. Judges watch the first 60 seconds at most. Front-load the silence demo.
- **X post timing.** Post after official submission confirmed. Tag accounts listed in plan.

**Exit criteria:** submission form shows "Submitted." Video link works. Repo link works. Nosana job URL works. Mainnet hash resolves on explorer. README renders on GitHub with images.

**Final commit:** `docs: README + submission artifacts`.

---

## KNOWN TRAPS — STACK-SPECIFIC ROLLUP

1. **Workspace location.** Docs/plans live at `C:/Users/JBOO/dreams/` (local SSD, moved off Drive 2026-04-06). Code repo lives separately at `~/dreamers` inside WSL2 — never colocate `.git`/`node_modules` with synced storage.
2. **bun vs npm lockfile collision.** Delete `package-lock.json` if forked repo has one.
3. **ElizaOS v2 API is a moving target.** Pin the fork commit. Resist `bun update`.
4. **Next.js API route → ElizaOS runtime.** Two processes, HTTP bridge. Do not try to embed.
5. **Tailwind v4 config format.** CSS-based now; breaking change from v3.
6. **React 19 `<ViewTransition>`.** Browser support uneven; feature-detect.
7. **Supabase free tier.** 500MB DB, 2GB egress. Fine for hackathon. Note row limit if you log every interaction aggressively.
8. **Solana memo byte limit.** 566 bytes. Hash, don't paste.
9. **Nosana GPU cold start.** First inference may take 60s+. Warm it before demo recording.
10. **Arcium availability.** Treat as uncertain. Have the fallback wrapper ready.
11. **Clude `:` in namespace keys.** Verify early.
12. **Node 23 native module gaps.** Fall back to Node 22 LTS if any package complains.
13. **Framer Motion + React 19.** Check version compatibility via context7 Day 5.
14. **PWA install on iOS vs Android.** Focus Android (Seeker); iOS is bonus.
15. **Docker Desktop WSL integration.** Must be enabled; test Day 1.
16. **Cron double-fire on hot reload.** Guard with module flag.
17. **Character file secrets.** Never commit keys inside `character.json`. Use env substitution.
18. **Video demo live inference.** Cache it.

---

## RUNNABLE VERIFICATION HARNESS (build Day 2, extend daily)

`scripts/verify.ts`:
```
1. Connect to Clude (self-hosted)
2. Store 3 test fragments with known UUIDs
3. Recall them → assert count === 3
4. Run brain.clinamen() → assert non-empty output
5. (Day 4+) Run a mini dream cycle with 3 fragments → assert journal length > 200 chars
6. (Day 4+) Hash to Solana devnet → assert signature returned, log explorer URL
7. (Day 8+) Arcium envelope round-trip → assert decrypt matches original
8. Print green checkmarks. Exit 0 on success, 1 on any failure.
```

Run it at end of every day. Add to the `Stop` hook. This is your regression net.

---

## END

File saved. This companion doc does not replace the Final Build Plan — it supplements it with the ground-truth details a builder hits on Day 1, hour 2.
