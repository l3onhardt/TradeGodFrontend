import type { Campaign, Evidence, EvidenceChannel, Confidence, Tier } from '../../src/terminal/types';

export function emptyCampaign(): Campaign {
  return {
    campaign_id: '0xJELLY-25Q1',
    asset: 'JELLYJELLY-PERP',
    evidence_stack: [],
    playbook: 'REFLEXIVE_SHORT_SQUEEZE',
    risk_box: { max_notional_usd: 250000, max_loss_pct: 8, adl_defense: true },
    state: 'WATCH',
    state_since: 0,
    invalidation: 'depth restored > 60% of OI',
    pnl_pct: 0,
  };
}

let n = 0;
export function evidence(over: Partial<Evidence> & { invalidates?: boolean } = {}): Evidence {
  n++;
  return {
    evidence_id: '0xk' + n.toString(16),
    source_channel: 'EVENT_NEWS' as EvidenceChannel,
    confidence: 'MED' as Confidence,
    asset: 'JELLYJELLY-PERP',
    tier: 'TIER_3' as Tier,
    claim: 'structural mismatch',
    metric_kv: {},
    ts: 'T+0',
    invalidates: false,
    ...over,
  };
}