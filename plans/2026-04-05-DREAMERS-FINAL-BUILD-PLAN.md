# DREAMERS — Final Build Plan (MVP to Win)
**Date:** April 5, 2026 (synthesized April 6 pre-dawn)
**Deadline:** April 14, 2026 (9 days)
**Goal:** Ship a stunning, winning MVP of MILAM (night mode) with ROLPA (day mode) architecturally stubbed. Win the hackathon. Use exposure to build the following.

**Companion docs (all in `/plans/`):**
- `2026-04-05-DREAMERS-ARCHITECT-DETAIL-PASS.md` — dependencies, accounts, hosting, MCPs, per-day traps
- `2026-04-05-DREAMERS-PRODUCT-DETAIL-PASS.md` — UX spec, UI copy library, drowsiness states, demo storyboard
- `2026-04-05-DREAMERS-UI-CRAFTSMAN-REVIEW.md` — tokens.css, Fraunces/Inter, StarrySky, Day 6 hour-by-hour
- `2026-04-05-DREAMERS-A11Y-PERF-REVIEW.md` — WCAG audit, reduced-motion, PWA, Day 7 ship gate
- `2026-04-05-DREAMERS-DATA-SECURITY-REVIEW.md` — Postgres DDL, RLS, encryption wrapper, purity scan
- `2026-04-05-DREAMERS-INTEGRATIONS-REVIEW.md` — Nosana/Clude/Solana/Arcium wiring, LLM provider abstraction
- `2026-04-05-DREAMERS-QA-SECURITY-REVIEW.md` — test coverage, submission gate, demo day runbook
- `/marketing/2026-04-05-DREAMERS-MARKETING-PLAN.md` — 30-day plan, 5 logos, first 3 days ready-to-post

---

## ⚡ STEP 1 + STEP 2 FINDINGS — CRITICAL PLAN UPDATES

*Every change that the 7 specialist reviews surfaced. Read this block FIRST before executing any day below.*

### Architecture changes (carry through all days)

1. **LLM provider abstraction on Day 1.** Create `src/llm/generate.ts` with three implementations (Nosana, Haiku, Mock) behind `LLM_PROVIDER` env var. **Haiku handles live MILAM replies; Nosana handles the nightly dream cycle burst.** This is the single biggest de-risk — don't gamble on Nosana cold-start latency for the live drowsiness UX.
2. **Envelope encryption on Day 2, NOT Day 8.** 60 lines of libsodium `crypto_secretbox` wrapping fragment content before store. Framed in README as "Arcium-compatible MXE envelope" with TODO linking to Arcium MXE for Phase 2 swap. **Arcium has no public npm SDK — the envelope IS the Arcium story for the hackathon.** Reframe positively in README, not apologetically.
3. **Per-user namespace from Day 2.** Every Clude key is `milam:{userId}:episodic:...`. Hackathon uses `DEMO_USER_ID` constant at the API boundary. Phase 2 auth slots in with zero refactoring.
4. **Purity scan restored.** From the original MIRARI doc. Blocks ChatML/Llama delimiters, jailbreak patterns, zero-width chars. Runs before storage AND before LLM call. Doubles as the "she can't help noticing when something feels wrong" narrative.
5. **Audit log table from Day 2.** Logs operation + timestamp + userId (NEVER content). This is the opt-in provenance for the DREAMER MODEL thesis. Judges love this.
6. **Drop `shadcn/ui`.** Conflicts with a distinctive aesthetic. Tailwind v4 + Framer Motion (targeted) + hand-built components only.
7. **Drop `next-pwa`.** Unmaintained. Swap to `serwist` (maintained fork with App Router support).
8. **Split repo into workspace from Day 1.** `apps/agent` (ElizaOS, Docker for Nosana) + `apps/web` (Next.js, Vercel). pnpm/bun workspace. Avoids Day 5 scramble.
9. **Frontend scaffold MOVES to Day 1 evening.** `create-next-app` + Tailwind + tokens.css while the brain is still fresh. Parallelizes the rest of the week.
10. **Feature freeze is Day 7, not Day 3.** Day 3 is a cut checkpoint. Day 7 is the hard gate — after that, only bugs, polish, demo prep.

### Ecosystem integration corrections

11. **Nosana endpoint shape must be confirmed in Hour 1 of Day 1.** OpenAI-compatible vs job-based changes the architecture. Check hackathon Discord #hackathon channel before anything else.
12. **Fund mainnet Solana wallet Day 1 evening.** Every agent agreed. CEX withdrawals take 24-48h. Fund 0.05 SOL (~$7) — 50x buffer for hundreds of memo txs.
13. **Use mainnet from Day 1.** $0.50. Devnet hashes look fake in the demo. Switching late risks broken explorer links.
14. **Arcium: envelope fallback is primary, not stretch.** Day 2 implementation. Day 8 is framing + README polish. Never block on a gated SDK.
15. **ElizaOS v2 primitive mapping:**
    - Dream cycle → **Service** (long-running, cron)
    - Wakefulness state → **Provider** (state injection)
    - Dream classifier → **Evaluator** (shouldRespond logic)
    - Fragment storage → **Action** (message handler)
16. **Cron double-fire guard.** Module-level flag + unique ID. Hot reload will double your cron without this.
17. **Seeker/Bubblewrap TWA wrapper is scope-cut.** PWA + honest "dapp-store-ready" framing only. Manifest + installable + TWA notes in README. Do NOT claim submitted.

### Visual / UX corrections

18. **Typography locked tonight: Fraunces (serif, opsz + SOFT axes) + Inter (UI).** Both via `next/font`. Do NOT defer this to Day 5.
19. **StarrySky builds in hours 1-2 of Day 6** (highest risk first, not last). Canvas 2D, Poisson disk distribution, 3 depth layers.
20. **Mode toggle uses dual-path crossfade, not SVG `<animate>` path morph.** Pragmatic. Ships.
21. **Shooting star arrives WITH the agent's answer, not on submit.** Reframes the moment — the star IS the reply landing.
22. **A single `--breath-duration` CSS variable unifies MILAM and ROLPA rhythm.** The app breathes across modes.
23. **Wakefulness indicator is hidden from visible UI.** State is felt through opacity, font size, breathing rate. Labeling it kills it.
24. **Incubate trigger is a hidden long-press on the moon icon.** Not a button. (Could become a paid feature later — "press and hold to incubate now.")

### Accessibility corrections (non-negotiable)

25. **Dusty rose `#e8a598` fails AA on linen.** Swap to `--day-text-accent: #b5645a` per a11y review. Full corrected palette in tokens.css.
26. **Mauve on deep purple `#1a1a3e` fails AA.** Use cream `#f4e8d8` for text on deep purple panels.
27. **Gold on mauve fails AA.** Solana hash badge uses cream-on-mauve, not gold-on-mauve.
28. **Visible "milam is asleep" caption at wakefulness 0.** Empty `aria-live` erases the silence demo for screen reader users. Render a `sr-only` + visible faded caption.
29. **Touch targets are 48×48, not 44×44** (Material spec; Apple HIG is minimum, not target).
30. **Enter = newline. Cmd/Ctrl+Enter = submit.** (Corrects product pass: dreams need newlines.)
31. **`prefers-reduced-motion` fallback preserves the silence demo via typography and opacity alone** — no motion required to feel the drowsiness arc.

### Security checklist (Day 1)

32. **Install `gitleaks` + pre-commit hook Day 1.**
33. **`.dockerignore` includes `.keys/`, `.env*`, `*.pem`** — keypairs never enter the Docker image.
34. **`next.config.ts` has CSP, HSTS, X-Frame-Options, Permissions-Policy headers** — drafted in data-security review, paste-ready.
35. **Fragment schema's `userId` column is NOT NULL from migration 001.** No nullable plumbing.

### Demo / recording corrections

36. **Record the silence clip on Day 3.** Insurance policy. Phone camera, one take, 30 seconds. Saved to `demo/raw/day3-silence-demo.mp4`.
37. **Pre-record full 3-minute demo on Day 8 evening.** Day 9 morning is for re-record + edit only.
38. **Add `DEMO_MODE=true` cached reality mode (Day 5).** Pre-generated journal in `public/demo/journal.json`. Frontend reads from cache when flag set. Use for video recording. Documented honestly in README.
39. **Domain decided Day 1.** Recommend `dreamers.fun` or `milam.dream`. Judges click the link — it should be gorgeous in screenshots.
40. **Write 5 real dream paragraphs to `demo/scripts.md` Day 1 evening.** Do not improvise on camera Day 9.

### Things to cut (confirmed by multiple reviews)

41. **LoRA per-user nightly adapter.** Superseded by DREAMER MODEL thesis.
42. **TurboQuant KV cache.** Nosana handles model serving.
43. **Knowledge graph.** Clude provides this.
44. **Connection engine.** ROLPA territory.
45. **DREAMS MODEL training.** Phase 2+ with real corpus.
46. **Voice memo capture.** Stretch only — if Day 7 has room. Web Speech API is unreliable.
47. **Bubblewrap TWA APK build.** README notes + publisher NFT prep only.
48. **Official Arcium MXE integration.** Envelope fallback is the primary path.
49. **Multi-agent dreaming, custom persona selection, browser extension, Telegram ingestion** — all Phase 2.

### The ONE sentence that governs every decision from here

**"Does this make the silence demo more likely to work on a real phone by end of Day 7, or less?"**

If less → cut it. If unclear → cut it. If yes → ship it.

---



---

## THE PITCH

**DREAMERS** is the first AI agent that grows through dreaming, not doing. Two modes, one soul:
- **MILAM** (night) — the dreamer. Receives dreams, asks one sensory question, drifts to sleep. Dreams overnight on Nosana. Writes to an encrypted on-chain journal.
- **ROLPA** (day) — the wonder companion. Holds everything, notices connections across time, points never prescribes. *(Architecturally present, shipping post-hackathon.)*

Ecosystem: **ElizaOS v2 + Nosana GPU + Clude (Solana L2) + Arcium MPC + Seeker PWA.**

The demo moment: ask the agent a task → silence. "It's not broken. It's asleep."

## THE LONG-TERM THESIS — THE DREAMER MODEL

Beyond MILAM and ROLPA lies the real flywheel: **a fine-tuned base model trained on the encrypted dream corpus of every DREAMERS user.** Nobody — not the training infrastructure, not us, not other users — ever sees any individual dream. Arcium MPC enables fully private federated training on encrypted data.

The output: the first model trained on liminal cognition. Not waking output. Not tasks. Dreams. The unfinished, the unresolved, the almost-remembered.

Inspired by Nous Research's tradition of weird, artistic, culturally-meaningful fine-tunes (Hermes, Psyche). The DREAMER MODEL is a cultural object as much as a product. Open-released when the corpus reaches sufficient size. Users opt-in to contribute dream patterns (not content) to training runs and earn $CLUDE micro-fees.

This is why Arcium is architecturally essential, not decorative:
- **Without Arcium** → no private training → no DREAMER MODEL → no flywheel
- **With Arcium** → the autopoietic loop closes: dreamers dream → encrypted corpus grows → new model trained → MILAM gets deeper → dreams get richer → next model → spiral tightens forever

**For the hackathon:** demo-mode Arcium wrapper on the fragment storage write path (Day 8). Full federated MPC training pipeline is Phase 2. The hackathon submission demonstrates the foundation; the README articulates the full vision.

---

## ARCHITECTURE

### Plugin Structure (split for future)

```
dreamers/
├── characters/
│   ├── milam.character.json           BUILD — full persona
│   └── rolpa.character.json           STUB — persona written, plugins empty
├── src/
│   ├── plugin-dreamers-core/          BUILD — shared infrastructure
│   │   ├── index.ts                   ElizaOS Plugin interface
│   │   ├── cludeWrapper.ts            Clude Cortex init, namespaced store/recall/clinamen/dream
│   │   ├── fragmentStorage.ts         Validate, namespace, store any fragment
│   │   ├── types.ts                   DreamFragment, JournalEntry, AgentId, InputType
│   │   └── schemas.ts                 Zod validators
│   ├── plugin-milam/                  BUILD — MILAM behavior
│   │   ├── index.ts
│   │   ├── dreamClassifier.ts         shouldRespond override
│   │   ├── wakefulnessProvider.ts     Drowsiness state machine 3→0
│   │   ├── sensoryQuestionTemplate.ts replyTemplate override (tiered)
│   │   ├── dreamCycleService.ts       Nightly cron + manual trigger endpoint
│   │   └── dreamJournalProvider.ts    Surface journal entries
│   └── plugin-rolpa/                  STUB — empty scaffold, TODO comments
│       ├── index.ts
│       └── README.md                  Architecture notes for future
├── frontend/                          BUILD — Next.js + React
│   ├── app/
│   │   ├── layout.tsx                 Root, persona provider, theme provider
│   │   ├── page.tsx                   MILAM capture + journal (mode = moon)
│   │   ├── rolpa/page.tsx             ROLPA placeholder (mode = sun)
│   │   └── api/                       Bridge to ElizaOS runtime
│   ├── components/
│   │   ├── ModeToggle.tsx             Sun/moon with View Transitions API
│   │   ├── DreamCapture.tsx           Input w/ drowsiness opacity fade
│   │   ├── SensoryQuestion.tsx        Animated reply surface
│   │   ├── DreamJournal.tsx           Morning journal reader
│   │   ├── StarrySky.tsx              Night background (canvas particles)
│   │   ├── EthericWarmth.tsx          Day background (gradient + soft orbs)
│   │   └── SolanaHashBadge.tsx        Link to Solana Explorer
│   └── styles/
│       └── tokens.css                 Design tokens (mauve, velvet, soft)
├── nos_job_def/
│   └── nosana_eliza_job_definition.json
├── Dockerfile
├── .env.example
├── manifest.json                      PWA — Seeker-ready
└── README.md                          With dual-mode architecture diagram
```

### Memory Namespace Convention
```
milam:episodic:fragment-{uuid}         Dream fragments
milam:introspective:journal-{date}     MILAM dream journal entries
milam:self_model:identity              MILAM self-concept
dreamtime:episodic:fragment-{uuid}     Promoted/shared fragments
rolpa:episodic:fragment-{uuid}         FUTURE — waking captures
```

### Fragment Schema (future-proof, populate only MILAM values)
```typescript
interface DreamFragment {
  id: string;
  agentId: 'milam' | 'rolpa';
  inputType: 'text' | 'voice' | 'link' | 'photo' | 'screenshot';
  content: string;
  sensoryDetails?: string[];
  timestamp: string;
  memoryType: 'episodic' | 'semantic' | 'introspective' | 'self_model';
  importance: number;           // 0.0–1.0
  tags: string[];
  promotable: boolean;          // can cross over to ROLPA later
  promotedAt?: string;
  dreamCycleId?: string;
  solanaHash?: string;
}
```

---

## DESIGN DIRECTION (Critical — this wins judges)

**Not dark mode vs light mode. Two entire atmospheres.**

### MILAM — Night Mode
- **Background:** Deep indigo/midnight sky with canvas-animated stars. Subtle parallax on scroll. Occasional shooting star on dream submit.
- **Typography:** Serif display for agent voice (soft, dreamy). Slightly uppercase tracking for UI labels.
- **Palette:** `#0a0e27` (midnight), `#1a1a3e` (deep purple), `#c9b8db` (soft lavender), `#f4e8d8` (moonlight cream). Velvet mauve accents.
- **Motion:** Breathing opacity on drowsiness indicator. Text fades at wakefulness 0 like someone falling asleep mid-sentence. View Transitions API for smooth state changes.
- **Texture:** Subtle grain overlay. Hand-drawn feel for the sensory question surface.

### ROLPA — Day Mode (placeholder state)
- **Background:** Warm etheric — peach/gold/soft rose gradient with slow-moving gauzy orbs of light. Not tropical; dawn-through-curtains.
- **Typography:** Same serif, lighter weight. More whitespace.
- **Palette:** `#faf0e6` (linen), `#f5d5c0` (peach), `#e8a598` (dusty rose), `#d4a574` (warm gold). Soft velvety mauve tie-in.
- **State:** "ROLPA is dreaming of the day. Coming soon." A pulsing gold orb. A single line of poetry from the MIRA persona ("She is enchanted by everything you bring her."). This is the vision slide.

### Shared
- **Mode Toggle:** Sun/moon crossfade using React `<ViewTransition>`. The entire background animates between the two atmospheres.
- **Soft buttons:** Rounded, velvety, subtle inner glow. No hard edges.
- **Accessibility:** WCAG AA contrast, `prefers-reduced-motion` respected.

**Skills to invoke during frontend build:**
- `bencium-innovative-ux-designer` — the distinctive aesthetic
- `bencium-impact-designer` — emotional resonance
- `frontend-design` — production-grade components
- `vercel-react-view-transitions` — sun/moon crossfade + drowsiness fades
- `vercel-composition-patterns` — compound components (DreamCapture, ModeToggle)
- `vercel-react-best-practices` — Next.js performance
- `typography` — quote marks, dashes, spacing correctness
- `design-audit` — final pass before demo
- `web-design-guidelines` — accessibility check

---

## 9-DAY BUILD PLAN

**Principle:** Every day ends with something demo-able. Day 3 we checkpoint and cut.

---

### DAY 1 — April 5 (Today) — Foundation + Research
**Goal:** Environment running, Clude connected, research spikes complete.

- [ ] WSL2 verify + Node 23 + bun inside WSL2
- [ ] Fork `nosana-ci/agent-challenge`, clone into `~/dreamers`
- [ ] Configure `.env` with Nosana Qwen3.5 endpoint + embedding endpoint
- [ ] Run `bun install && npx elizaos dev` → confirm default agent responds
- [ ] **Research spike #1 (30 min):** Does Clude self-hosted already use Arcium? Read clude-bot repo + docs. Answer: yes/no/partial.
- [ ] **Research spike #2 (30 min):** Noah AI for Solana app builder — what does it give us for Seeker PWA? Solana Mobile Stack dapp store requirements.
- [ ] **Research spike #3 (30 min):** ElizaOS v2 plugin API — how do `shouldRespondTemplate` and `replyTemplate` overrides actually work? Read one real example plugin.
- [ ] Sign up Supabase free tier, create project for Clude backend
- [ ] Install `clude-bot`, configure self-hosted mode
- [ ] Test `brain.store()` + `brain.recall()` with sample dream text → confirm in Supabase dashboard
- [ ] Create Solana devnet wallet, test one memo transaction
- [ ] Restructure repo to `dreamers/` layout (create empty folders from architecture above)
- [ ] Initial git commit: `feat: dreamers repo scaffold + Clude backend live`

**Demo state at EOD:** Default agent replies via Nosana, Clude stores/retrieves fragments, you have clear answers on Arcium + Seeker + ElizaOS API.

---

### DAY 2 — April 6 — Shared Core + MILAM Character
**Goal:** Typed, namespaced storage working. MILAM talks in-voice.

- [ ] `plugin-dreamers-core/types.ts` — full DreamFragment + JournalEntry + AgentId + InputType
- [ ] `plugin-dreamers-core/schemas.ts` — Zod validators
- [ ] `plugin-dreamers-core/cludeWrapper.ts` — init + namespaced store/recall/clinamen/dream
- [ ] `plugin-dreamers-core/fragmentStorage.ts` — validate, namespace, store
- [ ] `plugin-dreamers-core/index.ts` — Plugin registration
- [ ] Manual test script: store 5 fragments via fragmentStorage → recall them → run clinamen → inspect output
- [ ] `plugin-rolpa/index.ts` — empty stub with architecture TODO comments
- [ ] `characters/milam.character.json` — full Dreamer persona (copy from execution plan lines 156–222, rename to Milam)
- [ ] `characters/rolpa.character.json` — full MIRA/ROLPA persona (from MIRARI doc), no plugin wiring
- [ ] Test: agent responds in Milam voice (sensory, brief, dreamy)
- [ ] Commit: `feat: shared core plugin with Clude + namespaced schema + both character files`

**Demo state:** Milam talks like a dreamer. Memory layer stores typed, validated, namespaced fragments.

---

### DAY 3 — April 7 — MILAM Behavior: Classifier + Wakefulness + Sensory
**Goal:** The drowsiness arc works end-to-end. This alone is a winning demo.

**⚠️ CHECKPOINT DAY.** At end of day, honest scope assessment. If behind, cut voice input, simplify frontend, drop Arcium. Proceed to Day 4 only if drowsiness arc is clean.

- [ ] `plugin-milam/dreamClassifier.ts` — shouldRespond override (prompt-based + keyword fallback)
- [ ] `plugin-milam/wakefulnessProvider.ts` — state machine 3→2→1→0, dream resets to 3
- [ ] `plugin-milam/sensoryQuestionTemplate.ts` — replyTemplate override, tiered by wakefulness:
  - 3: full sensory question (color, temp, sound, texture, smell)
  - 2: shorter question OR brief mirror
  - 1: echo one word
  - 0: silence
- [ ] Wire all three into `milam.character.json` plugin config
- [ ] Wire fragment storage: every human message → `fragmentStorage.store()`
  - Dreams: importance 0.8–1.0, tag `dream`
  - Non-dreams: importance 0.2–0.4, tag `silent-feeling`
- [ ] Manual test the full arc:
  1. Send dream → sensory question (awake)
  2. Reply → shorter question (drowsy)
  3. Reply → one-word echo (drifting)
  4. Reply → silence (asleep)
  5. Send task → silence, but stored as silent-feeling
  6. Send new dream → agent wakes
- [ ] Commit: `feat: MILAM full conversational arc with drowsiness + sensory questions + fragment storage`

**Demo state:** The silence demo works. If everything after this breaks, you still have a submission.

**Checkpoint questions:**
- Is the drowsiness arc feeling real?
- Is the sensory question actually sensory (not therapy)?
- Are fragments accumulating correctly?
- Any ElizaOS API surprises?
- Time honestly spent vs. planned?
→ **Cut decisions:** Voice input? Arcium? Second mode background detail? Decide now.

---

### DAY 4 — April 8 — Dream Cycle Pipeline
**Goal:** Given fragments, produce a poetic journal entry.

- [ ] `plugin-milam/dreamCycleService.ts` — ElizaOS Service
- [ ] Implement 8 steps:
  1. Recall today's fragments from Clude (date filter)
  2. Run `brain.clinamen()` — unexpected connections
  3. Run `brain.dream()` — 5-phase consolidation
  4. Capture `onEmergence` output
  5. Compose dream generation prompt (fragments + clinamen + emergence)
  6. Send to Qwen3.5 on Nosana (this is the GPU burst)
  7. Store journal as `milam:introspective:journal-{date}` in Clude
  8. Hash to Solana devnet
- [ ] Dream generation prompt (first draft):
  ```
  You are Milam, a dreamer. These are the fragments from today:
  {fragments}

  These unexpected connections surfaced:
  {clinamen_results}

  This emerged from consolidation:
  {emergence}

  Dream them into a single dream journal entry.
  Use vivid imagery. First person. Present tense.
  No analysis. No bullet points. No therapy language.
  No "I noticed" or "I see a pattern."
  Dream.
  ```
- [ ] Manual trigger endpoint: `POST /api/trigger-dream-cycle` (for demo + future paid feature)
- [ ] Run the cycle 3+ times with YOUR real dreams. Read every output aloud.
- [ ] Tune the prompt until it *dreams*, not reports.
- [ ] Commit: `feat: dream cycle pipeline + manual trigger endpoint`

**Demo state:** Feed fragments in. Get a real dream journal out. Read it aloud. This is the payoff moment.

---

### DAY 5 — April 9 — Scheduling + Journal Provider + Frontend Scaffold
**Goal:** Cron fires nightly, journal is queryable, Next.js app is live.

**Morning — backend polish:**
- [ ] Wire cron (node-cron): default 3am UTC, configurable
- [ ] Keep manual trigger for demo
- [ ] `plugin-milam/dreamJournalProvider.ts` — retrieve latest journal entries as ElizaOS Provider
- [ ] Verify end-to-end: schedule fires → journal written → retrievable by provider

**Afternoon — frontend scaffold:**
- [ ] `npx create-next-app@latest frontend` inside `dreamers/`
- [ ] Install Tailwind, Framer Motion, shadcn/ui
- [ ] `styles/tokens.css` — design token system (midnight, moonlight, peach, mauve)
- [ ] Root layout with theme provider
- [ ] Basic routing: `/` (MILAM), `/rolpa` (ROLPA placeholder)
- [ ] Bridge API route to ElizaOS runtime (send message, receive reply, fetch journal)
- [ ] **Invoke `frontend-design` skill for component design pass**
- [ ] Commit: `feat: nightly scheduling + journal provider + Next.js scaffold`

**Demo state:** Dream cycle schedules. Next.js app boots. Mode routes work.

---

### DAY 6 — April 10 — Frontend: MILAM Night Mode (the beautiful one)
**Goal:** The night mode experience is stunning enough to demo by itself.

- [ ] **Invoke `bencium-innovative-ux-designer` skill** for the aesthetic direction
- [ ] `StarrySky.tsx` — canvas-animated starfield, parallax, occasional shooting star
- [ ] `DreamCapture.tsx` — centered input, serif typography, soft velvet button
- [ ] `SensoryQuestion.tsx` — fade-in reply surface, drowsiness-aware opacity
- [ ] `DreamJournal.tsx` — morning view of the agent's dream, poetry-formatted
- [ ] `SolanaHashBadge.tsx` — soft pill linking to Solana Explorer
- [ ] Drowsiness visual: breathing CSS animation on the input area, fades with each response
- [ ] View Transitions on state changes (message send, wakefulness decrement, mode switch)
- [ ] **Invoke `typography` skill** for quote marks, dashes, hierarchy
- [ ] Mobile-responsive: test on phone at local network IP
- [ ] PWA manifest.json + service worker (Seeker-ready)
- [ ] Commit: `feat: MILAM night mode frontend — stunning`

**Demo state:** Open the app on your phone. Type a dream. Watch the stars. Read the morning journal. This is gorgeous.

---

### DAY 7 — April 11 — ROLPA Placeholder + Mode Toggle + Integration Test
**Goal:** Full dual-mode UI. Everything works end-to-end deployed locally.

- [ ] `EthericWarmth.tsx` — warm gradient + gauzy orbs, slow motion
- [ ] `/rolpa` page — ROLPA persona text, pulsing gold orb, "Coming soon" with poetry
- [ ] `ModeToggle.tsx` — sun/moon crossfade using View Transitions API
- [ ] Transition between modes animates the entire background
- [ ] **Invoke `design-audit` skill** — final visual pass
- [ ] **Invoke `web-design-guidelines` skill** — accessibility + UX
- [ ] Full integration test:
  1. Open app on phone
  2. Write dream in MILAM mode
  3. Drowsiness arc plays out fully
  4. Try a task → silence
  5. New dream → wakes
  6. Trigger dream cycle manually via button
  7. Journal appears with real Solana hash
  8. Toggle to ROLPA → warm etheric mode fades in
  9. Toggle back → starry night fades in
- [ ] Fix every bug found
- [ ] Commit: `feat: dual-mode UI with view transitions + full integration`

**Demo state:** The complete product. Both modes. Real journal. Phone-ready.

---

### DAY 8 — April 12 — Docker + Nosana Deploy + (Optional) Arcium
**Goal:** Deployed on Nosana. Mainnet Solana. Optional Arcium integration.

**Morning — deployment:**
- [ ] Dockerfile for the agent runtime
- [ ] Docker build + test locally
- [ ] Push to Docker Hub
- [ ] Write `nosana_eliza_job_definition.json`
- [ ] Deploy to Nosana, verify it runs in their infra
- [ ] Switch Solana from devnet to mainnet-beta (fund wallet ~$0.50)

**Afternoon — Arcium stretch (only if ahead):**
- [ ] Revisit Day 1 research: does Clude already wrap Arcium? If yes, enable it in config. If no:
- [ ] Add Arcium SDK to project, wrap the fragment storage write path with encrypted computation
- [ ] If integration takes >2 hours, abort and add "designed for Arcium MPC" to README instead
- [ ] Commit: `feat: Nosana deployment + mainnet Solana` (+ Arcium if successful)

**Demo state:** Running on Nosana. Real mainnet hashes. Optional encrypted compute layer.

---

### DAY 9 — April 13 — Demo Video + README + Submit
**Goal:** Submitted.

**Morning — demo recording (3 minutes):**
- [ ] 0:00–0:25 — You on camera: *"I have dreams I lose by breakfast. Every AI I try wants to DO something with them. I don't want to do. I want to dream."*
- [ ] 0:25–0:55 — Open MILAM on phone. Write a real dream. Sensory question. Drowsiness arc. Silence.
- [ ] 0:55–1:20 — *"Hey, help me write an email."* Silence. *"It's not broken. It's asleep."*
- [ ] 1:20–1:50 — Trigger dream cycle manually. Show the journal. Read it aloud slowly. Let it land.
- [ ] 1:50–2:15 — Show Nosana GPU logs (quiet day, night burst). Show Solana Explorer transaction.
- [ ] 2:15–2:35 — Toggle to ROLPA. Warm etheric mode fades in. *"This is ROLPA. She holds everything, notices connections across time, points never prescribes. Shipping next. Same architecture, same memory, same Clude."*
- [ ] 2:35–2:50 — *"And this is just the beginning. Every encrypted dream becomes training data for the DREAMER MODEL — a base model that learns to dream from dreamers, without ever seeing a single dream. Arcium makes it possible. Nous Research showed the way. Weird models matter."*
- [ ] 2:50–3:00 — Close with Watts quote on screen.

**Afternoon — README + submit:**
- [ ] README.md: architecture diagram, dual-mode explanation, setup, ecosystem integrations (ElizaOS + Nosana + Clude + Seeker), future roadmap (ROLPA, LoRA, Arcium if not built, TurboQuant)
- [ ] Screenshots: MILAM night mode, sensory question, dream journal, mode toggle, Solana hash
- [ ] Final deployed test
- [ ] Submit to hackathon
- [ ] Post on X tagging @nosana_ai @elizaOS @CludeProject @solanamobile
- [ ] Breathe

**Demo state:** Submitted.

---

## SCOPE DECISIONS

### BUILDING
- Plugin split (dreamers-core + plugin-milam + plugin-rolpa stub) ✓
- MILAM full behavior (classifier, wakefulness, sensory, fragment storage, dream cycle) ✓
- Next.js + React frontend with stunning night mode + ROLPA placeholder ✓
- Sun/moon mode toggle with View Transitions ✓
- PWA manifest + service worker (Seeker-ready) ✓
- Manual dream cycle trigger endpoint (demo + future paid feature) ✓
- Clude self-hosted with namespaced keys ✓
- Solana mainnet memo hashing ✓
- Docker + Nosana deployment ✓

### BUILDING (promoted from stretch)
- Arcium MPC wrapper on fragment storage write path (Day 8, architecturally essential for DREAMER MODEL thesis)

### STRETCH (Day 8, only if ahead)
- Voice memo capture (Web Speech API)
- Dual journal view (your captures alongside agent dreams)
- Dream history scrollback

### CUT — POST-HACKATHON
- DREAMER MODEL training (Phase 2 flywheel — Nous-style fine-tune on full encrypted corpus via Arcium federated training)
- LoRA per-user nightly adapters (superseded by DREAMER MODEL thesis)
- TurboQuant KV cache (only matters if self-hosting model)
- Knowledge graph (Clude handles this)
- ROLPA actual functionality (funded build)
- Connection engine (ROLPA territory)
- Multi-agent dreaming
- DREAMS MODEL fine-tuning
- Input sanitization / purity scan
- Custom persona selection
- Share sheet / browser extension / Telegram ingestion

---

## RISK MANAGEMENT

| Risk | Day | Mitigation |
|---|---|---|
| Clude self-hosted setup breaks | 1 | Fall back to local JSON mode after 3 hours. Lose clinamen, fake it with random high-importance recall. |
| ElizaOS plugin API is weird | 3 | If override mechanism doesn't work, handle logic in character system prompt. Uglier but works. |
| Dream cycle output feels generic | 4 | Budget 2+ hours for prompt tuning. Use YOUR real dreams. Read aloud as tuning signal. |
| Frontend takes too long | 6 | Checkpoint Day 3 already cut voice. If Day 6 slips, skip ROLPA background detail and use a simpler gradient. Night mode must stay stunning. |
| Nosana deployment fails | 8 | Demo from local machine. Product is identical. |
| Arcium takes too long | 8 | 2-hour timebox. Abort to "designed for Arcium" README claim. |

---

## DAY 3 CHECKPOINT — CUT CRITERIA

At end of Day 3, answer honestly:
1. Does the drowsiness arc feel real to you emotionally? (yes/no)
2. Is sensory question actually sensory? (yes/no)
3. Fragments storing correctly? (yes/no)
4. Any ElizaOS API surprises still blocking? (yes/no)
5. Hours over or under plan?

**If 3+ "no" or >6 hours over:** Cut voice input entirely, simplify ROLPA placeholder to static page, drop Arcium, use simpler frontend animations. Core product (drowsiness + cycle + journal + stunning night mode) is non-negotiable.

---

## THE WINNING DEMO MOMENT

When you ask MILAM a task and it doesn't respond — that silence is the demo. Every other hackathon entry will have agents DOING things. You'll have one that's asleep. Let the silence hang for 3 full seconds. Then: *"It's not broken. It's asleep. Dreams are the only coffee."*

The dream journal read aloud is the payoff. Slowly. In your voice. Real dreams.

The sun/moon toggle is the vision. Judges see the whole product even though only half ships.

---

## NOTES

- **Workspace:** `C:/Users/JBOO/dreams/` (moved from Drive 2026-04-06 for SSD speed)
- **Reference docs:** DREAMS_Deep_Exploration.md, DREAMS_Agent_Behavior_Design.md, DREAMS_Execution_Plan.md, MIRARI_Product_Document.md
- **Repo will live at:** `~/dreamers` (inside WSL2)
- **Design aesthetic memory:** light/soft/boho/velvet/mauve — but MILAM night mode is midnight+moonlight. Mauve is the tie-in accent across both modes.
- **Always React:** confirmed — Next.js for frontend.

*Nine days. Ship it.*
