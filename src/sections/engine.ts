import './sections.css';
import jelly from '../terminal/replays/jelly.json';
import { renderTerminal } from '../terminal/terminal';
import { deriveFlags } from '../lib/feature-flags';

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
    <div style="display:flex;gap:var(--space-4);flex-wrap:wrap">
      <div class="pillars" style="flex:1;min-width:280px"></div>
      <div class="term-host" style="flex:1;min-width:320px"></div>
    </div>`;

  const list = sec.querySelector('.pillars') as HTMLElement;
  PILLARS.forEach(([title, desc]) => {
    const row = document.createElement('div');
    row.style.cssText = 'border-top:1px solid var(--line);padding:var(--space-2) 0';
    row.innerHTML =
      `<dt class="ember" style="font-size:14px;font-weight:600;font-family:var(--font-display)">${escapeText(title)}</dt>` +
      `<dd style="color:var(--white-60);margin:4px 0 0 0;font-size:14px">${escapeText(desc)}</dd>`;
    list.appendChild(row);
  });

  host.appendChild(sec);
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