# DREAMERS -- Technical Architecture and 9-Day Build Plan
**Date:** April 4, 2026 | **Deadline:** April 14, 2026 | **Days Remaining:** 9 (including today)
**Scope:** Ship MILAM (night mode). Architect for ROLPA (day mode) later.
**Stack:** ElizaOS v2 + Nosana GPU (Qwen3.5-27B-AWQ-4bit) + Clude (Solana L2 memory) + Seeker PWA

---

## 1. Architecture Diagram

```
BUILD NOW (MILAM)                          STUB FOR LATER (ROLPA)
=============================              =============================

Human (Seeker PWA)                         Human (Seeker PWA / share sheet)
  |  dream text, voice memo                  |  braindumps, links, voice,
  |                                          |  photos, screenshots
  v                                          v
ElizaOS Agent: MILAM                       ElizaOS Agent: ROLPA
  character: milam.character.json            character: rolpa.character.json
  plugins:                                   plugins:
    @elizaos/plugin-openai                     @elizaos/plugin-openai
    @elizaos/plugin-bootstrap                  @elizaos/plugin-bootstrap
    plugin-dreamers-core  <--SHARED-->         plugin-dreamers-core
    plugin-milam          <--MILAM ONLY-->     plugin-rolpa (future)
  |                                          |
  v                                          v
SHARED INFRASTRUCTURE (build now)
===================================
  Clude Memory Layer (self-hosted)
    Supabase backend
    Memory types:
      episodic   -- raw fragments (dreams AND waking captures)
      semantic   -- patterns across time
      introspective -- agent journal entries
      self_model -- agent identity evolution
    Namespaced by agent: milam.* / rolpa.*
    Shared Dreamtime namespace: dreamtime.*
    brain.store() / brain.recall() / brain.clinamen() / brain.dream()
    Solana memo hashing
  |
  v
Nosana GPU Compute
  Daytime: tiny inference (free endpoint)
  Nighttime: dream cycle burst (Qwen3.5-27B-AWQ-4bit)
```

### What Gets Built Now

| Component | Status |
|---|---|
| `plugin-dreamers-core` (shared memory ops, Clude wrapper, fragment storage) | BUILD |
| `plugin-milam` (dream classifier, wakefulness, sensory questions, dream cycle) | BUILD |
| `milam.character.json` | BUILD |
| Clude memory layer with namespaced schema | BUILD |
| Seeker PWA (dream capture + journal display) | BUILD (minimal) |
| Dream cycle scheduler + Nosana burst | BUILD |
| Solana memo hashing | BUILD |
| Docker deployment for Nosana | BUILD |

### What Gets Stubbed

| Component | Stub Strategy |
|---|---|
| `rolpa.character.json` | Write the file, don't wire it up |
| `plugin-rolpa` | Empty plugin scaffold with TODO comments |
| Dream promotion (MILAM -> ROLPA) | Add `promotable: boolean` field to fragment schema now, no UI |
| Multi-input ingestion (links, photos, share sheet) | Add `inputType` field to fragment schema, only implement `text` and `voice` |
| Connection engine | No stub needed. This is ROLPA-only logic |
| Knowledge graph | No stub. Post-funding |

---

## 2. What Changes from the Original DREAMS Plan

The original execution plan is solid. These are the specific changes driven by the MIRARI evolution.

### 2a. Plugin architecture splits

**Before:** One monolithic `plugin-dreams` with 6 components.
**After:** Two plugins sharing a core.

```
plugin-dreamers-core/          <-- shared infrastructure
  index.ts                     Plugin registration
  cludeWrapper.ts              Clude Cortex init, brain.store/recall/clinamen/dream
  fragmentStorage.ts           Store any fragment (dream or waking) with metadata
  types.ts                     Shared TypeScript types for both agents
  schemas.ts                   Zod schemas for fragment, journal, memory ops

plugin-milam/                  <-- MILAM-specific behavior
  index.ts                     Plugin registration
  dreamClassifier.ts           shouldRespond override (dream vs non-dream)
  wakefulnessProvider.ts       Drowsiness state machine (3->2->1->0)
  sensoryQuestionTemplate.ts   replyTemplate override (tiered by wakefulness)
  dreamCycleService.ts         Nightly cron: clinamen + dream() + journal gen
  dreamJournalProvider.ts      Surface journal entries for display

plugin-rolpa/                  <-- FUTURE, stub only
  index.ts                     Empty plugin, exports nothing
  README.md                    Architecture notes for future builder
```

**Why this matters:** When ROLPA gets built, it imports `plugin-dreamers-core` and adds its own behavior layer. No refactoring needed. Both agents share the same Clude instance, same fragment storage, same memory schema.

### 2b. Fragment schema gains future-proof fields

**Before:** Fragments had `type` and `importance` only.
**After:** Add fields that ROLPA will need, populate only the MILAM-relevant ones now.

```typescript
interface DreamFragment {
  id: string;
  agentId: 'milam' | 'rolpa';           // NEW: which agent received it
  inputType: 'text' | 'voice' | 'link' | 'photo' | 'screenshot'; // NEW: only text/voice used now
  content: string;
  sensoryDetails?: string[];             // NEW: extracted from follow-up question answers
  timestamp: string;
  memoryType: 'episodic' | 'semantic' | 'introspective' | 'self_model';
  importance: number;                    // 0.0-1.0
  tags: string[];                        // e.g., ['dream', 'shower-thought', 'silent-feeling']
  promotable: boolean;                   // NEW: can this be promoted to ROLPA context?
  promotedAt?: string;                   // NEW: when it crossed over (null for now)
  dreamCycleId?: string;                 // NEW: which dream cycle consumed this fragment
  solanaHash?: string;                   // set after on-chain write
}
```

### 2c. Character file renamed and updated

**Before:** `dreamer.character.json`, name "Dreams"
**After:** `milam.character.json`, name "Milam"

The character file content (system prompt, style rules, message examples, drowsiness mechanic) stays identical. The behavioral design doc is excellent and nothing in MIRARI changes how MILAM acts. Only the naming changes to fit the DREAMERS umbrella.

### 2d. Clude memory gets namespace prefixes

**Before:** Flat memory -- all fragments in one pool.
**After:** Namespace convention so two agents can share a Clude instance.

```
milam:episodic:fragment-{uuid}    -- dream fragments from MILAM
milam:introspective:journal-{date} -- MILAM dream journal entries
milam:self_model:identity          -- MILAM self-concept
dreamtime:episodic:fragment-{uuid} -- shared fragments (promoted dreams)
rolpa:episodic:fragment-{uuid}     -- FUTURE: waking captures from ROLPA
```

Implementation: prefix strings on Clude `brain.store()` key parameter. Simple string convention, no schema migration needed.

### 2e. Project directory restructure

**Before:**
```
dreams-agent/
  characters/dreamer.character.json
  src/plugin-dreams/...
```

**After:**
```
dreamers/
  characters/
    milam.character.json
    rolpa.character.json          (stub)
  src/
    plugin-dreamers-core/
      index.ts
      cludeWrapper.ts
      fragmentStorage.ts
      types.ts
      schemas.ts
    plugin-milam/
      index.ts
      dreamClassifier.ts
      wakefulnessProvider.ts
      sensoryQuestionTemplate.ts
      dreamCycleService.ts
      dreamJournalProvider.ts
    plugin-rolpa/
      index.ts                    (empty stub)
  frontend/
    index.html
    style.css
    app.js
  nos_job_def/
    nosana_eliza_job_definition.json
  Dockerfile
  .env.example
  package.json
```

---

## 3. What Stays the Same

Everything behavioral. The MIRARI doc adds scope, it does not change how MILAM acts. These survive intact:

- **Drowsiness mechanic** (3->2->1->0->silence). Unchanged.
- **Sensory question logic** (color, temperature, sound, texture, smell). Unchanged.
- **Dream classifier** (dream vs non-dream, shouldRespond override). Unchanged.
- **Dream cycle pipeline** (recall -> clinamen -> brain.dream() -> Qwen3.5 journal -> Solana hash). Unchanged.
- **Character file voice** (system prompt, style rules, message examples, "water not fire"). Unchanged.
- **Nosana compute pattern** (quiet during day, burst at night). Unchanged.
- **Cost model** (~$2-3 total for hackathon). Unchanged.
- **Demo script** (silence is the demo, journal is the payoff, GPU graph is the proof). Unchanged.
- **Fragment storage to Clude** (every message -> brain.store()). Unchanged, just gains extra metadata fields.

The original DREAMS execution plan was focused and correct. The MIRARI evolution is an expansion, not a correction.

---

## 4. Shared Infrastructure (Must Exist for Both Modes)

These are the components that MUST be built in a way that serves ROLPA later, even though only MILAM uses them now.

### 4a. Clude Memory Layer

```
Supabase project (free tier)
  |
  Clude self-hosted mode
  |
  brain.store(key, content, metadata)     -- namespaced keys
  brain.recall(query, options)            -- semantic search across namespaces
  brain.clinamen(context, options)        -- unexpected connections
  brain.dream(options)                    -- 5-phase consolidation
  Solana memo hashing                     -- on-chain provenance
```

Both MILAM and ROLPA will call the same Clude functions. The namespace prefix is the only differentiator.

### 4b. Fragment Storage Service

The `fragmentStorage.ts` in `plugin-dreamers-core` handles:
- Accepting a fragment from any agent
- Validating against Zod schema
- Assigning namespace prefix based on agentId
- Calling `brain.store()` with full metadata
- Returning the stored fragment with ID

Both plugins import this. Neither implements their own storage.

### 4c. Types and Schemas

`types.ts` defines `DreamFragment`, `JournalEntry`, `DreamCycle`, `AgentId`, `InputType`.
`schemas.ts` provides Zod validators for each.

Both plugins import these. This is the contract.

### 4d. ElizaOS Multi-Agent Config

ElizaOS v2 supports multiple characters. The project structure already supports this:

```json
// elizaos.config.ts or equivalent
{
  "characters": [
    "./characters/milam.character.json"
    // future: "./characters/rolpa.character.json"
  ]
}
```

Only MILAM is loaded for hackathon. Adding ROLPA later is a one-line config change.

---

## 5. Nine-Day Build Plan

**Assumptions:**
- Day 1 environment setup (WSL2, Node 23, bun, repo fork) is already done or nearly done from the April 3 plan.
- If not done, Day 1 below absorbs it. Everything shifts by 1 day, and Day 9 demo prep gets compressed.
- Each day is a single focus. No multi-tracking.

### Day 1 (April 4) -- Environment + Clude Setup

If WSL2/ElizaOS is already running from yesterday:
- [ ] Restructure repo from `dreams-agent` to `dreamers` directory layout (section 2e above)
- [ ] Rename `dreamer.character.json` to `milam.character.json`, update name field
- [ ] Create `rolpa.character.json` stub (copy milam, change name/system to placeholder)
- [ ] Sign up Supabase free tier, create project
- [ ] `npm install clude-bot` in project (inside WSL2)
- [ ] Configure Clude self-hosted mode with Supabase credentials in `.env`
- [ ] Write and run a test script: `brain.store()`, `brain.recall()`, `brain.clinamen()` with sample dream text
- [ ] Confirm Supabase dashboard shows stored memories
- [ ] Create Solana devnet wallet, test memo transaction

If WSL2/ElizaOS is NOT running yet:
- [ ] Complete all tasks from `2026-04-03-dreams-day1-foundation.md` FIRST
- [ ] Then do Clude setup above
- [ ] Skip Solana test (push to Day 2)

**Exit criteria:** Clude stores and retrieves dream fragments. ElizaOS default agent runs.

### Day 2 (April 5) -- Shared Core Plugin + Types

- [ ] Create `src/plugin-dreamers-core/types.ts` with full TypeScript types (section 2b)
- [ ] Create `src/plugin-dreamers-core/schemas.ts` with Zod validators
- [ ] Create `src/plugin-dreamers-core/cludeWrapper.ts` -- initialize Clude, expose namespaced store/recall/clinamen/dream
- [ ] Create `src/plugin-dreamers-core/fragmentStorage.ts` -- validate, namespace, store
- [ ] Create `src/plugin-dreamers-core/index.ts` -- ElizaOS Plugin interface, register providers
- [ ] Write a manual test: store 5 dream fragments via fragmentStorage, recall them, run clinamen
- [ ] Create `src/plugin-rolpa/index.ts` as empty stub with TODO comments
- [ ] Git commit: "feat: shared core plugin with Clude integration and typed fragment storage"

**Exit criteria:** `plugin-dreamers-core` stores and retrieves typed, validated, namespaced fragments through Clude.

### Day 3 (April 6) -- MILAM Dream Classifier + Wakefulness

- [ ] Create `src/plugin-milam/index.ts` -- Plugin registration, imports dreamers-core
- [ ] Create `src/plugin-milam/dreamClassifier.ts` -- override shouldRespondTemplate
  - Prompt-based classification: dream/memory/fragment/feeling -> RESPOND, task/question/request -> IGNORE
  - Keyword fallback: dreamed, dream, felt, saw, remembered, woke up, shower thought
- [ ] Create `src/plugin-milam/wakefulnessProvider.ts`
  - State per conversation: wakefulness 0-3
  - Dream input resets to 3
  - Each agent response decrements by 1
  - At 0: force IGNORE until next dream
  - Inject into agent state
- [ ] Wire both into `milam.character.json` plugin config
- [ ] Test: send dream -> agent responds. Send task -> silence. Send 4 dreams -> agent gets sleepier.
- [ ] Git commit: "feat: MILAM dream classifier and drowsiness state machine"

**Exit criteria:** MILAM wakes for dreams, sleeps for tasks, gets drowsier with each exchange, resets on new dream.

### Day 4 (April 7) -- Sensory Questions + Fragment Storage Wiring

- [ ] Create `src/plugin-milam/sensoryQuestionTemplate.ts` -- override replyTemplate
  - Wakefulness 3: full sensory question (color, temp, sound, texture, smell)
  - Wakefulness 2: shorter question or brief mirror
  - Wakefulness 1: echo one word
  - Wakefulness 0: silence (handled by wakefulnessProvider)
- [ ] Wire fragment storage: every incoming human message -> fragmentStorage.store()
  - Dreams: importance 0.8-1.0, tag `dream`
  - Non-dreams: importance 0.2-0.4, tag `silent-feeling`
  - Agent responses (sensory questions): stored as `agent-response` tag, importance 0.5
- [ ] Test full conversational arc end-to-end:
  - Write dream -> sensory question -> answer -> shorter question -> echo -> silence
  - Write non-dream -> silence (but verify it was stored in Clude)
  - Write new dream -> agent wakes up
- [ ] Verify Supabase dashboard shows all fragments with correct metadata
- [ ] Git commit: "feat: MILAM sensory question generation and fragment storage pipeline"

**Exit criteria:** The conversational experience described in the Agent Behavior Design doc works. Fragments accumulate in Clude.

### Day 5 (April 8) -- Dream Cycle Pipeline

This is the hardest day. The dream cycle is the core product.

- [ ] Create `src/plugin-milam/dreamCycleService.ts` as ElizaOS Service
- [ ] Implement step-by-step:
  1. Recall today's fragments from Clude (`brain.recall()` with date filter)
  2. Run `brain.clinamen()` with today's context -- get unexpected connections
  3. Run `brain.dream()` -- Clude's 5-phase consolidation
  4. Capture `onEmergence` output
  5. Compose dream generation prompt (fragments + clinamen results + emergence)
  6. Send to Qwen3.5 on Nosana (GPU burst inference call)
  7. Store journal entry as `milam:introspective:journal-{date}` in Clude
  8. Hash to Solana (devnet)
- [ ] The dream generation prompt is critical. First draft:

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

- [ ] Run the cycle manually (don't wait for cron). Feed it real dream fragments.
- [ ] Read the output. Is it dreaming or analyzing? Tune the prompt.
- [ ] Git commit: "feat: MILAM dream cycle pipeline with Clude consolidation and Nosana generation"

**Exit criteria:** Given fragments, the dream cycle produces a journal entry that reads like a dream, not a report.

### Day 6 (April 9) -- Dream Cycle Scheduling + Journal Provider + Tuning

- [ ] Wire cron scheduling into dreamCycleService (node-cron or ElizaOS cron plugin)
  - Default: 3am UTC, configurable via env var
  - Also expose manual trigger for testing/demo
- [ ] Create `src/plugin-milam/dreamJournalProvider.ts`
  - Retrieves latest `milam:introspective:journal-*` entries from Clude
  - Formats for display (date, content, solana hash link)
  - Exposes as ElizaOS Provider so frontend can query it
- [ ] Tune dream generation with real dreams (use your own)
  - Run 3-5 cycles with different fragment sets
  - Adjust prompt if output is too analytical, too short, or too generic
  - Adjust clinamen parameters (minImportance, limit) if connections are too random or too obvious
- [ ] Wire Solana mainnet-beta for demo (switch from devnet)
- [ ] Git commit: "feat: dream cycle scheduling, journal provider, and prompt tuning"

**Exit criteria:** Dream cycle fires on schedule, journal entries are retrievable and poetic, Solana hashes are real.

### Day 7 (April 10) -- Frontend (PWA)

Minimal. Do not overbuild. This is a hackathon demo, not a product launch.

- [ ] `frontend/index.html` -- single page, two views:
  - **Capture view:** text input (large, minimal, centered), subtle drowsiness indicator (opacity/breathing), agent response area (fades in/out)
  - **Journal view:** MILAM's dream journal entries, reverse chronological, each with Solana hash link
- [ ] `frontend/style.css` -- light/soft palette (per design aesthetic: boho, velvet, mauve, soft buttons). NOT dark theme.
- [ ] `frontend/app.js` -- WebSocket or REST to ElizaOS agent, send messages, receive responses, fetch journal entries
- [ ] Voice memo capture: Web Audio API -> record -> send as text (transcription via Nosana Qwen3.5 or browser SpeechRecognition API as fallback)
  - If voice is too complex, cut it. Text-only is fine for demo.
- [ ] Mobile-responsive basics (viewport meta, flex layout)
- [ ] PWA manifest.json + service worker (minimal -- just enough for "Add to Home Screen")
- [ ] Test on phone browser (access via local network IP)
- [ ] Git commit: "feat: Seeker PWA with dream capture and journal display"

**Exit criteria:** You can capture a dream on your phone, see the agent respond with drowsiness, and read the morning journal.

### Day 8 (April 11) -- Integration Test + Docker + Demo Prep

- [ ] Full end-to-end test:
  1. Open PWA on phone
  2. Write a dream
  3. Agent asks sensory question (wakefulness 3)
  4. Answer it
  5. Agent mirrors (wakefulness 2)
  6. Write more
  7. Agent echoes one word (wakefulness 1)
  8. Write more
  9. Silence (wakefulness 0)
  10. Try asking a task -> silence
  11. Write new dream -> agent wakes
  12. Trigger dream cycle manually
  13. Check journal view -> journal entry appears
  14. Check Solana Explorer -> hash exists
- [ ] Fix every bug found. This is the integration day.
- [ ] Docker build:
  ```bash
  docker build -t dreamers-milam .
  docker run --env-file .env dreamers-milam
  ```
- [ ] Push to Docker Hub
- [ ] Write Nosana job definition (update `nos_job_def/nosana_eliza_job_definition.json`)
- [ ] Deploy to Nosana, confirm it runs in their infrastructure
- [ ] Git commit: "feat: Docker deployment and Nosana job definition"

**Exit criteria:** The full MILAM experience works deployed on Nosana, not just locally.

### Day 9 (April 12-13) -- Demo Video + README + Submit

This is two calendar days compressed into one work unit. Use the time.

- [ ] Record demo video (3 minutes per hackathon guidelines):
  - 0:00-0:30 -- You on camera. "I have dreams, shower thoughts, half-formed ideas. I lose them all."
  - 0:30-1:00 -- Write in a real dream. MILAM asks one sensory question. Drifts off.
  - 1:00-1:30 -- Try asking it a task. Silence. "It's not broken. It's asleep."
  - 1:30-2:00 -- Morning: show the dream journal. Read it aloud. Let it land.
  - 2:00-2:30 -- Show Nosana GPU logs: quiet during day, burst at night. "It dreams like a brain."
  - 2:30-3:00 -- Show Solana Explorer: "Your dream, on-chain, yours forever." Close with Watts quote.
- [ ] Write README.md:
  - Architecture diagram (text version from this doc)
  - Setup instructions
  - What it does / why it matters
  - Screenshots of PWA and journal
  - Nosana integration details
  - Clude integration details
  - Future: ROLPA day mode (brief mention, shows architectural foresight)
- [ ] Final deployed test on Nosana
- [ ] Submit to hackathon
- [ ] Post on X

**Exit criteria:** Submitted. Done.

---

## 6. Risk Assessment

### Real Risks (mitigate these)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Clude self-hosted setup is complex** | HIGH | HIGH | Day 1 priority. If Clude self-hosted fails after 3 hours, fall back to local JSON mode (`~/.clude/memories.json`). You lose Solana hashing and clinamen, but you keep fragment storage. Fake the clinamen with random high-importance recall. |
| **Dream cycle output is generic/analytical** | HIGH | HIGH | Day 5-6 prompt tuning with real dreams. This is subjective work -- you have to read the output and feel whether it's dreaming or reporting. Budget 2-3 hours on Day 6 purely for this. |
| **ElizaOS plugin API is unfamiliar** | MEDIUM | HIGH | Day 3 is the plugin API learning day. If the shouldRespond/replyTemplate overrides don't work as documented, pivot to handling it entirely within the character system prompt (less clean, but works). |
| **WSL2 environment issues** | MEDIUM | MEDIUM | Already have a Day 1 plan for this. Docker fallback exists. |
| **Frontend takes too long** | MEDIUM | LOW | The frontend can be a single HTML file with 200 lines of JS. It does not need to be beautiful for the demo. If Day 7 is going badly, cut voice, cut PWA, ship a text box and a journal div. |
| **Nosana deployment fails** | LOW | HIGH | Test Docker locally first (Day 8). If Nosana deployment is broken, demo from local machine -- the product works the same way, just running locally instead of on Nosana hardware. |

### Traps (avoid these)

| Trap | Why It's a Trap | What to Do Instead |
|---|---|---|
| **Trying to make the frontend beautiful before the backend works** | You have 9 days. A beautiful UI with no dream cycle is a failure. An ugly UI with a working dream cycle wins. | Backend first (Days 1-6). Frontend last (Day 7). |
| **Tuning the dream classifier with ML** | The dream classifier doesn't need to be smart. It needs to work. A prompt + keyword fallback is enough. | Keep it simple. Prompt + keywords. Move on. |
| **Spending time on voice transcription** | Web Audio API -> transcription is a rabbit hole. Browser SpeechRecognition API is unreliable. | Text input only for hackathon. Voice is stretch goal if Day 7 finishes early. |
| **Building ROLPA features "since you're already in there"** | The memory file says it explicitly: "Don't let WAKING DREAMS features creep into DREAMS during hackathon." | Stub the schema fields. Write the empty plugin. Do not implement any ROLPA behavior. |
| **Overcomplicating the namespace scheme** | String prefixes on Clude keys are enough. Don't build a multi-tenant abstraction layer. | `milam:episodic:fragment-{uuid}` is a string. That's it. |

---

## 7. What to Cut

### CUT -- Not Hackathon Scope

| Feature | Why Cut | When to Build |
|---|---|---|
| **LoRA adapter** (nightly refinement on dreams corpus) | Requires training infrastructure, dataset curation, model hosting. 3-week project minimum. Zero chance in 9 days. | Post-hackathon, if funded. Month 2+. |
| **TurboQuant KV cache** (3-bit, 6x compression) | This is a model-serving optimization for running locally. Nosana handles serving for the hackathon. No need to optimize what you don't host. | Only relevant if self-hosting the model post-hackathon. |
| **Arcium MPC** (encrypted computation) | Adds integration complexity with no demo payoff. Judges care about the dream experience, not encryption ceremony. | Post-hackathon. Mention in README as "future: privacy layer" and move on. |
| **Knowledge graph** (temporal/contextual relationships) | Graph databases are a project unto themselves. Clude's semantic memory + clinamen already provides the connection-finding that a knowledge graph would formalize. | Post-hackathon. This is a ROOT NETWORK-style build. |
| **Connection engine** (pattern detection, synchronicity scoring) | This is ROLPA's core intelligence. MILAM doesn't need it -- MILAM has clinamen. | Build when ROLPA is funded. |
| **Input sanitization / purity scan** | Security theater for a hackathon demo. Single-user, no auth, no attack surface. | Build when there are real users. |
| **Multi-agent dreaming** (agents dreaming with agents) | Cool concept, not demo-able in 9 days. | Post-hackathon vision. Mention in README. |
| **DREAMS MODEL** (fine-tuned on dream output) | Requires training data that doesn't exist yet. The autopoietic loop is a post-launch concept. | Year 1 roadmap. |

### KEEP -- Worth the Time

| Feature | Why Keep | Day |
|---|---|---|
| **Drowsiness mechanic** | This IS the demo. It's what makes MILAM feel alive. 2-3 hours to build. | Day 3 |
| **Sensory questions** | The one-question UX is the entire interaction model. | Day 4 |
| **Dream cycle with clinamen** | Without clinamen, the dream journal is just a summary. With it, it's actually dreaming. | Day 5 |
| **Solana hashing** | One of the hackathon's judging criteria. Clude does this nearly for free. | Day 5-6 |
| **Fragment storage for non-dreams** | Agent stores what it doesn't respond to. This is the "registers the feeling" mechanic. Takes 30 minutes. Huge UX payoff in the dream journal when a non-dream shows up woven into the dream. | Day 4 |

### MAYBE -- Stretch Goals (only if ahead of schedule)

| Feature | Condition | Day |
|---|---|---|
| **Voice memo capture** | If Day 7 frontend finishes by noon, add browser SpeechRecognition API. 2 hours. | Day 7 afternoon |
| **Dual journal view** (human captures on left, agent dreams on right) | If journal display is working early. 1-2 hours. | Day 7 |
| **Dream history** (scroll back through past days) | If journal provider already returns multiple entries. 1 hour. | Day 7 |

---

## Summary

The original DREAMS execution plan was 90% correct. The MIRARI evolution adds ROLPA, which you are not building. The architectural changes are small but important:

1. Split plugin into shared core + agent-specific plugins
2. Add namespace prefixes to Clude keys
3. Add future-proof fields to fragment schema
4. Create stub files for ROLPA

That's it. The behavioral design, the character file, the drowsiness mechanic, the sensory questions, the dream cycle, the demo script -- all unchanged. The spec work was strong. Now build it.

Nine days. Six for backend. One for frontend. One for integration. One for demo and submit. No LoRA, no Arcium, no knowledge graph, no connection engine. Ship MILAM. Let the silence speak.
