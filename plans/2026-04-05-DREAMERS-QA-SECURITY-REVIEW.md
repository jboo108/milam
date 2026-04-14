# DREAMERS — QA / Security Final Gate Review
**Date:** April 5, 2026 (written April 6 early morning after original agent hit rate limit)
**Companion to:** Final build plan + 5 specialist reviews
**Purpose:** Final skeptical pass. Ship-gate checklist. Demo-day run book.

> **Note:** Original qa-security agent hit token limit before writing. This review was written inline by the orchestration lead after absorbing all 6 prior docs.

---

## CONCERNS — what could kill the submission

1. **Feature creep from STEP 2 reviews.** Five specialist agents added enormous detail. Every addition looks reasonable in isolation. Together, they risk exploding the 9-day timeline. The master plan must explicitly reject anything not on the critical path. The silence demo ships even if everything else breaks.

2. **Untested Nosana endpoint shape.** The integrations agent confirmed the Nosana Qwen3.5 endpoint shape is still unconfirmed. This is the single biggest risk. If it's job-based with 30s+ cold starts, MILAM's live replies must use Haiku or the demo is dead. Hour 1 of Day 1 — no exceptions.

3. **Arcium has no public SDK.** The integrations review confirmed it. The fallback (libsodium envelope framed as "Arcium-compatible MXE envelope") is now THE path, not a backup. This needs to be reframed positively in the README — not apologetically.

4. **No rehearsal built into the plan.** Day 9 is record + edit + submit in one day. If anything goes wrong, there's no buffer. The architect and product agents both suggested pre-recording Day 8 evening. This must become a hard rule.

5. **Demo will be recorded on a real phone over real network.** Any one of these fails the demo: Wi-Fi drops, Vercel cold start, Nosana timeout, Solana RPC rate limit, Clude latency, canvas frame drops on the recording phone. The demo must have a "cached reality" mode — pre-generated journal, deterministic responses — clearly labeled in README but used for the video.

6. **Feature freeze is Day 7, not Day 3.** Day 3 checkpoint is about cut decisions. Day 7 is about feature freeze. After Day 7 end: only bug fixes, polish, demo prep. No new features. Must be in the plan explicitly.

7. **No pre-commit hook for secrets.** The data-security review recommended `scripts/check-secrets.sh`. Day 1 install, not Day 8 discovery.

8. **Mainnet Solana wallet must be funded Day 1, not Day 8.** Every agent agreed on this independently. CEX withdrawals can take 24-48h. If Day 8 discovers the wallet is empty and the exchange is verifying, the mainnet demo dies.

9. **No actual disaster plan for "what if Clude self-hosted setup fails entirely."** The mitigation is "fall back to local JSON" — but what does that mean concretely in code? There should be an `adapter` pattern so swapping storage backends is 5 lines, not a refactor.

10. **No dry run of the demo video before Day 8.** You should be able to walk through the 3-minute demo verbally by Day 4, using only what you've built. If you can't narrate the demo on Day 4, you don't have a demo yet.

---

## SUGGESTIONS

1. **Add a "demo rehearsal" task to every day starting Day 3.** 10 minutes at end of day, walk through the portion of the demo you'd show if you had to submit tonight. Builds muscle memory, surfaces gaps.

2. **Build the cached reality mode on Day 5.** When `DEMO_MODE=true` env is set, the frontend reads a pre-generated journal from `public/demo/journal.json` instead of hitting the cycle. Toggle in README. Use for video recording on Day 8.

3. **Install `gitleaks` and a pre-commit hook Day 1.** Blocks commits containing secrets. Cheap insurance.

4. **Ship one Playwright smoke test on Day 7.** Not "full coverage" — one test that does: open page → submit dream → assert reply appears → toggle mode → assert crossfade. That's it. Catches regressions during polish phase.

5. **Run Lighthouse on deployed Vercel build Day 7 evening.** Target 90+. Fix whatever blocks it before feature freeze.

6. **Write the submission form fields to a text file Day 1 evening.** Read the hackathon submission form now. Pre-fill every text field. On Day 9 you paste, not draft.

7. **Record the silence clip Day 3.** Every agent said this. One-take, phone camera, 30 seconds. Insurance for Day 9.

8. **Create `docs/DEMO_SCRIPT.md` Day 4.** The shot-by-shot storyboard from the product pass, as a live document. Update after each day's build. By Day 8, the script reflects reality, not intentions.

---

## 1. Test Coverage Plan (9-day-sized)

**MUST have tests:**
- `plugin-dreamers-core/schemas.test.ts` — Zod schema validation (Day 2)
- `plugin-dreamers-core/fragmentStorage.test.ts` — store/recall/namespace round-trip (Day 2)
- `plugin-milam/wakefulnessProvider.test.ts` — state machine table-driven (Day 3)
- `plugin-milam/dreamClassifier.test.ts` — 10 example classifications (Day 3)
- `plugin-dreamers-core/arciumWrapper.test.ts` — encrypt/decrypt round-trip (Day 2)

**Smoke tested in `scripts/verify.ts`:**
- Supabase connection
- Clude store + recall + clinamen + mini-dream
- Nosana inference (or Haiku fallback)
- Solana memo write
- Arcium envelope round-trip
- Full dream cycle end-to-end

**Manual walkthrough only:**
- Drowsiness conversational arc (Day 3 checkpoint)
- Frontend visual states (Day 6 end)
- Mode toggle animation (Day 7)
- Phone test full flow (Day 7)
- Demo recording (Day 8)

**No tests:**
- Canvas animations (visual review only)
- Design token values (caught by contrast harness in a11y review)
- UI copy (voice is enforced by review, not test)

---

## 2. Critical Path Verification — The 12-step Integration Test

Run on Day 7 and Day 8. Must complete in <5 min.

```bash
# 1. Fresh state
rm -rf .cache/verify && bun run verify

# 2. Open app on phone
# URL: https://dreamers.vercel.app (or local IP)

# 3. Dream submit
# Type: "I dreamed of a warm room with no windows"
# Expected: sensory question fades in within 3s

# 4. Drowsiness arc (4 more exchanges)
# Expected: shorter → echo → silence

# 5. Task test
# Type: "what time is it"
# Expected: silence, 3-second hold

# 6. New dream
# Type: "last night I was underwater"
# Expected: agent wakes, full sensory question

# 7. Trigger cycle
# Long-press moon → "incubate"
# Expected: loading state "she's dreaming" (up to 30s)

# 8. Journal appears
# Expected: poetic dream entry, not report

# 9. Solana hash visible
# Expected: pill link at bottom, click opens mainnet explorer, tx resolves

# 10. Mode toggle
# Tap sun → 800ms crossfade → etheric warmth
# Tap moon → 800ms crossfade → starry night

# 11. Reload page
# Expected: state preserved (wakefulness read from Clude)

# 12. No console errors
# Chrome DevTools → Console → zero red
```

---

## 3. Security Audit Checklist

**Day 1:**
- [ ] `.env` in `.gitignore`
- [ ] `.env.example` committed with placeholder values
- [ ] Install `gitleaks`, add pre-commit hook
- [ ] Supabase project is private (not publicly accessible)
- [ ] GitHub repo is private until submission

**Day 2:**
- [ ] Every schema column has explicit type
- [ ] RLS policies drafted (even for single-user demo)
- [ ] Encryption wrapper (libsodium envelope) implemented and tested
- [ ] `userId` plumbed through every storage call

**Day 5:**
- [ ] Next.js API routes validate input with Zod
- [ ] No secrets in frontend bundle (check `.next/` build output)
- [ ] CORS configured explicitly

**Day 7:**
- [ ] `next.config.ts` has CSP, HSTS, X-Frame-Options headers
- [ ] `bun audit` shows zero critical vulnerabilities
- [ ] No `eval()` or `new Function()` in codebase

**Day 8:**
- [ ] Docker image scanned with `trivy image dreamers-agent:v0.1`
- [ ] Solana keypair NOT in Docker image (`.dockerignore` includes `.keys/`)
- [ ] Nosana job definition injects secrets via env, not baked in
- [ ] Mainnet wallet has enough SOL (verify balance)

**Day 9:**
- [ ] Submission form has no `.env` accidentally pasted
- [ ] README has honest security posture section
- [ ] License file committed (MIT or Apache)

---

## 4. Performance Verification

**Targets (from a11y-perf review):**
- LCP < 2.5s (Vercel edge, mid-Android)
- INP < 200ms
- CLS < 0.1
- JS bundle < 180kb First Load (per a11y-perf)
- Canvas animation 60fps target, 30fps floor
- Lighthouse 90+ in all four categories

**Verification:**
```bash
# Day 7 evening
npx lighthouse https://dreamers.vercel.app --view
# Target: Performance 90+, Accessibility 95+, Best Practices 95+, SEO 90+, PWA all green

# On real phone (Android Chrome remote inspect):
# Chrome DevTools → Performance → Start recording → Submit dream → Stop
# Frame rate should stay ≥50fps during canvas animation
```

---

## 5. Accessibility Verification

**Day 7 hard gate:**
- [ ] Run axe DevTools on every page — zero critical issues
- [ ] Keyboard-only walkthrough: complete drowsiness arc without touching mouse
- [ ] Screen reader walkthrough (VoiceOver/NVDA): complete drowsiness arc
- [ ] Toggle `prefers-reduced-motion`: silence demo still works
- [ ] Every text/bg pair meets AA (automated contrast check from a11y review)
- [ ] All interactive targets ≥48×48 (per a11y review correction)
- [ ] Visible "milam is asleep" caption at wakefulness 0 (per a11y review correction — empty aria-live erases the demo for SR users)

---

## 6. License Compliance

**Day 9:**
```bash
npx license-checker --production --summary > licenses-summary.txt
```
- [ ] No GPL / AGPL dependencies
- [ ] MIT/Apache/BSD only
- [ ] `LICENSE` file in repo root (recommend MIT)
- [ ] `CREDITS.md` naming: ElizaOS, Nosana, Clude, Arcium, Solana, Anthropic, Nous Research (inspiration), Alan Watts (quote)

---

## 7. Decentralization Scorecard (for README honesty)

| Layer | Status | Plan |
|---|---|---|
| LLM inference (nightly) | ✅ Decentralized (Nosana) | Ships |
| LLM inference (live) | ⚠️ Centralized (Anthropic Haiku) | Phase 2: move to Nosana when latency allows |
| Memory | ✅ Decentralized hash (Clude → Solana) + 🟡 centralized store (Supabase) | Phase 2: Clude-native storage |
| Encryption | 🟡 Demo envelope (libsodium, Arcium-compatible) | Phase 2: real Arcium MXE when SDK public |
| Frontend hosting | ❌ Centralized (Vercel) | Phase 2: IPFS mirror |
| Wallet | ❌ Server keypair | Phase 2: user-owned wallet |
| Auth | ❌ None (single user demo) | Phase 2: Sign-in with Solana |

**Judges respect honesty.** Ship this table in the README.

---

## 8. Day 9 Submission Gate Checklist

**Blocks submit until every box checked:**

- [ ] Demo video is 3:00 or under
- [ ] Video uploaded (YouTube unlisted), link works in private browser
- [ ] GitHub repo is public, URL works
- [ ] `main` branch builds cleanly: `bun install && bun run build`
- [ ] Nosana job deployed, job URL in README
- [ ] Mainnet Solana hash clickable on explorer (not devnet)
- [ ] Vercel deployment healthy, no 500s
- [ ] `manifest.webmanifest` valid (Lighthouse PWA check)
- [ ] README has: title, tagline, hero image, demo video link, architecture diagram, 3 screenshots, setup instructions, tech stack table, decentralization scorecard, credits, license
- [ ] No `.env` committed (git log audit)
- [ ] No console errors on deployed frontend
- [ ] Submission form all fields filled (pre-drafted Day 1)
- [ ] X post drafted, scheduled for post-submission
- [ ] IG carousel drafted
- [ ] TikTok clip drafted
- [ ] DREAMER MODEL thesis paragraph in README
- [ ] "Coming soon to Seeker" claim is honest (PWA installable, TWA scaffold, publisher NFT TBD)
- [ ] Arcium framing in README is honest ("Arcium-compatible envelope" not "running on Arcium")
- [ ] Watts quote properly attributed at end of demo
- [ ] Final commit pushed to main

---

## 9. Things That Break in Hackathon Demos (ranked by likelihood)

1. **Live inference cold start during recording.** (MITIGATE: pre-warm 60s before record, cache with `DEMO_MODE=true`.)
2. **Phone screen mirror looks muddy.** (MITIGATE: scrcpy `--video-bit-rate 12M`, test colors ahead of time.)
3. **Vercel deploy fails due to missing env var.** (MITIGATE: deploy Day 5 and never let it regress; env var diff check Day 8.)
4. **Solana wallet runs out of SOL mid-demo.** (MITIGATE: fund Day 1 with 0.05 SOL — 50x buffer.)
5. **Canvas drops frames on recording phone.** (MITIGATE: a11y review has throttling code; record on the best phone available.)
6. **Font FOUT during recording on slow network.** (MITIGATE: `next/font` preload, record on fast Wi-Fi, pre-load once.)
7. **Clude process crashes between Day 8 deploy and Day 9 record.** (MITIGATE: supervisor process, restart on crash, verify before recording.)
8. **Hot reload doubles cron fires overnight.** (MITIGATE: integrations review has guard pattern.)
9. **Nosana job expires mid-demo.** (MITIGATE: redeploy Day 9 morning, keep job alive through submission.)
10. **Screen recorder compresses mauve into muddy purple.** (MITIGATE: bump saturation 5% in CSS vars just for demo mode.)

---

## 10. Demo Day Run Book (Day 9 morning, April 13)

**07:00** — Make coffee. Do not touch laptop.
**07:30** — Open laptop. Check: Nosana job still running? Vercel deployed? Clude responding? Run `bun run verify` from last night's commit.
**08:00** — Review Day 8 pre-recorded demo. Watch it once. Does it still feel right? Any bugs surfaced overnight?
**08:30** — Decision: re-record or ship yesterday's cut?
**09:00** — If re-recording: warm Nosana with a throwaway dream, set DEMO_MODE if needed, record 3 takes.
**10:30** — Edit in Descript or CapCut. Trim to 3:00. No motion graphics beyond the end card.
**11:30** — Export. Upload to YouTube unlisted. Test link in private browser.
**12:00** — README final pass. Run through submission gate checklist section 8 above.
**12:30** — Submit to hackathon portal.
**13:00** — Verify submission received (screenshot confirmation).
**13:30** — Post X thread (pre-drafted from marketing plan).
**14:00** — Post IG carousel, TikTok clip.
**14:30** — DM ecosystem partners (@nosana_ai, @elizaOS, @CludeProject, @ArciumMPC, @solanamobile). Messages pre-drafted.
**15:00** — Close laptop. Walk outside. You did it.

---

## 11. Rollback Plans

**If Arcium wrapper breaks on Day 8:**
```bash
git revert HEAD  # reverts the Arcium commit
# Deploy the pre-Arcium version
# README line: "Arcium envelope integration is Phase 2"
```

**If Nosana deploy fails on Day 8:**
```bash
# Run agent locally, expose via ngrok
bun run dev
ngrok http 3001
# Point Vercel API bridge at ngrok URL via env var
# README line: "Nosana deployment: job ID pending (endpoint healthy)"
```

**If Solana mainnet hash write fails on Day 9 morning:**
```bash
# Fall back to devnet
export SOLANA_CLUSTER=devnet
# README line: "Devnet used for demo due to mainnet RPC issues at submission time"
```

**If the entire Clude backend dies:**
```bash
# Switch to JSON mode
export CLUDE_STORAGE=json
# README line: "Hackathon demo uses local JSON storage; Supabase-backed Clude is in main branch"
```

Each rollback is a single env var or a single commit. Never refactor at demo time.

---

## 12. What This Plan Is Still Missing

1. **No user testing.** You should show MILAM to 1 person (Tina? Katie?) by Day 7 and watch them use it. 15 minutes. Catches everything you can't see as the builder.

2. **No competitive scan.** What else is being submitted to this hackathon? 30 minutes of X searching for "Nosana ElizaOS hackathon" — know your competition so the demo can position against it.

3. **No backup judge story.** If the judges ask a question you didn't prepare for ("how does this scale to 1000 users?"), have a paragraph ready. The data-security review gave you per-user namespacing. Use it.

4. **No mention of the MILAM name origin in demo.** "MILAM means dream in Tibetan" is a 3-second add. Judges love the lineage.

5. **No plan for the 30-second TikTok cut.** Make a vertical 30-second version of the silence demo on Day 9. Different than the 3-min submission video. This is the piece that goes viral separately.

6. **No plan for what happens if you win.** The marketing plan has Day 10 strategy. But specifically: who do you DM in the first hour after winning? Nous Research. Nosana team. ElizaOS team. Clude team. Arcium team. Have the 5 DMs pre-drafted.

7. **No physical artifact backup.** Product pass suggested a printed card. Order it NOW from a same-day print shop or handwrite it. Hold it at the close of the demo.

8. **No emotional preparation.** You will be tired. You will be anxious. Schedule a 20-minute walk before the Day 9 submission. The plan should contain self-care, not just tasks.

---

## END — The Only Thing That Actually Matters

Everything in this review and every other review collapses into one sentence:

**The silence demo must work on a real phone by end of Day 7.**

If that works, you ship something unforgettable. If it doesn't, no amount of Arcium wrappers, design tokens, or marketing plans will save the submission.

Every decision from now until April 13 should be evaluated against: *does this make the silence demo more likely to work, or less?*
