import './sections.css';
import { frameSection } from '../systems/blueprint';

/**
 * §00 Hero — the landing beat after the forge clears. Full-viewport: brand
 * lockup, thesis line, status row, and a scroll cue. The forge glyph drifts up
 * and this fades in beneath it, so the eye lands here instead of on a text wall.
 */
export function mountHero(host: HTMLElement): HTMLElement {
  const sec = document.createElement('section');
  sec.id = 'hero';
  sec.className = 'hero';
  sec.innerHTML = `
    <p class="section-eyebrow" data-hero="eyebrow">3MA CAPITAL · ALPHA FOUNDRY</p>
    <h1 class="hero-title display">
      <span class="line"><span data-line>把 AI 摆在</span></span>
      <span class="line"><span data-line><em class="ember">正确的位置</em>上。</span></span>
    </h1>
    <p class="hero-sub" data-hero="sub">
      不是不扣毫秒扳机的信号机。是坐在总参谋部里、重构市场世界模型、制定战役剧本的军师 ——
      <br/>我们在为它锻造一座能动手的工厂。
    </p>
    <div class="hero-meta mono" data-hero="meta">
      <span><i class="dot"></i> FOUNDING · PRE-OPERATIONAL</span>
      <span>CRYPTO PERP · CAMPAIGN ENGINE</span>
      <span>2026 Q4(预期) — IN PROGRESS</span>
    </div>
    <a class="hero-cue" href="#manifesto" data-hero="cue" aria-label="向下滚动">
      <span class="mono">SCROLL</span>
      <svg width="14" height="34" viewBox="0 0 14 34" aria-hidden="true">
        <line x1="7" y1="0" x2="7" y2="26" stroke="var(--ember)" stroke-width="1"/>
        <path d="M2 21 L7 28 L12 21" fill="none" stroke="var(--ember)" stroke-width="1"/>
      </svg>
    </a>`;
  host.appendChild(sec);
  frameSection(sec, { numeral: '00', ticks: true });
  return sec;
}
