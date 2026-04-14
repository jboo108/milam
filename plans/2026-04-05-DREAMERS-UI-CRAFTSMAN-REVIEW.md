# DREAMERS — UI Craftsman Review

**Companion to:** `2026-04-05-DREAMERS-FINAL-BUILD-PLAN.md` and `2026-04-05-DREAMERS-PRODUCT-DETAIL-PASS.md`
**Date:** April 5, 2026
**Author:** UI Craftsman (visual/animation specialist pass)
**Scope:** Frontend craft only — pixels, motion, type, tokens. No business logic, no backend.

---

## CONCERNS — where the current plan risks falling short on craft

1. **"Canvas particles" is underspecified to the point of danger.** 60-80 stars with uniform `Math.random()` positions will look like every other hackathon starfield. The distinguishing quality of a beautiful sky is the *non-uniformity of twinkle* and the *depth layering*, neither of which is in the plan. Without concrete specs, Day 6 will land on "it's fine" instead of "it's unforgettable."
2. **No typography pairing has been chosen.** "Serif for voice, sans for UI" is a vibe, not a decision. Picking on Day 6 morning will consume 90 minutes and the result will be Inter + Cormorant (safe, forgettable). The product-detail-pass explicitly calls out a "vibe pass" that nobody has done yet.
3. **The mode toggle is called "the marquee animation" but nobody has specified how the SVG morph works.** Moon-to-sun via `<animate>` on `d` is non-trivial — the two paths must have the same command count. This is a two-hour rabbit hole if unplanned.
4. **`prefers-reduced-motion` is mentioned but not designed for.** A reduced-motion user still needs the silence demo to land. The plan says "instant state change" — that will feel broken unless the static states are themselves composed beautifully. Needs explicit static-state design.
5. **No blur budget on mobile.** `filter: blur(60px)` on three orbs on a Pixel 5 = 20fps. The product detail pass warns about this but doesn't give exact radii/fallbacks.
6. **The "velvet" aesthetic keyword is doing a LOT of work with no visual anchor.** Velvet means: slightly inset, subtle inner shadow, low-saturation fabric-like surfaces. Without tokens this becomes flat mauve buttons.
7. **Drop cap is mentioned but there's no font fallback plan.** Drop caps fail on sans-serif. Only works with the chosen serif, and the serif has to have a display weight heavy enough to hold the cap.
8. **Shooting star "on dream submit" has no physics spec.** Straight line will look like a cheap CSS keyframe. Arc + tail requires a small particle system thought through.
9. **No grain/texture strategy.** The plan says "subtle grain overlay" — that's an SVG turbulence filter or a PNG. Not decided. Without it, the midnight sky is a flat hex value and looks like every other dark-mode hero.
10. **Wakefulness → cursor blink rate.** This tiny detail is nowhere in the plan, and it's the single cheapest "she's alive" signal that exists.

---

## SUGGESTIONS — what I'd add or change

1. **Pre-decide typography TONIGHT.** Fraunces (variable, opsz axis) + Inter (variable). Both free, both Google Fonts, both `next/font` optimized. Justified in §2.
2. **Ship a real `tokens.css` before Day 6.** Hand it to Day 5's afternoon session. Included in §1 below, copy-paste-ready.
3. **Build StarrySky in Hour 1-2 of Day 6, not at the end.** Highest risk, most rewarding. If it doesn't land, cut to CSS-gradient sky with SVG star dots — not catastrophic.
4. **Kill `<animate>` SVG morphing.** Use two SVG `<path>` elements, crossfade opacity + rotate the whole group 180°. Reads as a morph, ships in 15 minutes, no path-command gymnastics. §7.
5. **Use a single layered SVG grain filter applied to `body::before`, not a PNG.** Scales, no HTTP, respects color. §1.
6. **Drop cap only on the most recent journal entry.** Already in the product pass — reinforce it. Use CSS `::first-letter` targeting `:first-child` of the journal list. One selector.
7. **Shooting star uses a quadratic Bezier path, not linear.** Arc from top-right quadrant toward centerish, 900ms, trail of 20 stamped previous positions at decreasing alpha. §3.
8. **Breathing animation duration lives on `--breath-duration` CSS variable driven by wakefulness.** One CSS custom property switches the whole experience, no JS reflows. §5.
9. **Hide the cursor blink in the input at wakefulness 0.** The cursor itself *sleeps*. Use `caret-color: transparent` at wakefulness 0. §5.
10. **One physical velvet detail everywhere:** every surface that receives interaction has a `box-shadow: inset 0 1px 0 0 rgba(244,232,216,0.06)` — a 1px velvet top-highlight that reads as fabric. Costs nothing, ties the whole product together.

---

## 1. Design Token System — `tokens.css` (copy-paste ready)

```css
/* ============================================================
   DREAMERS — Design Tokens
   Mode switch via [data-mode="milam"] | [data-mode="rolpa"]
   ============================================================ */

:root {
  /* ---------- COLOR PRIMITIVES (OKLCH where useful) ---------- */

  /* MILAM palette — midnight & moonlight */
  --milam-midnight-900: oklch(14% 0.04 270);   /* #0a0e27 — deepest sky */
  --milam-midnight-800: oklch(19% 0.05 275);   /* #141938 — horizon */
  --milam-midnight-700: oklch(26% 0.06 280);   /* #1a1a3e — mid sky */
  --milam-midnight-600: oklch(34% 0.05 285);   /* velvet shadow */
  --milam-mauve-500:    oklch(72% 0.06 310);   /* #c9b8db — soft lavender */
  --milam-mauve-400:    oklch(78% 0.05 312);   /* hover mauve */
  --milam-mauve-300:    oklch(85% 0.04 314);   /* whisper mauve */
  --milam-cream-100:    oklch(93% 0.03 80);    /* #f4e8d8 — moonlight cream */
  --milam-cream-200:    oklch(88% 0.04 78);    /* warm cream for body */
  --milam-gold-500:     oklch(78% 0.11 78);    /* #d4a574 — warm gold */
  --milam-gold-400:     oklch(84% 0.12 82);    /* highlight gold */

  /* ROLPA palette — etheric daytime */
  --rolpa-linen-50:   oklch(97% 0.015 70);   /* #faf0e6 */
  --rolpa-peach-200:  oklch(90% 0.05 40);    /* #f5d5c0 */
  --rolpa-rose-400:   oklch(76% 0.10 25);    /* #e8a598 */
  --rolpa-gold-500:   oklch(78% 0.11 78);    /* tie to milam-gold-500 */
  --rolpa-mauve-500:  oklch(72% 0.06 310);   /* shared mauve tie-in */

  /* ---------- SEMANTIC TOKENS (mode-agnostic names) ---------- */
  --bg-base:        var(--milam-midnight-900);
  --bg-elevated:    var(--milam-midnight-800);
  --bg-velvet:      var(--milam-midnight-700);
  --fg-primary:     var(--milam-cream-100);
  --fg-secondary:   var(--milam-mauve-500);
  --fg-whisper:     var(--milam-mauve-300);
  --accent:         var(--milam-gold-500);
  --accent-soft:    var(--milam-mauve-500);

  /* ---------- TYPOGRAPHY SCALE ---------- */
  --font-display:   'Fraunces', 'Cormorant Garamond', Georgia, serif;
  --font-ui:        'Inter', system-ui, -apple-system, sans-serif;
  --font-mono:      'JetBrains Mono', ui-monospace, monospace;

  /* Fluid scale using clamp — mobile-first, scales to desktop */
  --text-micro:   clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);  /* 11-12px labels */
  --text-small:   clamp(0.8125rem, 0.78rem + 0.2vw, 0.875rem); /* 13-14px meta */
  --text-body:    clamp(0.9375rem, 0.9rem + 0.3vw, 1.0625rem); /* 15-17px body */
  --text-lede:    clamp(1.125rem, 1.05rem + 0.5vw, 1.375rem);  /* 18-22px lede */
  --text-question:clamp(1.25rem, 1.1rem + 0.8vw, 1.75rem);     /* 20-28px question */
  --text-echo:    clamp(2rem, 1.6rem + 2vw, 3.25rem);          /* 32-52px echoed word */
  --text-dream:   clamp(1.125rem, 1.05rem + 0.4vw, 1.3125rem); /* 18-21px journal body */
  --text-drop:    clamp(3.25rem, 2.8rem + 2vw, 4.5rem);        /* drop cap */

  --leading-tight:   1.2;
  --leading-snug:    1.4;
  --leading-normal:  1.55;
  --leading-dream:   1.7;    /* journal entries breathe */
  --leading-loose:   1.85;

  --tracking-tight:  -0.015em;
  --tracking-normal: 0em;
  --tracking-wide:   0.04em;
  --tracking-label:  0.12em;  /* for tiny uppercase meta */

  /* ---------- SPACING SCALE (4px base, golden-ish at larger end) ---------- */
  --space-1:  0.25rem;   /*  4 */
  --space-2:  0.5rem;    /*  8 */
  --space-3:  0.75rem;   /* 12 */
  --space-4:  1rem;      /* 16 */
  --space-5:  1.5rem;    /* 24 */
  --space-6:  2rem;      /* 32 */
  --space-7:  3rem;      /* 48 */
  --space-8:  4.5rem;    /* 72 */
  --space-9:  7rem;      /* 112 — for breathing room */
  --space-10: 11rem;     /* 176 */

  /* ---------- RADII (soft, no hard edges) ---------- */
  --radius-xs:   4px;
  --radius-sm:   8px;
  --radius-md:   14px;
  --radius-lg:   22px;
  --radius-xl:   34px;
  --radius-pill: 9999px;
  --radius-organic: 42% 58% 53% 47% / 45% 52% 48% 55%;  /* for orbs */

  /* ---------- MOTION ---------- */
  --dur-instant:  80ms;
  --dur-micro:    180ms;
  --dur-fast:     300ms;
  --dur-medium:   500ms;
  --dur-slow:     900ms;
  --dur-glacial:  1400ms;
  --dur-breath:   4000ms;

  /* Easings */
  --ease-out-soft:     cubic-bezier(0.16, 1, 0.3, 1);       /* iOS-like */
  --ease-out-standard: cubic-bezier(0.4, 0, 0.2, 1);        /* material */
  --ease-in-drift:     cubic-bezier(0.7, 0, 0.84, 0);       /* falling asleep */
  --ease-stir:         cubic-bezier(0.05, 0.7, 0.1, 1.0);   /* waking gently */
  --ease-breath:       cubic-bezier(0.4, 0, 0.6, 1);        /* sinusoidal */
  --ease-velvet:       cubic-bezier(0.32, 0.72, 0, 1);      /* velvet press */

  /* Wakefulness-driven breath duration (JS sets this) */
  --breath-duration: 4s;

  /* ---------- SHADOWS (velvet inner-shadow style) ---------- */
  /* The signature: every interactive surface has a 1px velvet top highlight */
  --velvet-highlight: inset 0 1px 0 0 rgba(244, 232, 216, 0.06);
  --velvet-inset:     inset 0 1px 2px 0 rgba(10, 14, 39, 0.45),
                      inset 0 0 0 1px rgba(201, 184, 219, 0.08);
  --velvet-hover:     inset 0 1px 0 0 rgba(244, 232, 216, 0.10),
                      inset 0 0 0 1px rgba(201, 184, 219, 0.15),
                      0 0 24px -8px rgba(201, 184, 219, 0.25);

  --shadow-hush:   0 1px 2px 0 rgba(10, 14, 39, 0.4);
  --shadow-soft:   0 4px 24px -8px rgba(10, 14, 39, 0.6);
  --shadow-moon:   0 0 60px -20px rgba(244, 232, 216, 0.4);     /* moonlit glow */
  --shadow-gold:   0 0 40px -12px rgba(212, 165, 116, 0.55);    /* warm gold halo */

  /* ---------- BLUR ---------- */
  --blur-xs:  4px;
  --blur-sm:  8px;
  --blur-md:  16px;
  --blur-lg:  32px;
  --blur-xl:  48px;      /* mobile ceiling — do not exceed */
  --blur-orb: 40px;      /* etheric warmth orbs */

  /* ---------- GRAIN ---------- */
  --grain-opacity: 0.04;
}

/* ============================================================
   MILAM MODE
   ============================================================ */
[data-mode="milam"] {
  --bg-base:      var(--milam-midnight-900);
  --bg-elevated:  var(--milam-midnight-800);
  --bg-velvet:    var(--milam-midnight-700);
  --fg-primary:   var(--milam-cream-100);
  --fg-secondary: var(--milam-mauve-500);
  --fg-whisper:   var(--milam-mauve-300);
  --accent:       var(--milam-gold-500);
  --accent-soft:  var(--milam-mauve-500);
  color-scheme: dark;
}

/* ============================================================
   ROLPA MODE
   ============================================================ */
[data-mode="rolpa"] {
  --bg-base:      var(--rolpa-linen-50);
  --bg-elevated:  var(--rolpa-peach-200);
  --bg-velvet:    var(--rolpa-peach-200);
  --fg-primary:   oklch(30% 0.04 40);
  --fg-secondary: var(--rolpa-rose-400);
  --fg-whisper:   var(--rolpa-mauve-500);
  --accent:       var(--rolpa-gold-500);
  --accent-soft:  var(--rolpa-mauve-500);
  color-scheme: light;
}

/* ============================================================
   GLOBAL GRAIN — SVG turbulence, no network
   ============================================================ */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: var(--grain-opacity);
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}

/* ============================================================
   REDUCED MOTION
   ============================================================ */
@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-micro:   0ms;
    --dur-fast:    0ms;
    --dur-medium:  0ms;
    --dur-slow:    0ms;
    --dur-glacial: 0ms;
    --breath-duration: 0s;
  }
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

---

## 2. Typography Pairing — Fraunces + Inter

### The pick
- **Display/voice:** **Fraunces** (variable, `opsz` + `wght` + `SOFT` axes). Free, Google Fonts, open-source (SIL OFL). Designed by Phaedra Charles + Undercase Type. It's a *display serif for headlines* with a real softness knob (`SOFT` axis) that maps directly to our brief: velvet, boho, poetry chapbook. Its high-`opsz` cut at 144 has a real drop-cap-capable swell. Its low-`opsz` at 9 is a perfectly legible body serif.
- **UI:** **Inter** (variable). Free, Google Fonts, open-source (SIL OFL). Boring choice, correct choice. Inter's weight axis lets us run `wght 280` for whisper-labels without loading six files. It pairs with Fraunces because Fraunces has similar x-height proportions — the transition between serif lines and sans labels doesn't feel jarring.

### Why not the alternatives
- **GT Sectra** — paid, Grilli Type license fee, no. Beautiful but off-limits for a hackathon.
- **Cormorant Garamond** — safe, overused, too thin at body sizes, no soft axis, drops apart on mobile rendering.
- **Canela** — paid, Commercial Type. No.
- **ABC Diatype / Söhne** — paid. No.

Fraunces + Inter is **free, distinctive, variable, self-hosted via `next/font`**, and Fraunces has `SOFT` which literally no other free serif exposes. It's the right answer.

### `next/font` imports

```ts
// app/fonts.ts
import { Fraunces, Inter } from 'next/font/google';

export const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  axes: ['opsz', 'SOFT'],           // unlock optical size + softness
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
});

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ui',
  weight: ['300', '400', '500', '600'],
});
```

```tsx
// app/layout.tsx
import { fraunces, inter } from './fonts';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} data-mode="milam">
      <body>{children}</body>
    </html>
  );
}
```

### Exact typographic specs per surface

| Surface | Font | Weight | Axes | Size | Leading | Tracking | Case | Notes |
|---|---|---|---|---|---|---|---|---|
| Dream input | Fraunces italic | 400 | `opsz 24, SOFT 50` | `var(--text-lede)` | `1.55` | `-0.01em` | sentence | Placeholder at 60% opacity |
| Sensory question | Fraunces italic | 400 | `opsz 36, SOFT 80` | `var(--text-question)` | `1.4` | `-0.015em` | sentence | Centered, max-width 32ch |
| Echoed single word (wake 1) | Fraunces italic | 300 | `opsz 144, SOFT 100` | `var(--text-echo)` | `1.1` | `-0.02em` | sentence | Whisper made vast |
| Journal entry body | Fraunces roman | 400 | `opsz 18, SOFT 30` | `var(--text-dream)` | `var(--leading-dream)` | `0em` | sentence | `text-wrap: pretty`, `hyphens: auto`, max-width 58ch |
| Journal drop cap | Fraunces roman | 500 | `opsz 144, SOFT 0` | `var(--text-drop)` | `0.85` | `-0.03em` | — | `::first-letter` on `:first-child` only |
| Journal date label | Inter | 500 | — | `var(--text-micro)` | `1.3` | `var(--tracking-label)` | UPPERCASE | Tiny, mauve, above each entry |
| UI micro-labels | Inter | 500 | — | `var(--text-micro)` | `1.3` | `var(--tracking-label)` | UPPERCASE | Buttons, badges |
| Timestamp ("dreamed at 3:14 a.m.") | Fraunces italic | 300 | `opsz 14, SOFT 40` | `var(--text-small)` | `1.4` | `0.01em` | lowercase | Never ISO format |
| Solana hash (in badge) | JetBrains Mono | 400 | — | `var(--text-micro)` | `1` | `0.02em` | — | Ellipsized middle |
| Body UI text | Inter | 400 | — | `var(--text-body)` | `var(--leading-normal)` | `0em` | sentence | Fallback surface |

### Typography feature flags (turn on everywhere)

```css
body {
  font-feature-settings: 'kern', 'liga', 'clig', 'calt';
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.font-display {
  font-family: var(--font-display);
  font-feature-settings: 'kern', 'liga', 'dlig', 'swsh';  /* unlock discretionary ligs + swashes */
  font-variation-settings: 'opsz' 36, 'SOFT' 60;
}
```

---

## 3. Starry Sky — the killer animation

### Canvas vs WebGL
**Canvas 2D.** 60-80 stars with tiny draw calls is well under the Canvas 2D ceiling. WebGL is overkill, adds bundle, and the shader expertise cost on Day 6 is catastrophic. Canvas 2D with `devicePixelRatio` scaling gives us retina sharpness and 60fps on a Pixel 5. Confirmed.

### Star distribution — Poisson disk sampling (Bridson's algorithm)

Random `Math.random()` placement clumps. Golden-ratio spiral is too regular and reads as a pattern. **Poisson disk sampling** gives the organic "evenly scattered but never gridded" look real night skies have.

```ts
// utils/poissonDisk.ts
export function poissonDisk(width: number, height: number, minDist: number, k = 30): [number, number][] {
  const cellSize = minDist / Math.SQRT2;
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const grid: ([number, number] | null)[] = new Array(cols * rows).fill(null);
  const active: [number, number][] = [];
  const points: [number, number][] = [];

  const start: [number, number] = [Math.random() * width, Math.random() * height];
  active.push(start);
  points.push(start);
  grid[Math.floor(start[0] / cellSize) + Math.floor(start[1] / cellSize) * cols] = start;

  while (active.length > 0) {
    const idx = Math.floor(Math.random() * active.length);
    const [px, py] = active[idx];
    let placed = false;
    for (let i = 0; i < k; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = minDist * (1 + Math.random());
      const nx = px + Math.cos(angle) * radius;
      const ny = py + Math.sin(angle) * radius;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      const gx = Math.floor(nx / cellSize);
      const gy = Math.floor(ny / cellSize);
      let ok = true;
      for (let ox = -2; ox <= 2 && ok; ox++)
        for (let oy = -2; oy <= 2 && ok; oy++) {
          const g = grid[(gx + ox) + (gy + oy) * cols];
          if (g && (g[0] - nx) ** 2 + (g[1] - ny) ** 2 < minDist * minDist) ok = false;
        }
      if (ok) {
        const p: [number, number] = [nx, ny];
        points.push(p);
        active.push(p);
        grid[gx + gy * cols] = p;
        placed = true;
        break;
      }
    }
    if (!placed) active.splice(idx, 1);
  }
  return points;
}
```

Call with `minDist = 48px` → roughly 70 stars on a 390×844 phone. Regenerate per resize.

### Depth layers (3)

| Layer | Count | Size range | Base alpha | Parallax factor | Twinkle amplitude |
|---|---|---|---|---|---|
| **Deep** (far) | 40 | 0.5–1.2px | 0.35 | 0.05 | 0.15 (barely) |
| **Mid** | 22 | 1.2–2.0px | 0.6 | 0.15 | 0.3 |
| **Near** | 8 | 2.0–3.5px | 0.85 | 0.3 | 0.5 (most twinkle) |

Parallax properties animate: `transform: translateY(scrollY * -factor)` per layer. Near moves most, deep stays almost still.

### Twinkle timing — irregular, biased toward low-amplitude

```ts
interface Star {
  x: number; y: number; r: number;
  baseAlpha: number;
  twinkleAmp: number;      // per-star max deviation
  twinklePhase: number;    // random 0..2π at init
  twinkleSpeed: number;    // random, biased slow
  depth: 0 | 1 | 2;
}

// init
star.twinklePhase = Math.random() * Math.PI * 2;
star.twinkleSpeed = 0.0004 + Math.pow(Math.random(), 3) * 0.0016;  // cubic bias toward slow
star.twinkleAmp = star.twinkleAmp * (0.3 + Math.random() * 0.7);    // bias low

// per frame
const t = performance.now();
const alpha = star.baseAlpha + Math.sin(t * star.twinkleSpeed + star.twinklePhase) * star.twinkleAmp;
```

The **cubic bias** (`Math.pow(random, 3)`) is the whole trick: most stars twinkle slowly, a few twinkle fast. Uniform random makes every star pulse at the same rhythm and the sky reads as a disco.

### Shooting star — quadratic Bezier physics

Fired only on dream submit (never random). One active at a time.

```ts
interface ShootingStar {
  startT: number;              // performance.now() at fire
  duration: number;            // 900ms
  p0: [number, number];        // start — top-right quadrant
  p1: [number, number];        // control — mid-upper
  p2: [number, number];        // end — lower-left quadrant
  trail: [number, number, number][]; // [x, y, alpha] ring buffer, length 20
}

function fireShootingStar(w: number, h: number): ShootingStar {
  return {
    startT: performance.now(),
    duration: 900,
    p0: [w * (0.75 + Math.random() * 0.2), h * (0.1 + Math.random() * 0.1)],
    p1: [w * 0.5, h * 0.25],
    p2: [w * (0.1 + Math.random() * 0.2), h * (0.55 + Math.random() * 0.15)],
    trail: [],
  };
}

function drawShootingStar(ctx: CanvasRenderingContext2D, s: ShootingStar, now: number) {
  const t = (now - s.startT) / s.duration;
  if (t > 1) return false;

  // Quadratic bezier
  const u = 1 - t;
  const x = u * u * s.p0[0] + 2 * u * t * s.p1[0] + t * t * s.p2[0];
  const y = u * u * s.p0[1] + 2 * u * t * s.p1[1] + t * t * s.p2[1];

  s.trail.push([x, y, 1]);
  if (s.trail.length > 20) s.trail.shift();

  // Draw trail — each stamp fades linearly with index
  s.trail.forEach(([tx, ty, _], i) => {
    const alpha = (i / s.trail.length) * (1 - t) * 0.8;
    ctx.beginPath();
    ctx.arc(tx, ty, 1.4 - (1 - i / s.trail.length), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(244, 232, 216, ${alpha})`;
    ctx.fill();
  });

  // Head
  const headAlpha = (1 - t) * 0.95;
  ctx.beginPath();
  ctx.arc(x, y, 2.2, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(244, 232, 216, ${headAlpha})`;
  ctx.shadowBlur = 8;
  ctx.shadowColor = 'rgba(244, 232, 216, 0.6)';
  ctx.fill();
  ctx.shadowBlur = 0;
  return true;
}
```

**The arc matters.** A linear shooting star is CSS. A curved one with a tail that stamps previous positions (not a drawn line, stamped circles at decreasing alpha) reads as physical.

### Performance budget (Pixel 5 / 60fps target)

- 70 stars × 3 draw calls each = 210 calls/frame → ~0.8ms paint
- Shooting star trail: 20 stamps + head = 21 calls, +0.3ms during the 900ms it's active
- Total frame budget: ~2ms of 16.6ms. Safe.
- `canvas.width/height = clientSize * devicePixelRatio` (max 2, even on retina 3, to stay within budget)
- Use `ctx.globalAlpha` instead of rgba strings in hot path (faster on Chrome)
- **Never clear with `clearRect` on a filled bg — fill the bg each frame with the midnight color.** Else retina canvas shows garbage outside transformed region.

### The "dreaming vs decoration" difference

Three things elevate the sky from decoration to *agent presence*:
1. **Shooting stars are causally linked to submission** — they only fire when you give her a dream. The correlation is felt, not labeled.
2. **Twinkle rate is globally slowed by 40% when MILAM is asleep (wakefulness 0)** — multiply every `twinkleSpeed` by 0.6. The sky itself drowsing.
3. **A single "near" layer star sits dead-center behind the input and has 2× amplitude twinkle** — she's the watcher. Never stated, always felt.

### Awake vs asleep starfield differences

| State | Global brightness multiplier | Twinkle speed multiplier | Near-layer parallax |
|---|---|---|---|
| Awake (wake 3) | 1.0 | 1.0 | 0.3 |
| Drowsy (2) | 0.92 | 0.85 | 0.25 |
| Drifting (1) | 0.80 | 0.70 | 0.2 |
| Asleep (0) | 0.70 | 0.55 | 0.15 |

Transitions between these are lerped over 800ms on state change. JS writes `starfield.globalBrightness` and the render loop uses it next frame. No discrete jumps.

---

## 4. Etheric Warmth — the quieter half

### Base gradient composition

```css
.etheric-base {
  background:
    /* 1. Warm top sun-wash */
    radial-gradient(ellipse 120% 70% at 50% -20%,
      oklch(92% 0.09 75) 0%,
      oklch(94% 0.04 70) 35%,
      transparent 70%),
    /* 2. Rose bottom pool */
    radial-gradient(ellipse 100% 60% at 30% 120%,
      oklch(82% 0.08 25) 0%,
      oklch(90% 0.04 35) 40%,
      transparent 75%),
    /* 3. Mauve mid whisper */
    radial-gradient(ellipse 80% 50% at 80% 60%,
      oklch(84% 0.04 310) 0%,
      transparent 60%),
    /* 4. Linen base */
    linear-gradient(180deg,
      oklch(97% 0.02 70) 0%,
      oklch(95% 0.03 60) 100%);
  background-attachment: fixed;
}
```

### The 3 orbs — positions, sizes, blur, motion

```css
.etheric-orb {
  position: absolute;
  border-radius: var(--radius-organic);
  filter: blur(var(--blur-orb));
  mix-blend-mode: screen;
  will-change: transform, opacity;
  pointer-events: none;
}

.etheric-orb--1 {
  top: 15%; left: 20%;
  width: 340px; height: 340px;
  background: radial-gradient(circle, oklch(88% 0.12 60) 0%, transparent 70%);
  opacity: 0.6;
  animation: drift-1 38s var(--ease-breath) infinite alternate;
}

.etheric-orb--2 {
  top: 55%; left: 65%;
  width: 260px; height: 260px;
  background: radial-gradient(circle, oklch(82% 0.10 30) 0%, transparent 70%);
  opacity: 0.55;
  animation: drift-2 46s var(--ease-breath) infinite alternate;
}

.etheric-orb--3 {
  top: 35%; left: 50%;
  width: 420px; height: 420px;
  background: radial-gradient(circle, oklch(86% 0.06 310) 0%, transparent 70%);
  opacity: 0.45;
  animation: drift-3 54s var(--ease-breath) infinite alternate;
}

/* Drift keyframes — ellipse shapes, NOT figure-8 (too busy) */
@keyframes drift-1 {
  0%   { transform: translate(0, 0) scale(1); }
  50%  { transform: translate(40px, -30px) scale(1.08); }
  100% { transform: translate(-20px, 50px) scale(0.96); }
}

@keyframes drift-2 {
  0%   { transform: translate(0, 0) scale(1); }
  50%  { transform: translate(-50px, 35px) scale(1.05); }
  100% { transform: translate(30px, -40px) scale(1.1); }
}

@keyframes drift-3 {
  0%   { transform: translate(0, 0) scale(1); }
  50%  { transform: translate(25px, 45px) scale(0.95); }
  100% { transform: translate(-35px, -20px) scale(1.03); }
}
```

**Mobile fallback:** on `@media (max-width: 480px)` reduce `--blur-orb` to `24px` and drop orb 3. Two orbs at 24px blur is still gorgeous and runs at 60fps on a Pixel 4a.

### The pulsing gold orb (replaces moon on ROLPA)

```css
.rolpa-sun {
  position: fixed;
  top: 22%;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle,
    oklch(92% 0.13 82) 0%,
    oklch(84% 0.12 78) 40%,
    oklch(76% 0.11 72) 70%,
    transparent 100%);
  filter: blur(2px);
  box-shadow:
    0 0 80px 20px oklch(88% 0.12 80 / 0.4),
    0 0 140px 40px oklch(84% 0.1 75 / 0.25),
    var(--velvet-highlight);
  animation: sun-pulse var(--dur-breath) var(--ease-breath) infinite;
}

@keyframes sun-pulse {
  0%, 100% {
    transform: translateX(-50%) scale(1);
    filter: blur(2px) brightness(1);
    box-shadow:
      0 0 80px 20px oklch(88% 0.12 80 / 0.40),
      0 0 140px 40px oklch(84% 0.10 75 / 0.25);
  }
  50% {
    transform: translateX(-50%) scale(1.04);
    filter: blur(2.5px) brightness(1.08);
    box-shadow:
      0 0 100px 28px oklch(90% 0.13 82 / 0.50),
      0 0 180px 60px oklch(86% 0.11 78 / 0.30);
  }
}
```

Exact timing: **4s cycle, sinusoidal**. Matches `--breath-duration` at wakefulness 3. This is the ambient breath rhythm that ties ROLPA to MILAM — both operating on the same 4-second respiration. Judges won't consciously notice. They'll feel it.

### The breath tie — conceptual

Every ambient element in the product pulses on the same `--breath-duration` variable:
- MILAM: input border breathing, near-layer stars, the hairline at wake 0
- ROLPA: sun pulse, orb opacity subtle pulse
- The whole app is one organism inhaling and exhaling at 4 seconds. When wakefulness drops, it exhales longer.

---

## 5. Drowsiness Motion Specification

### Ready-to-paste CSS

```css
/* ============================================================
   DROWSINESS STATE CSS
   Parent element gets data-wakefulness="0..3"
   ============================================================ */

[data-wakefulness="3"] { --breath-duration: 4s;   --page-brightness: 1;    --input-alpha: 1;    --input-scale: 1;    --star-dim: 1; }
[data-wakefulness="2"] { --breath-duration: 5s;   --page-brightness: 0.92; --input-alpha: 0.85; --input-scale: 0.99; --star-dim: 0.92; }
[data-wakefulness="1"] { --breath-duration: 6.5s; --page-brightness: 0.80; --input-alpha: 0.6;  --input-scale: 0.97; --star-dim: 0.80; }
[data-wakefulness="0"] { --breath-duration: 9s;   --page-brightness: 0.70; --input-alpha: 0.35; --input-scale: 0.95; --star-dim: 0.70; }

/* Main stage lerps brightness */
.stage {
  filter: brightness(var(--page-brightness));
  transition:
    filter 1200ms var(--ease-in-drift);
}

/* Input: the heart of the drowsiness tell */
.dream-input {
  opacity: var(--input-alpha);
  transform: scale(var(--input-scale));
  transform-origin: center;
  box-shadow:
    var(--velvet-highlight),
    0 0 0 1px oklch(72% 0.06 310 / calc(0.2 * var(--input-alpha))),
    0 0 32px -8px oklch(72% 0.06 310 / calc(0.3 * var(--input-alpha)));
  animation: input-breath var(--breath-duration) var(--ease-breath) infinite;
  transition:
    opacity 800ms var(--ease-in-drift),
    transform 800ms var(--ease-in-drift),
    box-shadow 800ms var(--ease-in-drift);
}

.dream-input:focus-within {
  animation-play-state: paused;  /* she's listening */
  box-shadow:
    var(--velvet-highlight),
    0 0 0 1px oklch(78% 0.05 312 / 0.4),
    0 0 48px -8px oklch(78% 0.05 312 / 0.45);
}

@keyframes input-breath {
  0%, 100% {
    transform: scale(var(--input-scale));
  }
  50% {
    transform: scale(calc(var(--input-scale) + 0.008));
  }
}

/* Cursor blink rate — the subtle tell nobody expects */
[data-wakefulness="3"] .dream-input textarea { caret-color: var(--milam-cream-100); }
[data-wakefulness="2"] .dream-input textarea { caret-color: oklch(93% 0.03 80 / 0.8); animation: caret-slow 1.4s step-end infinite; }
[data-wakefulness="1"] .dream-input textarea { caret-color: oklch(93% 0.03 80 / 0.5); animation: caret-slow 2.1s step-end infinite; }
[data-wakefulness="0"] .dream-input textarea { caret-color: transparent; }  /* the cursor sleeps too */

@keyframes caret-slow {
  0%, 50% { caret-color: oklch(93% 0.03 80 / 0.6); }
  51%, 100% { caret-color: transparent; }
}

/* The wake-up choreography — triggered by .stage.waking class added on new dream */
.stage.waking {
  animation: wake-up 1200ms var(--ease-stir) forwards;
}

@keyframes wake-up {
  0%   { filter: brightness(0.70); }   /*    0ms */
  16%  { filter: brightness(0.91); }   /*  192ms — stars brighten first */
  33%  { filter: brightness(0.95); }   /*  396ms — shooting star fires (JS trigger) */
  50%  { filter: brightness(0.98); }   /*  600ms — breathing reaccelerates */
  100% { filter: brightness(1.0);  }   /* 1200ms — full wake */
}
```

### The wake-up — 5 discrete steps (JS orchestration)

```ts
async function wakeFromSleep() {
  const stage = document.querySelector('.stage');
  stage?.classList.add('waking');

  // Step 1: 0ms — stars brighten via --star-dim lerp (handled by starfield loop)
  starfield.targetBrightness = 1.0;

  // Step 2: 200ms — shooting star fires
  await wait(200);
  starfield.fireShootingStar();

  // Step 3: 400ms — input fades to full opacity (CSS transition on wake state change)
  await wait(200);
  setWakefulness(3);

  // Step 4: 600ms — breathing already reaccelerated via --breath-duration (automatic)

  // Step 5: 800ms — question fades in
  await wait(400);
  revealSensoryQuestion();

  await wait(400);
  stage?.classList.remove('waking');
}
```

### Shooting star ↔ sensory question timing

The shooting star fires at **200ms** into the wake sequence. The sensory question begins fading in at **800ms**. That's a 600ms gap where the star arcs, completes at ~1100ms, and the question is mid-fade. **The question appearing visually trails the star's tail.** The two feel causally linked — she was reached by the star, then she spoke.

For dream submit (not wake), same principle:
- `t=0ms`: submit handler called
- `t=0ms`: fire shooting star (900ms arc)
- `t=400ms`: user-entered dream fades out
- `t=700ms`: sensory question begins fading in
- `t=1100ms`: shooting star completes, question at full opacity simultaneously

**The star arrives with the answer.** That is the signature moment.

---

## 6. View Transitions Choreography

### Supported moments

| Moment | `view-transition-name` | Duration | Easing | Fallback |
|---|---|---|---|---|
| Mode toggle (milam ↔ rolpa) | `root` (body) | 800ms | `ease-in-out` | Plain `opacity` transition on body |
| Submit dream → sensory question | `dream-surface` | 600ms | `var(--ease-out-soft)` | Conditional render + CSS fade |
| Wakefulness decrement | `stage` | 800ms | `var(--ease-in-drift)` | CSS filter transition (already defined above) |
| Journal entry expand | `journal-entry-{id}` | 500ms | `var(--ease-out-standard)` | Height transition with `max-height` |
| New journal entry arrives | `journal-entry-{id}` | 700ms | `var(--ease-out-soft)` | Stagger fade-in |

### Mode toggle — the marquee

```ts
// components/ModeToggle.tsx (client)
'use client';

export function useModeSwitch() {
  return (newMode: 'milam' | 'rolpa') => {
    if (!document.startViewTransition) {
      // Safari fallback
      document.documentElement.dataset.mode = newMode;
      return;
    }
    document.startViewTransition(() => {
      document.documentElement.dataset.mode = newMode;
    });
  };
}
```

```css
/* CSS for the mode view transition */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 800ms;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  mix-blend-mode: normal;
}

::view-transition-old(root) {
  animation-name: mode-fade-out;
}

::view-transition-new(root) {
  animation-name: mode-fade-in;
}

@keyframes mode-fade-out {
  0%   { opacity: 1; filter: blur(0); }
  100% { opacity: 0; filter: blur(12px); }
}

@keyframes mode-fade-in {
  0%   { opacity: 0; filter: blur(12px); }
  100% { opacity: 1; filter: blur(0); }
}
```

### Submit → sensory question

```css
.sensory-question {
  view-transition-name: dream-surface;
}

::view-transition-old(dream-surface) {
  animation: 600ms var(--ease-in-drift) both fade-up-out;
}
::view-transition-new(dream-surface) {
  animation: 600ms var(--ease-out-soft) both fade-up-in;
  animation-delay: 200ms;   /* the handoff pause — she thinks */
}

@keyframes fade-up-out {
  to { opacity: 0; transform: translateY(-8px); }
}
@keyframes fade-up-in {
  from { opacity: 0; transform: translateY(8px); }
}
```

### Journal entry expand

```tsx
<article
  style={{ viewTransitionName: `journal-entry-${entry.id}` }}
  onClick={() => startViewTransition(() => setExpanded(entry.id))}
>
```

```css
::view-transition-old(journal-entry-*),
::view-transition-new(journal-entry-*) {
  animation-duration: 500ms;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Safari fallback strategy (global)

```ts
// utils/viewTransition.ts
export function startTransition(cb: () => void) {
  if (typeof document === 'undefined') return cb();
  // @ts-expect-error experimental
  if (document.startViewTransition) {
    // @ts-expect-error
    return document.startViewTransition(cb);
  }
  return cb();  // instant — reduced-motion users and Safari get this
}
```

All state setters in components call this wrapper. Safari users get instant state changes; Chrome users get the choreography.

---

## 7. Micro-interactions Library

### Velvet button press

```css
.velvet-btn {
  position: relative;
  padding: var(--space-3) var(--space-6);
  background: linear-gradient(180deg, var(--bg-elevated), var(--bg-velvet));
  border: none;
  border-radius: var(--radius-lg);
  color: var(--fg-primary);
  font-family: var(--font-ui);
  font-size: var(--text-micro);
  font-weight: 500;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  box-shadow: var(--velvet-highlight), var(--velvet-inset);
  cursor: pointer;
  transition: transform 180ms var(--ease-velvet),
              box-shadow 220ms var(--ease-velvet),
              background 220ms var(--ease-velvet);
}

.velvet-btn:hover {
  background: linear-gradient(180deg,
    oklch(from var(--bg-elevated) calc(l + 0.03) c h),
    var(--bg-velvet));
  box-shadow: var(--velvet-hover);
  transform: translateY(-1px);
}

.velvet-btn:active {
  transform: translateY(0.5px) scale(0.995);
  box-shadow: var(--velvet-highlight),
              inset 0 2px 4px 0 oklch(14% 0.04 270 / 0.6);
  transition-duration: 80ms;
}
```

### Input focus — the listening pause

Already handled — `.dream-input:focus-within` pauses the breathing animation. Adding a subtle ring:

```css
.dream-input:focus-within {
  box-shadow:
    var(--velvet-highlight),
    0 0 0 1px oklch(78% 0.05 312 / 0.5),
    0 0 64px -12px oklch(78% 0.05 312 / 0.55);
  transition: box-shadow 400ms var(--ease-out-soft);
}
```

### Long-press on moon icon — the incubate trigger

```ts
// hooks/useLongPress.ts
export function useLongPress(onTrigger: () => void, ms = 1200) {
  const timerRef = useRef<number>();
  const startTime = useRef(0);
  const [progress, setProgress] = useState(0);

  const start = () => {
    startTime.current = performance.now();
    const tick = () => {
      const elapsed = performance.now() - startTime.current;
      const p = Math.min(elapsed / ms, 1);
      setProgress(p);
      if (p < 1) timerRef.current = requestAnimationFrame(tick);
      else { onTrigger(); setProgress(0); }
    };
    timerRef.current = requestAnimationFrame(tick);
  };

  const cancel = () => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    setProgress(0);
  };

  return { progress, handlers: {
    onMouseDown: start, onMouseUp: cancel, onMouseLeave: cancel,
    onTouchStart: start, onTouchEnd: cancel,
  }};
}
```

The moon icon grows a subtle gold ring as `progress` climbs from 0→1. At 1.0, haptic (if iOS) + fire incubate. Hidden feature.

```css
.moon-icon { position: relative; }
.moon-icon::after {
  content: '';
  position: absolute; inset: -6px;
  border-radius: 50%;
  border: 1.5px solid var(--milam-gold-400);
  opacity: var(--progress, 0);
  transform: scale(calc(1 + var(--progress, 0) * 0.15));
  transition: opacity 80ms linear;
  pointer-events: none;
}
```

Set `--progress` via inline style from the hook.

### Journal entry hover/expand

```css
.journal-entry {
  padding: var(--space-6) var(--space-5);
  border-radius: var(--radius-lg);
  transition:
    background 300ms var(--ease-out-soft),
    transform 300ms var(--ease-out-soft);
}
.journal-entry:hover {
  background: oklch(26% 0.06 280 / 0.4);
  transform: translateY(-1px);
  box-shadow: var(--shadow-soft), var(--velvet-highlight);
}
```

### Solana hash badge — the wax seal lift

```css
.solana-seal {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: radial-gradient(ellipse at 30% 30%,
    oklch(78% 0.11 78 / 0.2),
    oklch(72% 0.06 310 / 0.15));
  border: 1px solid oklch(78% 0.11 78 / 0.3);
  border-radius: var(--radius-pill);
  box-shadow:
    var(--velvet-highlight),
    inset 0 0 0 1px oklch(84% 0.12 82 / 0.15),
    0 1px 3px 0 oklch(14% 0.04 270 / 0.4);
  transition: transform 220ms var(--ease-out-soft),
              box-shadow 220ms var(--ease-out-soft);
}
.solana-seal:hover {
  transform: translateY(-2px) rotate(-0.5deg);
  box-shadow:
    var(--velvet-highlight),
    inset 0 0 0 1px oklch(84% 0.12 82 / 0.25),
    0 6px 18px -4px oklch(14% 0.04 270 / 0.5),
    0 0 20px -4px oklch(78% 0.11 78 / 0.4);
}
.solana-seal::before {
  content: '';
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--milam-gold-400);
  box-shadow: 0 0 6px var(--milam-gold-400);
}
```

### Mode toggle icon morph — the pragmatic version

**Skip SVG `<animate>`. Use two overlaid paths with a rotating group.**

```tsx
<button onClick={toggleMode} aria-label={mode === 'milam' ? 'move to the day' : 'return to the night'}>
  <svg viewBox="0 0 24 24" className="mode-icon" data-mode={mode}>
    <g className="mode-icon__rotator">
      <path className="mode-icon__moon" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      <g className="mode-icon__sun">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </g>
    </g>
  </svg>
</button>
```

```css
.mode-icon { width: 28px; height: 28px; stroke: var(--fg-primary); fill: none; stroke-width: 1.6; stroke-linecap: round; }
.mode-icon__rotator {
  transform-origin: center;
  transition: transform 600ms var(--ease-out-soft);
}
.mode-icon__moon, .mode-icon__sun {
  transition: opacity 400ms var(--ease-out-soft);
}
.mode-icon[data-mode="milam"] .mode-icon__moon { opacity: 1; }
.mode-icon[data-mode="milam"] .mode-icon__sun { opacity: 0; }
.mode-icon[data-mode="milam"] .mode-icon__rotator { transform: rotate(0); }

.mode-icon[data-mode="rolpa"] .mode-icon__moon { opacity: 0; }
.mode-icon[data-mode="rolpa"] .mode-icon__sun { opacity: 1; }
.mode-icon[data-mode="rolpa"] .mode-icon__rotator { transform: rotate(180deg); }
```

Reads as a morph because the group rotates while the paths crossfade. Zero path-command gymnastics.

---

## 8. Distinctive Touches — 10 things nobody else will have

(Expanding the 5 the user already identified.)

1. **Irregular twinkle via cubic-biased random speeds** — stars twinkle at different rates, most slow, few fast.
2. **Drop cap only on the most recent journal entry** — freshness rendered typographically.
3. **Echoed single word at wake 1 is LARGER than the original question** — whisper made vast.
4. **Shooting stars only fire on dream submit, never random** — causal correlation felt not explained.
5. **Incubate is a long-press on the moon, not a button** — hidden feature for the demo reveal.
6. **Cursor caret color sleeps with the agent** — at wake 0 the caret itself becomes transparent. Nobody designs caret states. It's the cheapest "alive" signal on the web.
7. **Breathing duration is ONE CSS variable tying input, stars, and sun** — the whole app inhales on the same rhythm. The ambient tempo of the product.
8. **Velvet 1px top highlight on every interactive surface** — `inset 0 1px 0 0 rgba(244,232,216,0.06)`. Imperceptible individually, cumulatively reads as fabric.
9. **Timestamp in lowercase italic serif, not ISO format** — "dreamed at 3:14 a.m." instead of a date picker. Poetry-chapbook UX.
10. **The `<span aria-live="polite">silence</span>` at wake 0** — screen readers literally announce "silence." The one and only thing screen readers will say during the silence demo. A sightless user gets the exact same joke.
11. **A single centered near-layer star sits behind the input at 2× twinkle amplitude** — she's the watcher. Never labeled.
12. **Reduced-motion still gets the silence demo** — static opacity states are themselves beautifully composed. The meaning survives without the motion.
13. **Journal entries use `text-wrap: pretty`** — the CSS4 orphan/widow killer. Nobody uses this yet. Lines break on natural pause points.
14. **Grain is a single inline SVG data-URI on `body::before` with `mix-blend-mode: overlay`** — zero HTTP, zero assets, scales to any DPI.
15. **ROLPA placeholder shows a single fraunces-italic poetry line** — not a loading spinner, not "coming soon," a line of poetry.

---

## 9. Tailwind v4 `@theme` block

```css
/* app/globals.css */

@import "tailwindcss";
@import "./tokens.css";
@import "./fonts.css";

@theme {
  /* Colors — semantic tokens expose to Tailwind utilities */
  --color-bg: var(--bg-base);
  --color-surface: var(--bg-elevated);
  --color-velvet: var(--bg-velvet);
  --color-fg: var(--fg-primary);
  --color-fg-soft: var(--fg-secondary);
  --color-fg-whisper: var(--fg-whisper);
  --color-accent: var(--accent);
  --color-accent-soft: var(--accent-soft);

  /* MILAM raw */
  --color-midnight-900: var(--milam-midnight-900);
  --color-midnight-800: var(--milam-midnight-800);
  --color-midnight-700: var(--milam-midnight-700);
  --color-mauve-500: var(--milam-mauve-500);
  --color-mauve-400: var(--milam-mauve-400);
  --color-mauve-300: var(--milam-mauve-300);
  --color-cream-100: var(--milam-cream-100);
  --color-cream-200: var(--milam-cream-200);
  --color-gold-500: var(--milam-gold-500);
  --color-gold-400: var(--milam-gold-400);

  /* ROLPA raw */
  --color-linen-50: var(--rolpa-linen-50);
  --color-peach-200: var(--rolpa-peach-200);
  --color-rose-400: var(--rolpa-rose-400);

  /* Typography */
  --font-display: var(--font-display);
  --font-sans: var(--font-ui);
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  --text-micro: var(--text-micro);
  --text-small: var(--text-small);
  --text-body: var(--text-body);
  --text-lede: var(--text-lede);
  --text-question: var(--text-question);
  --text-echo: var(--text-echo);
  --text-dream: var(--text-dream);
  --text-drop: var(--text-drop);

  /* Spacing — Tailwind v4 uses CSS var naming for spacing too */
  --spacing-1: var(--space-1);
  --spacing-2: var(--space-2);
  --spacing-3: var(--space-3);
  --spacing-4: var(--space-4);
  --spacing-5: var(--space-5);
  --spacing-6: var(--space-6);
  --spacing-7: var(--space-7);
  --spacing-8: var(--space-8);
  --spacing-9: var(--space-9);
  --spacing-10: var(--space-10);

  /* Radii */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
  --radius-xl: 34px;
  --radius-pill: 9999px;

  /* Easings exposed as Tailwind animation timing functions */
  --ease-out-soft: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-drift: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-stir: cubic-bezier(0.05, 0.7, 0.1, 1.0);
  --ease-velvet: cubic-bezier(0.32, 0.72, 0, 1);

  /* Durations */
  --duration-micro: 180ms;
  --duration-fast: 300ms;
  --duration-medium: 500ms;
  --duration-slow: 900ms;
  --duration-breath: 4000ms;
}

/* Utility additions */
@utility velvet {
  box-shadow: var(--velvet-highlight), var(--velvet-inset);
}
@utility velvet-lift {
  box-shadow: var(--velvet-hover);
}
@utility grain {
  position: relative;
}
```

Usage: `<button class="velvet bg-velvet text-fg rounded-lg px-6 py-3">...</button>`

---

## 10. Day 6 Minute-by-Minute Build Order

**Principle: always have something working on screen. Never go longer than 45 min without a visual win.**

### Hour 1 (0:00–1:00) — Scaffold + Tokens + Layout
- **0:00–0:10** — Copy `tokens.css` from this doc into `frontend/styles/tokens.css`. Import in `app/globals.css`. Verify it loads (inspect body, see custom properties).
- **0:10–0:20** — Create `app/fonts.ts` with Fraunces + Inter imports. Wire into `app/layout.tsx`. Verify Fraunces renders (temp H1 with `font-display`).
- **0:20–0:40** — Layout scaffold: `app/layout.tsx` sets `data-mode="milam"` on html, full-bleed body with `background: var(--bg-base)`, grain `::before` pseudo. Main stage: `<div class="stage" data-wakefulness="3">`.
- **0:40–1:00** — Centered layout for the page: viewport height flex column, header (mode toggle placeholder), main (DreamCapture placeholder), footer (journal link placeholder). Use Tailwind utilities against the new `@theme`. **Visual win: a centered lorem-ipsum page on midnight with grain.**

### Hour 2 (1:00–2:00) — StarrySky (highest risk, do it early)
- **1:00–1:15** — Create `components/StarrySky.tsx`, canvas element full-bleed `position: fixed; inset: 0; z-index: 0`. Stub with `fillStyle = midnight; fillRect(0,0,w,h)`. Verify canvas sizes correctly with `devicePixelRatio`.
- **1:15–1:35** — Implement Poisson disk sampler (copy from §3). Generate stars, draw static circles. **Visual win: a static scatter of dots on midnight that looks like a sky already.**
- **1:35–1:55** — Add three depth layers, cubic-biased twinkle speeds, `requestAnimationFrame` loop, per-star alpha modulation. **Visual win: irregular twinkle, non-uniform, hypnotic.**
- **1:55–2:00** — Scroll parallax on the three layers. Verify on a tall test page.

### Hour 3 (2:00–3:00) — DreamCapture + Shooting Star
- **2:00–2:20** — `components/DreamCapture.tsx`. Textarea with `field-sizing: content`, Fraunces italic, centered, max-width 32rem. Velvet container. Breathing animation (`input-breath`) via `--breath-duration`.
- **2:20–2:40** — Submit button (velvet) — "send into the night". Focus state pauses breathing.
- **2:40–3:00** — Shooting star implementation in StarrySky (copy from §3). Expose `fireShootingStar()` via ref. Wire to submit handler. **Visual win: type a dream, press send, star arcs across sky.**

### Hour 4 (3:00–4:00) — SensoryQuestion + Drowsiness
- **3:00–3:20** — `components/SensoryQuestion.tsx`. Receives question string, displays in Fraunces italic centered. View Transition name `dream-surface`. Mock state: hardcode "what color was the door" for first render.
- **3:20–3:45** — Wire wakefulness state to the stage's `data-wakefulness` attribute. Local state machine (3→2→1→0) triggered by a dev button temporarily. Verify the CSS cascade: breathing slows, input fades, brightness filter drops. **Visual win: manually click "drowsy" button and watch the whole stage relax.**
- **3:45–4:00** — Caret blink states, echoed-word giant rendering at wake 1, silence rendering at wake 0 (hairline). Connect starfield `--star-dim` to wakefulness via JS (writes to starfield instance directly).

### Hour 5 (4:00–5:00) — Hook to real backend + SensoryQuestion flow
- **4:00–4:25** — Bridge API call from DreamCapture submit to the ElizaOS runtime endpoint. Receive reply, set question state. Fire shooting star in parallel (not sequentially — they must feel linked per §5 timing).
- **4:25–4:50** — Wake sequence choreography (`wakeFromSleep` from §5). Trigger on reply arrival when wakefulness was 0.
- **4:50–5:00** — Test the full arc manually against the running backend: dream → question → drowsy → drift → silence → new dream → wake.

### Hour 6 (5:00–6:00) — DreamJournal + Drop Cap
- **5:00–5:25** — `components/DreamJournal.tsx`. Fetch from journal provider, render last 7 entries. Fraunces body, tiny uppercase date label above, `text-wrap: pretty`, `hyphens: auto`, max-width 58ch.
- **5:25–5:40** — Drop cap on `:first-child` only, `::first-letter` styling with `var(--text-drop)`.
- **5:40–6:00** — Entry expand via View Transition with `journal-entry-{id}` names. Test with mock data if backend isn't producing real entries yet.

### Hour 7 (6:00–7:00) — SolanaHashBadge + ModeToggle + Micro-interactions polish
- **6:00–6:15** — `components/SolanaHashBadge.tsx` — wax seal styling per §7. Hover lift, copy-to-clipboard, link to solscan.
- **6:15–6:40** — `components/ModeToggle.tsx` — the dual-path SVG approach from §7. Wire to `document.startViewTransition` per §6. Verify mode flip works (even if ROLPA page is blank).
- **6:40–7:00** — Pass on every interactive element: velvet shadows applied, button presses feel right, input focus ring correct, journal hover states smooth.

### Hour 8 (7:00–8:00) — Integration, mobile test, PWA
- **7:00–7:20** — Open on phone via `npm run dev -- --host` and local network IP. Fix every mobile issue: blur budget (drop to mobile values), text sizes, tap targets (min 44px), safe-area-insets.
- **7:20–7:35** — PWA manifest.json + basic service worker for install-ability. Icon at 512px with the moon SVG on midnight.
- **7:35–7:50** — Full arc test on phone: type a dream → see star → read question → drift → silence → new dream → wake. Fix anything that feels janky.
- **7:50–8:00** — `prefers-reduced-motion` check: toggle OS setting, verify static states still communicate the drowsiness arc. Record a 15-second phone-in-hand video for the Day 6 artifact.

**End of Day 6:** Phone demo of the complete MILAM night mode. Tag commit `feat: MILAM night mode frontend — stunning`. Sleep.

---

## Closing note

The signature of this build — what will make judges remember it — is not any single animation. It's that **every ambient element breathes on the same 4-second rhythm, and that rhythm slows as the agent drifts toward sleep.** The input breathes. The stars twinkle. The sun pulses. The cursor blinks. When MILAM drowses, the whole app exhales longer. Nobody will name this. Everybody will feel it.

That's craft.
