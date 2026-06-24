import './sections.css';
import jelly from '../terminal/replays/jelly.json';
import { renderTerminal } from '../terminal/terminal';
import { deriveFlags } from '../lib/feature-flags';
import { frameSection } from '../systems/blueprint';

const PILLARS: Array<[string, string]> = [
  ['黑板 + Attention Router', '结构化证据黑板，注意力动态分配推理与抓取预算'],
  ['时间尺度分工', '0-20s 纯代码层 / 20s-24h AI 解释层 / 天-周 进化层'],
  ['战役对象 Trade Campaign', 'Evidence Stack · Playbook · Risk Box · Invalidation 链'],
  ['传感器网络 · 渐进缩放', 'Tier 0-4，按 Attention 分数渐进解锁抓取深度'],
  ['Token Dossier + Playbook DSL', '盘后预生成档案，临场秒级匹配 12 类剧本'],
];

export function mountEngine(host: HTMLElement): HTMLElement {
  const sec = document.createElement('section');
  sec.id = 'engine';
  sec.innerHTML = `
    <p class="section-eyebrow">03 — ENGINE</p>
    <svg class="engine-schematic" viewBox="0 0 640 96" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g class="es-node" data-es><rect x="8" y="34" width="120" height="28" rx="2"/><text x="68" y="52">SENSORS</text></g>
      <g class="es-node" data-es><rect x="200" y="20" width="140" height="56" rx="2" class="es-core"/><text x="270" y="44">BLACKBOARD</text><text x="270" y="60" class="es-sub">attention router</text></g>
      <g class="es-node" data-es><rect x="412" y="34" width="120" height="28" rx="2"/><text x="472" y="52">CAMPAIGN</text></g>
      <g class="es-node" data-es><rect x="556" y="34" width="76" height="28" rx="2"/><text x="594" y="52">RISK</text></g>
      <path class="es-link" data-es-link d="M128 48 H200"/>
      <path class="es-link" data-es-link d="M340 48 H412"/>
      <path class="es-link" data-es-link d="M532 48 H556"/>
    </svg>
    <div class="engine-cols">
      <div class="pillars"></div>
      <div class="term-host"></div>
    </div>`;

  const list = sec.querySelector('.pillars') as HTMLElement;
  PILLARS.forEach(([title, desc], i) => {
    const row = document.createElement('div');
    row.className = 'pillar-row';
    row.innerHTML =
      `<span class="pillar-idx mono">P${i + 1}</span>` +
      `<div><dt class="ember">${escapeText(title)}</dt>` +
      `<dd>${escapeText(desc)}</dd></div>`;
    list.appendChild(row);
  });

  host.appendChild(sec);
  frameSection(sec, { numeral: '03' });
  return sec;
}

/** Mount the live Campaign terminal into the §3 engine section. Called by reveals when §3 enters viewport. */
export function activateEngineTerminal(sec: HTMLElement): void {
  if (sec.dataset.termMounted === '1') return;
  sec.dataset.termMounted = '1';
  const termHost = sec.querySelector('.term-host') as HTMLElement;
  if (!termHost) return;
  const flags = deriveFlags();
  renderTerminal(termHost, jelly, { reducedMotion: flags.reducedMotion, now: () => performance.now() });
}

function escapeText(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}