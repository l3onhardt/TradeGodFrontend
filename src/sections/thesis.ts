import './sections.css';
import { frameSection } from '../systems/blueprint';

export function mountThesis(host: HTMLElement): HTMLElement {
  const sec = document.createElement('section');
  sec.id = 'thesis';
  sec.innerHTML = `
    <p class="section-eyebrow">02 — THESIS</p>
    <div class="thesis-grid">
      <div class="route route-old" data-route="old">
        <span class="route-tag mono">旧路线 · PerpRadar Agent</span>
        <ol class="route-flow mono">
          <li data-node>信号库</li>
          <li data-node>Agent 审阅</li>
          <li data-node>下单</li>
        </ol>
        <p class="route-note mono">上限低 · 缺博弈敏感度</p>
        <svg class="route-strike" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line data-strike x1="2" y1="6" x2="98" y2="94" stroke="var(--white-30)" stroke-width="0.6"/>
        </svg>
      </div>

      <div class="thesis-vs mono" aria-hidden="true"><span data-vs>VS</span></div>

      <div class="route route-new" data-route="new">
        <span class="route-tag mono ember">新路线 · Alpha Foundry</span>
        <ol class="route-flow mono">
          <li data-node class="ember">全市场传感器</li>
          <li data-node class="ember">证据黑板</li>
          <li data-node class="ember">战役引擎</li>
        </ol>
        <p class="route-note mono ember">高凸性右尾 · 反身性 · 错配</p>
      </div>
    </div>`;
  host.appendChild(sec);
  frameSection(sec, { numeral: '02' });
  return sec;
}