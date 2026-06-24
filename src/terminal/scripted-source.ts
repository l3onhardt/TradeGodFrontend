import type { Evidence, EvidenceSource, Tier } from './types';

/** Fields a replay entry actually carries. asset is supplied by the parent campaign; tier defaults to TIER_3 (small-cap reflexive). */
type ReplayEvidence = Pick<Evidence,
  | 'evidence_id' | 'source_channel' | 'confidence' | 'claim' | 'metric_kv' | 'ts' | 'invalidates'>;

interface ReplayEntry extends ReplayEvidence { t_ms: number; }
interface Replay {
  campaign: { asset: string } & Record<string, unknown>;
  evidence: ReplayEntry[];
}

const DEFAULT_TIER: Tier = 'TIER_3';

/** A replay entry with asset/tier backfilled so it is a complete Evidence, retaining its t_ms pacing offset. */
export type ScriptedEvidence = Evidence & { t_ms: number };

export class ScriptedEvidenceSource implements EvidenceSource {
  name = 'scripted';
  private i = 0;
  private readonly entries: ScriptedEvidence[];

  constructor(replay: Replay, private now: () => number = () => performance.now()) {
    const asset = replay.campaign.asset;
    this.entries = [...replay.evidence]
      .sort((a, b) => a.t_ms - b.t_ms)
      .map(({ t_ms, ...partial }) => ({ asset, tier: DEFAULT_TIER, ...partial, t_ms }));
  }

  async next(): Promise<ScriptedEvidence | null> {
    if (this.i >= this.entries.length) return Promise.resolve(null);
    const entry = this.entries[this.i];
    if (this.now() < entry.t_ms) return Promise.resolve(null);
    this.i++;
    return Promise.resolve(entry);
  }

  /** Wall-clock offset (ms) of the next pending entry, or null when exhausted. */
  nextAt(): number | null {
    return this.i < this.entries.length ? this.entries[this.i].t_ms : null;
  }

  dispose() { /* nothing to clean */ }
}