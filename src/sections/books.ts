import './sections.css';
import { BOOKS } from '../data/books';

export function mountBooks(host: HTMLElement): HTMLElement {
  const sec = document.createElement('section');
  sec.id = 'books';
  sec.style.position = 'relative';
  sec.innerHTML =
    '<p class="section-eyebrow">04 — THREE BOOKS</p>' +
    '<div class="grid3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3);position:relative"></div>';

  const grid = sec.querySelector('.grid3') as HTMLElement;
  BOOKS.forEach((b) => {
    const card = document.createElement('div');
    card.className = 'book';
    card.style.cssText = 'border:1px solid var(--line);padding:var(--space-4);background:rgba(10,10,12,0.5)';
    card.innerHTML =
      `<h3 class="ember" style="font-family:var(--font-display);font-weight:600;margin:0 0 var(--space-2)">${escapeText(b.name)}</h3>` +
      `<p style="color:var(--white-60);margin:0 0 var(--space-3)">${escapeText(b.scope)}</p>` +
      `<ul style="color:var(--white-85);line-height:1.9;list-style:none;padding:0;margin:0 0 var(--space-3)">` +
      b.ironLaw.map((l) => `<li>— ${escapeText(l)}</li>`).join('') +
      `</ul>` +
      `<span class="ember" style="border:1px solid var(--ember-soft);padding:1px 6px;border-radius:3px;font-size:11px">${escapeText(b.tag)}</span>`;
    grid.appendChild(card);
  });

  // SVG divider walls between the three cards, drawn (revealed) via ScrollTrigger in T14.
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0';
  [33.33, 66.66].forEach((x) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', `${x}%`);
    line.setAttribute('x2', `${x}%`);
    line.setAttribute('y1', '0');
    line.setAttribute('y2', '100%');
    line.setAttribute('stroke', 'var(--ember-soft)');
    line.setAttribute('stroke-dasharray', '1000');
    line.setAttribute('stroke-dashoffset', '1000');
    svg.appendChild(line);
  });
  sec.appendChild(svg);

  host.appendChild(sec);
  return sec;
}

function escapeText(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}