import './sections.css';
import { frameSection } from '../systems/blueprint';

const LINES = [
  '我们不是在猜价格。',
  '我们正在一座铸炉里，',
  'trying to build something nobody has built before ——',
  '一台把 AI 摆在正确位置上的加密永续战役机器。',
  'AI 不扣毫秒的扳机。它坐在总参谋部里，',
  '用全维度情报重构市场的世界模型，制定战役剧本。',
  '我们全部的工作，是给这位军师一座能动手的工厂。',
  '—— 3Ma Capital',
];

export function mountManifesto(host: HTMLElement): HTMLElement {
  const sec = document.createElement('section');
  sec.id = 'manifesto';
  sec.innerHTML =
    '<p class="section-eyebrow">01 — MANIFESTO</p>' +
    '<div class="manifesto-body display">' +
    LINES.map((l) => `<span class="line"><span data-line>${escapeHtml(l)}</span></span>`).join('') +
    '</div>';
  host.appendChild(sec);
  frameSection(sec, { numeral: '01', ticks: true });
  return sec;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}