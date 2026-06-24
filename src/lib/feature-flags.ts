export interface Flags {
  reducedMotion: boolean;
  lowEnd: boolean;
  webgpuAvailable: boolean;
  dprCap: number;
  particleCap: number;
}

export function deriveFlags(w: Window = window): Flags {
  const reducedMotion = w.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const nav = w.navigator as Navigator & { gpu?: unknown };
  const webgpuAvailable = !!nav.gpu;
  // WebGPU support is near-zero in current browsers; use only CPU count as the lowEnd signal
  const lowEnd = (w.navigator.hardwareConcurrency ?? 8) < 4;
  return { reducedMotion, lowEnd, webgpuAvailable, ...dprAndParticles(lowEnd) };
}

export function dprCapFor({ lowEnd }: Pick<Flags, 'lowEnd'>): number {
  return lowEnd ? 1.0 : 1.5;
}

function dprAndParticles(lowEnd: boolean): Pick<Flags, 'dprCap' | 'particleCap'> {
  return lowEnd ? { dprCap: 1.0, particleCap: 4000 } : { dprCap: 1.5, particleCap: 8000 };
}