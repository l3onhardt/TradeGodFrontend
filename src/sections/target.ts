import './sections.css';
import { frameSection } from '../systems/blueprint';

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

    <div class="target-body">
      <div class="target-copy">
        <p class="line"><span data-line>非对称凸性 · 右尾捕获 ——</span></p>
        <p class="line"><span data-line>在不死于 Rug 的前提下，把资本配置到那些凸性不对称的右尾战役上。</span></p>
        <p class="target-tags mono">Drawdown-capped · Convexity-first · Founding hypothesis</p>
      </div>

      <svg class="convex-plot" viewBox="0 0 280 200" preserveAspectRatio="xMidYMid meet" role="img"
        aria-label="凸性收益曲线:下行受限、上行加速">
        <line class="cp-axis" x1="20" y1="170" x2="270" y2="170"/>
        <line class="cp-axis" x1="20" y1="20" x2="20" y2="170"/>
        <line class="cp-zero" x1="20" y1="120" x2="270" y2="120" data-cp-zero/>
        <path class="cp-floor" data-cp-floor d="M20 150 H150"/>
        <path class="cp-curve" data-cp-curve d="M20 150 Q150 150 270 30"/>
        <circle class="cp-dot" data-cp-dot cx="270" cy="30" r="3.5"/>
        <text class="cp-label" x="150" y="190">capital at risk →</text>
        <text class="cp-label cp-floor-label" x="78" y="164">floor (capped)</text>
        <text class="cp-label ember cp-tail-label" x="248" y="24" text-anchor="end">right tail</text>
      </svg>
    </div>`;
  host.appendChild(sec);
  frameSection(sec, { numeral: '05' });
  return sec;
}