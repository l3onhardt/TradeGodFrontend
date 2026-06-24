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
void runForge(app, flags).done.then(() => {
  app.style.opacity = '1';
  if (!flags.reducedMotion && !flags.lowEnd) {
    // Task 15 supplies this module; tolerate its absence until T15 lands.
    // Non-literal specifier keeps Rollup from statically resolving (and failing on)
    // a module that doesn't exist yet. `catch` swallows the runtime import error.
    const fluidPath = './systems/fluid-bg';
    // @ts-expect-error — ./systems/fluid-bg does not exist until Task 15 lands
    import(/* @vite-ignore */ fluidPath).then((m: { mountFluidBg: (f: typeof flags) => void }) => m.mountFluidBg(flags)).catch(() => {});
  }
});