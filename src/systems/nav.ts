import { SECTIONS } from '../data/sections';

export interface LenisLike {
  scrollTo(target: number | string | HTMLElement, opts?: Record<string, unknown>): void;
}

export function mountNav(app: HTMLElement, lenis: LenisLike): HTMLElement {
  const nav = document.createElement('nav');
  nav.style.cssText =
    'position:fixed;top:0;left:0;right:0;z-index:30;display:flex;align-items:center;gap:var(--space-4);' +
    'padding:var(--space-2) var(--space-4);opacity:0;transform:translateY(-20px);' +
    'font-size:12px;background:rgba(10,10,12,0.4);backdrop-filter:blur(10px)';
  const brand = document.createElement('div');
  brand.className = 'ember';
  brand.style.fontWeight = '700';
  brand.textContent = '3MA';
  nav.appendChild(brand);
  SECTIONS.forEach((s) => {
    const a = document.createElement('a');
    a.textContent = `${String(s.order).padStart(2, '0')} ${s.label}`;
    a.style.cssText = 'color:var(--white-45);text-decoration:none';
    a.href = '#' + s.id;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(s.id);
      if (target) lenis.scrollTo(target);
    });
    nav.appendChild(a);
  });
  const join = document.createElement('a');
  join.textContent = 'Contact';
  join.className = 'ember';
  join.href = '#soon';
  join.style.cssText = 'margin-left:auto;border:1px solid var(--ember);padding:2px 10px;border-radius:3px;text-decoration:none';
  join.addEventListener('click', (e) => {
    e.preventDefault();
    const t = document.getElementById('soon');
    if (t) lenis.scrollTo(t);
  });
  nav.appendChild(join);
  app.appendChild(nav);
  return nav;
}