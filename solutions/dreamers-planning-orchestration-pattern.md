---
title: Multi-agent planning orchestration pattern — DREAMERS hackathon case study
date: 2026-04-06
track: knowledge
problem_type: planning_workflow
category: orchestration-patterns
tags: [multi-agent, planning, hackathon, parallel-agents, synthesis, claude-code]
module: orchestration
status: captured
applies_when: "A rapidly-evolving product vision needs to become an execution-ready plan under tight time pressure (hackathon, launch deadline, pivot). Multiple specialist lenses are needed but a single-agent pass would miss dimensions."
---

# Multi-agent planning orchestration pattern
## DREAMERS hackathon case study — April 5-6, 2026

## Context

On the night of April 5-6, 2026, a user (Justin Booher) needed to take a rapidly-evolving product vision and produce an execution-ready 9-day build plan for the Nosana × ElizaOS hackathon (deadline April 14). The vision had moved through three names in two days:

1. **DREAMS** — original night-only dreamer agent plan (thorough, single-focused)
2. **MIRARI** — two-mode umbrella vision adding daytime memory companion
3. **DREAMERS** — final name, with MILAM (night) + ROLPA (day) + DREAMER MODEL (long-term Nous-Research-style fine-tuned base model trained on encrypted dream corpus via Arcium federated training)

The problem: how to absorb a significantly expanded product scope into a plan that was originally designed for a narrower product, without losing the discipline of the original plan OR under-investing in the new dimensions.

Single-agent passes kept producing plans that were either:
- Too narrow (ignored the new thesis)
- Too broad (tried to build everything in 9 days)
- Missing critical specialist dimensions (accessibility, data security, integration edge cases)

The user went to bed and asked for a full orchestration to run overnight.

## Guidance

### The two-step orchestration pattern

**STEP 1 — Breadth pass with three general-purpose specialists (parallel, ~10 min wall clock):**

1. **Architect agent** — deep-detail pass on dependencies, accounts, hosting, MCPs, skills, per-day verification, known traps
2. **Product agent** — UX spec, component breakdown, drowsiness states, demo storyboard, UI copy library
3. **Marketing agent** — brand identity, logo concepts, content pillars, 30-day calendar, ready-to-post content

Each writes a companion doc. Do NOT have them rewrite the master plan — they produce *companion* detail passes that stay attached to the original.

**STEP 2 — Depth pass with five specialized team agents (parallel, ~10 min wall clock):**

1. **ui-craftsman** — design tokens, typography, animations, signature visual moments
2. **a11y-perf** — WCAG audit, reduced-motion, Core Web Vitals, PWA readiness
3. **data-security** — schema DDL, encryption wrapper, RLS, secret management, audit trail
4. **integrations-engine** — third-party API wiring, SDK reality checks, provider abstractions, failure modes
5. **qa-security** — test coverage plan, submission gate, demo runbook, rollback plans

Each also writes a companion doc. Specialists catch what generalists miss and correct contradictions.

**Synthesis step — orchestrator only:**

The orchestrator (main conversation) reads all 8 companion docs and produces a single synthesis block inserted at the TOP of the master plan. The block captures:
- Every architecture change
- Every ecosystem integration correction
- Every visual/UX correction
- Every accessibility correction
- Every security checklist item
- Every demo/recording correction
- Every item to cut
- ONE governing sentence that resolves all future tradeoffs

### Why this structure works

1. **Parallelism buys wall-clock time.** Three agents in STEP 1 + five in STEP 2 = 8 agents running in ~20 minutes total, not 8 hours sequential.

2. **Different agent types catch different dimensions.** The architect used for STEP 1 is good at systems thinking but not visual design. The ui-craftsman in STEP 2 is terrible at dependency pinning but excellent at canvas animation. Using both gives full coverage.

3. **Companion docs preserve discipline.** Having specialists rewrite the master plan would create 8 different master plans and lose all coherence. Having them write companions preserves one master plan and adds detail as append-only.

4. **The synthesis block is the contract.** Rather than merging all specialist changes into prose throughout the master plan (losing provenance), a single synthesis block at the top numbers every change (1-49 in the DREAMERS case). Each change is attributable and reviewable.

5. **One governing sentence prevents scope creep.** With 49 synthesis items, every future tradeoff could spiral. A single question — "Does this make the silence demo more likely to work on a real phone by end of Day 7, or less?" — collapses every decision.

## Why this matters

**Before this pattern:** a single plan doc, rewritten by whichever agent the user happened to dispatch, slowly losing coherence as the vision evolved.

**After this pattern:** a stable master plan + 7 companion detail passes + 1 cross-document review = 9 navigable documents where every specialist lens is preserved AND every change is attributable.

**Compound benefit:** future hackathons or time-constrained planning sessions can reuse this structure verbatim. The agents change (architect, product, marketing, ui-craftsman, a11y-perf, data-security, integrations-engine, qa-security), but the two-step breadth→depth rhythm is portable.

## When to apply

- Hackathon deadlines (any tight-timeline creative build)
- Product pivots where old plans need integration with new vision
- Feature launches spanning multiple specialist domains (frontend + backend + data + security + integrations)
- Any planning session where a single-agent pass keeps missing dimensions
- When the user is going to sleep and wants overnight progress

## Key architectural decisions captured in this case

These were the load-bearing decisions the orchestration surfaced. They are specific to DREAMERS but illustrate the kind of decisions this pattern catches:

1. **Plugin split architecture** — `plugin-dreamers-core` (shared Clude/types) + `plugin-milam` (night behavior) + `plugin-rolpa` (empty stub). Enables future ROLPA build with zero refactoring. Surfaced by architect, confirmed by integrations.

2. **Arcium-compatible libsodium envelope** instead of waiting for gated Arcium SDK. Framed in README as "Arcium-compatible MXE envelope" with migration path. Reframes a blocker as a feature. Surfaced by data-security, confirmed by integrations (no public Arcium npm package exists).

3. **LLM provider abstraction on Day 1** — `generate()` with Nosana/Haiku/Mock behind `LLM_PROVIDER` env var. Haiku handles live replies (latency-critical); Nosana handles nightly dream cycle burst (the GPU moment judges care about). Surfaced by integrations and architect independently.

4. **Envelope encryption moved from Day 8 stretch to Day 2 required.** 60 lines of code, reframes entire privacy posture for judges. Surfaced by data-security specialist — a generalist wouldn't have caught how much this changes the story.

5. **Per-user namespace baked into Clude keys from Day 2** even though hackathon is single-user. Format: `milam:{userId}:episodic:fragment-{uuid}`. Zero cost now, enables Phase 2 auth with zero refactoring. Demonstrates architectural thinking to judges. Surfaced by data-security and product.

## Examples

### Agent dispatch pattern (parallel, background)

```
Agent(architect) → companion doc 1
Agent(product) → companion doc 2         [all dispatched in one tool-call batch,
Agent(marketing) → companion doc 3         run_in_background: true]

# wait for all three completions

Agent(ui-craftsman) → companion doc 4
Agent(a11y-perf) → companion doc 5         [dispatched in one tool-call batch]
Agent(data-security) → companion doc 6
Agent(integrations) → companion doc 7
Agent(qa-security) → companion doc 8

# wait for all five completions

# orchestrator synthesis (no agent — main conversation)
Edit(master-plan) → insert synthesis block at top
Write(cross-doc-review) → coherence/contradiction check
```

### Synthesis block structure

```markdown
## ⚡ STEP 1 + STEP 2 FINDINGS — CRITICAL PLAN UPDATES

### Architecture changes
1. [change + source agent]
2. [change + source agent]
...

### Ecosystem integration corrections
11. [change + source agent]
...

### Visual / UX corrections
18. [change + source agent]
...

### Accessibility corrections (non-negotiable)
25. [change + source agent]
...

### Security checklist (Day 1)
32. [change + source agent]
...

### Demo / recording corrections
36. [change + source agent]
...

### Things to cut (confirmed by multiple reviews)
41. [cut + why]
...

### The ONE sentence that governs every decision from here
[governing question that collapses future tradeoffs]
```

### Cross-document contradiction resolution

When specialists disagreed, the cross-document review captured and resolved each conflict:

| Conflict | Source A | Source B | Resolution |
|---|---|---|---|
| Enter-key behavior | Product: Enter submits | A11y: Enter=newline, Cmd+Enter=submit | A11y wins — dreams need newlines |
| Touch target size | Product: 44×44 (Apple HIG minimum) | A11y: 48×48 (Material target) | A11y wins — stricter spec |
| Checkpoint day | Original plan: Day 3 | Architect + QA: Day 7 feature freeze | Both — Day 3 = cut checkpoint, Day 7 = feature freeze |
| Frontend scaffold timing | Plan: Day 5 | Architect: Day 1 evening | Day 1 — parallelizes the week |

## Prevention of common failure modes

1. **Don't let specialists rewrite the master plan.** They produce companion docs. Synthesis is the orchestrator's job alone.
2. **Don't skip the cross-document review.** Specialists contradict each other. Catching and resolving those contradictions is the difference between a coherent plan and 8 conflicting plans.
3. **Don't run STEP 2 before STEP 1 finishes.** STEP 2 agents need to read STEP 1's output for full context. Dependency chain must be explicit in task tracking.
4. **Don't dispatch a `Plan`-type subagent when you need file writes.** `Plan` mode is read-only. For write-capable specialist work, use `general-purpose` or team agents (frontend-lead, backend-lead, etc.).
5. **Don't hand-wave the synthesis.** Every synthesis item should be numbered, attributable to a source agent, and actionable. "Various improvements" is a failure.
6. **Preserve the governing sentence.** As days pass and fatigue builds, every decision drifts. The single sentence is the anchor.

---

*Captured by: Claude Code orchestration lead, during overnight DREAMERS planning session.*
*Next application: any hackathon, launch, or pivot where a plan needs multiple specialist lenses under time pressure.*
*Related docs: `C:/Users/JBOO/dreams/plans/` (8 companion planning docs from this session).*
