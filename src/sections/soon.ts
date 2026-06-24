import './sections.css';
import { frameSection } from '../systems/blueprint';

export function mountSoon(host: HTMLElement): HTMLElement {
  const sec = document.createElement('section');
  sec.id = 'soon';
  sec.innerHTML = `
    <p class="section-eyebrow">06 — COMING SOON</p>
    <svg class="forge-mark-svg" viewBox="0 0 120 120" aria-hidden="true">
      <circle class="fm-ring" data-fm-ring cx="60" cy="60" r="46"/>
      <circle class="fm-ring fm-ring2" data-fm-ring cx="60" cy="60" r="34"/>
      <path class="fm-spark" data-fm-spark d="M60 26 V44 M60 76 V94 M26 60 H44 M76 60 H94 M38 38 L50 50 M82 82 L70 70 M38 82 L50 70 M82 38 L70 50"/>
      <circle class="fm-core" data-fm-core cx="60" cy="60" r="9"/>
    </svg>
    <h2 class="display soon-title" style="font-size:clamp(2rem,6vw,4rem);margin:0 0 var(--space-2)">我们正在铸造。</h2>
    <p class="display ember" style="font-size:clamp(1.2rem,3vw,2rem);opacity:0.8;margin:0 0 var(--space-4)">Something is being forged.</p>
    <p style="color:var(--white-45);font-size:13px;letter-spacing:0.15em;margin:0 0 var(--space-4)">FOUNDING · 2026 Q4(预期) — IN PROGRESS</p>

    <p style="margin:0 0 var(--space-4);color:var(--white-60)">
      <a style="color:var(--white-60);text-decoration:none" href="#">▢ Telegram</a>
      &nbsp;·&nbsp;
      <a style="color:var(--white-60);text-decoration:none" href="#">▢ X</a>
    </p>

    <footer style="margin-top:var(--space-6);border-top:1px solid var(--line);padding-top:var(--space-4);display:flex;justify-content:space-between;gap:var(--space-3);color:var(--white-30);font-size:12px;flex-wrap:wrap">
      <span>© 2026 3Ma Capital</span><span>3maquant.com</span><span>Made with AI agents · Anthropic Claude</span>
    </footer>
    <p style="color:var(--white-18);font-size:11px;line-height:1.7;margin-top:var(--space-3)">
      DISCLOSURE — 3Ma Capital 处于 founding / pre-operational 阶段。本站所描述系统（Alpha Foundry、Campaign Engine、三本隔离账本）为目标架构与设计原型，非已运行或已验证的交易系统。本站所有内容均为理念展示与工程愿景，不构成投资建议、不构成要约、不构成任何形式的回报承诺。
    </p>`;

  host.appendChild(sec);
  frameSection(sec, { numeral: '06' });
  return sec;
}
