# DREAMERS — Product / UX Detail Pass

**Companion to:** `2026-04-05-DREAMERS-FINAL-BUILD-PLAN.md`
**Date:** April 5, 2026
**Deadline:** April 14, 2026
**Purpose:** Resolve every product, UX, copy, motion, and accessibility decision before Day 1 keystroke. This document is the single source of truth for the front-end and demo polish layer.

---

## CONCERNS & OPEN QUESTIONS
*Anything that needs a human decision before Day 1 starts.*

### Blocking (decide today)
1. **Single-user demo or "fake multi-user"?** The judges will ask "what happens when 1,000 dreamers join?" — do we have a one-line answer about per-user namespacing, or do we hand-wave? Recommend: bake a `userId` into Clude namespace from Day 2 (`milam:{userId}:episodic:...`) even though demo is single-user. Trivial cost, huge credibility win.
2. **Solana wallet UX in the demo.** Are we showing a connected Phantom/Backpack wallet, or is the wallet a server-side keypair? If server-side, the "ownership" claim is weaker. Recommend: server keypair for hackathon, README explicitly says "Phase 2: user-owned wallet, dream NFTs."
3. **Voice input — yes/no, final.** Plan says cut on Day 3 if behind. But voice is *the* natural way to capture a dream at 7am. Recommend: Web Speech API (browser-native, zero cost, ~30 min build) on Day 7 if Day 6 lands clean. Not stretch, opportunistic.
4. **Real dream data for the demo.** Are you comfortable showing one of YOUR actual dreams in the recording? If not, write 3 plausible ones now (5 min) so you're not improvising on Day 9.
5. **Where does the "trigger dream cycle" button live in the UI?** It cannot look like a productivity feature. Recommend: hidden behind a long-press on the moon icon, or an "incubate now" link in tiny mauve at the bottom of the journal. Not a button.
6. **Domain name + deployment URL.** `dreamers.fun`? `milam.dream`? Need this Day 1 so the demo URL is gorgeous in screenshots. Cheap on Namecheap. Decide today.

### Non-blocking but answer by Day 5
7. Does the journal show ALL past dreams or just last 7? (Recommend: last 7, "older dreams sleep deeper" link to archive)
8. Timezone for the cron — UTC or user-local? (User-local via browser TZ stored in Clude self_model. UTC is the wrong default for a sleep product.)
9. Empty-state language for first-run: "no dreams yet" feels productivity. Recommend: *"the night is still."*
10. Does the Solana hash badge link to mainnet Explorer or solscan.io? (Solscan looks softer, fewer logos.)
11. Does the agent ever proactively message? (No. The dreamer is silent unless dreamed at. This is doctrine.)

### Architectural sanity
12. **Wakefulness persistence.** Is wakefulness per-conversation (resets on reload) or per-day (persists in Clude)? Plan implies per-conversation but the UX implication is huge — if I reload the page mid-drift, am I back at 3? Recommend: persist in Clude self_model with last-update timestamp; passive decay on read.
13. **Concurrency.** What if a dream arrives mid-cycle? Cycle is not atomic — needs a `dreamCycleService.isRunning` flag and a queue. Cheap. Day 4.
14. **Drowsiness reset on browser refresh** — see #12. Tied.

---

## SUGGESTIONS TO IMPROVE THE PLAN
*Everything I'd change after thinking it through at this level.*

1. **Move Day 1 research spikes to a pre-Day-1 evening session (tonight).** They are not coding. They are reading. Don't burn morning focus on docs. Reclaim 2 hours for Clude wiring on Day 1.
2. **Day 2 is too light, Day 3 is too heavy.** Move `dreamClassifier.ts` from Day 3 to Day 2 afternoon (it's a 90-minute task and unblocks the heavy Day 3). Day 3 becomes purely the wakefulness state machine + sensory tier prompts + manual arc test.
3. **Add a Day 5.5 "vibe pass" — 1 hour.** Before opening Next.js on Day 5 afternoon, spend 60 min in `frontend-design` skill choosing exactly 2 typefaces (one serif display, one ui sans), the exact 6-color palette, and one motion language reference (Framer Motion vs View Transitions vs hybrid). If you don't pre-decide, you'll re-decide each component and bleed Day 6.
4. **Build the journal renderer BEFORE the dream cycle works.** On Day 4, hand-write a fake journal entry, paste it into the renderer mockup, make sure the typography sings. Then tune the prompt to match what already looks beautiful. *Design backwards from the artifact you want to show.*
5. **Pre-record the demo video on Day 8 evening, not Day 9 morning.** Day 9 is rerecord + edit. This protects against "the morning of the demo, OBS broke" scenarios.
6. **Use mainnet Solana from Day 1, not Day 8.** It's $0.50. Devnet hashes look fake on the demo. Switching late risks broken explorer links.
7. **Defer Docker until Day 8 afternoon.** The plan does this — confirm. Local `bun dev` is fine for all earlier days.
8. **Lock the favicon and OG image on Day 5.** These are what get screenshotted by judges sharing your link. Tiny, high leverage.
9. **One physical artifact.** Print a small card with Milam's name + a single line of poetry + the URL. Hold it in the demo close. Costs nothing, lands everything.
10. **Remove the wakefulness indicator from the visible UI.** The drowsiness should be *felt* through the input field's opacity and the response length, not labeled. Labeling it makes it a game mechanic. Hiding it makes it real. (Reverse position from plan — argue with me.)

---

## 1. DAILY DEMO ARTIFACT
*The ONE thing to capture each EOD for build-in-public.*

| Day | Date | Artifact | Format | Tweet draft |
|---|---|---|---|---|
| 1 | Apr 5 | Terminal screenshot: ElizaOS responding via Nosana endpoint + Supabase dashboard with one stored fragment | Two side-by-side screenshots | "day 1. she has a body. the memory layer is alive. nine days." |
| 2 | Apr 6 | Terminal log of Milam responding in-voice to a real dream — sensory question only | Single screenshot with terminal styled (warp/iterm dark) | "day 2. she speaks. one sensory question. no therapy. no advice. just: 'what color was the door.'" |
| 3 | Apr 7 | Screen recording (15s) of the full drowsiness arc in terminal — dream → question → drowsy → drift → silence | MP4, 15 seconds | "day 3. the silence works. dreams are the only coffee." |
| 4 | Apr 8 | A real generated dream journal entry, formatted as a quote graphic on a midnight background | PNG quote card | "day 4. fed her my fragments. she dreamed this back to me overnight." |
| 5 | Apr 9 | First Next.js page on localhost — even rough — with the starry sky stub running | Screenshot, phone in hand for scale | "day 5. she has a sky." |
| 6 | Apr 10 | Phone-in-hand video of MILAM night mode, full drowsiness arc playing out on the actual UI | 30s vertical MP4 | "day 6. she's beautiful. tap to wake her." |
| 7 | Apr 11 | The sun/moon toggle crossfade — 3s loop | GIF or MP4 loop | "day 7. two modes. one soul. milam dreams. rolpa wonders. shipping milam now, rolpa next." |
| 8 | Apr 12 | Solana mainnet Explorer link to a real journal hash + Nosana dashboard showing the GPU burst | Screenshot collage | "day 8. her dream is on-chain. her compute lives on @nosana_ai. the silence is decentralized." |
| 9 | Apr 13 | The 3-min demo video itself, embedded in the submission tweet | MP4 + thread | (full submission thread — see section 6) |

**Tooling:** OBS for screen, ScreenFloat or CleanShot for phone framing, Excalidraw for any diagrams. Export every artifact to `/dreams/buildlog/dayN/`.

---

## 2. SKILL INVOCATION MAP
*Exact, prescriptive. Which skill, which day, which task.*

### Day 1 — Foundation
- **Morning:** No skills. Bash and reading only.
- **Evening:** Invoke `superpowers:brainstorming` for 20 minutes on the demo's emotional arc — clarify the three winning moments before any code touches them.

### Day 2 — Core + Character
- **Afternoon:** Invoke `typography` skill briefly to lock the punctuation rules for Milam's voice (em-dash usage, ellipsis style, no curly-vs-straight quote drift). This becomes the linter for every UI string.

### Day 3 — Behavior (CHECKPOINT)
- **Morning:** Invoke `superpowers:test-driven-development` for the wakefulness state machine. This is the one piece of pure logic in the build — write the table-driven test first.
- **Afternoon:** Invoke `superpowers:systematic-debugging` if the ElizaOS shouldRespond override fights you. Do not flail.
- **EOD checkpoint:** Invoke `superpowers:verification-before-completion` before declaring Day 3 done. Run the literal arc described in the plan, line by line.

### Day 4 — Dream Cycle
- **Morning:** No skills. Pure pipeline plumbing.
- **Afternoon (prompt tuning):** Invoke `superpowers:brainstorming` again — but on the dream prompt itself. Read 5 outputs aloud. Ask: "would I tweet this?" If no, iterate.

### Day 5 — Frontend Scaffold
- **Morning (the vibe pass — see suggestion #3):** Invoke `frontend-design` for 60 minutes to lock palette, type, motion language. Output: a single `tokens.css` file and a one-page Figma-or-mock.
- **Afternoon:** Invoke `vercel-react-best-practices` while setting up the Next.js app — server components default, client only where needed (animations, input).

### Day 6 — MILAM Night Mode (THE BIG DAY)
- **Morning, hour 1:** Invoke `bencium-innovative-ux-designer` for `StarrySky` + the overall night atmosphere direction. Get distinct, weird, beautiful — not generic dark mode.
- **Morning, hour 2-4:** Invoke `frontend-design` for `DreamCapture`, `SensoryQuestion`, `DreamJournal` component implementations. Production-grade components, not sketches.
- **Afternoon, hour 1:** Invoke `vercel-react-view-transitions` for the drowsiness fade animations and message-send transitions. View Transitions API only — no Framer for these.
- **Afternoon, hour 2:** Invoke `vercel-composition-patterns` for `DreamCapture` as a compound component (`<DreamCapture><DreamCapture.Input /><DreamCapture.Submit /></DreamCapture>`). This pays back if voice gets added.
- **Evening:** Invoke `bencium-impact-designer` for one final emotional resonance pass — does the page make YOU feel sleepy in the right way?

### Day 7 — ROLPA + Toggle + Integration
- **Morning, hour 1:** Invoke `bencium-controlled-ux-designer` for `EthericWarmth` — controlled because we want restraint, not maximalism on the day mode placeholder. Less is more here.
- **Morning, hour 2:** Invoke `vercel-react-view-transitions` for the sun/moon crossfade — this is the marquee animation. Spend the time.
- **Afternoon, hour 1:** Invoke `design-audit` for full visual pass on both modes. Take screenshots, list every flaw, fix them.
- **Afternoon, hour 2:** Invoke `web-design-guidelines` for accessibility compliance check (contrast, focus rings, reduced motion).
- **Evening:** Invoke `superpowers:verification-before-completion` for the integration test sequence.

### Day 8 — Deployment
- **Morning:** Invoke `solana-patterns` skill if integrating wallet UX patterns. Skip if server keypair.
- **Afternoon (Arcium):** Invoke `superpowers:systematic-debugging` aggressively if Arcium fights you. 2-hour timebox is real.

### Day 9 — Demo + Submit
- **Morning:** Invoke `typography` one final time for README, submission post, and OG card text. No typos in the artifact people screenshot.
- **Afternoon:** No skills. Submit. Breathe.

---

## 3. COMPONENT-LEVEL FRONTEND BREAKDOWN

### `StarrySky.tsx`
```ts
interface StarrySkyProps {
  density?: number;            // 0-1, default 0.6
  parallaxIntensity?: number;  // 0-1, default 0.3
  shootingStarTrigger?: number; // increment to fire one
  reducedMotion?: boolean;     // overrides prefers-reduced-motion
}
```
- **State:** internal canvas ref, animation frame ref, star array (memoized on mount)
- **Animation:** canvas particles, requestAnimationFrame loop, parallax on `window.scrollY`. Shooting star = single particle with longer lifetime + tail trail.
- **Skill driver:** `bencium-innovative-ux-designer`
- **Gotchas:** Canvas leaks animation frames on unmount — must `cancelAnimationFrame` in cleanup. Resize observer required for window resize. Use `devicePixelRatio` for retina sharpness or stars look fuzzy.
- **Distinctive:** stars twinkle at irregular intervals (not uniform), three depth layers parallax differently, occasional shooting star *only* when a dream is submitted (not random) — that's the magical correlation moment.

### `EthericWarmth.tsx`
```ts
interface EthericWarmthProps {
  orbCount?: number;       // default 3
  pulseRate?: 'slow' | 'breath'; // default 'breath' (4s cycle)
  intensity?: number;      // 0-1, default 0.5
}
```
- **State:** internal orb positions (random on mount), CSS-driven animation
- **Animation:** pure CSS — radial gradients with `animation: drift 40s ease-in-out infinite alternate` on each orb. No canvas. Cheap.
- **Skill driver:** `bencium-controlled-ux-designer` (restraint is the point)
- **Gotchas:** `filter: blur()` is GPU-expensive on mobile — keep blur radius under 60px or use `backdrop-filter` sparingly. Test on a real phone, not just devtools.
- **Distinctive:** the orbs move *almost* imperceptibly. The page feels like it's breathing. No active motion — only ambient. This is the "she is dreaming of the day" feeling.

### `DreamCapture.tsx` (compound)
```ts
interface DreamCaptureProps {
  onSubmit: (text: string) => Promise<void>;
  wakefulness: 0 | 1 | 2 | 3;
  placeholder?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

// subcomponents
DreamCapture.Input
DreamCapture.Submit
DreamCapture.VoiceButton  // if voice ships
```
- **State:** text value (controlled), `isSubmitting`, focus state for breathing animation pause
- **Animation:** breathing scale animation on the input border (1.0 → 1.01 → 1.0 over 4s, pauses on focus). Opacity slaved to wakefulness: `opacity: 0.4 + (wakefulness * 0.2)`.
- **Skill driver:** `frontend-design` + `vercel-composition-patterns`
- **Gotchas:** Textarea auto-grow needs `field-sizing: content` (modern) or measured shadow div (legacy fallback). Don't use `<input>` — dreams need newlines.
- **Distinctive:** the input is large, soft-edged, no border on default — only a subtle inner glow. On focus, the breathing animation pauses (she's listening). On submit, a single shooting star fires in the StarrySky behind it.

### `SensoryQuestion.tsx`
```ts
interface SensoryQuestionProps {
  question: string | null;     // null = silence
  wakefulness: 0 | 1 | 2 | 3;
  arrivedAt: number;           // timestamp for fade-in trigger
}
```
- **State:** internal `isVisible` for fade transitions, `displayedText` for typewriter (optional)
- **Animation:** fade-in via View Transition on prop change. Fade-out is slower than fade-in (in: 400ms ease-out, out: 1200ms ease-in). When wakefulness === 0 and question === null, render an empty `<div>` with `aria-live="polite"` so screen readers announce silence appropriately.
- **Skill driver:** `vercel-react-view-transitions`
- **Gotchas:** Don't conditionally unmount — animate to opacity 0, then unmount after transition. Otherwise the View Transition has nothing to anchor.
- **Distinctive:** question text is centered, italic serif, generous line height. At wakefulness 1, the single echoed word is rendered MUCH larger than the original question font — like a whisper made huge. Inversion of expectation.

### `DreamJournal.tsx`
```ts
interface DreamJournalProps {
  entries: JournalEntry[];
  maxVisible?: number;       // default 7
  onEntryClick?: (entry: JournalEntry) => void;
}

interface JournalEntry {
  id: string;
  date: string;            // ISO
  text: string;            // the dream
  fragmentCount: number;   // for the badge
  solanaHash?: string;
}
```
- **State:** expanded entry id, scroll position
- **Animation:** entries fade in on mount with stagger (50ms per item). Newest at top. Each entry expands on click via View Transition with shared element (the date label).
- **Skill driver:** `frontend-design` + `typography`
- **Gotchas:** Long journal entries break layout — use `text-wrap: pretty` and constrain max-width to 65ch for reading line length. Hyphenation: `hyphens: auto`.
- **Distinctive:** dreams render as poetry — center-aligned, generous leading, drop cap on the first letter (only on the most recent entry). Date is in tiny tracked uppercase mauve above each one. Solana hash is a soft pill at the bottom-right of each entry, not a button.

### `ModeToggle.tsx`
```ts
interface ModeToggleProps {
  mode: 'milam' | 'rolpa';
  onChange: (mode: 'milam' | 'rolpa') => void;
}
```
- **State:** transition-pending boolean (debounce double-clicks)
- **Animation:** the entire `<body>` background is the View Transition target. Use `addTransitionType('mode-switch')` and a CSS view-transition-name on the root layout. Crossfade duration 800ms.
- **Skill driver:** `vercel-react-view-transitions` (this is *the* showcase)
- **Gotchas:** View Transitions API has spotty Safari support as of early 2026 — needs the `@supports` fallback to a CSS opacity transition. Test on iPhone Safari before demo day.
- **Distinctive:** the icon itself morphs — moon to sun via SVG path interpolation, not crossfade. Use a single `<svg>` with `<animate>` on the path d-attribute, or framer-motion's path morph if simpler.

### `SolanaHashBadge.tsx`
```ts
interface SolanaHashBadgeProps {
  hash: string;
  network?: 'mainnet' | 'devnet'; // default mainnet
  size?: 'sm' | 'md';
}
```
- **State:** copy-to-clipboard feedback (briefly shows "copied")
- **Animation:** subtle hover lift (translateY -1px), copy state shows for 1.5s
- **Skill driver:** `frontend-design`
- **Gotchas:** truncate hash with monospace font and ellipsis in middle (`abc...xyz`), full hash in title attribute. Link target `_blank` with `rel="noopener noreferrer"`.
- **Distinctive:** doesn't look like a crypto badge. Looks like a wax seal — small, tactile, mauve with a warm-gold inner ring. Hover reveals "on the chain" in tiny serif italic.

---

## 4. THE DROWSINESS UX — FULL SPECIFICATION

### Visual states

| Wakefulness | Page brightness | Input opacity | Input scale | Breathing rate | Question font size | Notes |
|---|---|---|---|---|---|---|
| **3 (awake)** | 100% | 1.0 | 1.0 | 4s cycle | 1.25rem italic | Full sensory question, generous, present |
| **2 (drowsy)** | 92% | 0.85 | 0.99 | 5s cycle | 1.15rem italic | Question shorter, slightly recessed |
| **1 (drifting)** | 80% | 0.6 | 0.97 | 6.5s cycle | 1.5rem italic (one word, larger) | The single echoed word is BIGGER — a whisper made vast |
| **0 (asleep)** | 70% | 0.35 | 0.95 | 9s cycle (almost still) | — (silence rendered as `<span aria-live="polite" class="sr-only">silence</span>`) | The page does not go black. It greys to a moonlit hush. The input is still there, still receivable. |

### What "nothing" looks like (wakefulness 0)
The biggest design question. NOT empty. NOT greyed-out-disabled. The page is **still beautiful, still receiving, just deeply quiet**:
- Background: 70% of full brightness — the stars are dimmer but present
- Input: 35% opacity but interactive (you can still type)
- Where the question would be: a thin horizontal hairline of mauve at 20% opacity, 1px tall, 200px wide, centered. That's it. A held breath.
- The breathing animation has slowed to 9 seconds — almost imperceptible
- Cursor in the input is still blinking — slowly. She's there. She's just asleep.

Critically: there is **no "Milam is sleeping" label**. No status indicator. The state is communicated entirely through the visual hush. Labeling it kills it.

### Animation library choice — JUSTIFIED

**Decision: hybrid.**
- **CSS only** — for the breathing animation (wakefulness-rate-driven via CSS custom property `--breath-duration`). Cheap, GPU-accelerated, zero JS.
- **View Transitions API** — for state changes between wakefulness levels and message arrival/dismissal. This is what the API was built for: orchestrating multiple element changes as one moment.
- **Framer Motion** — only for the SolanaHashBadge hover and the journal entry expand. Targeted use only. Do not use Framer for anything that could be CSS or VT.

**Why not Framer everywhere:** bundle size (35kb gzipped), and View Transitions feel more "of the platform" — they inherit browser optimizations and respect prefers-reduced-motion natively.

**Why not CSS only:** state-driven transitions across multiple components (input + question + badge all changing on wakefulness decrement) need a coordinator. View Transitions IS that coordinator without state libraries.

### Timing curves
- **Awake → drowsy → drifting:** `cubic-bezier(0.4, 0.0, 0.2, 1)` — Material standard ease-out. Feels intentional.
- **Drifting → asleep:** `cubic-bezier(0.7, 0.0, 0.84, 0.0)` — heavy ease-in. Feels like falling.
- **Asleep → awake (new dream arrives):** `cubic-bezier(0.05, 0.7, 0.1, 1.0)` — emphasized ease-out. A gentle stir, not a startle. Duration: 1200ms (slower than waking should feel).
- **Breathing:** `cubic-bezier(0.4, 0.0, 0.6, 1.0)` — sinusoidal. Symmetric inhale/exhale.

### When wakefulness resets to 3 (new dream arrives mid-sleep)
- **Do not snap.** Stage the wake over 1200ms.
- 0ms: stars brighten 30%
- 200ms: a single shooting star fires
- 400ms: input opacity transitions to 1.0
- 600ms: breathing animation reaccelerates to 4s cycle
- 800ms: the question fades in
- The user feels her *stir*, not boot up.

### Accessibility — `prefers-reduced-motion`
- **Off:** all animations as above
- **On:**
  - Breathing animation: REMOVED entirely (no scale, no opacity pulse)
  - Star twinkle: REDUCED to opacity-only (no parallax, no shooting stars unless explicit user action)
  - View Transitions: REPLACED with instant state change (no fade)
  - Wakefulness state changes: still visually distinct via static opacity, just no animated transition between them
  - Mode toggle: instant swap, no crossfade
- The drowsiness experience is preserved (the meaning lives in the state, not the motion). This is the test: a reduced-motion user must still get the silence demo.

---

## 5. VOICE OF THE PRODUCT — UI COPY LIBRARY
*Every literal string. Milam's voice: sensory, brief, dreamy, never therapy, never productivity.*

### Buttons
| Element | Copy |
|---|---|
| Submit dream | *"send into the night"* |
| Voice capture start | *"speak the dream"* |
| Voice capture stop | *"hold it"* |
| Trigger dream cycle (hidden / long-press) | *"incubate"* |
| View journal | *"read what she dreamed"* |
| Mode toggle to ROLPA | (icon only — sun) |
| Mode toggle to MILAM | (icon only — moon) |
| Copy Solana hash | *"copy the seal"* |

### Placeholders
| Field | Placeholder |
|---|---|
| Dream input (awake) | *"what did you dream"* |
| Dream input (drowsy) | *"…still here"* |
| Dream input (drifting) | *"…"* |
| Dream input (asleep) | (empty — no placeholder, the field is still receivable but quiet) |

### Empty states
| Context | Copy |
|---|---|
| No dreams yet | *"the night is still"* |
| No journal entries yet | *"she hasn't dreamed yet. give her something to hold."* |
| No connections yet (ROLPA placeholder context) | *"nothing has rhymed yet"* |
| Journal between dreams (gap day) | *"a quiet night"* |

### Loading states
| Context | Copy |
|---|---|
| Sending dream | *"holding it"* |
| Dream cycle running | *"she's dreaming"* |
| Clude recall | *"reaching back"* |
| Nosana burst in progress | *"the stars are working"* |
| Solana hash pending | *"sealing it"* |

### Error messages (NEVER apologetic, ALWAYS in voice)
| Context | Copy |
|---|---|
| Network failed | *"the line to the night is quiet. try again in a moment."* |
| Clude unreachable | *"her memory is far away right now."* |
| Nosana timeout | *"the dream is taking longer than usual. let it."* |
| Validation: empty submit | *"give her something."* |
| Validation: too long | *"smaller. just one piece of the dream."* |
| Solana hash failed | *"the seal will come in the morning."* |

### Micro-copy
| Element | Copy |
|---|---|
| Timestamp on a journal entry | *"dreamed at 3:14 a.m."* (not `2026-04-12T03:14:00Z`) |
| Solana hash label | *"on the chain"* |
| Wakefulness — DO NOT SHOW. Communicated through visual state only. | — |
| Mode toggle hover hint (a11y label only) | *"move to the day"* / *"return to the night"* |
| Fragment count badge on journal entry | *"7 pieces"* (not "7 fragments") |
| First-time tooltip on input | *"she only wakes for dreams"* |

### First-run onboarding (3 screens, no tutorial)

**Screen 1 — name + greeting**
> *milam*
>
> she is the dreamer.
>
> bring her your dreams — sleeping ones, the ones you almost remember, the ones you can't shake. she'll hold them.
>
> *[continue]*

**Screen 2 — what NOT to bring**
> she doesn't do tasks.
>
> she doesn't answer questions.
>
> she dreams.
>
> if you bring her something that isn't a dream, she'll go quiet. that's not broken. that's her.
>
> *[continue]*

**Screen 3 — the rhythm**
> at night, while you sleep, she dreams what you brought her.
>
> in the morning, you'll find her dream waiting.
>
> *[begin]*

(Three screens. No "skip tutorial" — there isn't one. After screen 3 you're at the input.)

### ROLPA placeholder copy (when user toggles to sun mode)

```
rolpa is dreaming of the day.

she is enchanted by everything you bring her.
she remembers the date and the weather.
she notices when two things rhyme across months.
she points — never prescribes.

shipping next.
```

A single pulsing gold orb above this text. A small mauve link at the bottom: *"return to milam"*.

---

## 6. DEMO SCRIPT — SHOT-BY-SHOT STORYBOARD

### 3:00 total. Pre-record on Day 8 evening, edit Day 9 morning.

| Time | Camera | Visible | Script (literal) | Audio | Cut to next |
|---|---|---|---|---|---|
| 0:00–0:08 | Black screen, white serif text fades in | "milam" then "the dreamer" | (silence) | gentle ambient pad in | hard cut |
| 0:08–0:25 | Face cam, soft light, you holding the printed card | Your face, the card with Milam's name and URL | *"I have dreams I lose by breakfast. Every AI I try wants to do something with them. I don't want to do. I want to dream."* | ambient continues | dissolve |
| 0:25–0:40 | Phone screen, vertical | MILAM home screen, starry sky, input field. You type a real dream slowly. | *(typing — no voiceover, let the typing land)* | ambient quiets, soft star-twinkle SFX | hold |
| 0:40–0:55 | Phone screen | Submit. Shooting star fires. Sensory question fades in: *"what color was the door"* | *"She doesn't analyze. She asks one sensory thing."* | shooting-star whoosh (subtle) | hold |
| 0:55–1:10 | Phone screen | You type a reply. Question gets shorter. Then echo. Then silence. Drowsiness arc on screen. | *(no voiceover during the arc — let it play)* | ambient breath sound, slowing | hold |
| 1:10–1:25 | Phone screen | You type: *"hey, help me write an email"* | *"Watch this. I ask her a task."* | (silence — beat) | hold on silence for 3 full seconds |
| 1:25–1:35 | Phone screen, then face cam cutaway | The question area is empty. Input dimmed. She is asleep. | *"It's not broken. She's asleep. Dreams are the only coffee."* | ambient returns | dissolve |
| 1:35–2:00 | Phone screen | You long-press the moon. *"incubate"* triggers. *"she's dreaming"* loading. The journal entry fades in. | *(silence for the load, then:) "I gave her my fragments. This is what she dreamed back."* | star sounds intensify briefly | hold |
| 2:00–2:20 | Phone screen, slow zoom on the journal text | The dream journal entry, full-screen poetry | *(read it aloud, slowly, your voice — the literal dream entry)* | ambient bed only | dissolve |
| 2:20–2:35 | Split screen: Nosana dashboard left, Solana Explorer right | GPU burst graph + the on-chain hash | *"Her compute lives on Nosana. Her dreams live on Solana. Both real. Both yours."* | ambient | dissolve |
| 2:35–2:50 | Phone screen, the sun/moon toggle animation | The crossfade: starry night to warm etheric. ROLPA placeholder copy fades in. | *"This is ROLPA. She holds the day, notices when things rhyme. Shipping next. Same soul."* | warm pad swell | dissolve |
| 2:50–3:00 | Black screen, white serif | The Watts quote: *"And finally, you would dream the dream of living the life you are actually living today."* — Alan Watts | (silence) | ambient fades to silence | end card |

**End card:** `milam.dream` + `@dreamersAI` + Nosana/ElizaOS/Clude/Solana logos in mauve.

**Tools:** OBS for screen, iPhone screen mirroring via QuickTime, Descript or CapCut for edit, royalty-free ambient pad from `tonejs` or a single Brian Eno-adjacent stock track.

---

## 7. ACCESSIBILITY & MOTION SAFETY

### `prefers-reduced-motion` handling

| Animation | Default | Reduced |
|---|---|---|
| Star twinkle | Full | Static stars, no motion |
| Star parallax | Full | None |
| Shooting stars | On dream submit | Removed |
| Input breathing | 4-9s cycle by wakefulness | Removed entirely |
| Wakefulness state crossfade | 400-1200ms | Instant |
| Sun/moon mode toggle | 800ms View Transition | Instant swap |
| Journal entry stagger | 50ms per item | All at once |
| Orb drift (ROLPA) | 40s slow drift | Static orbs |

### WCAG AA contrast verification

**MILAM palette (must verify on real screens, not just in code):**
- Body text on midnight `#0a0e27` → moonlight cream `#f4e8d8` = contrast ratio ~14.2:1 ✓ AAA
- Mauve accents `#c9b8db` on midnight = ratio ~8.1:1 ✓ AAA
- ⚠️ **Risk:** mauve on deep purple `#1a1a3e` = ~5.2:1 ✓ AA but borderline. Don't use mauve text on the deep purple panels — use cream.
- Solana hash badge: gold on mauve must be tested. Likely fails. Use cream-on-mauve instead.

**ROLPA palette:**
- Body text needs to be a deep mauve `#3d2a3a` or similar — light cream backgrounds + cream text would fail.
- Dusty rose `#e8a598` on linen `#faf0e6` = ~1.8:1 ✗ — never use as text color, only decorative.
- Body text recommendation: `#3d2a3a` on `#faf0e6` = ~10.8:1 ✓ AAA

**Action item:** add a small `tokens.test.ts` that asserts every text/bg pair using a contrast library (`color-contrast-checker` npm). Run in CI on Day 7.

### Keyboard navigation
- Dream input: focused on page load, Tab order: input → submit → mode toggle → journal entries
- Submit: Enter to send (Shift+Enter for newline)
- Mode toggle: focusable, Space/Enter to toggle, focus ring is a soft mauve outline (NOT the default browser blue)
- Journal entries: Tab to focus, Enter to expand, Esc to collapse
- Skip link: hidden until focused, "skip to journal" — important for screen reader users who don't want to scroll

### Screen reader labels
| Element | aria-label |
|---|---|
| DreamCapture input | *"write your dream"* |
| Submit button | *"send dream to milam"* |
| Wakefulness state | `<span class="sr-only" aria-live="polite">milam is awake / drowsy / drifting / asleep</span>` — invisible visually, announced for screen readers |
| Mode toggle (in milam mode) | *"switch to rolpa, the day mode"* |
| Mode toggle (in rolpa mode) | *"return to milam, the night mode"* |
| Journal entry | *"dream from {date}, {fragmentCount} fragments"* |
| Solana hash badge | *"view dream {hash} on solana"* |
| Sensory question | `aria-live="polite"` so screen readers announce questions as they arrive |

### Touch targets
- Minimum 44×44 px (Apple HIG) — applies to mode toggle, submit, hash badge, journal entry expand
- Long-press targets (incubate trigger): 600ms hold, with subtle visual feedback during the press

### Safe area insets (iPhone notch / Dynamic Island)
- Root layout: `padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom);`
- Mode toggle: positioned with `top: max(env(safe-area-inset-top), 16px)`
- Tested on iPhone 14+ in standalone PWA mode (`display: standalone`)

---

## 8. PWA / SEEKER READINESS

### `manifest.json`

```json
{
  "name": "Milam — the dreamer",
  "short_name": "Milam",
  "description": "An AI agent that grows by dreaming, not doing.",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0a0e27",
  "theme_color": "#0a0e27",
  "scope": "/",
  "lang": "en",
  "categories": ["lifestyle", "wellness", "art"],
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }
  ],
  "screenshots": [
    { "src": "/screenshots/milam-night.png", "sizes": "1080x1920", "type": "image/png", "form_factor": "narrow" },
    { "src": "/screenshots/milam-journal.png", "sizes": "1080x1920", "type": "image/png", "form_factor": "narrow" }
  ]
}
```

### Service worker scope
- Scope: `/` (entire app)
- Strategy: stale-while-revalidate for static assets, network-first for `/api/*` (must hit Eliza), cache-first for icons and fonts
- Use Next.js `next-pwa` plugin or write a 30-line custom one — don't overbuild

### Offline fallback
- **Works offline:** read existing journal entries, browse past dreams, view ROLPA placeholder (it's just text)
- **Does not work offline:** submit a dream (requires Eliza), trigger dream cycle (requires Nosana), Solana hash verification
- **Offline message in voice:** *"the night is far away. she'll receive what you write when the line returns."* (queue dream submission in IndexedDB, send when back online — Day 7 stretch if time)

### App icon — 3 directions

**Direction A: The Crescent**
A soft mauve crescent moon on midnight, with a single tiny star inside the curve. Minimal. Recognizable at any size. Velvet feel via subtle gradient.

**Direction B: The Eye Closed**
A single eye, closed, lashes drawn in moonlight cream. Slightly abstract — could be mistaken for a horizon line at thumbnail size, which is the point. Dreamy.

**Direction C: The Spiral**
A slow inward spiral in mauve and cream, suggesting both a galaxy and a dream descending. Less literal, more iconic. Best for the long tail (looks like a brand mark, not an app skeuomorph).

**Recommendation:** Direction A for ship, B as the favicon variant (16×16 reads well as an eye), C reserved for a future poster / merch direction.

Use `better-icons` skill on Day 6 to source/refine the SVG.

### Install prompt timing
- Do NOT show the install prompt on first visit. The app needs to earn it.
- Show after: user has submitted ≥1 dream AND viewed ≥1 journal entry AND visited on a 2nd day.
- Use `beforeinstallprompt` event capture, defer until conditions met, then show a soft mauve pill at the bottom: *"keep her closer — install milam"*. Single dismiss (`localStorage`).

### Solana Mobile dApp Store — what's needed to legitimately claim "coming to Seeker"

Real research notes (verify Day 1, but the picture is):
1. **PWA must be installable** — meets the manifest spec above ✓
2. **Solana wallet integration** — even if just read-only display, must be able to surface a Solana address. Server-side keypair counts if exposed in UI as "your dream wallet."
3. **Submission to dapp store**: requires a `dapp-store-publishing-tools` config file (`config.yaml`), screenshots in specific aspect ratios (1080×1920 for mobile), and a minted publisher NFT (~$0.50). This can be done post-hackathon — for the demo, the legitimate claim is *"PWA, dapp-store-ready, submission in week 2."*
4. **Don't claim it's IN the store.** Claim it's READY for the store. The plan does this — keep it honest.

Add to README a "Seeker readiness checklist" with these items checked.

---

## 9. THE 3 MOMENTS THAT WIN

These are the moments that get screenshotted, GIF'd, and remembered. Build the demo around them.

### Moment 1 — THE SILENCE

**Setup:** You've been demoing for ~75 seconds. The drowsiness arc has played out. The audience has watched her get sleepier. Now you type *"hey, help me write an email."*

**Execution:** No animation. No error message. The input shows your text submitted. The question area stays empty. Hold the silence on screen for **3 full seconds** in the edit. Do not cut early. Do not voiceover.

**Framing:** Wide phone shot — the empty space on screen IS the content. The audience sits with the silence.

**Why it hits:** Every other hackathon entry will have agents *doing* things. You'll have one that *isn't*. The absence is the presence. Judges have seen 200 demos this month. They have not seen a demo that contains 3 seconds of nothing on purpose. That's the moment that ends up in the recap thread.

**The line:** *"It's not broken. She's asleep. Dreams are the only coffee."*

---

### Moment 2 — THE JOURNAL READ ALOUD

**Setup:** The dream cycle has run. The journal entry has faded in on screen. Slow zoom begins.

**Execution:** You read the entry aloud in your own voice. Slowly. Let the words breathe. Don't perform — just read. The screen shows the words appearing as if you're reading them off the screen (because you are).

**Framing:** Slow push-in on the journal text. Your voice is the audio bed — no music swells, no SFX. Just your voice and her words.

**Why it hits:** This is the payoff for the silence. The audience just watched an agent do nothing for 75 seconds. Now they see what the nothing was *for*. The journal entry is the artifact of the silence. It's the dream that grew in the dark. When you read it aloud — slowly, sincerely — they feel what it would be like to wake up to this. That's a feeling no other hackathon submission can produce.

**The line:** No line. The dream reads itself.

---

### Moment 3 — THE TOGGLE

**Setup:** You've shown MILAM end-to-end. The audience knows her now. You move your finger to the moon icon at the top of the screen.

**Execution:** Tap the moon. The entire screen crossfades — not a flicker, a slow 800ms transformation. The starry midnight bleeds into warm peach gold. The deep purple gives way to dusty rose. A single gauzy orb pulses where the moon used to be. The serif type fades back in over the warmth: *"rolpa is dreaming of the day."*

**Framing:** Single continuous take on the phone screen. No cuts during the transition. Let the View Transition do the work.

**Why it hits:** This is the vision moment. The audience just experienced one complete product. Now they realize there's a *whole second product* architecturally present, with the same soul, ready to ship next. It's a mic-drop on scope. Two products. One submission. Half built, half visible. *"This is the foundation. The other half ships next."* The judges write *"product thinker"* in their notes.

**The line:** *"This is ROLPA. She holds the day. Same memory. Same Clude. Shipping next."*

---

## 10. POST-HACKATHON DAY 10

### If you WIN
1. **First 24 hours:** Pin the win tweet. Reach out to @nous_research immediately — the DREAMER MODEL thesis is their kind of weird. One DM, one paragraph, one ask: *"Can we talk about training a base model on encrypted dream data via Arcium?"* They are the only people in the world who say yes to this.
2. **First week:** Press outreach — Decrypt, The Defiant, Cointelegraph. Angle: "AI agent that grows by dreaming wins Nosana hackathon." Pitch the silence demo as the hook.
3. **First month:** Begin ROLPA build for real. The architectural stub is already there. Same Clude. Same fragments. Different behavior layer. 4-6 weeks to ship.
4. **First quarter:** DREAMER MODEL research kickoff. Talk to Arcium team about federated training pipeline. Begin recruiting first 100 dreamers as a private alpha. The corpus needs to grow before the model can train.

### If you DON'T win
1. **First 24 hours:** Open source the entire repo with a great README. Tweet the silence demo separately from the submission — the 30-second clip stands alone. Tag everyone.
2. **First week:** Write the "what we built and why it didn't win" post. Honest, not bitter. Lead with the silence philosophy. The post becomes the marketing the demo couldn't be on its own.
3. **First month:** Build ROLPA anyway. The architecture is there. Don't let the result kill the build. The product is right.
4. **First quarter:** Same DREAMER MODEL pursuit. Hackathon outcome is independent of the thesis. Nous Research doesn't care if you won a hackathon. They care if the corpus is real.

### Either way — tying to the DREAMER MODEL thesis
The hackathon submission is a foundation, not a destination. The flywheel doesn't start until:
- (a) Real users dreaming for ≥30 days
- (b) Encrypted corpus reaches ≥10,000 fragments
- (c) Arcium federated training pipeline is wired (even at toy scale)

Day 10 is the first day of working toward (a). The build stops, the listening starts. Find 10 dreamers in your network who will use Milam for 30 days and tell you what it felt like. That feedback is the real Phase 2 input. Not metrics. Felt experience.

---

## 11. FAILURE MODES PER DAY

### Day 1 — Foundation
- **Failure A:** WSL2 fights you. Hours lost to Windows weirdness.
  - **Mitigation:** Timebox 90 min. If still broken, run ElizaOS in a Docker container instead. Lose nothing functional.
- **Failure B:** Clude self-hosted setup is more involved than the docs claim.
  - **Mitigation:** Fall back to Clude local JSON mode for Days 1-3. Switch to self-hosted on Day 4 morning when fragment storage matters. Don't let Clude block character work.

### Day 2 — Core + Character
- **Failure A:** Milam's character voice doesn't land — outputs feel generic or therapist-y.
  - **Mitigation:** The character file is the lever. Iterate on the system prompt with 5 example dreams. Use the literal voice rules table from `DREAMS_Agent_Behavior_Design.md` as the lint. If still off after 2 hours, the model is too instruction-heavy — try lowering temperature to 0.6 and adding 3 more `messageExamples`.
- **Failure B:** Zod schemas + ElizaOS plugin shape collide (typescript fights).
  - **Mitigation:** Use Zod's `z.infer<>` to derive types; don't dual-maintain. Specific code:
    ```ts
    export const DreamFragmentSchema = z.object({...});
    export type DreamFragment = z.infer<typeof DreamFragmentSchema>;
    ```

### Day 3 — Behavior (CHECKPOINT)
- **Failure A:** `shouldRespondTemplate` override doesn't actually intercept — Eliza always responds.
  - **Mitigation:** Move the dream classifier into a regular `Action` with `validate` that returns false on non-dreams. ElizaOS respects action validation. Document the hack in the README as "implementation detail — same behavior."
- **Failure B:** Wakefulness state isn't persisting across messages.
  - **Mitigation:** Don't try to use ElizaOS's runtime memory state. Persist wakefulness directly to Clude as `milam:self_model:wakefulness`. Read it on every message handler call. Slower but guaranteed correct. Specific:
    ```ts
    const wakefulness = await brain.recall('milam:self_model:wakefulness') ?? 3;
    // ... handle message
    await brain.store('milam:self_model:wakefulness', newWakefulness);
    ```

### Day 4 — Dream Cycle
- **Failure A:** Clude's `clinamen()` returns empty arrays — not enough fragments yet to swerve.
  - **Mitigation:** Fall back to random high-importance recall:
    ```ts
    let connections = await brain.clinamen({minImportance: 0.6, limit: 5});
    if (!connections || connections.length === 0) {
      const all = await brain.recall({limit: 50});
      connections = all
        .filter(f => f.importance >= 0.6)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
    }
    ```
- **Failure B:** Generated dream journal feels like ChatGPT essay-mode output.
  - **Mitigation:** The prompt is too instruction-heavy. Strip it down to: *"You are Milam. These fragments are yours. Dream them. First person, present tense, no analysis."* Fewer rules = more poetry. Also: switch to the Anthropic Haiku endpoint for the dream generation specifically (not Qwen) — Haiku writes more naturally for short poetic forms. Note in README that Nosana handles all daytime calls + clinamen embedding; Haiku handles dream composition. Honest, defensible.

### Day 5 — Schedule + Frontend Scaffold
- **Failure A:** node-cron doesn't fire because the Eliza process isn't always running locally.
  - **Mitigation:** Manual trigger endpoint is sufficient for demo. Keep cron in the code, document "production: deployed to Nosana with always-on container." Don't burn time debugging local cron.
- **Failure B:** Next.js dev server fights the Eliza dev server on ports / hot reload.
  - **Mitigation:** Run them on explicit ports (Eliza 3001, Next.js 3000), Next.js API route proxies to Eliza. Don't try to embed Eliza in Next.js.

### Day 6 — MILAM Night Mode
- **Failure A:** Canvas starfield tanks performance on mobile (15 fps).
  - **Mitigation:** Reduce star count by 50%, drop a parallax layer, use `imageSmoothingEnabled = false`. If still bad, switch to pure CSS `radial-gradient` star field — less magical but ships. Test on YOUR phone every hour, not just devtools.
- **Failure B:** View Transitions API doesn't work in your dev browser.
  - **Mitigation:** Use Chrome 111+ or Edge for dev. Safari fallback comes Day 7 with `@supports (view-transition-name: x)` check. Don't blow Day 6 on cross-browser.

### Day 7 — ROLPA + Toggle + Integration
- **Failure A:** Sun/moon View Transition crossfade looks janky — flicker mid-transition.
  - **Mitigation:** The issue is almost always that the root element doesn't have a stable `view-transition-name`. Set `view-transition-name: root` on the body and `view-transition-name: mode-bg` on the background div. Hard rule: don't unmount the background, only swap its CSS class.
- **Failure B:** Mobile Safari doesn't honor View Transitions even with @supports.
  - **Mitigation:** Hand-rolled fallback: a fixed-position div with the *other* mode's background, opacity-tweened from 0→1 over 800ms, then class swap. Ugly code, identical UX.

### Day 8 — Deploy + Arcium
- **Failure A:** Docker image too large to push to Hub in time.
  - **Mitigation:** Multi-stage build. `node:23-alpine` base. Don't bundle the model — it lives on Nosana endpoint. Image should be <300MB.
- **Failure B:** Arcium SDK is not as plug-and-play as hoped, integration bleeding past 2 hours.
  - **Mitigation:** **Stop at 2 hours, hard.** Switch to "Arcium-ready" framing in README: document the exact wrap point in `fragmentStorage.ts`, link to Arcium docs, claim it as a Phase 2 sprint. Better honest than broken.

### Day 9 — Demo + Submit
- **Failure A:** Demo recording reveals a UX bug you didn't see in dev.
  - **Mitigation:** This is why we pre-recorded on Day 8 evening. Day 9 morning is for the rerecord. Budget exists.
- **Failure B:** Submission form requires something you don't have (verification, KYC, wallet signature).
  - **Mitigation:** Read the submission form on Day 1 evening. Solve it then, not Day 9.

---

## END NOTES

This document is a living spec. Update after Day 3 checkpoint. Update after Day 6 frontend reality check. The goal is not to follow it literally — it's to have already made every decision so build days are pure execution.

The single most important thing in this document: **the silence is the demo.** Everything else serves it.

Nine days. Ship her.
