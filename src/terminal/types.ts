export type EvidenceChannel =
  | 'MICROSTRUCTURE' | 'EVENT_NEWS' | 'SOCIAL_KOL' | 'ONCHAIN_DEX' | 'CROSS_VENUE';
export type Confidence = 'LOW' | 'MED' | 'HIGH';
export type Tier = 'TIER_0' | 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4';
export type CampaignState = 'WATCH' | 'ARMED' | 'PROBE' | 'SCALE' | 'CLOSE';

export interface Evidence {
  evidence_id: string;
  source_channel: EvidenceChannel;
  asset: string;
  tier: Tier;
  confidence: Confidence;
  claim: string;
  metric_kv: Record<string, string>;
  ts: string;
  invalidates?: boolean;
}

export interface Campaign {
  campaign_id: string;
  asset: string;
  evidence_stack: Evidence[];
  playbook: string;
  risk_box: { max_notional_usd: number; max_loss_pct: number; adl_defense: boolean };
  state: CampaignState;
  state_since: number;
  invalidation: string;
  pnl_pct: number;
}

export interface EvidenceSource {
  name: string;
  next(): Promise<Evidence | null>;
  dispose(): void;
}