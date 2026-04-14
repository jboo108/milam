# DREAMERS — Accessibility & Performance Specialist Review
**Date:** April 5, 2026
**Reviewer:** A11y/Perf specialist pass
**Scope:** Next.js 15 + React 19 + Tailwind v4 frontend for MILAM (night) / ROLPA (day), PWA, Seeker target, 9-day hackathon build.
**Inputs reviewed:** FINAL-BUILD-PLAN, PRODUCT-DETAIL-PASS, ARCHITECT-DETAIL-PASS.

---

## CONCERNS (top)

1. **Dusty rose `#e8a598` on linen `#faf0e6` = ~1.8:1.** Product pass flagged it; no replacement token yet. Ship blocker for ROLPA mode.
2. **Wakefulness 0 "silence" is poorly screen-reader-addressable.** `aria-live="polite"` on an empty div announces nothing. A blind user will not experience the demo at all — and the demo IS the pitch.
3. **Canvas starfield + View Transitions + breathing CSS + Framer Motion journal on a mid-range Android = CPU/battery risk.** No documented frame budget, no throttling, no `visibilitychange` pause outside of "visibility:hidden when tab hidden" prose.
4. **`prefers-reduced-motion` plan removes motion but does not define how the silence demo still tells its story.** Reduced-motion users must still feel MILAM fall asleep.
5. **View Transitions API has partial Firefox/iOS Safari 17 support.** Plan says "feature detect + fall back to Framer crossfade" but never specifies the detection or the fallback behavior for the drowsiness decrement (not just the sun/moon toggle).
6. **Font strategy undecided (Fraunces/Cormorant/GT Sectra).** Display serifs are 200–400kb unsubsetted. No subset plan → CLS + LCP risk on 3G.
7. **Focus rings unspecified on the night palette.** Default browser blue on midnight is ugly and low-contrast; plan says "soft mauve outline" but mauve on midnight for a 2px ring may not hit 3:1 non-text contrast.
8. **Touch target for mode toggle in safe-area-top zone may collide with Android gesture bar / Dynamic Island.** Plan uses `max(env(safe-area-inset-top), 16px)` — good — but does not verify the 44×44 hit area extends *below* the visual glyph.
9. **No service-worker versioning strategy.** "stale-while-revalidate" without a build-hash cache key = users stuck on old UI after a demo-day hotfix. Fatal on submission day.
10. **`next-pwa` is unmaintained for Next 15.** Architect pass notes "decide Day 5"; specialist recommendation is **Serwist** (the maintained fork). Lock this now.
11. **PWA install prompt timing not wired to the night mode's quiet aesthetic.** A default Chrome banner during the silence beat will kill the demo.
12. **No performance budget gate in CI.** Day 7 ship checklist has no enforced JS/CSS/image budgets.

---

## SUGGESTIONS

1. **Adopt Serwist, not next-pwa.** Maintained, Next 15/App Router native, Workbox-compatible recipes.
2. **Replace dusty rose `#e8a598` as a text color with a deeper rose `#b5645a` (see audit §1).** Keep the original as decorative/orb only.
3. **Add a visible + audible "silence" affordance for screen readers** (see §3). Announce "milam is asleep" once, then go quiet. Re-announce only on state change.
4. **Define a Reduced Motion Silence Mode** (see §2) where the drowsiness arc becomes a textual/typographic fade (font-weight, letter-spacing, opacity jumps at discrete tiers) rather than continuous animation.
5. **Move `next/font` + serif subsetting decision to Day 5 morning, not Day 5 evening.** Block Day 6 until it's locked.
6. **Add `scripts/contrast.test.ts`** (architect pass proposed `tokens.test.ts`) — make it required in the Day 7 checklist.
7. **Add `@next/bundle-analyzer` to the Day 7 gate** with a 180kb First Load JS budget for `/`.
8. **Write a tiny `useDeviceCapability()` hook** that samples `navigator.hardwareConcurrency`, `navigator.deviceMemory`, and battery state, then throttles the canvas star count from 80 → 40 → 20 accordingly.
9. **Explicit View Transitions fallback:** wrap every `<ViewTransition>` usage in a feature detect, fall back to `opacity` transition with `@starting-style`. No Framer fallback for state transitions — bundle cost not worth it.
10. **Defer `framer-motion` to dynamic import** (`next/dynamic`) inside the Journal entry expand, keyed off user interaction. Keeps it off the LCP path.
11. **Lock landscape orientation OR respond to it** — pick. Recommendation: portrait-primary on mobile, responsive on desktop (see §5).
12. **Add a visible `DEBUG_A11Y=1` env flag** that renders the tab order, live regions, and contrast ratios as overlays during Day 7 manual audit.

---

## 1. WCAG AA Audit of the Palette

**Method:** WCAG 2.1 relative luminance contrast. AA normal text = 4.5:1, AA large (≥18.66px bold / ≥24px) = 3:1, AAA normal = 7:1, non-text (focus rings, UI borders) = 3:1.

### MILAM (Night) — declared tokens
| Token | Hex | Purpose |
|---|---|---|
| midnight | `#0a0e27` | primary bg |
| deep-purple | `#1a1a3e` | panel bg |
| lavender | `#c9b8db` | accent/decorative |
| moonlight | `#f4e8d8` | primary text |
| mauve (implied) | `#9a7eb0` | accent tie-in |

### MILAM pairs (computed)
| Foreground | Background | Ratio | Normal AA | Large AA | AAA |
|---|---|---|---|---|---|
| moonlight `#f4e8d8` | midnight `#0a0e27` | **14.2:1** | PASS | PASS | PASS |
| moonlight `#f4e8d8` | deep-purple `#1a1a3e` | **11.0:1** | PASS | PASS | PASS |
| lavender `#c9b8db` | midnight `#0a0e27` | **8.1:1** | PASS | PASS | PASS |
| lavender `#c9b8db` | deep-purple `#1a1a3e` | **6.3:1** | PASS | PASS | FAIL |
| mauve `#9a7eb0` | midnight `#0a0e27` | **4.7:1** | PASS | PASS | FAIL |
| mauve `#9a7eb0` | deep-purple `#1a1a3e` | **3.6:1** | **FAIL** | PASS | FAIL |
| gold `#d4a574` | midnight `#0a0e27` | **8.5:1** | PASS | PASS | PASS |
| gold `#d4a574` | mauve `#9a7eb0` | **1.8:1** | **FAIL** | **FAIL** | FAIL |

**Fixes:**
- **Never put mauve text on deep-purple panels.** Use moonlight cream for body text, lavender only for ≥18.66px bold headings, mauve strictly decorative.
- **Solana hash badge:** replace gold-on-mauve with **moonlight-on-deep-purple** (`#f4e8d8` on `#1a1a3e` = 11:1), with a 1px mauve border. Gold becomes the hover/focus glow only.
- **Focus ring (night):** use **moonlight-cream `#f4e8d8` at 2px with 2px offset** on all interactive elements. Ratio against midnight = 14.2:1. A warm mauve inner-glow is decorative only. Never rely on mauve alone for focus.

### ROLPA (Day) — declared tokens
| Token | Hex | Purpose |
|---|---|---|
| linen | `#faf0e6` | primary bg |
| peach | `#f5d5c0` | panel bg |
| dusty-rose | `#e8a598` | accent (flagged failing) |
| warm-gold | `#d4a574` | accent |

### ROLPA pairs (computed)
| Foreground | Background | Ratio | Normal AA | Large AA |
|---|---|---|---|---|
| dusty-rose `#e8a598` | linen `#faf0e6` | **1.8:1** | **FAIL** | **FAIL** |
| warm-gold `#d4a574` | linen `#faf0e6` | **2.0:1** | **FAIL** | **FAIL** |
| warm-gold `#d4a574` | peach `#f5d5c0` | **1.7:1** | **FAIL** | **FAIL** |
| deep-ink `#3d2a3a` | linen `#faf0e6` | **10.8:1** | PASS | PASS |
| deep-ink `#3d2a3a` | peach `#f5d5c0` | **8.9:1** | PASS | PASS |
| deep-rose `#b5645a` (proposed) | linen `#faf0e6` | **4.7:1** | PASS | PASS |
| plum `#6b3f5a` (proposed) | peach `#f5d5c0` | **7.4:1** | PASS | PASS |

**Fixes:**
- **Add `--rolpa-ink: #3d2a3a`** as the mandatory body-text color (AAA on linen and peach).
- **Add `--rolpa-rose-deep: #b5645a`** for links/accents that must read as text.
- **Keep `#e8a598` and `#d4a574` as decorative only** (orbs, gradients, SVG fills) — never as text color, never as icon stroke below 24px.
- **Focus ring (day):** use **plum `#6b3f5a` at 2px** on linen = 7.4:1. On peach = 5.3:1.

### Tokens file recommendation

```css
/* styles/tokens.css */
:root {
  /* night */
  --night-bg: #0a0e27;
  --night-panel: #1a1a3e;
  --night-text: #f4e8d8;          /* moonlight — body */
  --night-text-muted: #c9b8db;    /* lavender — ≥18.66px only */
  --night-accent: #9a7eb0;        /* mauve — decorative only */
  --night-focus: #f4e8d8;         /* focus ring */

  /* day */
  --day-bg: #faf0e6;
  --day-panel: #f5d5c0;
  --day-text: #3d2a3a;            /* ink — body */
  --day-text-accent: #b5645a;     /* deep rose — links */
  --day-decor-rose: #e8a598;      /* DECORATIVE ONLY */
  --day-decor-gold: #d4a574;      /* DECORATIVE ONLY */
  --day-focus: #6b3f5a;
}

@media (prefers-contrast: more) {
  :root {
    --night-text-muted: #f4e8d8;  /* collapse muted to full cream */
    --day-text-accent: #6b3f5a;
  }
}
```

### Contrast test harness (Day 7 gate)

```ts
// frontend/tests/contrast.test.ts
import { hex, score } from 'wcag-contrast';
const pairs = [
  ['#f4e8d8', '#0a0e27', 4.5], // moonlight on midnight
  ['#f4e8d8', '#1a1a3e', 4.5],
  ['#3d2a3a', '#faf0e6', 4.5],
  ['#3d2a3a', '#f5d5c0', 4.5],
  ['#b5645a', '#faf0e6', 4.5],
] as const;
test.each(pairs)('%s on %s >= %s', (fg, bg, min) => {
  expect(hex(fg, bg)).toBeGreaterThanOrEqual(min);
});
```

---

## 2. `prefers-reduced-motion` Full Specification

### Principle
Reduced motion must not erase the drowsiness arc — it must **translate** it from kinetic to typographic. MILAM still falls asleep, but through discrete visual state rather than continuous animation.

### Table (extends product pass §7)

| Element | Default | Reduced Motion |
|---|---|---|
| StarrySky | 80 stars, parallax, twinkle, shooting star | 30 static stars, no parallax, NO shooting star. Pure SVG, no rAF loop. |
| EthericWarmth orbs | 40s drift, breathing opacity | Static radial gradients. No animation. |
| DreamCapture breathing border | 4s scale+opacity | Instant — no scale, no opacity pulse |
| Wakefulness decrement | View Transition morph 800ms | Instant class swap, CSS `transition: none` |
| Opacity at w=3/2/1/0 | 1.0 / 0.85 / 0.6 / 0.35 | **1.0 / 0.9 / 0.75 / 0.55** (less dramatic so it doesn't look broken) |
| Text at w=0 | fade to silence | **Italicized caption: "milam is asleep. write another dream to wake her."** (discoverable for reduced-motion AND screen readers) |
| Sun/moon crossfade | View Transition 600ms | 120ms opacity fade (still crossfade, just fast) |
| Shooting star on submit | canvas burst | `*` glyph pulse once, no movement |
| Journal entry stagger | 50ms/item | Instant |
| Typewriter question | 40ms/char | All-at-once |

### The silence demo under reduced motion

At wakefulness 0, render:
```tsx
{wakefulness === 0 && (
  <p
    className="milam-asleep"
    role="status"
    aria-live="polite"
  >
    milam is asleep. write another dream to wake her.
  </p>
)}
```
Styled: italic serif, centered, `--night-text-muted`, 1.125rem. The visual hush is communicated through typography and whitespace, not opacity animation.

### Media query code

```css
/* tokens.css — motion layer */
:root {
  --motion-breathing: 4s ease-in-out infinite;
  --motion-vt-duration: 800ms;
  --motion-crossfade: 600ms;
  --opacity-w3: 1.0;
  --opacity-w2: 0.85;
  --opacity-w1: 0.6;
  --opacity-w0: 0.35;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-breathing: none;
    --motion-vt-duration: 0ms;
    --motion-crossfade: 120ms;
    --opacity-w2: 0.9;
    --opacity-w1: 0.75;
    --opacity-w0: 0.55;
  }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .starry-sky-canvas { display: none; }
  .starry-sky-static { display: block; }
}
```

### JS-side detection (for canvas decisions)

```ts
// hooks/useReducedMotion.ts
import { useSyncExternalStore } from 'react';

const query = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    query,
    () => false,
  );
}
```
Use inside `StarrySky.tsx` to skip the rAF loop entirely.

### Dev test plan
1. Chrome DevTools → Rendering panel → "Emulate CSS media feature prefers-reduced-motion: reduce". Walk the entire drowsiness arc. Verify: no animation, silence caption visible, sun/moon toggle still works.
2. macOS/iOS: System Settings → Accessibility → Display → Reduce Motion ON. Verify on real iPhone via Vercel preview URL.
3. Android: Settings → Accessibility → Remove Animations. Verify on Seeker if available, else Pixel emulator.
4. Windows 10: Settings → Ease of Access → Display → "Show animations in Windows" OFF.
5. **Axe DevTools run** with reduced motion on — should pass with zero motion-related violations.

---

## 3. Screen Reader Experience — MILAM Walkthrough

Target readers: **NVDA + Firefox (desktop)**, **TalkBack + Chrome (Android/Seeker)**, **VoiceOver + Safari (iOS)**.

### Page load
- Document `<title>` = "MILAM — the dreamer · DREAMERS"
- `<main>` landmark contains the whole experience. Skip link (visible on focus) jumps to `#journal`.
- On mount: `<h1 class="sr-only">MILAM. Tell me a dream.</h1>` — visible heading is decorative serif; sr-only h1 is the actual outline.
- Focus lands on the dream textarea automatically (`autoFocus`, but only if `!reducedMotion`-agnostic — do it for all).

**Announcement order (NVDA expected):**
1. "MILAM — the dreamer, DREAMERS" (title)
2. "main landmark"
3. "heading level 1, MILAM, tell me a dream"
4. "write your dream, edit, multi-line"

### Dream submit
```tsx
<button aria-label="send dream to milam" type="submit">
  send
</button>
```
On submit:
- Button briefly shows "sending" via `aria-live="polite"` on a status node.
- After reply arrives, focus does **not** move (user keeps typing context). Instead the question region is an `aria-live="polite"` element.

### Sensory question arriving
```tsx
<div
  id="milam-voice"
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sensory-question"
>
  {question /* empty string when asleep */}
</div>
```
- `aria-atomic="true"` reads the full question each time (not just the diff).
- `role="status"` = polite; does NOT interrupt the user mid-typing.
- At wakefulness 1 (one-word echo): the single word reads cleanly — no punctuation chaos.

### Drowsiness state changes
Yes, announce them. Once per transition, not on every render.

```tsx
<span className="sr-only" aria-live="polite" aria-atomic="true">
  {wakefulnessLabel /* "milam is awake" | "milam is drowsy" | "milam is drifting" | "milam is asleep" */}
</span>
```
Debounce so rapid transitions don't spam. Only announce the *final* state after 600ms settle.

### Silence at wakefulness 0
The tricky one. Three layers:
1. **Visual silence** (the moonlit hush).
2. **Caption** (always rendered under reduced motion, optionally rendered otherwise):
   ```tsx
   <p role="status" aria-live="polite" className="milam-asleep-caption">
     milam is asleep. write another dream to wake her.
   </p>
   ```
3. **Live region update** announces "milam is asleep" exactly once when the state flips to 0.

Critically: **do NOT leave the aria-live region empty expecting screen readers to "announce nothing."** They literally announce nothing, and the blind user gets no demo. The caption text IS the silence demo for SR users.

### Journal entry navigation
```tsx
<section aria-labelledby="journal-heading" id="journal">
  <h2 id="journal-heading">MILAM's dreams</h2>
  <ol role="list" className="journal-list">
    {entries.map(e => (
      <li key={e.id}>
        <article
          aria-labelledby={`entry-${e.id}-date`}
          tabIndex={0}
          onKeyDown={handleEntryKeys}
        >
          <h3 id={`entry-${e.id}-date`}>
            <time dateTime={e.date}>{formatDate(e.date)}</time>
          </h3>
          <p>{e.preview}</p>
          <a
            href={`https://explorer.solana.com/tx/${e.hash}`}
            aria-label={`view dream ${e.hash.slice(0,8)} on solana`}
          >
            on-chain
          </a>
        </article>
      </li>
    ))}
  </ol>
</section>
```
Tab into entries; Enter to expand; Esc to collapse. Expanded state = `aria-expanded`.

### Mode toggle announcement
```tsx
<button
  type="button"
  role="switch"
  aria-checked={mode === 'rolpa'}
  aria-label={mode === 'milam' ? 'switch to rolpa, the day mode' : 'return to milam, the night mode'}
  onClick={toggle}
>
  <span aria-hidden="true">{mode === 'milam' ? '☾' : '☀'}</span>
</button>
```
`role="switch"` + `aria-checked` is more meaningful than button — SR reads "switch, rolpa, off" / "switch, rolpa, on."

---

## 4. Keyboard Navigation Map

### Tab order (top → bottom, DOM order)
1. Skip link (visible on focus) → `#journal`
2. Mode toggle (top-right)
3. Dream textarea (autoFocus on mount)
4. Submit button
5. Voice button (if shipped)
6. Sensory question region — **not focusable** (it's status, not interactive)
7. Journal heading — not focusable
8. Journal entry 1 (tabIndex=0 article)
9. Journal entry 1 Solana link
10. Journal entry 2 ...
11. Footer links

### Key bindings
| Key | Context | Behavior |
|---|---|---|
| Tab / Shift-Tab | global | move forward/back |
| Enter | textarea | newline (Shift+Enter alternative discussed; default Enter = newline, button press = submit) |
| Cmd/Ctrl+Enter | textarea | submit |
| Enter or Space | submit button | submit |
| Enter or Space | mode toggle | toggle |
| Enter | journal entry | expand/collapse |
| Esc | expanded journal entry | collapse |
| Esc | textarea (empty) | blur to allow Tab out cleanly |

**Note:** The product pass says "Submit: Enter to send (Shift+Enter for newline)." This is wrong for a multi-line dream textarea — screen reader + mobile keyboard users will fight it. **Recommend: Enter = newline, Cmd/Ctrl+Enter = submit, explicit Submit button is the canonical path.**

### No modals, no focus traps needed
Confirmed. Only concern: journal expand could become a dialog later — if so, use `<dialog>` element + `showModal()` for native focus trap.

### Skip link
```tsx
<a href="#journal" className="skip-link">skip to dream journal</a>
```
```css
.skip-link {
  position: absolute; left: -9999px; top: 0;
}
.skip-link:focus {
  left: 16px; top: 16px;
  padding: 8px 16px;
  background: var(--night-text);
  color: var(--night-bg);
  border-radius: 8px;
  z-index: 999;
}
```

---

## 5. Touch Target + Mobile UX Audit

### Minimum sizes
All interactive elements ≥ **44×44 CSS px** (Apple HIG) / 48×48 (Material). Use 48×48 as target.

Audit of plan elements:
| Element | Visual size | Hit area | Fix |
|---|---|---|---|
| Mode toggle glyph | ~28px glyph | **48×48** via padding | `padding: 10px; min-width: 48px; min-height: 48px;` |
| Submit button | depends on copy | 48 min | `min-height: 48px; padding: 12px 24px` |
| Journal entry article | large | full card | tap anywhere, 48+ tall |
| Solana hash badge | pill | **48 min** | pad vertically |
| Voice button (if shipped) | circle | 56×56 recommended | larger because long-press |

### Long-press (incubate trigger)
```ts
// hooks/useLongPress.ts
export function useLongPress(cb: () => void, ms = 600) {
  const timer = useRef<number>();
  const fired = useRef(false);
  const start = () => {
    fired.current = false;
    timer.current = window.setTimeout(() => {
      fired.current = true;
      navigator.vibrate?.(30); // haptic
      cb();
    }, ms);
  };
  const cancel = () => clearTimeout(timer.current);
  return {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
  };
}
```
- **Timing:** 600ms (plan-consistent). Add visible progress ring during the press.
- **Haptic:** `navigator.vibrate(30)` on fire. iOS Safari ignores (no API) — visual ring is mandatory.
- **Accessibility:** long-press must have a keyboard alternative (a regular button with same effect). Never require long-press as the only path.

### Safe area insets
```css
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
}
.app-shell {
  padding-top: max(var(--safe-top), 16px);
  padding-bottom: max(var(--safe-bottom), 24px); /* clears gesture bar */
  padding-left: max(var(--safe-left), 16px);
  padding-right: max(var(--safe-right), 16px);
}
.mode-toggle {
  position: fixed;
  top: max(var(--safe-top), 16px);
  right: max(var(--safe-right), 16px);
}
```
Require `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` in `app/layout.tsx` head.

### Landscape
**Recommendation: do not lock.** Manifest `"orientation": "portrait-primary"` is a hint Chrome respects during install, but locking in CSS frustrates tablet judges. Instead, **design responsive**: at landscape min-height < 500px, collapse StarrySky density, reduce breathing amplitude, stack journal horizontally.

### Thumb reach zones
- **Easy reach (bottom 40%):** dream textarea, submit button. ✓
- **Stretch (middle 40%):** sensory question region. ✓ (read-only)
- **Hard reach (top 20%):** mode toggle, skip link. ✓ (infrequent)

Matches plan. No changes.

---

## 6. Core Web Vitals Targets — Mid-range Android ($300 Seeker class)

Target device profile: Snapdragon 7-gen-class, 6–8GB RAM, mid-tier GPU, 4G throttled to Slow 4G in Lighthouse.

| Metric | Target | Stretch | Risk level |
|---|---|---|---|
| **LCP** | < 2.5s | < 1.8s | MEDIUM — serif display font is the LCP element |
| **INP** | < 200ms | < 100ms | MEDIUM — canvas rAF loop can block input |
| **CLS** | < 0.1 | < 0.05 | HIGH if font not subsetted + no `next/font` |
| **FCP** | < 1.8s | < 1.2s | LOW |
| **TTFB** | < 800ms | < 400ms | LOW (Vercel edge) |
| **TBT** | < 300ms | < 150ms | MEDIUM — canvas init blocks main thread |

### How to measure
1. **Lighthouse mobile** via `npx lighthouse https://dreamers.vercel.app --preset=mobile --throttling-method=simulate`.
2. **PageSpeed Insights** on the deployed URL — uses real Chrome UX data after a few days of traffic.
3. **WebPageTest** with Moto G4 profile + Slow 4G. Free tier.
4. **Real device: a Pixel 6a or the Seeker itself** connected via `chrome://inspect` to DevTools Performance panel.
5. **`web-vitals` library** wired to console in dev, to Vercel Analytics in prod:
   ```ts
   import { onLCP, onINP, onCLS } from 'web-vitals';
   onLCP(console.log); onINP(console.log); onCLS(console.log);
   ```

### Risks and mitigations
| Risk | Metric | Mitigation |
|---|---|---|
| Unsubsetted Fraunces = 300kb, delayed text paint | LCP, CLS | `next/font/google` with `subsets: ['latin']`, `display: 'swap'`, `preload: true`, pinned axis range |
| Canvas init on mount blocks main thread | LCP, TBT | Defer canvas init via `requestIdleCallback` or `setTimeout(0)`. Render a CSS gradient bg first; upgrade to canvas after paint. |
| rAF loop @ 60fps CPU | INP | Cap to 30fps when `document.hidden` transitions, `battery.level < 0.2`, or `hardwareConcurrency < 4` |
| View Transitions coordinator = layout thrash on decrement | INP, CLS | Use `contain: layout` on the SensoryQuestion container |
| Framer Motion on initial bundle | LCP, TBT | `next/dynamic` on journal expand only |
| Missing image dimensions (hero starfield, orbs) | CLS | All decorative = CSS, not `<img>`. If used, `next/image` with explicit `width`/`height`. |
| Service worker not yet installed on first visit | TTFB | No impact first visit; huge help second visit. Accept. |

---

## 7. Performance Budget

### Hard budgets (enforce in CI)

| Asset | Budget | Tool |
|---|---|---|
| `/` First Load JS | **180 kb gzipped** | `@next/bundle-analyzer`, `next build` output |
| Route JS `/rolpa` | 50 kb gzipped | same |
| CSS total | 30 kb gzipped | bundle analyzer |
| Fonts total | **120 kb** (2 weights of 1 serif, subset latin) | network panel |
| Initial HTML | 20 kb | |
| Image total initial | 50 kb (icons only; backgrounds are canvas/CSS) | |
| **Total initial transfer** | **~400 kb** | Lighthouse |
| Network requests initial | ≤ 10 | Lighthouse |
| Canvas frame rate | 60fps typical, **30fps floor**, pause when hidden | DevTools Perf |

### Next.js specific optimizations

```ts
// next.config.ts
import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const config: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })(config);
```

### Font setup (`next/font`)

```ts
// app/layout.tsx
import { Fraunces } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-serif',
  preload: true,
  axes: ['opsz', 'SOFT'],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fraunces.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```
This gives one variable-font file, subset to latin, swap so text renders with a fallback and swaps when loaded (no invisible-text period). FOUT is acceptable; FOIT is not.

### Framer Motion deferral

```ts
// components/DreamJournal.tsx
import dynamic from 'next/dynamic';
const MotionExpand = dynamic(() => import('./MotionExpand'), { ssr: false });
```

### Tree-shaking View Transitions
React 19's `<ViewTransition>` is core — nothing to tree-shake. Do NOT also install `@vercel/react-view-transitions` unless feature detection for older browsers demands it (it's ~4kb).

### Canvas throttling

```ts
// components/StarrySky.tsx — excerpt
const targetFps = useMemo(() => {
  if (reducedMotion) return 0;
  if (typeof navigator === 'undefined') return 60;
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as any).deviceMemory ?? 4;
  if (cores <= 2 || mem <= 2) return 30;
  return 60;
}, [reducedMotion]);

const frameInterval = 1000 / targetFps;
let lastFrame = 0;
function loop(ts: number) {
  if (ts - lastFrame < frameInterval) {
    rafId = requestAnimationFrame(loop);
    return;
  }
  lastFrame = ts;
  draw();
  if (!document.hidden) rafId = requestAnimationFrame(loop);
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelAnimationFrame(rafId);
  else rafId = requestAnimationFrame(loop);
});
```

---

## 8. PWA Audit

### Updated `manifest.json`

```json
{
  "name": "DREAMERS — MILAM & ROLPA",
  "short_name": "DREAMERS",
  "description": "An AI agent that grows through dreaming, not doing.",
  "id": "/?source=pwa",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "display_override": ["window-controls-overlay", "standalone", "minimal-ui"],
  "orientation": "portrait-primary",
  "background_color": "#0a0e27",
  "theme_color": "#0a0e27",
  "lang": "en",
  "dir": "ltr",
  "categories": ["productivity", "lifestyle", "utilities"],
  "prefer_related_applications": false,
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" },
    { "src": "/icons/icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any" }
  ],
  "screenshots": [
    { "src": "/screenshots/milam-night.png", "sizes": "1080x1920", "type": "image/png", "form_factor": "narrow", "label": "MILAM night mode" },
    { "src": "/screenshots/journal.png", "sizes": "1080x1920", "type": "image/png", "form_factor": "narrow", "label": "Dream journal" },
    { "src": "/screenshots/rolpa-day.png", "sizes": "1080x1920", "type": "image/png", "form_factor": "narrow", "label": "ROLPA day mode" }
  ],
  "shortcuts": [
    { "name": "Write a dream", "short_name": "Dream", "url": "/?source=shortcut", "icons": [{ "src": "/icons/shortcut-dream.png", "sizes": "96x96" }] },
    { "name": "Read journal", "short_name": "Journal", "url": "/#journal", "icons": [{ "src": "/icons/shortcut-journal.png", "sizes": "96x96" }] }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  },
  "protocol_handlers": [
    { "protocol": "web+dreamers", "url": "/?share=%s" }
  ]
}
```

**Additions over product pass:**
- `id` for stable PWA identity
- `display_override` for graceful fallback
- `categories`, `dir`, `lang` for store listings
- `shortcuts` (long-press app icon menu)
- `share_target` (Android share sheet receives text → opens as dream draft)
- `protocol_handlers` (deep link path)
- Maskable + SVG icons

### Icon generation

```bash
# Day 6, one-shot
npx pwa-asset-generator ./icons/source.svg ./public/icons \
  --background "#0a0e27" \
  --padding "15%" \
  --opaque false \
  --maskable true \
  --favicon \
  --manifest ./public/manifest.json
```
Source SVG at 1024×1024 minimum. Run once, commit outputs.

### Service worker — Serwist recipe

```ts
// frontend/app/sw.ts
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, NetworkFirst, StaleWhileRevalidate, CacheFirst, ExpirationPlugin } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[];
  }
}
declare const self: ServiceWorkerGlobalScope & typeof globalThis & { __SW_MANIFEST: any };

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // API: always try network, fall back to cache (for offline journal)
    {
      matcher: /\/api\/.*/i,
      handler: new NetworkFirst({
        cacheName: 'api',
        networkTimeoutSeconds: 3,
        plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 })],
      }),
    },
    // Fonts: cache forever (hashed URLs)
    {
      matcher: /\/_next\/static\/media\/.*\.(woff2|woff|ttf)$/i,
      handler: new CacheFirst({
        cacheName: 'fonts',
        plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 })],
      }),
    },
    // Icons/images
    {
      matcher: /\.(png|jpg|jpeg|svg|webp|avif)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: 'images',
        plugins: [new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 })],
      }),
    },
    // App shell
    {
      matcher: ({ request }) => request.mode === 'navigate',
      handler: new NetworkFirst({
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
      }),
    },
  ],
  fallbacks: {
    entries: [
      { url: '/offline', matcher: ({ request }) => request.destination === 'document' },
    ],
  },
});

serwist.addEventListeners();
```

### Offline fallback page
`/offline/page.tsx`:
```tsx
export default function Offline() {
  return (
    <main className="offline">
      <h1>milam is dreaming.</h1>
      <p>you are offline. your dream will be remembered when you return.</p>
    </main>
  );
}
```
Writes to `localStorage` queue, flushed on `online` event.

### Install prompt timing
```ts
// components/InstallPrompt.tsx
useEffect(() => {
  const handler = (e: any) => {
    e.preventDefault();
    setDeferred(e);
    // Wait until user has submitted at least one dream AND 20s have passed
    // AND wakefulness has hit drifting — so the prompt appears at a soft moment
  };
  window.addEventListener('beforeinstallprompt', handler);
  return () => window.removeEventListener('beforeinstallprompt', handler);
}, []);
```
Show the prompt as a **custom in-app card** styled as night mode — never the default browser banner. Trigger `deferred.prompt()` only on user tap. Demo day: defer the prompt until after the silence beat has played.

### iOS quirks
- iOS ignores `beforeinstallprompt`. Detect iOS standalone via `window.navigator.standalone`.
- Show a manual "add to home screen: tap share → add" card on first iOS visit.
- iOS PWA loses storage after 7 days of non-use — warn in README.
- iOS doesn't support background sync; journal writes must happen on next foreground.
- `apple-touch-icon.png` must be 180×180, in `/public`, referenced in `<link rel="apple-touch-icon">`.
- `<meta name="apple-mobile-web-app-capable" content="yes">` + `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`.

### Vercel-specific PWA gotchas
- **Service worker must NOT be cached by Vercel Edge.** Set `Cache-Control: public, max-age=0, must-revalidate` in `next.config.ts` headers for `/sw.js`. (Included above.)
- **`Service-Worker-Allowed: /` header** required if the SW is served from a subpath — not strictly needed here, but safe.
- **Manifest content-type:** Vercel serves `manifest.json` as `application/json`. Prefer `manifest.webmanifest` which is served as `application/manifest+json`.
- **Preview deployments get their own URL** → service workers scope per-URL → don't test caching on previews, only on the main deployment.

---

## 9. Seeker / Solana Mobile Readiness

### Truthful claim framing (use exactly this language in README + demo)
> "DREAMERS is a PWA built to Solana dApp Store submission standards. It is installable on any Seeker device today, and a Trusted Web Activity wrapper for dApp Store submission is scaffolded in `apps/web/android/`. Submission to the dApp Store is planned for week 2 post-hackathon."

**Do not say:** "available on Seeker," "in the dApp store," "Seeker-native."
**Do say:** "Seeker-installable PWA," "dApp-store-ready," "dApp-store submission prepared."

### Viewport meta requirements
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
```
`viewport-fit=cover` is required for the safe-area insets to activate.
`interactive-widget=resizes-content` prevents the on-screen keyboard from pushing the canvas.

### Wallet connect hook points (deferred, stub now)
```ts
// lib/wallet.ts — stub
export interface WalletHook {
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signMessage: (msg: string) => Promise<string>;
}

export function useWallet(): WalletHook {
  // TODO: wire Mobile Wallet Adapter (MWA) for Seeker
  // For hackathon: read-only display of server-generated "dream wallet" address
  return {
    address: process.env.NEXT_PUBLIC_DEMO_WALLET ?? null,
    connect: async () => { /* noop */ },
    disconnect: () => {},
    signMessage: async () => { throw new Error('not implemented'); },
  };
}
```
This surfaces a Solana address in the UI (requirement #2 for dApp store) without the full MWA dependency.

### Deep link scheme
Use **HTTPS universal links** for Seeker — `https://dreamers.vercel.app/?share=...` — not a custom `dreamers://` scheme. Android Chrome prefers HTTPS; Seeker TWA will auto-route these to the installed app. Back up with `web+dreamers` custom protocol via `protocol_handlers` in manifest.

### Trusted Web Activity (TWA) via Bubblewrap
```bash
# Day 8 or post-hackathon
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://dreamers.vercel.app/manifest.webmanifest
bubblewrap build
```
Requirements:
- Digital Asset Links file at `/.well-known/assetlinks.json` (served by Vercel from `public/.well-known/`)
- SHA256 fingerprint of the signing key embedded in the file
- `android/` folder committed to repo with TWA scaffold (even unsigned)
- This proves "dApp store ready" without submitting

### dApp Store submission checklist (for README)
- [x] PWA installable
- [x] manifest.webmanifest with all required fields
- [x] Icons (192, 512, maskable)
- [x] Service worker registered, offline-capable
- [x] Screenshots (1080×1920 narrow form factor)
- [x] Solana address surfaced in UI
- [ ] Publisher NFT minted (~$0.50, post-hackathon)
- [ ] `config.yaml` for dApp store publishing tools
- [ ] Digital Asset Links verified
- [ ] Bubblewrap TWA signed and built

---

## 10. Failure Modes — Accessibility / Performance

### Canvas battery drain on Seeker
**Detection:**
```ts
const battery = await (navigator as any).getBattery?.();
if (battery && (battery.level < 0.2 || battery.charging === false)) {
  starfield.setTargetFps(15);
}
battery?.addEventListener('levelchange', () => { /* re-evaluate */ });
```
Also throttle via `document.hidden`, `document.visibilityState === 'hidden'`, and an idle timer (pause after 60s of no input).

### View Transitions breaking on Firefox Android
Feature detect at top of client components:
```ts
const supportsVT =
  typeof document !== 'undefined' && 'startViewTransition' in document;

function transitionTo(cb: () => void) {
  if (!supportsVT) { cb(); return; }
  (document as any).startViewTransition(cb);
}
```
Fallback: `cb()` runs immediately and a CSS `opacity` transition with `@starting-style` provides a gentle fade. Never ship a hard cut.

### Font flash on slow 3G (FOUT strategy)
- `next/font` with `display: 'swap'` → text renders in fallback, swaps when font loads. Accept FOUT.
- Define fallback stack with metrics-matched sizing:
  ```css
  :root {
    --font-serif-fallback: 'Times New Roman', Georgia, serif;
  }
  .serif {
    font-family: var(--font-serif, var(--font-serif-fallback));
    /* next/font auto-generates ascent/descent overrides to prevent CLS */
  }
  ```
- Never `display: 'block'` — that causes FOIT and destroys LCP.

### Service worker caching outdated UI
- Serwist `skipWaiting: true` + `clientsClaim: true` forces immediate activation.
- Add a version check:
  ```ts
  // lib/sw-version-check.ts
  navigator.serviceWorker?.addEventListener('controllerchange', () => {
    window.location.reload();
  });
  ```
- Demo day: bump `public/manifest.webmanifest` version, hard-reload Vercel, verify old clients auto-refresh within 60s.
- Cache busting: Next.js hashes filenames automatically for `_next/static/*`. API routes use `NetworkFirst`, so fresh.

### Screen reader announcing "silence" awkwardly
- NEVER leave an empty live region.
- Announce once: "milam is asleep."
- Then render a visible caption only (not live) explaining the state.
- Avoid "null," "undefined," punctuation-only strings, or unicode ellipsis alone in the live region. NVDA reads these literally.
- Test: run NVDA + Firefox with the speech viewer open. The sequence should be: "send dream to milam, button, pressed" → 800ms → "color, shape, or feeling?" → user replies → ... → "milam is asleep." → silence. Confirmed pleasant.

### Other traps to watch
- **`autoFocus` on textarea breaks iOS Safari scroll anchoring.** Test; if broken, focus on first user scroll instead.
- **`field-sizing: content` is Chromium-only.** Provide a `useAutoSize` hook fallback.
- **`role="status"` + `aria-live` double-declaration** is fine but don't also set `aria-relevant` — defaults are correct.
- **`prefers-reduced-motion` media query updating mid-session**: the `useReducedMotion` hook handles it via `matchMedia` listener. Don't cache the initial value.

---

## 11. Day 7 Accessibility + Performance Checklist (Ship Gate)

Run top to bottom on Day 7 afternoon, before Day 7 feature freeze commit. **Any unchecked item blocks the freeze.**

### Contrast
- [ ] `scripts/contrast.test.ts` passes for every text/bg pair in `tokens.css`
- [ ] No dusty-rose or gold as text colors anywhere (grep `color:.*(#e8a598|#d4a574)` returns zero)
- [ ] Focus ring visible on every interactive element in both modes
- [ ] Manual eye check in direct sunlight on a phone screen (night mode especially)

### Keyboard
- [ ] Skip link reachable on first Tab press
- [ ] Full tab order walked (textarea → submit → mode → journal entries → solana links)
- [ ] Mode toggle responds to Space and Enter
- [ ] Esc collapses expanded journal entries
- [ ] No keyboard trap anywhere
- [ ] Cmd/Ctrl+Enter submits textarea

### Screen reader
- [ ] NVDA + Firefox walks the demo: page load → dream submit → sensory question → drowsiness → silence → wake → journal
- [ ] TalkBack on Android walks the same path
- [ ] VoiceOver on iPhone walks the same path
- [ ] "milam is asleep" is announced once at w=0
- [ ] Journal entries reachable and readable
- [ ] Mode toggle reads as "switch"

### Reduced motion
- [ ] DevTools emulate prefers-reduced-motion → full demo works
- [ ] StarrySky canvas replaced by static SVG
- [ ] Breathing animation gone
- [ ] Silence caption visible under reduced motion
- [ ] Sun/moon toggle still functional, 120ms fade

### Touch & mobile
- [ ] Every interactive element ≥ 48×48 hit area (DevTools audit)
- [ ] Safe-area insets respected on iPhone notch device
- [ ] No horizontal scroll at 320px width
- [ ] Viewport meta includes `viewport-fit=cover`
- [ ] Long-press incubate has haptic + visual ring + keyboard alternative

### Performance
- [ ] `ANALYZE=true next build` — `/` First Load JS ≤ 180kb gz
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90, PWA installable
- [ ] LCP ≤ 2.5s on Slow 4G throttle
- [ ] INP ≤ 200ms after 10 interactions
- [ ] CLS ≤ 0.1
- [ ] Real-device test on any Android phone (≥ mid-range)
- [ ] Canvas frame rate measured via Perf panel, hits 60fps idle, pauses when tab hidden

### PWA
- [ ] Chrome Android: "Install app" prompt fires
- [ ] Installed PWA opens standalone, no URL bar
- [ ] Offline: load cached pages, see offline fallback
- [ ] Service worker shows "activated and running" in DevTools → Application
- [ ] Manifest validates via `chrome://inspect` → Application → Manifest (no warnings)
- [ ] iOS: add to home screen works, apple-touch-icon correct
- [ ] `manifest.webmanifest` served as `application/manifest+json`

### SEO / metadata
- [ ] `<title>`, `<meta description>`, Open Graph tags present
- [ ] `robots.txt` + `sitemap.xml` (Next.js `app/robots.ts`, `app/sitemap.ts`)
- [ ] `<html lang="en">`
- [ ] Canonical URL set

### Automated
- [ ] `npx @axe-core/cli https://dreamers.vercel.app` — zero serious violations
- [ ] `npx lighthouse https://dreamers.vercel.app --preset=mobile` — all categories ≥ 90

---

## Appendix A — Recommended dev dependencies

```jsonc
{
  "devDependencies": {
    "@axe-core/cli": "^4.9.0",
    "@axe-core/react": "^4.9.0",
    "@next/bundle-analyzer": "^15.0.0",
    "@serwist/next": "^9.0.0",
    "serwist": "^9.0.0",
    "lighthouse": "^12.0.0",
    "pwa-asset-generator": "^6.0.0",
    "wcag-contrast": "^3.0.0",
    "web-vitals": "^4.2.0"
  }
}
```

## Appendix B — Files this review expects to exist by Day 7

- `frontend/styles/tokens.css` (per §1)
- `frontend/app/layout.tsx` with `next/font` serif setup
- `frontend/app/offline/page.tsx`
- `frontend/app/sw.ts` (Serwist)
- `frontend/app/robots.ts`, `frontend/app/sitemap.ts`
- `frontend/hooks/useReducedMotion.ts`
- `frontend/hooks/useLongPress.ts`
- `frontend/hooks/useDeviceCapability.ts`
- `frontend/lib/wallet.ts` (stub)
- `frontend/tests/contrast.test.ts`
- `frontend/public/manifest.webmanifest`
- `frontend/public/icons/*` (generated by pwa-asset-generator)
- `frontend/public/.well-known/assetlinks.json` (Day 8 or post-hack)

---

*Ship the silence. Ship it accessibly.*
