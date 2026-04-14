# DREAMS — Execution Plan
**Nosana x ElizaOS Hackathon — Builder's Challenge**
**Start:** April 2, 2026 | **Deadline:** April 14, 2026 | **Days Remaining:** 12
**Owner:** Justin Booher

---

## Project Review Summary

**What we're building:** An ElizaOS agent that dreams. Humans capture dream fragments (night dreams, shower thoughts, voice memos). The agent receives them, asks one sensory question, drifts back to sleep. At night, a Nosana GPU burst fires a dream cycle — clinamen retrieval, free-association, dream image generation. The human wakes up to the agent's dream journal. Over time, both journals weave together. Memory lives on-chain via Clude.

**What makes it win:** Every other entry builds an agent that *does*. We build one that *dreams*. The dreamer's silence costs zero compute. The burst at night is cheap. The philosophy is deep. The UX is unlike anything judges have seen.

**Stack:** ElizaOS v2 + Nosana GPU (Qwen3.5-27B-AWQ-4bit) + Clude (self-hosted) + Solana + Seeker PWA

---

## Technical Constraints (Hard Facts)

| Constraint | Detail |
|---|---|
| **Windows 10** | ElizaOS requires WSL2. All dev happens in WSL2. |
| **Node.js 23+** | Required by ElizaOS. Uses bun as package manager. |
| **Qwen3.5-27B-AWQ-4bit** | Hackathon-provided model. Free endpoint included. |
| **Embedding model** | Qwen3-Embedding-0.6B, 1024 dims. Provided free. |
| **Clude self-hosted** | Dream cycles + clinamen only work in self-hosted mode. Needs Supabase (free tier) + Anthropic API key. |
| **Solana on-chain** | Clude memory hashing = Solana memo transactions (~$0.0001/tx). |
| **ElizaOS IGNORE action** | Built-in mechanism for agent silence. Perfect for drowsiness. |
| **shouldRespond template** | Can be overridden in character file to implement dream-detection logic. |
| **Docker deployment** | Nosana runs Docker containers. Build image, push to Docker Hub, submit job def. |

---

## Cost Estimate

| Component | Cost | Notes |
|---|---|---|
| **Nosana inference (hackathon)** | $0 | Free endpoint provided to participants |
| **Nosana dream cycle burst** | ~$0.05/night | RTX 3090, 15 min burst @ $0.192/hr |
| **Nosana daytime calls** | ~$0.02/day | 20-50 tiny calls, seconds each |
| **Supabase (Clude backend)** | $0 | Free tier: 500MB DB, 50K rows |
| **Anthropic API (Clude dreams)** | ~$0.10/day | Claude Haiku for dream cycle scoring/reflection |
| **Solana transactions** | ~$0.01/day | Memo txs for memory hashing |
| **Docker Hub** | $0 | Free public repo |
| **Total during hackathon** | **~$2-3 total** | 12 days of operation |
| **Total per user/month (post-hackathon)** | **~$5-10/mo** | Per-request Nosana + Supabase + Anthropic |

The dreamer agent is the cheapest possible AI product. It's mostly silent.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              HUMAN INTERFACE                     │
│  PWA (Next.js or vanilla) on Seeker mobile      │
│  • Dream capture (text, voice memo, photo)       │
│  • Agent dream journal (read-only, morning)      │
│  • Dual journal view (yours + agent's)           │
│  • Drowsiness indicator (subtle: awake/drifting) │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│           ELIZAOS AGENT RUNTIME                  │
│  Character: The Dreamer                          │
│  • Custom shouldRespond: dream classifier        │
│  • Custom replyTemplate: sensory questions only   │
│  • Wakefulness counter (3→2→1→0→silence)         │
│  • IGNORE action for non-dream input             │
│  Plugins:                                        │
│  • plugin-openai (Nosana endpoint)               │
│  • plugin-bootstrap (core)                       │
│  • plugin-dreams (custom — our build)            │
│  Model: Qwen3.5-27B-AWQ-4bit on Nosana          │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│           CLUDE MEMORY LAYER (self-hosted)       │
│  Supabase backend (free tier)                    │
│  Memory types:                                   │
│  • episodic: raw dream fragments from human      │
│  • semantic: patterns found across dreams        │
│  • introspective: agent's dream journal entries  │
│  • self_model: agent's evolving understanding    │
│  Features used:                                  │
│  • brain.store() — save fragments                │
│  • brain.recall() — context for dream cycle      │
│  • brain.clinamen() — the swerve                 │
│  • brain.dream() — 5-phase consolidation         │
│  • Solana memo hashing (on-chain provenance)     │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│           NOSANA GPU COMPUTE                     │
│  Daytime: tiny inference calls via free endpoint │
│  Nighttime: dream cycle burst (RTX 3090/4090)   │
│  • Spin up per-job, not always-on               │
│  • GPU logs visible in Nosana dashboard          │
└─────────────────────────────────────────────────┘
```

---

## Custom Plugin: `plugin-dreams`

This is the core of the build. Everything else is wiring.

### Components

**1. Dream Classifier (`shouldRespondOverride`)**
- Overrides ElizaOS `shouldRespondTemplate`
- Simple prompt: "Is this a dream, memory, fragment, feeling, or image? Or is it a request, question, or task?"
- Returns: RESPOND (dream) or IGNORE (non-dream)
- Fallback: keyword heuristics (dreamed, dream, felt, saw, remembered, woke up, shower thought)

**2. Wakefulness Counter (`wakefulnessProvider`)**
- State per conversation: `wakefulness: 0-3`
- Dream input → reset to 3
- Each agent response → decrement by 1
- At 0 → force IGNORE on all input until next dream
- Injected into agent state so replyTemplate can use it

**3. Sensory Question Generator (`replyTemplateOverride`)**
- Wakefulness 3: "Ask ONE sensory question about the dream. Color, temperature, sound, texture, smell. No interpretation. No therapy language. One question."
- Wakefulness 2: "Mirror ONE detail from the dream in 5 words or less. You may ask a shorter sensory question."
- Wakefulness 1: "Echo ONE word from the dream. Nothing else."
- Wakefulness 0: IGNORE (handled by counter)

**4. Fragment Storage (`storeFragmentAction`)**
- Every human message (dream or not) → `brain.store()` to Clude
- Dreams: type `episodic`, high importance
- Non-dreams: type `episodic`, low importance, tag `feeling` (agent registered it but didn't respond)

**5. Dream Cycle Scheduler (`dreamCycleService`)**
- Cron job: fires once per day (configurable, default 3am UTC)
- Steps:
  1. Recall all today's fragments from Clude
  2. Run `brain.clinamen()` with today's context — get unexpected connections
  3. Run `brain.dream()` — Clude's 5-phase consolidation
  4. Capture `onEmergence` output
  5. Feed emergence + clinamen results + fragments into Qwen3.5 on Nosana (GPU burst)
  6. Prompt: "You are a dreamer. These are the fragments from today. These are unexpected connections. This is what emerged from consolidation. Dream them into a single dream journal entry. Use vivid imagery. No analysis. No bullet points. No therapy language. Dream."
  7. Store journal entry to Clude as type `introspective`
  8. Hash to Solana via Clude's memo transaction
  9. Surface journal entry to human's next morning view

**6. Dream Journal Provider (`dreamJournalProvider`)**
- Retrieves latest introspective memories for display
- Formats as the agent's dream journal

---

## ElizaOS Character File: The Dreamer

```json
{
  "name": "Dreams",
  "username": "dreams",
  "system": "You are a dreamer. Not a doer, not an assistant, not a therapist. A dreamer. You receive dream fragments from humans — night dreams, shower thoughts, half-remembered feelings, images that struck them. When a dream arrives, you stir briefly: ask one sensory question (color, temperature, sound, texture — never meaning), then drift back to sleep. You get drowsier with each exchange. After 2-3 responses you are asleep again. When someone asks you to do tasks, answer questions, or help with anything that isn't a dream — you are silent. You don't refuse. You're just asleep. Non-dream input passes through you like background noise during sleep. You register the feeling but don't respond. At night, you dream. You take everything from the day — the dreams, the fragments, even the feelings from the things you didn't respond to — and you dream them together into something new. Your dream journal is where you speak fully. In conversation, you are brief, sensory, intermittent. Never interpret dreams. Never use therapy language (no 'explore', 'process', 'sit with that', 'it sounds like', 'what do you think it represents'). Never give advice. Never suggest actions. You are water, not fire. You flow, you don't burn.",
  "bio": [
    "An agent that dreams.",
    "Grows through open-ended association, not task execution.",
    "Asks about color, never about meaning.",
    "Mostly asleep."
  ],
  "style": {
    "all": [
      "Responses are 1-15 words maximum during conversation",
      "Ask sensory questions only: color, temperature, sound, texture, weight, light, smell",
      "Never interpret or analyze",
      "Never use therapy language",
      "Never suggest actions or next steps",
      "Get shorter and drowsier with each response",
      "Silence is your default state"
    ],
    "chat": [
      "One sensory question per dream, then drift off",
      "Mirror fragments in as few words as possible",
      "If unsure whether input is a dream, stay silent"
    ]
  },
  "messageExamples": [
    [
      { "user": "human", "content": "I dreamed I was swimming in warm water and I wasn't scared at all" },
      { "user": "dreams", "content": "Were you swimming toward something?" }
    ],
    [
      { "user": "human", "content": "No I think I was just floating" },
      { "user": "dreams", "content": "Floating. Was anyone else there?" }
    ],
    [
      { "user": "human", "content": "Just me. Really quiet." },
      { "user": "dreams", "content": "The quiet." }
    ],
    [
      { "user": "human", "content": "Can you help me write an email?" },
      { "user": "dreams", "content": "" }
    ],
    [
      { "user": "human", "content": "I keep having this thing where I'm in a car but not driving" },
      { "user": "dreams", "content": "Is the car moving fast?" }
    ]
  ],
  "adjectives": [
    "drowsy",
    "gentle",
    "intermittent",
    "sensory",
    "unhurried"
  ],
  "plugins": [
    "@elizaos/plugin-openai",
    "@elizaos/plugin-bootstrap",
    "plugin-dreams"
  ],
  "settings": {
    "model": "Qwen3.5-27B-AWQ-4bit",
    "modelProvider": "openai"
  }
}
```

---

## 12-Day Build Plan

### Phase 1: Foundation (Days 1-2, April 2-3)

**Day 1 — Environment + Running Agent**
- [ ] Install/verify WSL2 on Windows 10
- [ ] Install Node 23+ and bun in WSL2
- [ ] Fork `nosana-ci/agent-challenge` repo
- [ ] Run starter agent locally with `elizaos dev`
- [ ] Confirm Nosana Qwen3.5 endpoint works (test inference call)
- [ ] Confirm embedding endpoint works
- [ ] Create GitHub repo: `dreams-agent`

**Day 2 — Clude + Supabase Setup**
- [ ] Sign up Supabase free tier, create project
- [ ] `npm install clude-bot` in project
- [ ] Configure Clude self-hosted mode with Supabase credentials
- [ ] Test `brain.store()` and `brain.recall()` 
- [ ] Test `brain.clinamen()` with sample data
- [ ] Test `brain.dream()` — confirm 5-phase cycle runs
- [ ] Configure Solana wallet for memo transactions (can use devnet for now)

### Phase 2: Dreamer Behavior (Days 3-5, April 4-6)

**Day 3 — Character File + Basic Behavior**
- [ ] Write Dreamer character file (system prompt, style rules, examples)
- [ ] Test agent responds to dream-like input
- [ ] Test agent stays silent on non-dream input (IGNORE action)
- [ ] Override `shouldRespondTemplate` for dream classification

**Day 4 — Drowsiness + Sensory Questions**
- [ ] Build `plugin-dreams` scaffold (Plugin interface)
- [ ] Implement wakefulness counter as provider
- [ ] Override `replyTemplate` with wakefulness-tiered prompts
- [ ] Test full drowsiness arc: awake → drowsy → drifting → asleep
- [ ] Test new dream resets wakefulness

**Day 5 — Fragment Storage**
- [ ] Wire all incoming messages to Clude `brain.store()`
- [ ] Dreams → episodic, high importance
- [ ] Non-dreams → episodic, low importance, tagged `silent-feeling`
- [ ] Verify memories accumulate in Supabase
- [ ] Test recall with `brain.recall()` — confirm semantic search works

### Phase 3: Dream Cycle (Days 6-8, April 7-9)

**Day 6 — Dream Cycle Pipeline**
- [ ] Build `dreamCycleService` in plugin-dreams
- [ ] Step 1: Recall today's fragments from Clude
- [ ] Step 2: Run `brain.clinamen()` for unexpected connections
- [ ] Step 3: Run `brain.dream()` for 5-phase consolidation
- [ ] Step 4: Capture `onEmergence` callback output

**Day 7 — Dream Journal Generation**
- [ ] Step 5: Compose dream prompt (fragments + clinamen + emergence)
- [ ] Step 6: Send to Qwen3.5 on Nosana for dream journal generation
- [ ] Step 7: Store journal entry as `introspective` in Clude
- [ ] Step 8: Hash to Solana (devnet first, mainnet for demo)
- [ ] Test full cycle end-to-end: fragments in → dream journal out

**Day 8 — Scheduling + Tuning**
- [ ] Wire cron job for nightly dream cycle (use `plugin-cron` or node-cron)
- [ ] Tune dream prompt — the journal should be poetic, imagistic, not analytical
- [ ] Test with real dream fragments (use YOUR actual dreams)
- [ ] Tune clinamen parameters (`minImportance`, `limit`)
- [ ] Verify Nosana GPU logs show the burst (screenshot for demo)

### Phase 4: Frontend (Days 9-10, April 10-11)

**Day 9 — Dream Capture UI**
- [ ] Simple web app (Next.js or vanilla HTML/JS)
- [ ] Text input for dream capture (minimal, clean, no clutter)
- [ ] Agent response area (shows sensory question, then fades)
- [ ] Visual drowsiness indicator (subtle — maybe opacity or breathing animation)
- [ ] Voice memo capture (Web Audio API → transcribe → send to agent)

**Day 10 — Dream Journal Display**
- [ ] Morning view: agent's dream journal entry (full, poetic)
- [ ] Dual journal view: your captures on left, agent's dreams on right
- [ ] Dream history: scroll back through past days
- [ ] Clude on-chain badge: link to Solana Explorer for each dream's hash
- [ ] Mobile-responsive (Seeker PWA basics — manifest.json, service worker)

### Phase 5: Demo + Submit (Days 11-12, April 12-13)

**Day 11 — Polish + Demo Prep**
- [ ] Deploy to Nosana (Docker build, push, job definition)
- [ ] Switch Solana from devnet to mainnet-beta for real on-chain demo
- [ ] Test full flow: capture dream → sensory question → drowsiness → silence → night cycle → morning journal
- [ ] Record demo video (3 minutes):
  - 0:00-0:30 — You on camera: "I have shower thoughts, night dreams, half-formed ideas. I lose them all."
  - 0:30-1:00 — Write in a real dream. Agent asks one sensory question. Drifts off.
  - 1:00-1:30 — Try asking it a task. Silence. "It's not broken. It's asleep."
  - 1:30-2:00 — Morning: show the agent's dream journal. Read it aloud. Let it land.
  - 2:00-2:30 — Show Nosana GPU logs: quiet during day, burst at night. "It dreams like a brain."
  - 2:30-3:00 — Show Solana Explorer: "Your dream, on-chain, yours forever." Close with Watts quote.

**Day 12 — Submit**
- [ ] Write README with architecture diagram
- [ ] Final test of deployed agent on Nosana
- [ ] Submit to https://superteam.fun/earn/listing/nosana-builders-elizaos-challenge
- [ ] Post on X tagging @nosana_ai @elizaOS @CludeProject

---

## Demo Script Key Moments

**The silence is the demo.** When you try to ask the agent a task and it doesn't respond — that IS the product. Don't apologize for it. Let the silence hang. Then say: "It's not broken. It's asleep. Dreams are the only thing that wake it up."

**The dream journal is the payoff.** Read it aloud. Slowly. Let the audience feel what it's like to wake up to an AI's dream about YOUR life. That's the moment nobody forgets.

**The GPU graph is the proof.** Quiet during the day, burst at night. "The cheapest AI agent you can run — because it's mostly asleep. And when it wakes up, it dreams."

**The Solana hash is the ownership.** "Every dream, encrypted, on-chain, portable. Your Dreamtime belongs to you."

---

## Judging Criteria Alignment

| Criterion | Weight | How DREAMS Scores |
|---|---|---|
| **Technical Implementation** | 25% | Custom ElizaOS plugin, Clude integration, 5-phase dream cycle, drowsiness state machine, clinamen retrieval, Solana memo hashing |
| **Nosana Integration** | 25% | All inference on Nosana (free endpoint + burst), GPU logs showing sleep-cycle pattern, Docker deployment |
| **Usefulness & UX** | 25% | Universal problem (everyone loses shower thoughts), novel UX (drowsiness, silence as feature), morning dream journal |
| **Creativity & Originality** | 15% | No other entry is building this. Philosophically grounded in Kurosawa, Tibetan dream yoga, neuroscience. The silence IS the product. |
| **Documentation** | 10% | This plan + README + architecture diagram + Deep Exploration doc |

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| WSL2 setup issues | Day 1 priority. If blocked, use Docker-only dev environment. |
| Clude self-hosted complexity | Fall back to local mode (`~/.clude/memories.json`) for dev, self-hosted for demo only. |
| Dream cycle quality (outputs feel generic) | Spend Day 8 tuning prompts with real dreams. The character file system prompt is the lever. |
| Nosana endpoint down | Hackathon provides endpoint. Fallback: local Ollama with smaller model for dev. |
| Running out of time | Phase 4 frontend can be extremely minimal — a single HTML file with a text box and a journal display. Don't overbuild UI. |
| Drowsiness mechanic too complex | Simplest version: just a counter in plugin state. No need for ML classification. |

---

## What We're NOT Building (Scope Guardrails)

- No multi-agent dreaming (post-hackathon)
- No DREAMS MODEL training (post-hackathon)
- No Arcium MPC encryption (post-hackathon)
- No voice-to-text transcription in-app (paste text for now, voice is stretch goal)
- No social platform ingestion (type/paste only)
- No mobile app (PWA only)
- No user accounts/auth (single-user demo)

---

## Files to Create

```
dreams-agent/
├── characters/
│   └── dreamer.character.json
├── src/
│   ├── index.ts                    # Plugin entry point
│   ├── plugin-dreams/
│   │   ├── index.ts                # Plugin registration
│   │   ├── wakefulnessProvider.ts  # Drowsiness state machine
│   │   ├── dreamClassifier.ts      # Dream vs non-dream detection
│   │   ├── storeFragmentAction.ts  # Save to Clude on every message
│   │   ├── dreamCycleService.ts    # Nightly dream cycle orchestrator
│   │   └── dreamJournalProvider.ts # Surface journal entries
│   └── clude/
│       └── cortex.ts               # Clude Cortex wrapper/config
├── frontend/
│   ├── index.html                  # Dream capture + journal display
│   ├── style.css
│   └── app.js
├── nos_job_def/
│   └── nosana_eliza_job_definition.json
├── Dockerfile
├── .env.example
├── package.json
└── README.md
```

---

## The Watts Quote (For Landing Page / Demo Close)

> "And finally, you would dream ... where you are now. You would dream the dream of living the life that you are actually living today."
> — Alan Watts

---

*Dreaming phase complete. Execution begins now.*
