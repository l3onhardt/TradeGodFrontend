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
  stage.appendChild(glyph);
  host.appendChild(stage);

  let disposed = false;
  const untilDone = new Promise<void>(async (resolve) => {
    if (flags.reducedMotion) {
      // reduced path: pure CSS opacity transition, no Three.js, ~0.6s
      glyph.style.transition = 'opacity .6s ease';
      glyph.style.opacity = '1';
      await delay(620);
      // Reconciliation (b): fade stage out but keep it in the DOM so the glyph
      // stays queryable until the caller disposes. dispose() performs the .remove().
      await unload(stage);
      resolve();
      return;
    }

    // Full shader path: Three.js lazily imported here (reduced path never enters this).
    if (deps.loadShader) await deps.loadShader();
    const canvas = document.createElement('canvas');
    stage.insertBefore(canvas, glyph); // glyph on top
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
      tl.set(stage, { autoAlpha: 1 })
        .to(phase, { p: 0.6, duration: 1.5, ease: 'power1.inOut', onUpdate() { surface.setPhase(phase.p); } }, 0)
        .to(phase, { p: 1.0, duration: 1.0, ease: 'power2.in', onUpdate() { surface.setPhase(phase.p); } }, 0.3)
        .to(glyph, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 2.4)  // glyph crystallizes
        .to(stage, { autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, 2.8);
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