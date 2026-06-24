import { describe, it, expect, beforeEach } from 'vitest';
import { runForge } from '../src/forge/forge';

beforeEach(() => {
  // jsdom lacks rAF; the reduced path uses CSS transitions only (no rAF), but guard anyway
  (globalThis as any).requestAnimationFrame = (cb: (t: number) => void) => 0 as any;
  (globalThis as any).cancelAnimationFrame = () => {};
});

describe('forge', () => {
  it('reduced-motion path reveals glyph in ~0.6s and never imports three', async () => {
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