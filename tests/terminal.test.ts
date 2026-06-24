import { describe, it, expect, beforeEach } from 'vitest';
import { renderTerminal } from '../src/terminal/terminal';
import jelly from '../src/terminal/replays/jelly.json';

// jsdom lacks these; provide minimal stubs before each test
beforeEach(() => {
  (globalThis as any).IntersectionObserver = class {
    observe() {} unobserve() {} disconnect() {}
    constructor(private cb: (e: any[]) => void) {}
  };
  (globalThis as any).requestAnimationFrame = (cb: (t: number) => void) => 0 as any;
  (globalThis as any).cancelAnimationFrame = () => {};
});

describe('terminal render', () => {
  it('mounts into a container without throwing', () => {
    const host = document.createElement('div');
    const ctrl = renderTerminal(host, jelly as any, { reducedMotion: true, now: () => 0 });
    expect(host.querySelector('[data-term=campaign]')).toBeTruthy();
    // reduced-motion seeds the ARMED static plate; assert the BOLDED current state, not a substring
    expect(host.querySelector('[data-term=state] .state-cur')?.textContent).toContain('ARMED');
    ctrl.dispose();
  });
  it('reduced-motion freezes at ARMED static plate', () => {
    const host = document.createElement('div');
    const ctrl = renderTerminal(host, jelly as any, { reducedMotion: true, now: () => 999999 });
    expect(host.querySelector('[data-term=state]')?.textContent).toContain('ARMED');
    ctrl.dispose();
  });
  it('advance() steps the campaign forward across the full replay to CLOSE', async () => {
    const host = document.createElement('div');
    let t = 0;
    const ctrl = renderTerminal(host, jelly as any, { reducedMotion: false, now: () => t });
    await ctrl.advance(20000); // past all evidence + invalidation
    expect(host.querySelector('[data-term=state] .state-cur')?.textContent).toContain('CLOSE');
    // invalidation applied the replay's pnl_pct_at_close
    expect(host.querySelector('[data-term=pnl]')?.textContent).toContain('31.2');
    ctrl.dispose();
  });
});