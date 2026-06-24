import './sections.css';
import { BOOKS } from '../data/books';
import { frameSection } from '../systems/blueprint';

export function mountBooks(host: HTMLElement): HTMLElement {
  const sec = document.createElement('section');
  sec.id = 'books';
  sec.innerHTML =
    '<p class="section-eyebrow">04 — THREE BOOKS</p>' +
    '<div class="grid3"></div>';

  const grid = sec.querySelector('.grid3') as HTMLElement;
  BOOKS.forEach((b, i) => {
    const card = document.createElement('div');
    card.className = 'book';
    card.innerHTML =
      `<span class="book-idx mono">0${i + 1}</span>` +
      `<h3 class="ember book-name">${escapeText(b.name)}</h3>` +
      `<p class="book-scope">${escapeText(b.scope)}</p>` +
      `<ul class="book-laws">` +
      b.ironLaw.map((l) => `<li data-law>— ${escapeText(l)}</li>`).join('') +
      `</ul>` +
      `<span class="book-tag ember">${escapeText(b.tag)}</span>`;
    grid.appendChild(card);
  });

  // SVG divider walls between the three cards, drawn (revealed) via ScrollTrigger.
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
  frameSection(sec, { numeral: '04' });
  return sec;
}

function escapeText(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}