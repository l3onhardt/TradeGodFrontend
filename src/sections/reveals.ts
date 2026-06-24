import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { deriveFlags } from '../lib/feature-flags';
import { activateEngineTerminal } from './engine';

export function wireReveals(app: HTMLElement): void {
  const flags = deriveFlags();
  const reduced = flags.reducedMotion;

  heroIntro(app, reduced);
  blueprintFrames(app, reduced);
  lineReveals(app, reduced);
  targetSvg(app, reduced);
  convexPlot(app, reduced);
  engineSchematic(app, reduced);
  booksDividers(app, reduced);
  thesisDiagram(app, reduced);
  spine(app, reduced);
  engineTerminal(app);
  navFade(app);
}

/** §00 hero: title lines + sub/meta/cue play AFTER the forge hands off
 *  (gated on the `forge:revealed` event so they aren't wasted under #app opacity:0). */
function heroIntro(app: HTMLElement, reduced: boolean): void {
  const hero = app.querySelector('#hero');
  if (!hero) return;
  const lines = hero.querySelectorAll('[data-line]');
  const rest = hero.querySelectorAll('[data-hero="sub"],[data-hero="meta"],[data-hero="cue"]');

  if (reduced) {
    const show = () => { gsap.set(lines, { yPercent: 0 }); gsap.set(rest, { autoAlpha: 1 }); };
    document.addEventListener('forge:revealed', show, { once: true });
    return;
  }

  gsap.set(lines, { yPercent: 110 });
  const play = () => {
    gsap.to(lines, { yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12 });
    gsap.to(rest, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power2.out', stagger: 0.15, delay: 0.4 });
  };
  document.addEventListener('forge:revealed', play, { once: true });
}

/** Draw each section's blueprint frame: edges scale in, corners + ghost numeral fade. */
function blueprintFrames(app: HTMLElement, reduced: boolean): void {
  app.querySelectorAll('.bp-frame').forEach((frame) => {
    const sec = frame.closest('section');
    if (!sec) return;
    const edges = frame.querySelectorAll('.bp-edge');
    const corners = frame.querySelectorAll('.bp-corner');
    const ticks = frame.querySelector('.bp-ticks');
    const ghost = sec.querySelector('.bp-ghost');

    if (reduced) {
      edges.forEach((e) => gsap.set(e, { scaleX: 1, scaleY: 1 }));
      gsap.set([...corners, ticks, ghost].filter(Boolean), { autoAlpha: 1 });
      return;
    }

    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 78%' } });
    tl.to(frame.querySelectorAll('.bp-edge.top, .bp-edge.bottom'),
        { scaleX: 1, duration: 0.7, ease: 'power2.out', stagger: 0.05 }, 0)
      .to(frame.querySelectorAll('.bp-edge.left, .bp-edge.right'),
        { scaleY: 1, duration: 0.7, ease: 'power2.out', stagger: 0.05 }, 0.1)
      .to(corners, { autoAlpha: 1, duration: 0.4, stagger: 0.06 }, 0.5)
      .to([ticks].filter(Boolean), { autoAlpha: 1, duration: 0.4 }, 0.5);
    if (ghost) {
      gsap.to(ghost, { autoAlpha: 1, duration: 1.0, ease: 'power1.out',
        scrollTrigger: { trigger: sec, start: 'top 70%' } });
    }
  });
}

/** Line-mask reveals (manifesto + target + soon). Hero lines are handled in heroIntro. */
function lineReveals(app: HTMLElement, reduced: boolean): void {
  app.querySelectorAll('[data-line]').forEach((el) => {
    if (el.closest('#hero')) return;
    gsap.fromTo(el, { yPercent: reduced ? 0 : 110 }, {
      yPercent: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });
}

/** §05 target: outline text draw. */
function targetSvg(app: HTMLElement, reduced: boolean): void {
  app.querySelectorAll('text[data-draw]').forEach((node) => {
    const text = node as SVGTextElement;
    if (reduced) {
      text.setAttribute('fill', 'var(--ember)');
      text.setAttribute('stroke', 'none');
      return;
    }
    const len = text.getComputedTextLength?.() ?? 600;
    gsap.fromTo(text, { strokeDasharray: len, strokeDashoffset: len }, {
      strokeDashoffset: 0, duration: 1.6, ease: 'power2.inout',
      scrollTrigger: { trigger: text, start: 'top 80%' },
    });
  });
}

/** §05 target: convexity payoff curve draws, dot pops at the right tail. */
function convexPlot(app: HTMLElement, reduced: boolean): void {
  const plot = app.querySelector('.convex-plot');
  if (!plot) return;
  const floor = plot.querySelector('[data-cp-floor]');
  const curve = plot.querySelector('[data-cp-curve]');
  const dot = plot.querySelector('[data-cp-dot]');
  if (reduced) {
    gsap.set([floor, curve], { strokeDashoffset: 0 });
    gsap.set(dot, { autoAlpha: 1 });
    return;
  }
  const tl = gsap.timeline({ scrollTrigger: { trigger: plot, start: 'top 80%' } });
  tl.to(floor, { strokeDashoffset: 0, duration: 0.6, ease: 'power1.inOut' })
    .to(curve, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.in' }, '>-0.1')
    .to(dot, { autoAlpha: 1, duration: 0.2 }, '>-0.15')
    .fromTo(dot, { scale: 0.4, transformOrigin: 'center' },
      { scale: 1.5, duration: 0.3, ease: 'back.out(3)', yoyo: true, repeat: 1 }, '<');
}

/** §03 engine: schematic nodes fade left→right, links draw between them. */
function engineSchematic(app: HTMLElement, reduced: boolean): void {
  const svg = app.querySelector('.engine-schematic');
  if (!svg) return;
  const nodes = svg.querySelectorAll('[data-es]');
  const links = svg.querySelectorAll('[data-es-link]');
  if (reduced) {
    gsap.set(nodes, { autoAlpha: 1 });
    links.forEach((l) => gsap.set(l, { strokeDashoffset: 0 }));
    return;
  }
  const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 82%' } });
  tl.to(nodes, { autoAlpha: 1, duration: 0.4, stagger: 0.18, ease: 'power2.out' })
    .to(links, { strokeDashoffset: 0, duration: 0.5, stagger: 0.15, ease: 'power1.inOut' }, 0.3);
}

/** §04 books: divider walls draw, then iron-laws slide in per card. */
function booksDividers(app: HTMLElement, reduced: boolean): void {
  app.querySelectorAll('#books svg line').forEach((node) => {
    const line = node as SVGLineElement;
    if (reduced) { line.setAttribute('stroke-dashoffset', '0'); return; }
    gsap.fromTo(line, { strokeDashoffset: 1000 }, {
      strokeDashoffset: 0, duration: 1.2, ease: 'power2.out',
      scrollTrigger: { trigger: line, start: 'top 90%' },
    });
  });
  app.querySelectorAll('#books .book').forEach((card) => {
    const laws = card.querySelectorAll('[data-law]');
    if (reduced) { gsap.set(laws, { autoAlpha: 1, x: 0 }); return; }
    gsap.to(laws, {
      autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 80%' },
    });
  });
}

/** §02 thesis: VS pops, connectors grow, old route gets struck through. */
function thesisDiagram(app: HTMLElement, reduced: boolean): void {
  const grid = app.querySelector('.thesis-grid');
  if (!grid) return;
  const vs = grid.querySelector('[data-vs]');
  const strike = grid.querySelector('[data-strike]') as SVGLineElement | null;
  const routes = grid.querySelectorAll('[data-route]');
  if (reduced) {
    gsap.set(vs, { autoAlpha: 1, scale: 1 });
    routes.forEach((r) => r.classList.add('revealed'));
    if (strike) strike.style.strokeDashoffset = '0';
    return;
  }
  ScrollTrigger.create({
    trigger: grid, start: 'top 75%',
    onEnter: () => routes.forEach((r) => r.classList.add('revealed')),
  });
  const tl = gsap.timeline({ scrollTrigger: { trigger: grid, start: 'top 75%' } });
  tl.to(vs, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' })
    .to(strike, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, 0.3);
}

/** Global scroll spine: reveal it, fill proportional to scroll, track with a knob. */
function spine(app: HTMLElement, reduced: boolean): void {
  const spineEl = app.querySelector('.bp-spine') as HTMLElement | null;
  if (!spineEl) return;
  const fill = spineEl.querySelector('i') as HTMLElement;
  const knob = spineEl.querySelector('.knob') as HTMLElement;
  if (reduced) { gsap.set(spineEl, { autoAlpha: 1 }); gsap.set(fill, { scaleY: 1 }); return; }
  ScrollTrigger.create({
    trigger: app, start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: (self) => {
      gsap.set(fill, { scaleY: self.progress });
      gsap.set(knob, { top: `${self.progress * 100}%` });
    },
  });
  gsap.to(spineEl, { autoAlpha: 1, duration: 0.6, scrollTrigger: { trigger: app, start: 'top -10' } });
}

/** §03 engine: lazy-mount the live terminal when it enters the viewport. */
function engineTerminal(app: HTMLElement): void {
  const engine = app.querySelector('#engine') as HTMLElement | null;
  if (!engine) return;
  ScrollTrigger.create({
    trigger: engine, start: 'top 80%',
    onEnter: () => activateEngineTerminal(engine),
  });
}

/** Nav fade-in after first scroll past the top. */
function navFade(app: HTMLElement): void {
  const nav = app.querySelector('nav') as HTMLElement | null;
  if (!nav) return;
  ScrollTrigger.create({
    trigger: app, start: 'top -10',
    onEnter: () => gsap.to(nav, { autoAlpha: 1, y: 0, duration: 0.6 }),
    onLeaveBack: () => gsap.to(nav, { autoAlpha: 0, y: -20, duration: 0.4 }),
  });
}
