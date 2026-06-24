import './sections.css';

export function mountTarget(host: HTMLElement): HTMLElement {
  const sec = document.createElement('section');
  sec.id = 'target';
  sec.innerHTML = `
    <p class="section-eyebrow">05 — TARGET</p>
    <svg viewBox="0 0 600 140" width="100%" height="140" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <text data-draw x="300" y="60" text-anchor="middle"
        style="font-family:var(--font-display);font-size:64px;fill:transparent;stroke:var(--ember);stroke-width:1">ASYMMETRIC</text>
      <text data-draw x="300" y="120" text-anchor="middle"
        style="font-family:var(--font-display);font-size:64px;fill:transparent;stroke:var(--ember);stroke-width:1">CONVEXITY</text>
    </svg>
    <p class="line"><span data-line>非对称凸性 · 右尾捕获 ——</span></p>
    <p class="line"><span data-line>在不死于 Rug 的前提下，把资本配置到那些凸性不对称的右尾战役上。</span></p>
    <p style="color:var(--white-30);font-size:13px;letter-spacing:0.1em;margin-top:var(--space-3)">
      Drawdown-capped · Convexity-first · Founding hypothesis
    </p>`;
  host.appendChild(sec);
  return sec;
}