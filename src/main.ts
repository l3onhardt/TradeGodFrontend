import { deriveFlags } from './lib/feature-flags';
import { startSmoothScroll } from './lib/lenis-gsap';
import { runForge } from './forge/forge';
import { mountManifesto } from './sections/manifesto';
import { mountThesis } from './sections/thesis';
import { mountEngine } from './sections/engine';
import { mountBooks } from './sections/books';
import { mountTarget } from './sections/target';
import { mountSoon } from './sections/soon';
import { mountNav, LenisLike } from './systems/nav';
import { wireReveals } from './sections/reveals';

const app = document.getElementById('app')!;
const flags = deriveFlags();

[mountManifesto, mountThesis, mountEngine, mountBooks, mountTarget, mountSoon]
  .forEach((m) => m(app));

const lenis = startSmoothScroll();
mountNav(app, lenis as unknown as LenisLike);
wireReveals(app);

// The forge owns the first ~3s. After it resolves, reveal the app and lazily mount the fluid background.
// Three.js stays lazy: fluid-bg is dynamically imported only here, only on capable devices.
void runForge(app, flags).done.then(async () => {
  app.style.opacity = '1';
  if (!flags.reducedMotion && !flags.lowEnd) {
    try {
      const { mountFluidBg } = await import('./systems/fluid-bg');
      mountFluidBg(flags);
    } catch {
      // shader unavailable — leave the CSS gradient fallback in base.css visible
    }
  }
});