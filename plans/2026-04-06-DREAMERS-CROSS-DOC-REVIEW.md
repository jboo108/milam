# DREAMERS — Cross-Document Review
**Date:** April 6, 2026 (pre-dawn)
**Scope:** Final coherence/contradiction/risk pass across all planning documents before Day 1 execution.
**Documents reviewed:**
1. `2026-04-05-DREAMERS-FINAL-BUILD-PLAN.md` (master)
2. `2026-04-05-DREAMERS-ARCHITECT-DETAIL-PASS.md`
3. `2026-04-05-DREAMERS-PRODUCT-DETAIL-PASS.md`
4. `2026-04-05-DREAMERS-UI-CRAFTSMAN-REVIEW.md`
5. `2026-04-05-DREAMERS-A11Y-PERF-REVIEW.md`
6. `2026-04-05-DREAMERS-DATA-SECURITY-REVIEW.md`
7. `2026-04-05-DREAMERS-INTEGRATIONS-REVIEW.md`
8. `2026-04-05-DREAMERS-QA-SECURITY-REVIEW.md`
9. `marketing/2026-04-05-DREAMERS-MARKETING-PLAN.md`

> **Note:** `ce-review` skill expects a git diff context; the plan corpus lives on Drive. This review was performed manually by the orchestration lead across the 9 documents.

---

## VERDICT: Ready with one tightening pass

The plan corpus is unusually coherent for 9 independent agent outputs. Most contradictions are benign (different agents using slightly different numbers for the same thing — 44 vs 48 touch targets, Day 3 vs Day 7 checkpoint) and have been resolved in the master plan synthesis block.

**One remaining blocker before Day 1:** Nosana endpoint shape must be confirmed in hour 1 of Day 1. Everything else is a green light.

---

## P0 — Must resolve before Day 1

### P0-1: Nosana endpoint shape is unconfirmed
**Source:** Architect detail pass (§Concerns 3), Integrations review (§1)
**Issue:** The entire live-reply architecture depends on whether Nosana's Qwen3.5 endpoint is OpenAI-compatible (sub-second latency) or job-based (30+ second cold start). The integrations review recommends Haiku for live replies regardless, but this must be confirmed before any wiring.
**Resolution:** Day 1 Hour 1 — check Nosana Discord `#hackathon` channel, review `nosana-ci/agent-challenge` repo for example clients. Decision tree:
- If OpenAI-compatible + <3s latency → Nosana for both live + nightly
- If job-based OR >5s latency → Haiku for live, Nosana for nightly only
- If endpoint unreachable → Haiku for both, Nosana integration is "warm standby" + demo screenshot

---

## P1 — Resolved contradictions (document where the final answer lives)

### P1-1: Enter-key behavior in dream input
**Conflict:**
- Product detail pass §5: "Submit: Enter to send (Shift+Enter for newline)"
- A11y-perf review §4: "Enter=newline, Cmd+Enter=submit"

**Resolution:** A11y-perf wins. Dreams naturally span multiple lines; Enter must insert a newline. Cmd/Ctrl+Enter submits. Folded into master plan synthesis block #30.

### P1-2: Touch target size
**Conflict:**
- Product detail pass §7: "Minimum 44×44 px (Apple HIG)"
- A11y-perf review §5: "48×48 minimum (Material spec; Apple HIG is minimum, not target)"

**Resolution:** 48×48. Material is stricter; exceeds Apple minimum. Folded into synthesis block #29.

### P1-3: Checkpoint day (Day 3 vs Day 7)
**Conflict:**
- Original master plan: "Day 3 is checkpoint"
- Architect review suggestion #9: "Day 7 is the real checkpoint, not Day 3"
- QA review concern #6: "Feature freeze is Day 7, not Day 3"

**Resolution:** Both are right — Day 3 is a **cut checkpoint** (kill non-essential features), Day 7 is a **feature freeze** (no new code, only polish). Folded into synthesis block #10.

### P1-4: Wakefulness indicator visibility
**Conflict:**
- Original plan: "drowsiness indicator (subtle — maybe opacity or breathing animation)" — present in UI
- Product pass suggestion #10: "Remove the wakefulness indicator from the visible UI. Labeling it kills it."

**Resolution:** Hide the indicator. State is communicated through opacity, font size, breathing rate, and the content of the reply itself. Folded into synthesis block #23.

### P1-5: Day palette contrast failures
**Conflict:**
- Original plan palette: dusty rose `#e8a598`, warm gold `#d4a574`
- A11y-perf audit: dusty rose on linen = 1.8:1 (fails AA), gold on mauve = 1.8:1 (fails AA)

**Resolution:** A11y-perf corrected palette wins. `--day-text-accent: #b5645a`, `--day-focus: #6b3f5a`. Folded into synthesis block #25-27.

### P1-6: Frontend scaffold timing
**Conflict:**
- Original master plan: "Day 5 — Next.js scaffold"
- Architect suggestion #2: "Move frontend scaffold from Day 5 to Day 1 evening"
- UI craftsman §10: Day 6 starts with "tokens + layout" — assumes scaffold already exists

**Resolution:** Day 1 evening, 30 minutes for `create-next-app` + Tailwind + tokens. Parallelizes the week. Folded into synthesis block #9.

### P1-7: Arcium placement in timeline
**Conflict:**
- Original plan: Arcium on Day 8
- Data-security review: "Move envelope encryption from Day 8 stretch to Day 2 required"
- Integrations review: "Arcium has no public npm package; envelope fallback is the primary path"

**Resolution:** Day 2 builds the envelope wrapper (60 lines libsodium). Day 8 is README polish + framing, not build. Arcium is architecturally essential via the envelope, not via a gated SDK. Folded into synthesis blocks #2 and #14.

### P1-8: next-pwa vs serwist
**Conflict:**
- Original plan + product pass: `next-pwa`
- A11y-perf review: "`next-pwa` unmaintained (swap to Serwist)"

**Resolution:** Serwist. Folded into synthesis block #7.

### P1-9: shadcn/ui
**Conflict:**
- Original frontend plan mentions shadcn/ui
- Architect suggestion #7: "Drop shadcn/ui. Use Tailwind + Framer Motion + hand-built components."
- UI craftsman implicitly agrees (custom components throughout)

**Resolution:** Drop. Folded into synthesis block #6.

---

## P2 — Remaining risks (monitor, not blockers)

### P2-1: React 19 + Framer Motion compatibility
**Source:** Architect detail pass §Day 6 traps, UI craftsman §3
**Issue:** Framer Motion 11+ vs React 19 may have compatibility edges. Neither agent confirmed which version works.
**Mitigation:** Day 5 morning — use context7 to confirm current compatible version. If broken, fall back to CSS + View Transitions only (UI craftsman's preferred choice anyway).

### P2-2: View Transitions API Safari fallback
**Source:** UI craftsman §6, A11y-perf §10
**Issue:** Safari iOS support is partial. iOS PWA users may see instant swap instead of crossfade.
**Mitigation:** UI craftsman specced a dual-path crossfade wrapper. Safari gets the fallback. Test on iPhone Day 7.

### P2-3: Canvas animation battery drain on Seeker
**Source:** A11y-perf §10 (failure mode), UI craftsman §3 (perf budget)
**Issue:** 60-80 canvas stars with requestAnimationFrame can pin mid-range Android CPU.
**Mitigation:** UI craftsman specced throttling (30fps floor, visibility: hidden on background, devicePixelRatio cap). A11y-perf added battery monitoring via the Battery API. Test on real Android Day 7.

### P2-4: Supabase free tier connection pool
**Source:** Integrations review §9
**Issue:** Clude will hold persistent Postgres connections. Free tier has limited pool. Concurrent dream cycle + live replies could exhaust.
**Mitigation:** Use Supabase session pooler URL for Clude (not direct connection). Transaction pooler for Next.js API routes. Documented in integrations review.

### P2-5: Solana RPC rate limits on mainnet
**Source:** Integrations review §4
**Issue:** Public mainnet RPC endpoints rate-limit aggressively. Demo recording could hit 429.
**Mitigation:** Use a paid RPC provider (Helius, QuickNode) for mainnet. Cost: ~$0 on free tier with 100k requests/month. Sign up Day 1.

### P2-6: Demo video live inference
**Source:** Architect suggestion #10, product suggestion #5, QA concern #5
**Issue:** Recording over real network with live Nosana inference is fragile.
**Mitigation:** `DEMO_MODE=true` cached reality mode built Day 5. Record against cache Day 8 evening. Label honestly in README. Folded into synthesis block #38.

---

## P3 — Tightening opportunities (post-Day-3 checkpoint)

### P3-1: Missing user testing plan
**Source:** QA review §12
**Suggestion:** Show MILAM to one person (Tina or Katie) by Day 7. 15 minutes. Catches blind spots.

### P3-2: Missing competitive scan
**Source:** QA review §12
**Suggestion:** 30 minutes on Day 1 evening searching X for "Nosana ElizaOS hackathon" to know the competition.

### P3-3: MILAM name origin in demo
**Source:** QA review §12
**Suggestion:** Add 3 seconds in the demo script: "MILAM means dream in Tibetan." Lineage resonates with judges.

### P3-4: Physical artifact for demo close
**Source:** Product suggestion #9
**Suggestion:** Print or handwrite a small card with Milam's name + one line of poetry + the URL. Hold at the end. Costs nothing, lands.

### P3-5: TikTok-specific 30-second cut
**Source:** QA review §12
**Suggestion:** Make a vertical 30-second silence-demo cut separately from the 3-minute submission video. Different optimal format, different viral potential.

---

## Cross-document coherence — strengths

1. **The silence demo** is the single load-bearing moment. Every agent independently converged on it. QA-security made it the closing sentence.
2. **Per-user namespace from Day 2** is consistent across data-security, product, and architect.
3. **Fund mainnet Solana Day 1** is consistent across architect, data-security, integrations, QA.
4. **Record silence clip Day 3** is consistent across architect, product, QA.
5. **Pre-record demo Day 8 evening** is consistent across architect, product, QA.
6. **Arcium envelope as primary path** is consistent across data-security, integrations, QA.
7. **DREAMER MODEL thesis** threads through architect, product, marketing, QA — it's the spine of the long-term vision.

---

## What's missing from the corpus entirely

1. **`scripts/verify.ts` actual code.** Architect and integrations both described it. Neither wrote the actual file. Day 2 afternoon task.
2. **`tokens.css` actual file.** UI craftsman described it but didn't write it to disk as a real file (it's inside the review doc). Day 1 evening: extract and save as `apps/web/styles/tokens.css`.
3. **`milam.character.json` with the voice corrections.** The original is in `DREAMS_Execution_Plan.md` at lines 156-222. Should be copied/renamed Day 2 morning.
4. **Nosana hackathon endpoint URL + token.** Unknown until Day 1 Hour 1 research spike.
5. **Domain name purchase.** Product suggested `dreamers.fun` or `milam.dream`. User decides + buys Day 1. Under $15.

---

## Final tightening recommendations (for Day 1 briefing)

1. **Resolve P0-1 (Nosana endpoint) before doing anything else.** Everything downstream depends on this.
2. **Extract tokens.css from the UI craftsman review into a real file Day 1 evening.** Ready for Day 6 use.
3. **Buy the domain Day 1.** Put on Vercel. Deploy a placeholder.
4. **Run `bun run verify` as end-of-day ritual starting Day 2.** The harness catches regressions instantly.
5. **Before any commit, verify `.env` is not staged.** Install gitleaks Day 1.
6. **Day 3 checkpoint answer is binary:** drowsiness arc felt real → continue. Anything less → cut voice, simplify ROLPA placeholder, drop stretch goals, protect the core.
7. **Day 7 end state is a working phone demo.** If by Day 7 evening the full integration test doesn't pass on a real phone, stop building and start fixing.
8. **Day 9 submit is a ceremony, not work.** All work must be done by Day 8.

---

## Review complete

**Verdict:** Ready with one tightening pass (Nosana endpoint confirmation). All contradictions resolved in master plan synthesis block. All residual risks have mitigation paths. The plan is tight enough to execute. Ship it.

**The single sentence that governs every Day 1-9 decision:**

> Does this make the silence demo more likely to work on a real phone by end of Day 7, or less?
