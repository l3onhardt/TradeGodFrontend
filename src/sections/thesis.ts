import './sections.css';

export function mountThesis(host: HTMLElement): HTMLElement {
  const sec = document.createElement('section');
  sec.id = 'thesis';
  sec.innerHTML = `
    <p class="section-eyebrow">02 — THESIS</p>
    <svg viewBox="0 0 700 220" width="100%" height="220" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g data-ascii style="font-family:var(--font-mono);font-size:13px;fill:var(--white-45)">
        <text x="10" y="40">旧路线  PerpRadar Agent</text>
        <text x="10" y="70">信号库 ─▶ Agent 审阅 ─▶ 下单</text>
        <text x="10" y="100">上限低 · 缺博弈敏感度</text>
      </g>
      <g data-ascii style="font-family:var(--font-mono);font-size:13px;fill:var(--ember)">
        <text x="360" y="40">新路线  Alpha Foundry</text>
        <text x="360" y="70">全市场传感器 ─▶ 证据黑板 ─▶ 战役引擎</text>
        <text x="360" y="100">高凸性右尾 · 反身性 · 错配</text>
      </g>
    </svg>`;
  host.appendChild(sec);
  return sec;
}