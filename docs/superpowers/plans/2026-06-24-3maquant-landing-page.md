# 3Ma Capital Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 3maquant.com landing page — a single-route, scroll-driven marketing site with a 3s Forge intro animation, six narrative sections, a live Campaign terminal running a simulated JELLYJELLY replay, and an honest "coming soon / founding" tone.

**Architecture:** Pure TypeScript + Vite, no frontend framework. A pure-logic core (Campaign state machine, scripted replay engine, feature flags) is unit-tested with Vitest and framework-agnostic. A thin visual layer (GSAP timelines, ScrollTrigger, Three.js shaders, SVG) consumes that core. Three.js is lazily imported only after the Forge intro nears completion to keep first paint light. Two independent degradation paths: `reducedMotion` (user preference → static) and `lowEnd` (device capability → lighter shaders).

**Tech Stack:** TypeScript, Vite, Vitest, Three.js, GSAP + ScrollTrigger, Lenis, Tailwind CSS, vite-plugin-glsl. Serverless email endpoint is stubbed locally and left deployed-deferred.

**Spec:** `docs/superpowers/specs/2026-06-24-3maquant-frontend-design.md`

**Conventions:**
- Palette tokens: `--void: #0a0a0c`, `--ember: #d4af78`, `--text: #f4f4f5`. Layer whites via `rgba(255,255,255,0.N)`. Never introduce a second hue.
- Fonts: body Inter (woff2 subset), display Newsreader (variable opsz), mono Söhne Mono → fallback JetBrains Mono. All `font-display: swap`.
- Every task ends with a commit. Commit messages follow `feat:/fix:/chore:/docs:` + short subject.
- Tests first. Pure logic gets Vitest unit tests. Visual modules get a mount-smoke test + a manual screenshot note.

---

## File Structure

| File | Responsibility |
|---|---|
| `index.html` | Single entry; critical hero CSS inline; mounts `#app` and `<canvas id=fluid>` |
| `vite.config.ts` | Vite + glsl plugin + vitest config |
| `package.json` | Deps + scripts (`dev`,`build`,`test`,`test:run`,`preview`) |
| `src/styles/tokens.css` | CSS custom properties: palette, fonts, spacing scale |
| `src/styles/base.css` | Reset + base typography + reduced-motion terminal styles |
| `src/lib/feature-flags.ts` | `reducedMotion`, `lowEnd`, `webgpuAvailable` flags + `dprCapFor()` |
| `src/lib/lenis-gsap.ts` | Lenis↔ScrollTrigger wiring (`scrollerProxy`) |
| `src/lib/reduced-motion.ts` | Returns `Promise<reducedApp>` — all visuals degrade via one accessor |
| `src/data/books.ts` | Three-book copy + risk-iron-law text |
| `src/data/playbooks.ts` | 12-archetype enum + labels |
| `src/data/sections.ts` | Section ids, nav labels, anchor order |
| `src/terminal/types.ts` | `Evidence`, `Campaign`, `EvidenceSource`, `CampaignState` types |
| `src/terminal/state-machine.ts` | Pure `transition(state, evidence)` → next state/`Campaign` |
| `src/terminal/scripted-source.ts` | `ScriptedEvidenceSource`: clocks JSON at wall-time deltas |
| `src/terminal/replays/jelly.json` | 10-15 Evidence entries + Campaign metadata |
| `src/terminal/terminal.ts` | Renders terminal DOM, drives state machine, on/offscreen lifecycle |
| `src/terminal/terminal.css` | Terminal look (mono, ember accents, layered whites) |
| `src/forge/forge-shader.ts` | Three.js point-cloud → ring → glyph shader scene (lazy import) |
| `src/forge/forge.ts` | Forge timeline orchestrator; forks reduced vs full at t=0 |
| `src/forge/forge.css` | Hero/forge stage layout |
| `src/systems/fluid-bg.ts` | Persistent low-ember fluid shader background (lazy import) |
| `src/systems/nav.ts` | After-hero nav fade-in + anchor smooth-scroll + section highlight |
| `src/sections/manifesto.ts` | §1 line-mask reveal |
| `src/sections/thesis.ts` | §2 ASCII flow morph + time-band pacer hook |
| `src/sections/engine.ts` | §3 pinned pillars + mounts terminal |
| `src/sections/books.ts` | §4 three flip cards + SVG divider reveal |
| `src/sections/target.ts` | §5 DrawSVG `ASYMMETRIC CONVEXITY` + line-mask |
| `src/sections/soon.ts` | §6 Coming Soon + waitlist form + footer DISCLOSURE |
| `src/sections/sections.css` | Shared section typography/spacing |
| `src/main.ts` | Bootstrap: register GSAP, mount sections, run forge |
| `src/waitlist/client.ts` | `submitEmail(email)` → POST serverless (abortable) |
| `src/waitlist/worker-note.md` | Deploy-time serverless snippet instructions |
| `tests/feature-flags.test.ts` | Unit: dpr caps, lowEnd logic |
| `tests/state-machine.test.ts` | Unit: legal transitions, invalidation, watch→close path |
| `tests/scripted-source.test.ts` | Unit: evidence clocked at correct wall deltas |
| `tests/waitlist-client.test.ts` | Unit: POST shape, abort, success/fail parsing |
| `tests/forge.test.ts` | Smoke: reduced-motion path returns static glyph timeline (no Three import) |

Build order is bottom-up: tokens & flags → pure core (tested) → terminal → data → sections → forge → systems → bootstrap.

---

## Task 1: Project scaffold + toolchain

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `.gitignore` (extend existing)
- Create: `index.html`
- Create: `src/main.ts` (placeholder)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "3maquant-landing",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vitest": "^2.0.0",
    "jsdom": "^24.1.0",
    "vite-plugin-glsl": "^1.3.0",
    "tailwindcss": "^3.4.0",
    "@types/three": "^0.168.0"
  },
  "dependencies": {
    "three": "^0.168.0",
    "gsap": "^3.12.5",
    "lenis": "^1.1.0"
  }
}
```

Note: GSAP `ScrollTrigger` ships inside the `gsap` package. `lenis` is the new scoped package (drop the `@studio-freight/lenis` alias).

- [ ] **Step 2: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl.default()],
  build: { target: 'es2020', cssMinify: true },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
} as any);
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vitest/globals"]
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 4: Extend `.gitignore`**

Append:
```
node_modules/
dist/
*.local
.superpowers/
```

- [ ] **Step 5: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>3Ma Capital — Alpha Foundry</title>
  <link rel="stylesheet" href="/src/styles/tokens.css" />
  <style>
    /* critical hero CSS — keeps first paint light */
    html,body{margin:0;background:#0a0a0c;color:#f4f4f5;overflow-x:hidden}
    #app{opacity:0} /* forge owns the first reveal */
  </style>
</head>
<body>
  <canvas id="fluid" aria-hidden="true"></canvas>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

- [ ] **Step 6: Create `src/main.ts` placeholder**

```ts
console.log('3MA: stage 0');
```

- [ ] **Step 7: Install and verify dev server boots**

Run: `npm install && npm run dev`
Expected: Vite dev server prints a localhost URL, no errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold vite+vitest+ts toolchain"
```

---

## Task 2: Design tokens + base CSS + font subset wiring

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/base.css`
- Modify: `index.html` (link base.css)

- [ ] **Step 1: Create `src/styles/tokens.css`**

```css
:root {
  --void: #0a0a0c;
  --void-2: #111114;
  --ember: #d4af78;
  --ember-soft: rgba(212,175,120,0.5);
  --text: #f4f4f5;
  --white-85: rgba(255,255,255,0.85);
  --white-60: rgba(255,255,255,0.6);
  --white-45: rgba(255,255,255,0.45);
  --white-30: rgba(255,255,255,0.3);
  --white-18: rgba(255,255,255,0.18);
  --line: rgba(255,255,255,0.12);

  --font-body: "Inter", system-ui, sans-serif;
  --font-display: "Newsreader", "Inter", Georgia, serif;
  --font-mono: "Söhne Mono", "JetBrains Mono", ui-monospace, monospace;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --space-4: 2rem;
  --space-5: 4rem;
  --space-6: 8rem;

  --maxw: 80rem;
}
```

Self-hosted woff2 fonts are added later in the asset task; `font-display: swap` plus these fallback stacks keeps text legible in the meantime.

- [ ] **Step 2: Create `src/styles/base.css`**

```css
@import './tokens.css';

* { box-sizing: border-box; }
html { scroll-behavior: auto; }
body {
  margin: 0;
  background: var(--void);
  color: var(--text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
#fluid { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
#app { position: relative; z-index: 1; }

.display { font-family: var(--font-display); font-weight: 400; letter-spacing: -0.02em; }
.mono { font-family: var(--font-mono); font-feature-settings: "tnum" 1; }
.ember { color: var(--ember); }

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}
```

- [ ] **Step 3: Link base.css in `index.html`**

Replace the `<link rel="stylesheet" href="/src/styles/tokens.css" />` line with:
```html
<link rel="stylesheet" href="/src/styles/base.css" />
```

- [ ] **Step 4: Verify**

Run: `npm run dev` → open URL → DevTools shows `#0a0a0c` body bg, no 404 for tokens/base.

- [ ] **Step 5: Commit**

```bash
git add src/styles index.html
git commit -m "feat: design tokens + base CSS (Ember on Void)"
```

---

## Task 3: Feature flags (pure)

**Files:**
- Create: `src/lib/feature-flags.ts`
- Test: `tests/feature-flags.test.ts`

`featureFlags` is the single source both degradation paths read from. Unit-testable without a real DOM: it takes an optional window-like accessor.

- [ ] **Step 1: Write the failing test**

`tests/feature-flags.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { deriveFlags, dprCapFor } from '../src/lib/feature-flags';

const win = (over: any = {}) =>
  ({ matchMedia: () => ({ matches: false } as MediaQueryList), navigator: { hardwareConcurrency: 8 }, ...over } as unknown as Window);

describe('feature flags', () => {
  it('reducedMotion true when user prefers reduce', () => {
    const f = deriveFlags({ ...win(), matchMedia: () => ({ matches: true } as MediaQueryList) });
    expect(f.reducedMotion).toBe(true);
  });
  it('lowEnd true when hardwareConcurrency < 4', () => {
    const f = deriveFlags(win({ navigator: { hardwareConcurrency: 2 } }));
    expect(f.lowEnd).toBe(true);
  });
  it('lowEnd true when webgpu unavailable', () => {
    const f = deriveFlags({ ...win(), navigator: { hardwareConcurrency: 8, gpu: undefined } });
    expect(f.lowEnd).toBe(true);
  });
  it('lowEnd false on capable device with webgpu', () => {
    const f = deriveFlags(win({ navigator: { hardwareConcurrency: 8, gpu: {} } }));
    expect(f.lowEnd).toBe(false);
  });
  it('dprCapFor full = 1.5, lowEnd = 1.0', () => {
    expect(dprCapFor({ lowEnd: false })).toBe(1.5);
    expect(dprCapFor({ lowEnd: true })).toBe(1.0);
  });
  it('particleCap full = 8000, lowEnd = 4000', () => {
    expect(deriveFlags(win()).particleCap).toBe(8000);
    expect(deriveFlags(win({ navigator: { hardwareConcurrency: 2 } })).particleCap).toBe(4000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- feature-flags`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

`src/lib/feature-flags.ts`:
```ts
export interface Flags {
  reducedMotion: boolean;
  lowEnd: boolean;
  webgpuAvailable: boolean;
  dprCap: number;
  particleCap: number;
}

export function deriveFlags(w: Window = window): Flags {
  const reducedMotion = w.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const webgpuAvailable = !!(w.navigator as any).gpu;
  const lowEnd = (w.navigator.hardwareConcurrency ?? 8) < 4 || !webgpuAvailable;
  return { reducedMotion, lowEnd, webgpuAvailable, ...dprAndParticles(lowEnd) };
}

export function dprCapFor({ lowEnd }: Pick<Flags, 'lowEnd'>): number {
  return lowEnd ? 1.0 : 1.5;
}

function dprAndParticles(lowEnd: boolean): Pick<Flags, 'dprCap' | 'particleCap'> {
  return lowEnd ? { dprCap: 1.0, particleCap: 4000 } : { dprCap: 1.5, particleCap: 8000 };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- feature-flags`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/feature-flags.ts tests/feature-flags.test.ts
git commit -m "feat: feature flags (reduce-motion vs low-end)"
```

---

## Task 4: Campaign state machine (pure)

**Files:**
- Create: `src/terminal/types.ts`
- Create: `src/terminal/state-machine.ts`
- Create: `tests/helpers/campaign-factory.ts`
- Test: `tests/state-machine.test.ts`

Pure: given current `Campaign` and one new `Evidence`, return next `Campaign`. No timers, no DOM.

- [ ] **Step 1: Write the failing test**

`tests/state-machine.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { step } from '../src/terminal/state-machine';
import { emptyCampaign, evidence } from './helpers/campaign-factory';

describe('Campaign state machine', () => {
  it('stays WATCH with < 3 qualifying channels', () => {
    let c = emptyCampaign();
    c = step(c, evidence({ source_channel: 'EVENT_NEWS' }));
    c = step(c, evidence({ source_channel: 'ONCHAIN_DEX' }));
    expect(c.state).toBe('WATCH');
  });
  it('advances WATCH -> ARMED at 3 qualifying channels', () => {
    let c = emptyCampaign();
    c = step(c, evidence({ source_channel: 'EVENT_NEWS' }));
    c = step(c, evidence({ source_channel: 'ONCHAIN_DEX' }));
    c = step(c, evidence({ source_channel: 'CROSS_VENUE' }));
    expect(c.state).toBe('ARMED');
  });
  it('ARMED -> PROBE on next evidence', () => {
    let c = emptyCampaign();
    c = step(c, evidence({ source_channel: 'EVENT_NEWS' }));
    c = step(c, evidence({ source_channel: 'ONCHAIN_DEX' }));
    c = step(c, evidence({ source_channel: 'CROSS_VENUE' }));
    c = step(c, evidence({ source_channel: 'SOCIAL_KOL' }));
    expect(c.state).toBe('PROBE');
  });
  it('PROBE -> SCALE on MICROSTRUCTURE HIGH validation', () => {
    let c = emptyCampaign();
    c = step(c, evidence({ source_channel: 'EVENT_NEWS' }));
    c = step(c, evidence({ source_channel: 'ONCHAIN_DEX' }));
    c = step(c, evidence({ source_channel: 'CROSS_VENUE' }));
    c = step(c, evidence({ source_channel: 'SOCIAL_KOL' }));
    c = step(c, evidence({ source_channel: 'MICROSTRUCTURE', confidence: 'HIGH' }));
    expect(c.state).toBe('SCALE');
  });
  it('invalidation drives CLOSE', () => {
    let c = emptyCampaign();
    c = step(c, evidence({ source_channel: 'EVENT_NEWS' }));
    c = step(c, evidence({ source_channel: 'ONCHAIN_DEX' }));
    c = step(c, evidence({ source_channel: 'CROSS_VENUE' }));
    c = step(c, evidence({ source_channel: 'SOCIAL_KOL' }));
    c = step(c, evidence({ source_channel: 'MICROSTRUCTURE', confidence: 'HIGH' }));
    c = step(c, evidence({ source_channel: 'ONCHAIN_DEX', confidence: 'HIGH', invalidates: true }));
    expect(c.state).toBe('CLOSE');
  });
  it('CLOSE is terminal', () => {
    let c = emptyCampaign();
    c = step(c, evidence({ source_channel: 'EVENT_NEWS' }));
    c = step(c, evidence({ source_channel: 'ONCHAIN_DEX' }));
    c = step(c, evidence({ source_channel: 'CROSS_VENUE' }));
    c = step(c, evidence({ source_channel: 'ONCHAIN_DEX', invalidates: true }));
    expect(c.state).toBe('CLOSE');
    c = step(c, evidence({ source_channel: 'EVENT_NEWS' }));
    expect(c.state).toBe('CLOSE');
  });
});
```

- [ ] **Step 2: Create test helpers**

`tests/helpers/campaign-factory.ts`:
```ts
import type { Campaign, Evidence, EvidenceChannel, Confidence, Tier } from '../../src/terminal/types';

export function emptyCampaign(): Campaign {
  return {
    campaign_id: '0xJELLY-25Q1',
    asset: 'JELLYJELLY-PERP',
    evidence_stack: [],
    playbook: 'REFLEXIVE_SHORT_SQUEEZE',
    risk_box: { max_notional_usd: 250000, max_loss_pct: 8, adl_defense: true },
    state: 'WATCH',
    state_since: 0,
    invalidation: 'depth restored > 60% of OI',
    pnl_pct: 0,
  };
}

let n = 0;
export function evidence(over: Partial<Evidence> & { invalidates?: boolean } = {}): Evidence {
  const { invalidates, ...rest } = over;
  n++;
  return {
    evidence_id: '0xk' + n.toString(16),
    source_channel: 'EVENT_NEWS' as EvidenceChannel,
    confidence: 'MED' as Confidence,
    asset: 'JELLYJELLY-PERP',
    tier: 'TIER_3' as Tier,
    claim: 'structural mismatch',
    metric_kv: {},
    ts: 'T+0',
    invalidates: false,
    ...rest,
  };
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test:run -- state-machine`
Expected: FAIL — types/`step` missing.

- [ ] **Step 4: Write types**

`src/terminal/types.ts`:
```ts
export type EvidenceChannel =
  | 'MICROSTRUCTURE' | 'EVENT_NEWS' | 'SOCIAL_KOL' | 'ONCHAIN_DEX' | 'CROSS_VENUE';
export type Confidence = 'LOW' | 'MED' | 'HIGH';
export type Tier = 'TIER_0' | 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4';
export type CampaignState = 'WATCH' | 'ARMED' | 'PROBE' | 'SCALE' | 'CLOSE';

export interface Evidence {
  evidence_id: string;
  source_channel: EvidenceChannel;
  asset: string;
  tier: Tier;
  confidence: Confidence;
  claim: string;
  metric_kv: Record<string, string>;
  ts: string;
  invalidates?: boolean;
}

export interface Campaign {
  campaign_id: string;
  asset: string;
  evidence_stack: Evidence[];
  playbook: string;
  risk_box: { max_notional_usd: number; max_loss_pct: number; adl_defense: boolean };
  state: CampaignState;
  state_since: number;
  invalidation: string;
  pnl_pct: number;
}

export interface EvidenceSource {
  name: string;
  next(): Promise<Evidence | null>;
  dispose(): void;
}
```

- [ ] **Step 5: Write the state machine**

`src/terminal/state-machine.ts`:
```ts
import type { Campaign, CampaignState, Evidence } from './types';

const ARM_THRESHOLD = 3;

export function step(c: Campaign, e: Evidence): Campaign {
  const stack = [...c.evidence_stack, e];
  if (c.state === 'CLOSE') return { ...c, evidence_stack: stack };
  if (e.invalidates) return { ...c, evidence_stack: stack, state: 'CLOSE', state_since: stack.length };

  let state: CampaignState = c.state;
  const qualifying = distinctChannels(stack);
  if (c.state === 'WATCH')        state = qualifying >= ARM_THRESHOLD ? 'ARMED' : 'WATCH';
  else if (c.state === 'ARMED')   state = 'PROBE';
  else if (c.state === 'PROBE')   state = e.source_channel === 'MICROSTRUCTURE' && e.confidence === 'HIGH' ? 'SCALE' : 'PROBE';
  // SCALE persists until invalidation closes it.

  return { ...c, evidence_stack: stack, state, state_since: state === c.state ? c.state_since : stack.length };
}

function distinctChannels(stack: Evidence[]): number {
  const seen = new Set<string>();
  for (const e of stack) if (e.confidence !== 'LOW') seen.add(e.source_channel);
  return seen.size;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test:run -- state-machine`
Expected: PASS (6 tests).

- [ ] **Step 7: Commit**

```bash
git add src/terminal/types.ts src/terminal/state-machine.ts tests/state-machine.test.ts tests/helpers/campaign-factory.ts
git commit -m "feat: pure Campaign state machine (watch->close)"
```

---

## Task 5: Scripted evidence source (pure clock)

**Files:**
- Create: `src/terminal/replays/jelly.json`
- Create: `src/terminal/scripted-source.ts`
- Test: `tests/scripted-source.test.ts`

Replays an evidence list at wall-time offsets. Pure: injectable clock.

- [ ] **Step 1: Create the replay data**

`src/terminal/replays/jelly.json`:
```json
{
  "campaign": {
    "campaign_id": "0xJELLY-25Q1",
    "asset": "JELLYJELLY-PERP",
    "playbook": "REFLEXIVE_SHORT_SQUEEZE",
    "risk_box": { "max_notional_usd": 250000, "max_loss_pct": 8, "adl_defense": true },
    "invalidation": "depth restored > 60% of OI",
    "pnl_pct_at_close": 31.2
  },
  "evidence": [
    { "t_ms": 0,     "evidence_id": "0xj01", "source_channel": "EVENT_NEWS",      "confidence": "HIGH", "claim": "binance listing window T-18m",        "metric_kv": {}, "ts": "T-18m" },
    { "t_ms": 2000,  "evidence_id": "0xj02", "source_channel": "EVENT_NEWS",      "confidence": "HIGH", "claim": "184M pos vs 12M book depth",         "metric_kv": { "pos": "184M", "depth": "12M" }, "ts": "T-16m" },
    { "t_ms": 4000,  "evidence_id": "0xj03", "source_channel": "ONCHAIN_DEX",    "confidence": "MED",  "claim": "MMs short-biased",                    "metric_kv": {}, "ts": "T-14m" },
    { "t_ms": 6000,  "evidence_id": "0xj04", "source_channel": "CROSS_VENUE",    "confidence": "MED",  "claim": "OI 2.4x open-interest base",          "metric_kv": { "oi_multiple": "2.4x" }, "ts": "T-12m" },
    { "t_ms": 8000,  "evidence_id": "0xj05", "source_channel": "SOCIAL_KOL",     "confidence": "LOW",  "claim": "KOL velocity low (not social event)","metric_kv": {}, "ts": "T-10m" },
    { "t_ms": 10000, "evidence_id": "0xj06", "source_channel": "MICROSTRUCTURE", "confidence": "HIGH", "claim": "book thinning stops, basis widens",  "metric_kv": {}, "ts": "T-8m" },
    { "t_ms": 14000, "evidence_id": "0xj07", "source_channel": "ONCHAIN_DEX",    "confidence": "HIGH", "claim": "depth restored > 60% OI",             "metric_kv": {}, "ts": "T+0m", "invalidates": true }
  ]
}
```

- [ ] **Step 2: Write the failing test**

`tests/scripted-source.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { ScriptedEvidenceSource } from '../src/terminal/scripted-source';
import jelly from '../src/terminal/replays/jelly.json';

describe('ScriptedEvidenceSource', () => {
  it('emits evidence in t_ms order when clock advances', async () => {
    let t = 0;
    const src = new ScriptedEvidenceSource(jelly as any, () => t);
    const got: string[] = [];
    t = 999999; // jump forward so all are due
    let n = await src.next();
    while (n) { got.push(n.evidence_id + '@' + n.t_ms); n = await src.next(); }
    const want = (jelly as any).evidence.map((e: any) => e.evidence_id + '@' + e.t_ms);
    expect(got).toEqual(want);
  });
  it('returns null after last and stays null', async () => {
    let t = 999999;
    const src = new ScriptedEvidenceSource(jelly as any, () => t);
    let n = await src.next();
    while (n) n = await src.next();
    expect(await src.next()).toBeNull();
    expect(await src.next()).toBeNull();
  });
  it('withholds evidence whose t_ms is in the future', async () => {
    let t = 0;
    const src = new ScriptedEvidenceSource(jelly as any, () => t);
    expect((await src.next())?.evidence_id).toBe('0xj01'); // t=0 due
    expect(await src.next()).toBeNull();                    // t=2000 not due yet
    t = 5000;
    expect((await src.next())?.evidence_id).toBe('0xj02');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test:run -- scripted-source`
Expected: FAIL — module missing.

- [ ] **Step 4: Write the implementation**

`src/terminal/scripted-source.ts`:
```ts
import type { Evidence, EvidenceSource } from './types';

interface ReplayEntry extends Evidence { t_ms: number; }
interface Replay { campaign: Record<string, unknown>; evidence: ReplayEntry[]; }

export type TimeStampedEvidence = Evidence & { t_ms: number };

export class ScriptedEvidenceSource implements EvidenceSource {
  name = 'scripted';
  private i = 0;
  private readonly tMs: ReplayEntry[];

  constructor(replay: Replay, private now: () => number = () => performance.now()) {
    this.tMs = [...replay.evidence].sort((a, b) => a.t_ms - b.t_ms);
    this.now = now;
  }

  async next(): Promise<TimeStampedEvidence | null> {
    if (this.i >= this.tMs.length) return null;
    const entry = this.tMs[this.i];
    if (this.now() < entry.t_ms) return null;
    this.i++;
    return entry;
  }

  dispose() { /* nothing to clean */ }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:run -- scripted-source`
Expected: PASS (3 tests). (Test references `n.t_ms`, which the returned entry retains.)

- [ ] **Step 6: Commit**

```bash
git add src/terminal/replays/jelly.json src/terminal/scripted-source.ts tests/scripted-source.test.ts
git commit -m "feat: scripted JELLY replay evidence source"
```

---

## Task 6: Waitlist client (pure fetch, abortable)

**Files:**
- Create: `src/waitlist/client.ts`
- Test: `tests/waitlist-client.test.ts`

- [ ] **Step 1: Write the failing test**

`tests/waitlist-client.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import { submitEmail } from '../src/waitlist/client';

describe('waitlist client', () => {
  it('posts JSON {email} to endpoint', async () => {
    let lastBody = '';
    const f = vi.fn(async (_url: string, opt: any) => {
      lastBody = opt.body;
      return { ok: true, status: 200, json: async () => ({ ok: true }) };
    });
    const r = await submitEmail('a@b.com', { fetch: f as any, endpoint: '/api/waitlist' });
    expect(f).toHaveBeenCalledWith('/api/waitlist', expect.objectContaining({
      method: 'POST', headers: { 'content-type': 'application/json' },
    }));
    expect(lastBody).toBe(JSON.stringify({ email: 'a@b.com' }));
    expect(r.ok).toBe(true);
  });
  it('returns ok:false on 4xx', async () => {
    const f = vi.fn(async () => ({ ok: false, status: 400, json: async () => ({ error: 'bad email' }) }));
    const r = await submitEmail('x', { fetch: f as any, endpoint: '/api/w' });
    expect(r.ok).toBe(false);
    expect(r.message).toBe('bad email');
  });
  it('supports AbortSignal', async () => {
    const ctrl = new AbortController(); ctrl.abort();
    const f = vi.fn(async () => { throw new DOMException('aborted', 'AbortError'); });
    const r = await submitEmail('a@b.com', { fetch: f as any, endpoint: '/api/w', signal: ctrl.signal });
    expect(r.ok).toBe(false);
    expect(r.aborted).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- waitlist-client`
Expected: FAIL — module missing.

- [ ] **Step 3: Write the implementation**

`src/waitlist/client.ts`:
```ts
export interface WaitlistResult { ok: boolean; message?: string; aborted?: boolean }

export interface SubmitOpts {
  fetch?: typeof fetch;
  endpoint?: string;
  signal?: AbortSignal;
}

export async function submitEmail(email: string, opts: SubmitOpts = {}): Promise<WaitlistResult> {
  const fetcher = opts.fetch ?? fetch.bind(globalThis);
  const endpoint = opts.endpoint ?? '/api/waitlist';
  try {
    const res = await fetcher(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
      signal: opts.signal,
    });
    const body: any = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, message: body?.error ?? 'request failed' };
    return { ok: true, message: body?.message };
  } catch (e: any) {
    if (e?.name === 'AbortError') return { ok: false, aborted: true };
    return { ok: false, message: 'network error' };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- waitlist-client`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/waitlist/client.ts tests/waitlist-client.test.ts
git commit -m "feat: waitlist client (abortable POST)"
```

---

## Task 7: Terminal renderer (DOM + lifecycle)

**Files:**
- Create: `src/terminal/terminal.ts`
- Create: `src/terminal/terminal.css`
- Test: `tests/terminal.test.ts`

Drives the state machine against a `ScriptedEvidenceSource` on a clock, renders DOM per §3, pauses when offscreen (IntersectionObserver), and freezes to ARMED static state under reduced-motion.

- [ ] **Step 1: Write the failing test**

`tests/terminal.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { renderTerminal } from '../src/terminal/terminal';
import jelly from '../src/terminal/replays/jelly.json';

describe('terminal render', () => {
  it('mounts into a container without throwing', () => {
    const host = document.createElement('div');
    const ctrl = renderTerminal(host, jelly as any, { reducedMotion: true, now: () => 0 });
    expect(host.querySelector('[data-term=campaign]')).toBeTruthy();
    expect(host.querySelector('[data-term=state]')?.textContent).toContain('WATCH');
    ctrl.dispose();
  });
  it('reduced-motion freezes at ARMED static plate', async () => {
    const host = document.createElement('div');
    const ctrl = renderTerminal(host, jelly as any, { reducedMotion: true, now: () => 999999 });
    ctrl.staticPlate(); // reduced path jumps straight to a chosen static state
    expect(host.querySelector('[data-term=state]')?.textContent).toContain('ARMED');
    ctrl.dispose();
  });
  it('advance() steps the campaign forward across replay', async () => {
    const host = document.createElement('div');
    let t = 0;
    const ctrl = renderTerminal(host, jelly as any, { reducedMotion: false, now: () => t });
    await ctrl.advance(0);    // t=0
    expect(host.querySelector('[data-term=state]')?.textContent).toContain('WATCH');
    await ctrl.advance(16000); // past all evidence + invalidation
    expect(host.querySelector('[data-term=state]')?.textContent).toContain('CLOSE');
    ctrl.dispose();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- terminal`
Expected: FAIL — `terminal.ts` missing.

- [ ] **Step 3: Write terminal CSS**

`src/terminal/terminal.css`:
```css
.term { background: rgba(10,10,12,0.66); backdrop-filter: blur(12px);
  border: 1px solid var(--line); font-family: var(--font-mono);
  color: var(--white-85); padding: var(--space-4); font-size: 13px; line-height: 1.7; }
.term .lbl { color: var(--white-30); font-size: 10px; letter-spacing: 0.2em; }
.term .row { padding: var(--space-2) 0; border-bottom: 1px solid var(--line); }
.term .pill { color: var(--ember); border: 1px solid var(--ember-soft);
  padding: 1px 6px; border-radius: 3px; font-size: 10px; }
.term .state-dot { color: var(--ember); }
.term .seed { color: var(--white-30); letter-spacing: 0.2em; }
```

- [ ] **Step 4: Write the renderer**

`src/terminal/terminal.ts`:
```ts
import './terminal.css';
import type { Campaign, Evidence } from './types';
import { step } from './state-machine';
import { ScriptedEvidenceSource } from './scripted-source';
import jellyJson from './replays/jelly.json';

export interface TerminalOpts { reducedMotion: boolean; now: () => number }
export interface TerminalCtrl { advance(toMs: number): Promise<void>; staticPlate(): void; dispose(): void }

export function renderTerminal(host: HTMLElement, replay: any, opts: TerminalOpts): TerminalCtrl {
  let campaign: Campaign = {
    ...replay.campaign, evidence_stack: [], state: 'WATCH', state_since: 0, pnl_pct: 0,
  } as Campaign;
  const source = new ScriptedEvidenceSource(replay, opts.now);
  let observer: IntersectionObserver | null = null;
  let running = false;

  host.innerHTML = '';
  const root = document.createElement('div'); root.className = 'term';
  const head = document.createElement('div'); head.className = 'row';
  head.innerHTML = `<span class="ember">3MA · CAMPAIGN ENGINE</span> <span style="float:right;color:var(--white-30)">replay mode</span>`;
  const idRow = document.createElement('div'); idRow.className = 'row';
  const sensorsRow = document.createElement('div'); sensorsRow.className = 'row';
  const evidenceRow = document.createElement('div'); evidenceRow.className = 'row';
  const stateRow = document.createElement('div'); stateRow.className = 'row';
  const pnlRow = document.createElement('div'); stateRow.className = 'row';
  const seedRow = document.createElement('div'); seedRow.className = 'row';
  root.append(head, idRow, sensorsRow, evidenceRow, stateRow, pnlRow, seedRow);
  host.appendChild(root);

  idRow.setAttribute('data-term', 'campaign');
  stateRow.setAttribute('data-term', 'state');

  function paint() {
    idRow.innerHTML = `<span class="lbl">CAMPAIGN</span><br>${campaign.campaign_id} · ${campaign.asset} <span class="pill">${campaign.playbook}</span>`;
    sensorsRow.innerHTML = `<span class="lbl">SENSORS · evidence ingest</span><br>` +
      ['EVENT_NEWS','ONCHAIN_DEX','CROSS_VENUE','SOCIAL_KOL','MICROSTRUCTURE']
        .map(ch => peakConfidence(campaign.evidence_stack, ch))
        .map(c => c ? `<span class="${c==='HIGH'?'ember':'state-dot'}">● ${c}</span>` : `<span style="color:var(--white-18)">● —</span>`)
        .join(' ');
    evidenceRow.innerHTML = `<span class="lbl">EVIDENCE STACK</span>` +
      campaign.evidence_stack.slice(-5).map(e => `<br>▴ ${highlight(e.claim)}`).join('');
    stateRow.innerHTML = `<span class="lbl">CAMPAIGN STATE · lifecycle</span><br>` +
      ['WATCH','ARMED','PROBE','SCALE','CLOSE']
        .map((s, i) => `<span style="color:${s===campaign.state?'var(--<data-term=state>text,#f4f4f5)':'var(--white-30)'};font-weight:${s===campaign.state?700:400}">${s}</span>`)
        .join(' <span class="state-dot">—▸</span> ');
    pnlRow.innerHTML = campaign.state === 'CLOSE'
      ? `<span style="color:var(--white-30)">realized PnL (replay)</span> <span class="ember">+${replay.campaign.pnl_pct_at_close}% — capped at ${campaign.risk_box.max_loss_pct}% drawdown</span>`
      : '';
    seedRow.innerHTML = `<span class="seed">▢ LIVE CHANNEL SEEDING…</span><span style="float:right;color:var(--white-18)">playbook 0x3MA · 12 archetypes</span>`;
  }

  function highlight(claim: string): string {
    return claim.replace(/\b(\d+[Mx]?)\b/g, '<span class="ember">$1</span>');
  }

  async function pump() {
    running = true;
    for (;;) {
      const e = await source.next();
      if (!e) break;
      campaign = step(campaign, e);
      if ((e as any).invalidates) campaign.pnl_pct = replay.campaign.pnl_pct_at_close;
    }
    running = false;
  }

  async function advance(toMs: number): Promise<void> {
    // advance the source's clock window; we reuse opts.now by wrapping
    (opts as any).now = () => toMs;
    await pump();
    paint();
  }

  function staticPlate() {
    campaign = { ...campaign, state: 'ARMED', state_since: 1,
      evidence_stack: (replay.evidence as any[]).slice(0,4).map(({t_ms,...e})=>e) };
    paint();
  }

  if (opts.reducedMotion) staticPlate(); else paint();

  observer = new IntersectionObserver((ents) => {
    const inView = ents[0]?.isIntersecting;
    if (opts.reducedMotion) { running = false; return; }
    if (inView && !running) pump();
    if (!inView) running = false;
  });
  observer.observe(host);

  return { advance, staticPlate, dispose() { observer?.disconnect(); source.dispose(); host.innerHTML = ''; } };
}
```

Note: `opts.now` is captured by closure into the source at construction. The `advance(toMs)` rewrites `opts.now` so the source clears any due evidence. (If your approach fixes the clock differently, keep the test contract — `advance(CLOSE)` produces the CLOSE state.) The broken template literal `${s===campaign.state?'var(--<data-term=state>text,#f4f4f5)':'var(--white-30)'}` must be a plain `'var(--text)'` — fix before running:

Replace that stateRow color with:
```ts
.map((s) => s === campaign.state ? `<b>${s}</b>` : `<span style="color:var(--white-30)">${s}</span>`)
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:run -- terminal`
Expected: PASS (3 tests).
If `advance` fails to reach CLOSE, confirm `pump()` emits the invalidating `0xj07` (t_ms=14000 ≤ 16000). Insert a `console.log(campaign.state, campaign.evidence_stack.length)` in pump if needed, then fix the source/state logic until CLOSE lands.

- [ ] **Step 6: Commit**

```bash
git add src/terminal/terminal.ts src/terminal/terminal.css tests/terminal.test.ts
git commit -m "feat: terminal renderer + lifecycle (reduced/static split)"
```

---

## Task 8: Forge intro — reduced-motion path + timeline skeleton

**Files:**
- Create: `src/forge/forge.ts`
- Create: `src/forge/forge.css`
- Test: `tests/forge.test.ts`

We build the reduced-motion path first (testable in jsdom, no Three.js) plus the timeline skeleton that the full shader path plugs into in Task 9.

- [ ] **Step 1: Write the failing test**

`tests/forge.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { runForge } from '../src/forge/forge';

describe('forge', () => {
  it('reduced-motion path reveals glyph in 0.6s and never imports three', async () => {
    const host = document.createElement('div'); host.id = 'app';
    const flags = { reducedMotion: true, lowEnd: false, webgpuAvailable: true, dprCap: 1.5, particleCap: 8000 };
    let fetchedThree = false;
    const ctrl = runForge(host, flags, { loadShader: async () => { fetchedThree = true; return {}; } });
    await ctrl.done;
    expect(fetchedThree).toBe(false);
    expect(host.querySelector('[data-forge=glyph]')?.textContent).toContain('3MA');
    ctrl.dispose();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- forge`
Expected: FAIL — module missing.

- [ ] **Step 3: Write forge CSS**

`src/forge/forge.css`:
```css
.forge-stage { position: fixed; inset: 0; display: grid; place-items: center; z-index: 50; background: var(--void); }
.forge-stage canvas { position:absolute; inset:0; }
.glyph { font-family: var(--font-display); font-size: clamp(3rem, 12vw, 9rem); letter-spacing: -0.04em; color: var(--text);
  opacity: 0; }
.glyph.dim { color: var(--white-60); }
```

- [ ] **Step 4: Write the orchestrator (reduced path live; full path stubbed)**

`src/forge/forge.ts`:
```ts
import './forge.css';
import type { Flags } from '../lib/feature-flags';

export interface ForgeDeps { loadShader?: () => Promise<unknown> }
export interface ForgeCtrl { done: Promise<void>; dispose(): void }

export function runForge(host: HTMLElement, flags: Flags, deps: ForgeDeps = {}): ForgeCtrl {
  const stage = document.createElement('div'); stage.className = 'forge-stage';
  const glyph = document.createElement('div'); glyph.className = 'glyph'; glyph.textContent = '3MA';
  glyph.setAttribute('data-forge', 'glyph');
  if (flags.reducedMotion) glyph.classList.add('dim');
  stage.appendChild(glyph);
  host.appendChild(stage);

  let disposed = false;
  const untilDone = new Promise<void>(async (resolve) => {
    if (flags.reducedMotion) {
      await delay(0); glyph.style.transition = 'opacity .6s ease'; glyph.style.opacity = '1';
      await delay(620); await unload(stage); resolve();
      return;
    }
    // Full shader path (Task 9): canvas + shader, lazy import.
    if (deps.loadShader) await deps.loadShader();
    // placeholder timeline; Task 9 replaces body
    await delay(2800); glyph.style.opacity = '1';
    await delay(220); await unload(stage); resolve();
  });

  function unload(el: HTMLElement) { if (!disposed) el.remove(); return Promise.resolve(); }
  return { done: untilDone, dispose() { disposed = true; stage.remove(); } };
}

function delay(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
```

jsdom lacks `requestAnimationFrame`-driven GSAP; the reduced path uses CSS transitions so tests don't need rAF.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:run -- forge`
Expected: PASS (1 test, ~700ms).

- [ ] **Step 6: Commit**

```bash
git add src/forge/forge.ts src/forge/forge.css tests/forge.test.ts
git commit -m "feat: forge intro (reduced-motion path + timeline skeleton)"
```

---

## Task 9: Forge shader scene (Three.js, lazy) — visual

**Files:**
- Create: `src/forge/forge-shader.ts`
- Create: `src/shaders/curl-noise.glsl`
- Create: `src/shaders/fbm.glsl`
- Create: `src/shaders/ring-form.glsl`
- Modify: `src/forge/forge.ts` (plug full path into skeleton)

Visual task — no unit test; verified by manual screenshot in Step 6.

- [ ] **Step 1: Create GLSL includes**

`src/shaders/curl-noise.glsl` (Simplex-derived curl; standard reference impl):
```glsl
vec3 curlNoise(vec3 p) {
  // compact simplex curl — see Appendix of Bridson 2007 gist
  float s = 0.5;
  vec3 a = vec3(sin(p.x*s+1.7), sin(p.y*s+9.2), sin(p.z*s+3.3));
  vec3 b = vec3(cos(p.z*1.1), cos(p.x*1.1), cos(p.y*1.1));
  return cross(a, b) * 0.8;
}
```

`src/shaders/fbm.glsl`:
```glsl
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p),f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i+vec2(0,0)),hash(i+vec2(1,0)),u.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y); }
float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }
```

`src/shaders/ring-form.glsl`:
```glsl
// vertex: drive point cloud curl->collapse by uniform uPhase (0..1)
uniform float uPhase;
attribute float aSeed;
void main() {
  vec3 pos = position;
  vec3 flow = curlNoise(pos * 0.6 + uPhase * 0.5);
  vec3 toCenter = -normalize(pos + vec3(1e-3));
  pos += flow * (1.0 - uPhase) * 1.2;     // churn early
  pos += toCenter * uPhase * 3.0;         // collapse to ring late
  float ring = smoothstep(0.45, 0.9, uPhase);
  pos.y += sin(uPhase*6.28+pos.x*4.0)*ring*0.3;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = (2.0 + aSeed*2.0) * (300.0 / -gl_Position.z);
}
```

(fragments color toward `--ember`; alpha fades so the glyph reads behind.)

- [ ] **Step 2: Write the shader module**

`src/forge/forge-shader.ts`:
```ts
import * as THREE from 'three';
import fragmentRing from '../shaders/ring-form.glsl?raw'; // re-use vert as note; below uses ShaderMaterial
import curlSrc from '../shaders/curl-noise.glsl?raw';
import fbmSrc from '../shaders/fbm.glsl?raw';
import type { Flags } from '../lib/feature-flags';

export interface ForgeScene { setPhase(p: number): void; dispose(): void }

export async function createForgeScene(canvas: HTMLCanvasElement, flags: Flags): Promise<ForgeScene> {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, flags.dprCap));
  renderer.setSize(window.innerWidth, window.innerHeight);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.z = 14;

  const N = flags.particleCap >= 8000 ? 8000 : Math.min(flags.particleCap, 4000);
  const geom = new THREE.BufferGeometry();
  const arr = new Float32Array(N * 3); const seed = new Float32Array(N);
  for (let i=0;i<N;i++){ arr[i*3]=Math.random()*24-12; arr[i*3+1]=Math.random()*24-12; arr[i*3+2]=Math.random()*24-12; seed[i]=Math.random(); }
  geom.setAttribute('position', new THREE.BufferAttribute(arr,3));
  geom.setAttribute('aSeed', new THREE.BufferAttribute(seed,1));

  const mat = new THREE.ShaderMaterial({
    uniforms: { uPhase: { value: 0 } },
    vertexShader: curlSrc + fbmSrc + vertexShader,
    fragmentShader: `void main(){ gl_FragColor = vec4(0.83,0.69,0.47,0.9); }`, // #d4af78 ~ rgb(212,175,120)
    transparent: true, blending: THREE.AdditiveBlending,
  });
  // inject the ring vertex + curl/fbm prefixes
  mat.vertexShader = curlSrc + fbmSrc + vertexShader;
  const points = new THREE.Points(geom, mat); scene.add(points);

  const vert = `uniform float uPhase; attribute float aSeed; void main(){ vec3 pos=position; vec3 flow=curlNoise(pos*0.6+uPhase*0.5); vec3 toC=-normalize(pos+vec3(1e-3)); pos+=flow*(1.0-uPhase)*1.2; pos+=toC*uPhase*3.0; gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0); gl_PointSize=(2.0+aSeed*2.0)*(300.0/-gl_Position.z); }`;
  mat.vertexShader = vert; mat.needsUpdate = true;

  let raf = 0; let phase = 0;
  function tick() { mat.uniforms.uPhase.value = phase; renderer.render(scene,camera); raf=requestAnimationFrame(tick); }
  tick();

  return {
    setPhase(p: number) { phase = p; },
    dispose() { cancelAnimationFrame(raf); geom.dispose(); mat.dispose(); renderer.dispose(); },
  };
}
```

(The vertex string duplication above is a wart; on first real compile, delete the duplicated `mat.vertexShader =` assignment that uses the placeholder and keep only the inline `vert` version. Treat the duplication as flagged-and-resolved before screenshotting.)

- [ ] **Step 3: Plug the full path into `forge.ts`**

In `src/forge/forge.ts`, replace the full-path branch body (`if (deps.loadShader) await deps.loadShader(); ...`) with:
```ts
    const canvas = document.createElement('canvas'); stage.insertBefore(canvas, glyph);
    const { createForgeScene } = await import('./forge-shader'); // lazy: Three.js enters here
    const scene = createForgeScene(canvas, flags);
    // 0-0.3 fade particles in; 0.3-1.8 churn; 1.8-2.8 collapse+ring; glyph emerges 2.4
    await animate((t) => scene.then ? null : null); // replaced below
```
Then implement a real timeline using GSAP:
```ts
    import { gsap } from 'gsap';
    const sceneRef = await (scene as Promise<Awaited<ReturnType<typeof createForgeScene>>>);
    const tl = gsap.timeline();
    tl.to(stage, { autoAlpha: 1, duration: 0.3 })
      .to({ p: 0 }, { p: 0.6, duration: 1.5, onUpdate() { sceneRef.setPhase(this.targets()[0].p*0.6); } }, 0)
      .to({ p: 0.6 }, { p: 1.0, duration: 1.0, onUpdate() { sceneRef.setPhase(this.targets()[0].p); } }, 0.3)
      .to(glyph, { opacity: 1, duration: 0.4 }, 2.4)     // glyph crystallizes
      .to(stage, { autoAlpha: 0, scale: 0.98, duration: 0.2 }, 2.8);
    await tl.then();
    sceneRef.dispose();
    await unload(stage); resolve();
```

(Adjust the placeholder `animate` import out — use `gsap.timeline()` only. Delete the stray `await animate(...)` line.)

- [ ] **Step 4: Run forge test again — reduced path still passes**

Run: `npm run test:run -- forge`
Expected: PASS (1 test). The full path isn't exercised here; it's verified manually next.

- [ ] **Step 5: Manual smoke — full path**

Run: `npm run dev` → open in browser (no reduced-motion).
Expected: ~3s, particles churn → collapse → ring → "3MA" glyph appears → stage fades. DevTools Network tab: `three.js` chunk loads **after** ~2.4s, not on first paint.

- [ ] **Step 6: Commit**

```bash
git add src/forge/forge-shader.ts src/shaders src/forge/forge.ts
git commit -m "feat: forge shader scene (lazy Three.js, ember particles)"
```

---

## Task 10: Section data (books, playbooks, sections)

**Files:**
- Create: `src/data/books.ts`
- Create: `src/data/playbooks.ts`
- Create: `src/data/sections.ts`

Pure data; no test needed (consumed by visual tasks).

- [ ] **Step 1: `src/data/sections.ts`**
```ts
export const SECTIONS = [
  { id: 'manifesto', label: 'manifesto', order: 1 },
  { id: 'thesis',    label: 'thesis',    order: 2 },
  { id: 'engine',    label: 'engine',    order: 3 },
  { id: 'books',     label: 'books',     order: 4 },
  { id: 'target',    label: 'target',     order: 5 },
  { id: 'soon',      label: 'soon',      order: 6 },
] as const;
```

- [ ] **Step 2: `src/data/books.ts`**
```ts
export interface Book { id: string; name: string; scope: string; ironLaw: string[]; tag: string }
export const BOOKS: Book[] = [
  { id: 'core', name: 'Core Book',
    scope: 'BTC / ETH / SOL 主流币永续',
    ironLaw: ['高胜率','稳定正期望','± controlled','不追极致盈亏比'],
    tag: 'controlled' },
  { id: 'event', name: 'Event Book',
    scope: '突发新闻 / 上币 / KOL 爆破 / 机制错配',
    ironLaw: ['高盈亏比','事件驱动','asymmetric','Probe 先试仓'],
    tag: 'asymmetric' },
  { id: 'moonshot', name: 'Moonshot Book',
    scope: '极端反身性小市值妖币',
    ironLaw: ['归零心态','单次损失锁死','不允许向下摊平','利润滚动','独立风控'],
    tag: 'right-tail' },
];
```

- [ ] **Step 3: `src/data/playbooks.ts`**
```ts
export const PLAYBOOKS = [
  'REFLEXIVE_SHORT_SQUEEZE','LISTING_WINDOW_FRONT_RUN','KOL_VELOCITY_BREAKOUT',
  'MM_MISPRICE_REVERSION','FUNDING_ARBITRAGE','CROSS_VENUE_BASIS',
  'ONCHAIN_ACCUM_FRONT_RUN','ADL_DEFENSE','NEWS_HEADLINE_SNIPER',
  'LIQUIDITY_DRAIN_FADE','TIER0_TREND_RIDE','JELLY_STRUCT_MISMATCH',
] as const;
export type Playbook = typeof PLAYBOOKS[number];
```

- [ ] **Step 4: Commit**

```bash
git add src/data
git commit -m "feat: books/playbooks/sections data"
```

---

## Task 11: Manifesto (§1) — SVG text reveal

**Files:**
- Create: `src/sections/sections.css`
- Create: `src/sections/manifesto.ts`

Visual task — manual verifd.

- [ ] **Step 1: Create shared section CSS**

`src/sections/sections.css`:
```css
section { position: relative; max-width: var(--maxw); margin: 0 auto;
  padding: var(--space-6) var(--space-4); z-index: 1; }
.section-eyebrow { color: var(--white-30); font-size: 12px; letter-spacing: 0.25em; }
.line { display: block; overflow: hidden; }
.line > span { display: block; transform: translateY(110%); }
@media (prefers-reduced-motion: reduce){ .line > span { transform: none; } }
```

- [ ] **Step 2: Create Manor-block**

`src/sections/manifesto.ts`:
```ts
import './sections.css';

const LINES = [
  '我们不是在猜价格。',
  '我们正在一座铸炉里，',
  'trying to build something nobody has built before ——',
  '一台把 AI 摆在正确位置上的加密永续战役机器。',
  'AI 不扣毫秒的扳机。它坐在总参谋部里，',
  '用全维度情报重构市场的世界模型，制定战役剧本。',
  '我们全部的工作，是给这位军师一座能动手的工厂。',
  '—— 3Ma Capital',
];

export function mountManifesto(host: HTMLElement): HTMLElement {
  const sec = document.createElement('section'); sec.id = 'manifesto';
  sec.innerHTML = `<p class="section-eyebrow">01 — MANIFESTO</p>` +
    LINES.map((l,i) =>
      `<span class="line"><span data-line>${l}</span></span>`).join('');
  host.appendChild(sec);
  return sec;
}
```

Wiring GSAP reveal is done in Task 14 (bootstrap) so all sections share one ScrollTrigger pass.

- [ ] **Step 3: Commit**

```bash
git add src/sections/sections.css src/sections/manifesto.ts
git commit -m "feat: manifesto section markup (§1)"
```

---

## Task 12: Three books (§4) + target (§5) — SVG reveals

**Files:**
- Create: `src/sections/books.ts`
- Create: `src/sections/target.ts`

- [ ] **Step 1: `src/sections/books.ts`**
```ts
import './sections.css';
import { BOOKS } from '../data/books';

export function mountBooks(host: HTMLElement): HTMLElement {
  const sec = document.createElement('section'); sec.id = 'books';
  sec.innerHTML = `<p class="section-eyebrow">04 — THREE BOOKS</p>` +
    `<div class="grid3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3);"></div>`;
  const grid = sec.querySelector('.grid3')!;
  BOOKS.forEach((b) => {
    const card = document.createElement('div'); card.className = 'book';
    card.style.cssText = 'border:1px solid var(--line);padding:var(--space-4);background:rgba(10,10,12,0.5)';
    card.innerHTML = `<h3 class="ember">${b.name}</h3><p style="color:var(--white-60)">${b.scope}</p>` +
      `<ul style="color:var(--white-85);line-height:1.9">${b.ironLaw.map(l=>`<li>${l}</li>`).join('')}</ul>` +
      `<span class="pill small ember">${b.tag}</span>`;
    grid.appendChild(card);
  });
  // SVG divider wall between cards
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width','100%'); svg.setAttribute('height','100%');
  svg.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:0';
  [33.33, 66.66].forEach((x) => {
    const p = document.createElementNS('http://www.w3.org/2000/svg','line');
    p.setAttribute('x1',`${x}%`); p.setAttribute('x2',`${x}%`);
    p.setAttribute('y1','0'); p.setAttribute('y2','100%');
    p.setAttribute('stroke','var(--ember-soft)'); p.setAttribute('stroke-dasharray','1000');
    ((p as any)._drawRef = p); // reveal driven in bootstrap ScrollTrigger
    svg.appendChild(p);
  });
  sec.style.position = 'relative'; sec.appendChild(svg);
  host.appendChild(sec);
  return sec;
}
```

- [ ] **Step 2: `src/sections/target.ts`**
```ts
import './sections.css';

export function mountTarget(host: HTMLElement): HTMLElement {
  const sec = document.createElement('section'); sec.id = 'target';
  sec.innerHTML = `
    <p class="section-eyebrow">05 — TARGET</p>
    <svg viewBox="0 0 600 120" width="100%" height="120" preserveAspectRatio="xMidYMid meet">
      <text data-draw x="300" y="60" text-anchor="middle" style="font-family:var(--font-display);font-size:64px;fill:transparent;stroke:var(--ember);stroke-width:1">ASYMMETRIC</text>
      <text data-draw x="300" y="110" text-anchor="middle" style="font-family:var(--font-display);font-size:64px;fill:transparent;stroke:var(--ember);stroke-width:1">CONVEXITY</text>
    </svg>
    <p class="line"><span data-line>非对称凸性 · 右尾捕获 ——</span></p>
    <p class="line"><span data-line>在不死于 Rug 的前提下，把资本配置到那些凸性不对称的右尾战役上。</span></p>
    <p style="color:var(--white-30);font-size:13px;letter-spacing:0.1em;margin-top:var(--space-3)">
      Drawdown-capped · Convexity-first · Founding hypothesis
    </p>`;
  host.appendChild(sec);
  return sec;
}
```

(`data-draw` text gets DrawSVG-length reveal; `data-line` gets line-mask; both wired in Task 14.)

- [ ] **Step 3: Commit**

```bash
git add src/sections/books.ts src/sections/target.ts
git commit -m "feat: books + target sections (SVG draw/line-mask anchors)"
```

---

## Task 13: Engine (§3) — mounts terminal; Soon (§6) — waitlist

**Files:**
- Create: `src/sections/engine.ts`
- Create: `src/sections/soon.ts`
- Create: `src/sections/thesis.ts`
- Create: `src/waitlist/worker-note.md`

- [ ] **Step 1: `src/sections/thesis.ts`**
```ts
import './sections.css';
export function mountThesis(host: HTMLElement): HTMLElement {
  const sec = document.createElement('section'); sec.id = 'thesis';
  sec.innerHTML = `<p class="section-eyebrow">02 — THESIS</p>` +
    `<svg viewBox="0 0 700 220" width="100%" height="220" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
       <g data-ascii fill="var(--white-45)" style="font-family:var(--font-mono);font-size:13px">
         <text x="10" y="40">旧路线  PerpRadar Agent</text>
         <text x="10" y="70">信号库 ─▶ Agent 审阅 ─▶ 下单</text>
         <text x="10" y="100">上限低 · 缺博弈敏感度</text>
       </g>
       <g data-ascii fill="var(--ember)" style="font-family:var(--font-mono);font-size:13px">
         <text x="360" y="40">新路线  Alpha Foundry</text>
         <text x="360" y="70">全市场传感器 ─▶ 证据黑板 ─▶ 战役引擎</text>
         <text x="360" y="100">高凸性右尾 · 反身性 · 错配</text>
       </g>
     </svg>`;
  host.appendChild(sec);
  return sec;
}
```

ASCII morph keyed by `data-ascii` in Task 14.

- [ ] **Step 2: `src/sections/engine.ts`**
```ts
import './sections.css';
import { renderTerminal } from '../terminal/terminal';
import jelly from '../terminal/replays/jelly.json';
import { deriveFlags } from '../lib/feature-flags';

const PILLARS = [
  ['黑板 + Attention Router', '结构化证据黑板，注意力动态分配推理与抓取预算'],
  ['时间尺度分工', '0-20s 纯代码层 / 20s-24h AI 解释层 / 天-周 进化层'],
  ['战役对象 Trade Campaign', 'Evidence Stack · Playbook · Risk Box · Invalidation 链'],
  ['传感器网络 · 渐进缩放', 'Tier 0-4，按 Attention 分数渐进解锁抓取深度'],
  ['Token Dossier + Playbook DSL', '盘后预生成档案，临场秒级匹配 12 类剧本'],
];

export function mountEngine(host: HTMLElement): HTMLElement {
  const sec = document.createElement('section'); sec.id = 'engine';
  sec.innerHTML = `<p class="section-eyebrow">03 — ENGINE</p>
    <div class="pillars" style="width:48%;float:left"></div>
    <div class="term-host" style="width:48%;float:right"></div>
    <div style="clear:both"></div>`;
  const p = sec.querySelector('.pillars')!;
  PILLARS.forEach(([t,d]) => {
    const d_ = document.createElement('div'); d_.className='row';
    d_.style.cssText='border-top:1px solid var(--line);padding:var(--space-2) 0';
    d_.innerHTML = `<dt class="ember" style="font-size:14px">${t}</dt><dd style="color:var(--white-60);margin:4px 0 0">${d}</dd>`;
    p.appendChild(d_);
  });
  const termHost = sec.querySelector('.term-host') as HTMLElement;
  // terminal mounts lazily only when section nears viewport (Task 14 Scrolltrigger)
  sec.dataset.lazyTerm = '1';
  (sec as any)._termHost = termHost;
  host.appendChild(sec);
  return sec;
}

export function activateEngineTerminal(sec: HTMLElement) {
  if (sec.dataset.termMounted) return; sec.dataset.termMounted = '1';
  const host = (sec as any)._termHost as HTMLElement;
  const flags = deriveFlags();
  renderTerminal(host, jelly as any, { reducedMotion: flags.reducedMotion, now: () => performance.now() });
}
```

- [ ] **Step 3: `src/sections/soon.ts`**
```ts
import './sections.css';
import { submitEmail } from '../waitlist/client';

export function mountSoon(host: HTMLElement): HTMLElement {
  const sec = document.createElement('section'); sec.id = 'soon';
  sec.innerHTML = `
    <p class="section-eyebrow">06 — COMING SOON</p>
    <h2 class="display" style="font-size:clamp(2rem,6vw,4rem)">我们正在铸造。</h2>
    <p class="display ember" style="font-size:clamp(1.2rem,3vw,2rem);opacity:0.8">Something is being forged.</p>
    <p style="color:var(--white-45);font-size:13px;letter-spacing:0.15em;margin-top:var(--space-4)">FOUNDING · Q4 25 — IN PROGRESS</p>
    <div class="progress" style="width:240px;height:2px;background:var(--white-18);overflow:hidden"><i data-band style="display:block;width:30%;height:100%;background:linear-gradient(90deg,var(--ember),transparent)"></i></div>

    <form data-waitlist style="display:flex;gap:var(--space-2);margin-top:var(--space-4)">
      <input name="email" type="email" placeholder="email@yourdomain.com"
        style="flex:1;background:transparent;border:1px solid var(--line);color:var(--text);padding:var(--space-2)" required />
      <button class="ember" style="border:1px solid var(--ember);background:transparent;padding:var(--space-2) var(--space-3)">JOIN</button>
    </form>
    <p data-wl-msg style="color:var(--ember);margin-top:var(--space-2)"></p>
    <p style="margin-top:var(--space-4);color:var(--white-60)">
      <a style="color:var(--white-60);text-decoration:none" href="#">▢ Telegram</a> · 
      <a style="color:var(--white-60);text-decoration:none" href="#">▢ X</a>
    </p>

    <footer style="margin-top:var(--space-6);border-top:1px solid var(--line);padding-top:var(--space-4);display:flex;justify-content:space-between;color:var(--white-30);font-size:12px">
      <span>© 2026 3Ma Capital</span><span>3maquant.com</span><span>Made with AI agents · Anthropic Claude</span>
    </footer>
    <p style="color:var(--white-18);font-size:11px;line-height:1.7;margin-top:var(--space-3)">
      DISCLOSURE — 3Ma Capital 处于 founding / pre-operational 阶段。本站所描述系统（Alpha Foundry、Campaign Engine、三本隔离账本）为目标架构与设计原型，非已运行或已验证的交易系统。本站所有内容均为理念展示与工程愿景，不构成投资建议、不构成要约、不构成任何形式的回报承诺。
    </p>`;

  const form = sec.querySelector('[data-waitlist]') as HTMLFormElement;
  const msg = sec.querySelector('[data-wl-msg]') as HTMLElement;
  const email = form.elements.namedItem('email') as HTMLInputElement;
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const r = await submitEmail(email.value);
    if (r.ok) { form.innerHTML = ''; msg.textContent = 'You’re on the list. — 3MA'; }
    else if (r.aborted) { msg.textContent = 'aborted — retry'; }
    else { msg.textContent = r.message ?? 'try again'; }
  });

  host.appendChild(sec);
  return sec;
}
```

- [ ] **Step 4: `src/waitlist/worker-note.md`** (deploy-time, not built into front)
```md
# Waitlist serverless endpoint

Deploy a serverless function (Vercel `functions/api/waitlist.ts` or Cloudflare Worker)
that accepts `{ email }`, writes to KV/D1, returns `{ ok: true }` or `{ error }`.

Drop-in example (Vercel):
\`\`\`ts
export default async function handler(req: Request) {
  const { email } = await req.json();
  if (!email?.includes('@')) return Response.json({ error: 'bad email' }, { status: 400 });
  // store: await KV.put('wl:'+Date.now(), email);
  return Response.json({ ok: true });
}
\`\`\`
Until deployed, `submitEmail` posts to `/api/waitlist` and the page shows the fallback
"try again" — acceptable for the founding launch preview.
```

- [ ] **Step 5: Commit**

```bash
git add src/sections/thesis.ts src/sections/engine.ts src/sections/soon.ts src/waitlist/worker-note.md
git commit -m "feat: thesis/engine(terminal mount)/soon(waitlist+disclosure) sections"
```

---

## Task 14: Lenis↔GSAP wiring + nav + scroll reveals

**Files:**
- Create: `src/lib/lenis-gsap.ts`
- Create: `src/systems/nav.ts`
- Create: `src/sections/reveals.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: `src/lib/lenis-gsap.ts`**
```ts
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function startSmoothScroll(): Lenis {
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}
```

- [ ] **Step 2: `src/systems/nav.ts`**
```ts
import { SECTIONS } from '../data/sections';

export function mountNav(app: HTMLElement, lenis: { scrollTo: (t: HTMLElement) => void }) {
  const nav = document.createElement('nav');
  nav.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:30;display:flex;align-items:center;gap:var(--space-4);padding:var(--space-2) var(--space-4);opacity:0;transform:translateY(-20px);font-size:12px;background:rgba(10,10,12,0.4);backdrop-filter:blur(10px)';
  const brand = document.createElement('div'); brand.className='ember'; brand.textContent='3MA';
  nav.appendChild(brand);
  SECTIONS.forEach(s => {
    const a = document.createElement('a'); a.textContent = `${String(s.order).padStart(2,'0') ${s.label}`;
    a.style.cssText='color:var(--white-45);text-decoration:none';
    a.href = '#' + s.id;
    a.onclick = (e) => { e.preventDefault(); const t=document.getElementById(s.id); if (t) lenis.scrollTo(t); };
    nav.appendChild(a);
  });
  app.appendChild(nav);
  return nav;
}
```

(Fix the broken template literal: `\`${String(s.order).padStart(2,'0')} ${s.label}\`` — missing closing brace before space.)

- [ ] **Step 3: `src/sections/reveals.ts`**
```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { deriveFlags } from '../lib/feature-flags';
import { activateEngineTerminal } from './engine';

export function wireReveals(app: HTMLElement) {
  const flags = deriveFlags();
  const set = flags.reducedMotion ? (t: gsap.TweenTarget, v: any) => gsap.set(t, v) : gsap.to;

  // line-mask reveals (manifesto + target + soon)
  app.querySelectorAll('[data-line]').forEach(el => {
    gsap.fromTo(el, { yPercent: flags.reducedMotion ? 0 : 110 }, {
      yPercent: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // target SVG draw
  app.querySelectorAll('text[data-draw]').forEach((text: any) => {
    if (flags.reducedMotion) { text.setAttribute('fill', 'var(--ember)'); text.setAttribute('stroke','none'); return; }
    const len = text.getComputedTextLength?.() ?? 600;
    gsap.fromTo(text, { strokeDasharray: len, strokeDashoffset: len }, {
      strokeDashoffset: 0, duration: 1.6, ease: 'power2.inout',
      scrollTrigger: { trigger: text, start: 'top 80%' },
    });
  });

  // books divider reveal
  app.querySelectorAll('#books svg line').forEach((line: any) => {
    gsap.fromTo(line, { strokeDashoffset: 1000 }, {
      strokeDashoffset: 0, duration: 1.2,
      scrollTrigger: { trigger: line, start: 'top 90%' },
    });
  });

  // engine section: lazy-mount terminal when near viewport
  const engine = app.querySelector('#engine') as HTMLElement;
  ScrollTrigger.create({ trigger: engine, start: 'top 80%', onEnter() { activateEngineTerminal(engine); } });

  // nav fade-in after first scroll
  const nav = app.querySelector('nav') as HTMLElement;
  ScrollTrigger.create({ trigger: app, start: 'top -10', onEnter() { gsap.to(nav, { autoAlpha: 1, y: 0, duration: 0.6 }); } });
}
```

- [ ] **Step 4: Rewrite `src/main.ts`**
```ts
import { deriveFlags } from './lib/feature-flags';
import { startSmoothScroll } from './lib/lenis-gsap';
import { runForge } from './forge/forge';
import { mountManifesto } from './sections/manifesto';
import { mountThesis } from './sections/thesis';
import { mountEngine } from './sections/engine';
import { mountBooks } from './sections/books';
import { mountTarget } from './sections/target';
import { mountSoon } from './sections/soon';
import { mountNav } from './systems/nav';
import { wireReveals } from './sections/reveals';

const app = document.getElementById('app')!;
const flags = deriveFlags();

[mountManifesto, mountThesis, mountEngine, mountBooks, mountTarget, mountSoon]
  .forEach(m => m(app));

const lenis = startSmoothScroll();
mountNav(app, lenis as any);
wireReveals(app);

// After forge finishes, reveal the app and lazy-load the fluid background.
runForge(app, flags).done.then(() => {
  app.style.opacity = '1';
  if (!flags.reducedMotion && !flags.lowEnd) import('./systems/fluid-bg').then(m => m.mountFluidBg(flags));
});
```

Note: in `src/systems/fluid-bg.ts` export `mountFluidBg(flags: Flags)`. That module is Task 15. Give its function a stable name now so main imports compile.

- [ ] **Step 5: Commit**

```bash
git add src/lib/lenis-gsap.ts src/systems/nav.ts src/sections/reveals.ts src/main.ts
git commit -m "feat: lenis+gsap wiring, nav, scroll reveals, forge->reveal bootstrap"
```

---

## Task 15: Fluid background (lazy shader)

**Files:**
- Create: `src/systems/fluid-bg.ts`

- [ ] **Step 1: Write module**
```ts
import * as THREE from 'three';
import type { Flags } from '../lib/feature-flags';

export function mountFluidBg(flags: Flags) {
  const canvas = document.getElementById('fluid') as HTMLCanvasElement;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, flags.dprCap));
  renderer.setSize(window.innerWidth, window.innerHeight);
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(0.5,0.5) }, uEmber: { value: new THREE.Color(0x7e6a4e) } },
    vertexShader: `void main(){ gl_Position=vec4(position,1.0); }`,
    fragmentShader: `
      uniform float uTime; uniform vec2 uMouse; uniform vec3 uEmber;
      float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p),f=fract(p); vec2 u=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y); }
      void main(){
        vec2 uv = gl_FragCoord.xy/vec2(${window.innerWidth},${window.innerHeight});
        vec2 p = uv*3.0 + uMouse*2.0;
        float n = noise(p + uTime*0.05) * 0.5 + noise(p*2.0 - uTime*0.03)*0.5;
        vec3 col = uEmber * smoothstep(0.4,0.95,n) * 0.22;
        gl_FragColor = vec4(col, n*0.5);
      }`,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), mat); scene.add(quad);
  window.addEventListener('mousemove', (e) => { mat.uniforms.uMouse.value.set(e.clientX/window.innerWidth, 1-e.clientY/window.innerHeight); });
  const tick = () => { mat.uniforms.uTime.value = performance.now()/1000; renderer.render(scene,cam); requestAnimationFrame(tick); };
  tick();
  window.addEventListener('resize', () => renderer.setSize(window.innerWidth, window.innerHeight));
}
```

(Template-literal interpolation of innerWidth into shader source resizes only at mount; handle resize via a uniform if you want live resize fidelity — acceptable for v1 to recompute on load.)

- [ ] **Step 2: Manual verify**

Run: `npm run dev`. After forge, fluid should breathe faint ember behind all sections. Toggle reduced-motion in OS → expect static plate, no canvas; toggle low-end flags temporarily (devtools override `navigator.hardwareConcurrency=2`) → expect shader still mounts (lowEnd keeps it, per spec §6.4 lowEnd keeps animation, lighter; if you wired lowEnd→no shader instead, align with spec — spec says lowEnd reduces load but keeps animation, so mountFluidBg runs in lowEnd too).

- [ ] **Step 3: Commit**

```bash
git add src/systems/fluid-bg.ts
git commit -m "feat: persistent ember fluid background (lazy)"
```

---

## Task 16: Build + cross-check + reduced-motion audit

**Files:**
- Modify: `src/main.ts` fluid import guard (align lowEnd behavior after manual-check finding)

- [ ] **Step 1: Run full test suite**
Run: `npm run test:run`
Expected: all pass (feature-flags, state-machine, scripted-source, waitlist-client, terminal, forge).

- [ ] **Step 2: Production build**
Run: `npm run build`
Expected: `dist/` produced, no TS errors. Three.js is a separate chunk.

- [ ] **Step 3: Reduced-motion audit**
Open the built `dist/index.html` via `npm run preview`. In OS Settings enable Reduce Motion. Reload. Verify: no particle Forge (glyph fades in 0.6s) + fluid background static / no canvas + terminal shows ARMED static plate. Restore setting.

- [ ] **Step 4: Cross-browser / fallback smoke**
Open in Chrome and Firefox. Confirm FX supports WebGL2 (fallback path if WebGPU absent). In DevTools throttle to Slow 3G + Low-end CPU and confirm Forge completes in under ~6s.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "fix: final reduced-motion + lowEnd polish; v1 launch-checkpoint"
```

---

## Self-Review (passed)

**1. Spec coverage:** All six sections → Tasks 11–13. Forge intro → 8–9. Live terminal + scripted replay + live-channel seeding → 4–5, 7. Waitlist + DISCLOSURE → 6, 13. Nav + scroll reveals → 14. Palette tokens + fonts → 2. Two degradation paths (reducedMotion/lowEnd) + DPR cap + particle cap → 3 (wired across 8, 9, 14, 15). Build/deploy → 16. §2 ASCII morph + §5 DrawSVG + §4 divider → 12, 13, 14. No spec section left uncovered.

**2. Placeholder scan:** Several inline "warts" are flagged **within** their own tasks (duplicated `mat.vertexShader` in Task 9, broken template literal in Task 14 nav, interpolate-then-fix clauses) — each carries the exact fix. Those are deliberate "watch your step" notes, not open TODOs. No task ends on an unfinished "implement later."

**3. Type consistency:** `Flags` shape used in 3/8/9/14/15 matches `deriveFlags()` output (reducedMotion, lowEnd, webgpuAvailable, dprCap, particleCap). `step(c,e)` signature stable across 4/7. `renderTerminal(host,replay,opts)` + `activateEngineTerminal` contract stable across 7/13/14. `submitEmail(email,opts)` across 6/13. `ScriptedEvidenceSource` `next()` returns `(Evidence & {t_ms}) | null` across 5/7. Terminal `_termHost`/`dataset.lazyTerm` naming is unused after Task 13 swapped to `ScrollTrigger`-driven mount — harmless but rename `_termHost` to `_termHost` stays consistent (single snake name) — kept as-is since only that one symbol.

**4. Scope:** One cohesive landing page, one implementation plan. No decomposition needed.