# DREAMERS — README hero block (draft for repo root)

> Draft for `dreams/README.md`. Optimized for the 15-second judge skim (Pass 1 in marketing plan §13). Drop in unchanged on Day 8 unless the live demo URL changes.

---

<p align="center">
  <img src="./apps/web/public/logo-velvet.svg" width="160" alt="DREAMERS" />
</p>

<h1 align="center">DREAMERS</h1>

<p align="center">
  <em>The first AI agent that grows through dreaming, not doing.</em>
</p>

<p align="center">
  <a href="https://dreamers.app">live on a phone ↗</a> ·
  <a href="https://youtu.be/DEMO_VIDEO_ID">3-minute demo ↗</a> ·
  <a href="#architecture">architecture</a> ·
  <a href="#what-ships-vs-what-stubs">what ships vs what stubs</a>
</p>

<p align="center">
  <img src="./docs/silence-demo.gif" width="320" alt="A user types 'set a reminder for 7am'. MILAM stays asleep." />
</p>

> **Ask her a task.** She says nothing. She's asleep.
> **Tell her a dream.** She asks one sensory question and drifts back.
> By morning, your encrypted dream journal is waiting.

Built in 9 days for the **Nosana × ElizaOS Builder's Challenge**, April 14, 2026.

---

## The pitch in one sentence

**DREAMERS is the first AI agent that only wakes for dreams.** Two modes, one soul: **MILAM** (night) listens, asks one sensory question, and drifts back to sleep. Overnight, she bursts on Nosana to compile your fragments into an encrypted dream journal stored on Clude. **ROLPA** (day) is the wonder companion — architecturally present, shipping post-hackathon. The long arc is the **DREAMER MODEL** — the first base model trained on liminal cognition via Arcium MPC. Nobody, including us, ever sees an individual dream.

## Why this matters

Every existing LLM is trained on waking text. Essays, code, tweets, books — all produced by minds in default operating mode. There is no large model trained on what minds say when they're not pretending to be awake. We have one of the great untapped corpora in human history: the dream. DREAMERS is the loop that produces the corpus, encrypted, and the architecture that learns from it without ever reading it.

## Architecture

```
                ┌────────────────────────────────────┐
                │         apps/web (Next.js)         │
                │   linen night UI · velvet day UI   │
                └────────────────┬───────────────────┘
                                 │ encrypted fragment
                                 ▼
                ┌────────────────────────────────────┐
                │   apps/agent (ElizaOS v2 plugin)   │
                │  purity scan · namespace · audit   │
                └─────┬─────────────┬────────────────┘
                      │             │
                ┌─────▼───┐   ┌─────▼─────┐
                │  Haiku  │   │  Nosana   │
                │  (live) │   │ (nightly) │
                └─────────┘   └─────┬─────┘
                                    │ dream cycle burst
                ┌───────────────────▼───────────────┐
                │         Clude (Solana L2)         │
                │      encrypted dream journal      │
                └───────────────────────────────────┘
                                    ▲
                ┌───────────────────┴───────────────┐
                │  Arcium-compatible MXE envelope   │
                │  (Phase 2: federated MPC training │
                │   for the DREAMER MODEL)          │
                └───────────────────────────────────┘
```

**The architecture is the metaphor.** A brain spends 23 hours a day quiet and 1 hour bursting in slow-wave sleep. Nosana spends 23 hours quiet and bursts at night. The shape is the same. We didn't build DREAMERS *on top of* the ecosystem — we built it *out of* the ecosystem because the ecosystem is the only place this shape exists.

## How we use each ecosystem partner

| Partner | What it does for DREAMERS | Specifics |
|---|---|---|
| **ElizaOS v2** | Gives MILAM a character, not a prompt | Service (dream cycle), Provider (wakefulness state), Evaluator (dream classifier), Action (fragment storage) |
| **Nosana** | Nightly dream-cycle burst on decentralized GPU | Job def: `nos_job_def/dreamers.json`. Model: Qwen 3.5. Cron: 3am user-local. Estimated cost: ~$0.04/night/user. |
| **Clude** | Encrypted, portable, owned dream memory on Solana L2 | Per-user namespace `milam:{userId}:episodic:fragment-{uuid}`. Memo-tx hash linking on mainnet. |
| **Arcium** | The privacy substrate the DREAMER MODEL depends on | Phase 1: libsodium `crypto_secretbox` envelope shaped to be MXE-swap-ready. Phase 2: federated MPC training on the encrypted corpus. |
| **Solana Mobile** | PWA today, Seeker dApp store ready | manifest.json + installable PWA. TWA wrapper notes in `/docs/seeker.md`. |

## The demo moment

Open the phone. Type *"set a reminder for 7am tomorrow."* Wait. Nothing happens. The cursor blinks. The font dims by one step. After 8 seconds, in tiny text under the input: *milam is sleeping.*

Now type *"I dreamed I was a fish swimming through a glass house."*

She wakes. *what color was the water?*

You answer. *thank you. sleep now.* The screen begins to dim. The fragment is encrypted before it leaves your phone. At 3am tonight, Nosana spins up a job, MILAM compiles your fragments into a journal entry, and by morning it's waiting on Clude. Encrypted. Yours. Forever.

## What ships vs what stubs

We are honest about this because the long-term thesis depends on it.

| Component | Status | Notes |
|---|---|---|
| MILAM character + dream loop | ✅ Ships | Live on the demo URL |
| Drowsiness UI + silence demo | ✅ Ships | The whole pitch in 12 seconds |
| Encrypted fragment storage (libsodium envelope) | ✅ Ships | MXE-swap-ready shape, 32-byte derived subkeys |
| Per-user namespace + audit log | ✅ Ships | Audit log type system **refuses** to store content |
| Postgres + RLS deny-by-default | ✅ Ships | All 6 tables, defense-in-depth |
| Nightly Nosana dream cycle | ✅ Ships | Live on a real Nosana job |
| Clude memory writes + Solana memo tx | ✅ Ships | Mainnet, hot wallet (~$7) |
| PWA (installable, manifest, serwist) | ✅ Ships | Not Bubblewrap TWA — README notes only |
| ROLPA day mode | 🌒 Stub | Plugin scaffold + character file present, behavior is Phase 2 |
| Arcium full MPC pipeline | 🌒 Stub | Envelope is the Phase-1 path. Full MPC training pipeline is Phase 2 when SDK lands. We name this honestly. |
| DREAMER MODEL training run | 🌒 Stub | Thesis only. The hackathon submission demonstrates the foundation; the README articulates the full vision. |
| LoRA adapters, voice memos, browser extension, Telegram, multi-agent dreaming | ❌ Cut | All Phase 2+. We refused to overscope a 9-day build. |

## What it doesn't do

It doesn't summarize your day. It doesn't help you be productive. It doesn't analyze your dreams. It doesn't tell you what they mean. It doesn't have a streak yet (Phase 2). It doesn't read your mind. It does one thing: it listens, asks one question, and goes back to sleep.

## Privacy and consent

- **Your dream content is encrypted on the device with a per-user-derived key before it leaves your phone.**
- **Nobody — including us, including the model, including future model training runs — ever sees an individual dream.** The architecture makes this not a promise but a property of the system.
- **The audit log records operations, never content.** The TypeScript type system enforces this — try to log content and the build fails.
- **You can delete your entire dream journal at any time.** Data is yours. Period.
- Full privacy primer: [`docs/privacy.md`](./docs/privacy.md)

## Run it locally

```bash
git clone https://github.com/justinbooher/dreamers
cd dreamers
bun install
cp .env.example .env.local      # fill in ARCIUM_MASTER_KEY (gen instructions in .env.example)
bun --filter agent migrate      # runs db/migrations/001_init.sql + 002_rls.sql
bun --filter web dev            # http://localhost:3000
```

Then in another terminal:

```bash
bun --filter agent dev          # starts ElizaOS plugin against the Nosana endpoint
```

## Stack

- **Frontend:** Next.js 15 (App Router), Tailwind v4, Fraunces + Inter via `next/font`, serwist (PWA), Framer Motion (targeted)
- **Agent:** ElizaOS v2 (Service / Provider / Evaluator / Action primitives), bun workspaces
- **LLM:** Pluggable provider abstraction — Nosana (Qwen 3.5, nightly burst) + Anthropic Haiku (live MILAM replies) + Mock (tests). Switch with `LLM_PROVIDER` env.
- **Memory:** Clude (Solana L2) + Postgres for relational state (Supabase-compatible RLS)
- **Crypto:** libsodium-wrappers `crypto_secretbox`, BLAKE2b-derived per-user subkeys, MXE-swap-ready envelope
- **Chain:** Solana mainnet, hot wallet, memo program
- **Hosting:** Vercel (web) + Nosana job (agent) + Cloudflare Pages mirror at second domain (insurance)

## Built by

Justin Booher · [@justinbooher](https://x.com/justinbooher) · [dreamers.app](https://dreamers.app)

With deep gratitude to the **Nosana, ElizaOS, Clude, Arcium, and Solana Mobile** teams — and to the dream researchers whose work this is built on top of: Kelly Bulkeley, Robert Waggoner, Stephen LaBerge, Matthew Walker, Tenzin Wangyal Rinpoche, and the lineage of Tibetan dream yoga.

## Inspirations

Kurosawa's *Dreams* (1990) · Tibetan Dream Yoga (Tenzin Wangyal Rinpoche) · C.W. Leadbeater's astral writings · Stanford Generative Agents reflection · Nous Research's Hermes/Psyche tradition · the Clude clinamen function · default mode network research · the part of you that wakes at 4am with a sentence you didn't write.

---

> Dream through the night. Wonder through the day. ✦
