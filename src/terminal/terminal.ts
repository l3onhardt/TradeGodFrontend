import './terminal.css';
import type { Campaign, Evidence } from './types';
import { step } from './state-machine';
import { ScriptedEvidenceSource } from './scripted-source';

export interface TerminalOpts { reducedMotion: boolean; now: () => number }
export interface TerminalCtrl { advance(toMs: number): Promise<void>; dispose(): void }

const CHANNELS = ['EVENT_NEWS','ONCHAIN_DEX','CROSS_VENUE','SOCIAL_KOL','MICROSTRUCTURE'] as const;
const ARM_SEED_COUNT = 4; // first 4 entries → {EVENT_NEWS, ONCHAIN_DEX, CROSS_VENUE} = 3 distinct non-LOW → ARMED
const DEFAULT_TIER: Evidence['tier'] = 'TIER_3';

function replayCampaign(replay: any): Campaign {
  return {
    campaign_id: replay.campaign.campaign_id,
    asset: replay.campaign.asset,
    evidence_stack: [],
    playbook: replay.campaign.playbook,
    risk_box: replay.campaign.risk_box,
    state: 'WATCH', state_since: 0,
    invalidation: replay.campaign.invalidation,
    pnl_pct: 0,
  };
}

/** Build a complete Evidence (with asset/tier backfilled) from a raw replay entry, for synchronous seeding. */
function seedEvidence(replay: any, raw: any): Evidence {
  const { t_ms, ...partial } = raw;
  return { asset: replay.campaign.asset, tier: DEFAULT_TIER, ...partial } as Evidence;
}

export function renderTerminal(host: HTMLElement, replay: any, opts: TerminalOpts): TerminalCtrl {
  // mutable clock so advance() can bump the window
  let clock = opts.now;
  let campaign: Campaign = replayCampaign(replay);
  const source = new ScriptedEvidenceSource(replay, () => clock());

  host.innerHTML = '';
  const root = document.createElement('div'); root.className = 'term';
  const head = el('div', 'row', `<span class="pill">3MA · CAMPAIGN ENGINE</span>` +
    `<span style="float:right" class="dim">replay mode</span>`);
  const idRow = el('div', 'row'); idRow.setAttribute('data-term', 'campaign');
  const sensorsRow = el('div', 'row');
  const evidenceRow = el('div', 'row');
  const stateRow = el('div', 'row'); stateRow.setAttribute('data-term', 'state');
  const pnlRow = el('div', 'row');
  const seedRow = el('div', 'row',
    `<span class="seed">▢ LIVE CHANNEL SEEDING…</span>` +
    `<span style="float:right" class="dim">playbook 0x3MA · 12 archetypes</span>`);
  root.append(head, idRow, sensorsRow, evidenceRow, stateRow, pnlRow, seedRow);
  host.appendChild(root);

  function peak(channel: string): 'HIGH' | 'MED' | 'LOW' | null {
    let peak: 'HIGH' | 'MED' | 'LOW' | null = null;
    for (const e of campaign.evidence_stack) {
      if (e.source_channel !== channel) continue;
      if (e.confidence === 'HIGH') peak = 'HIGH';
      else if (e.confidence === 'MED' && peak !== 'HIGH') peak = 'MED';
      else if (e.confidence === 'LOW' && !peak) peak = 'LOW';
    }
    return peak;
  }

  function highlight(claim: string): string {
    return claim.replace(/\b(\d+(?:\.\d+)?[Mx%]?)\b/g, '<span class="pill">$1</span>');
  }

  function paint() {
    idRow.innerHTML = `<div class="lbl">CAMPAIGN</div>` +
      `${campaign.campaign_id} · ${campaign.asset} <span class="pill">${campaign.playbook}</span>`;
    sensorsRow.innerHTML = `<div class="lbl">SENSORS · evidence ingest</div>` +
      CHANNELS.map(ch => {
        const p = peak(ch);
        if (p === 'HIGH') return `<span class="pill">● ${ch} HIGH</span>`;
        if (p === 'MED')  return `<span class="med">● ${ch} MED</span>`;
        if (p === 'LOW')  return `<span class="dim">● ${ch} LOW</span>`;
        return `<span class="dim">● ${ch} —</span>`;
      }).join(' ');
    const lastFive = campaign.evidence_stack.slice(-5);
    evidenceRow.innerHTML = `<div class="lbl">EVIDENCE STACK</div>` +
      (lastFive.length ? lastFive.map(e => `<div>▴ ${highlight(e.claim)}</div>`).join('') : `<div class="dim">—</div>`);
    const states = ['WATCH','ARMED','PROBE','SCALE','CLOSE'];
    stateRow.innerHTML = `<div class="lbl">CAMPAIGN STATE · lifecycle</div>` +
      states.map((s, i) => {
        const cls = s === campaign.state ? 'state-cur' : 'state-dim';
        const sep = i < states.length - 1 ? ` <span class="arrow">—▸</span> ` : '';
        return `<span class="${cls}">${s}</span>${sep}`;
      }).join('');
    pnlRow.innerHTML = campaign.state === 'CLOSE'
      ? `<div class="lbl">realized PnL (replay)</div><span class="pill" data-term="pnl">+${campaign.pnl_pct}% — capped at ${campaign.risk_box.max_loss_pct}% drawdown</span>`
      : '';
  }

  async function pump() {
    let e: Evidence | null;
    while ((e = await source.next())) {
      campaign = step(campaign, e);
      if ((e as any).invalidates) campaign = { ...campaign, pnl_pct: replay.campaign.pnl_pct_at_close };
    }
    paint();
  }

  async function advance(toMs: number): Promise<void> {
    if (opts.reducedMotion) return; // frozen plate
    clock = () => toMs;
    await pump();
  }

  // mount: seed state synchronously, then paint
  if (opts.reducedMotion) {
    // Seed the ARMED static plate SYNCHRONOUSLY from replay.evidence (no async source).
    // First 4 entries: EVENT_NEWS HIGH, EVENT_NEWS HIGH (distinct-channels ignores the dup),
    // ONCHAIN_DEX MED, CROSS_VENUE MED → 3 distinct non-LOW channels → ARMED.
    const seedEntries = (replay.evidence as any[]).slice(0, ARM_SEED_COUNT);
    for (const raw of seedEntries) {
      campaign = step(campaign, seedEvidence(replay, raw));
    }
    paint();
  } else {
    paint(); // WATCH initial plate
  }

  // defensive IntersectionObserver (real in browser, stubbed/absent in tests)
  let obs: IntersectionObserver | null = null;
  try {
    const IO = (globalThis as any).IntersectionObserver;
    if (IO) {
      const o = new IO(() => {});
      o.observe(host);
      obs = o;
    }
  } catch { /* no-op */ }

  return {
    advance,
    dispose() {
      try { obs?.disconnect(); } catch { /* no-op */ }
      source.dispose();
      host.innerHTML = '';
    },
  };
}

function el(tag: string, cls: string, html?: string): HTMLElement {
  const e = document.createElement(tag); e.className = cls; if (html) e.innerHTML = html; return e;
}