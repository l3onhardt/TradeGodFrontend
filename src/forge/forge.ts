import './forge.css';
import { gsap } from 'gsap';
import type { Flags } from '../lib/feature-flags';

export interface ForgeDeps { loadShader?: () => Promise<unknown> }
export interface ForgeCtrl { done: Promise<void>; dispose(): void }

export function runForge(host: HTMLElement, flags: Flags, deps: ForgeDeps = {}): ForgeCtrl {
  const stage = document.createElement('div'); stage.className = 'forge-stage';
  const glyph = document.createElement('div'); glyph.className = 'glyph'; glyph.textContent = '3MA';
  glyph.setAttribute('data-forge', 'glyph');
  if (flags.reducedMotion) glyph.classList.add('dim');
  const tagline = document.createElement('div'); tagline.className = 'forge-tagline';
  tagline.textContent = 'ALPHA FOUNDRY';
  const wrap = document.createElement('div'); wrap.className = 'forge-mark';
  wrap.appendChild(glyph); wrap.appendChild(tagline);
  stage.appendChild(wrap);
  // stage is position:fixed — must live on body, not inside #app (which starts opacity:0)
  document.body.appendChild(stage);

  let disposed = false;
  const untilDone = new Promise<void>(async (resolve) => {
    if (flags.reducedMotion) {
      // reduced path: pure CSS opacity transition, no Three.js. Reveal, then HOLD
      // so the mark is actually readable before handing off.
      glyph.style.transition = 'opacity .6s ease';
      glyph.style.opacity = '1';
      await delay(900);
      // Reconciliation (b): fade stage out but keep it in the DOM so the glyph
      // stays queryable until the caller disposes. dispose() performs the .remove().
      await unload(stage);
      resolve();
      return;
    }

    // Full shader path: Three.js lazily imported here (reduced path never enters this).
    if (deps.loadShader) await deps.loadShader();
    const canvas = document.createElement('canvas');
    stage.insertBefore(canvas, wrap); // mark on top
    const surface = await (await import('./forge-shader')).createForgeScene(canvas, flags);

    const phase = { p: 0 };
    let didCleanup = false;
    const fullDone = new Promise<void>((r) => {
      const tl = gsap.timeline({
        onComplete() {
          if (!didCleanup) {
            didCleanup = true;
            surface.dispose();
            canvas.remove();
            r();
          }
        },
      });
      // 0.0–2.4s  particles churn then collapse into the ring
      // 2.0–2.6s  glyph crystallizes
      // 2.6–4.1s  HOLD — the mark stays readable (this was the missing beat)
      // 4.1–4.9s  glyph drifts up + fades, particles dim, stage clears for the hero
      tl.set(stage, { autoAlpha: 1 })
        .to(phase, { p: 0.6, duration: 1.6, ease: 'power1.inOut', onUpdate() { surface.setPhase(phase.p); } }, 0)
        .to(phase, { p: 1.0, duration: 1.0, ease: 'power2.in', onUpdate() { surface.setPhase(phase.p); } }, 1.4)
        .fromTo(glyph, { opacity: 0, scale: 0.92, filter: 'blur(8px)' },
          { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power2.out' }, 2.0)
        .fromTo(tagline, { opacity: 0, letterSpacing: '0.05em' },
          { opacity: 1, letterSpacing: '0.5em', duration: 0.9, ease: 'power2.out' }, 2.5)
        .to(canvas, { opacity: 0.35, duration: 1.4, ease: 'power1.out' }, 2.6)
        // hold: nothing changes 2.7 → 4.1
        .to(wrap, { y: -28, opacity: 0, scale: 1.04, duration: 0.8, ease: 'power2.inOut' }, 4.1)
        .to(stage, { autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, 4.3);
    });
    await fullDone;
    await unload(stage);
    resolve();
  });

  // Reconciliation (b): unload only fades the stage to opacity:0 (no removal).
  // The stage + glyph remain in the host so host.querySelector still finds the
  // glyph after `await ctrl.done`. dispose() does the actual .remove().
  function unload(el: HTMLElement) {
    if (!disposed) el.style.opacity = '0';
    return Promise.resolve();
  }
  return {
    done: untilDone,
    dispose() { disposed = true; stage.remove(); },
  };
}

function delay(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }