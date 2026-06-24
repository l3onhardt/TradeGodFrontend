import { describe, it, expect } from 'vitest';
import { deriveFlags, dprCapFor } from '../src/lib/feature-flags';

const win = (over: any = {}) =>
  ({ matchMedia: () => ({ matches: false } as MediaQueryList), navigator: { hardwareConcurrency: 8, gpu: {} }, ...over } as unknown as Window);

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
    const f = deriveFlags(win({ navigator: { hardwareConcurrency: 8, gpu: undefined } }));
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
  it('lowEnd false when hardwareConcurrency undefined (defaults to 8) + webgpu present', () => {
    const f = deriveFlags(win({ navigator: { hardwareConcurrency: undefined as unknown as number, gpu: {} } }));
    expect(f.lowEnd).toBe(false);
    expect(f.particleCap).toBe(8000);
  });
});