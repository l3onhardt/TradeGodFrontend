import './sections.css';
import { submitEmail } from '../waitlist/client';

export function mountSoon(host: HTMLElement): HTMLElement {
  const sec = document.createElement('section');
  sec.id = 'soon';
  sec.innerHTML = `
    <p class="section-eyebrow">06 — COMING SOON</p>
    <h2 class="display" style="font-size:clamp(2rem,6vw,4rem);margin:0 0 var(--space-2)">我们正在铸造。</h2>
    <p class="display ember" style="font-size:clamp(1.2rem,3vw,2rem);opacity:0.8;margin:0 0 var(--space-4)">Something is being forged.</p>
    <p style="color:var(--white-45);font-size:13px;letter-spacing:0.15em;margin:0 0 var(--space-3)">FOUNDING · Q4 25 — IN PROGRESS</p>
    <div class="progress" style="width:240px;height:2px;background:var(--white-18);overflow:hidden;margin-bottom:var(--space-4)">
      <i data-band style="display:block;width:30%;height:100%;background:linear-gradient(90deg,var(--ember),transparent)"></i>
    </div>

    <form data-waitlist style="display:flex;gap:var(--space-2);margin:0 0 var(--space-3);flex-wrap:wrap">
      <input name="email" type="email" placeholder="email@yourdomain.com"
        style="flex:1;min-width:240px;background:transparent;border:1px solid var(--line);color:var(--text);padding:var(--space-2)" required />
      <button class="ember" style="border:1px solid var(--ember);background:transparent;padding:var(--space-2) var(--space-3);cursor:pointer">JOIN</button>
    </form>
    <p data-wl-msg style="color:var(--ember);margin:0 0 var(--space-4);min-height:1.2em"></p>
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

  const form = sec.querySelector('[data-waitlist]') as HTMLFormElement;
  const msg = sec.querySelector('[data-wl-msg]') as HTMLElement;
  const emailInput = form.elements.namedItem('email') as HTMLInputElement;

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    msg.textContent = '';
    const result = await submitEmail(emailInput.value);
    if (result.ok) {
      form.innerHTML = '';
      msg.textContent = 'You’re on the list. — 3MA';
    } else if (result.aborted) {
      msg.textContent = 'aborted — retry';
    } else {
      msg.textContent = result.message ?? 'try again';
    }
  });

  host.appendChild(sec);
  return sec;
}