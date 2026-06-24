import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { deriveFlags } from '../lib/feature-flags';
import { activateEngineTerminal } from './engine';

export function wireReveals(app: HTMLElement): void {
  const flags = deriveFlags();
  const reduced = flags.reducedMotion;

  // Line-mask reveals (manifesto + target + soon)
  app.querySelectorAll('[data-line]').forEach((el) => {
    gsap.fromTo(el, { yPercent: reduced ? 0 : 110 }, {
      yPercent: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // Target SVG text draw
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

  // Books divider reveal (the two SVG lines between the three cards)
  app.querySelectorAll('#books svg line').forEach((node) => {
    const line = node as SVGLineElement;
    if (reduced) { line.setAttribute('stroke-dashoffset', '0'); return; }
    gsap.fromTo(line, { strokeDashoffset: 1000 }, {
      strokeDashoffset: 0, duration: 1.2, ease: 'power2.out',
      scrollTrigger: { trigger: line, start: 'top 90%' },
    });
  });

  // Engine section: lazy-mount the live terminal when §3 enters viewport
  const engine = app.querySelector('#engine') as HTMLElement | null;
  if (engine) {
    ScrollTrigger.create({
      trigger: engine, start: 'top 80%',
      onEnter: () => activateEngineTerminal(engine),
    });
  }

  // Nav fade-in after first scroll past the top
  const nav = app.querySelector('nav') as HTMLElement | null;
  if (nav) {
    ScrollTrigger.create({
      trigger: app, start: 'top -10',
      onEnter: () => gsap.to(nav, { autoAlpha: 1, y: 0, duration: 0.6 }),
      onLeaveBack: () => gsap.to(nav, { autoAlpha: 0, y: -20, duration: 0.4 }),
    });
  }
}