import { describe, it, expect } from 'vitest';
import { ScriptedEvidenceSource } from '../src/terminal/scripted-source';
import jelly from '../src/terminal/replays/jelly.json';

describe('ScriptedEvidenceSource', () => {
  it('emits evidence in t_ms order when clock advances', async () => {
    let t = 0;
    const src = new ScriptedEvidenceSource(jelly as any, () => t);
    const got: string[] = [];
    t = 999999; // jump forward so all are due
    let n = await src.next();
    while (n) { got.push(n.evidence_id + '@' + n.t_ms); n = await src.next(); }
    // t_ms is backfilled onto each emitted evidence at construction
    const want = jelly.evidence.map((e: any) => e.evidence_id + '@' + e.t_ms);
    expect(got).toEqual(want);
  });
  it('returns null after last and stays null', async () => {
    let t = 999999;
    const src = new ScriptedEvidenceSource(jelly as any, () => t);
    let n = await src.next();
    while (n) n = await src.next();
    expect(await src.next()).toBeNull();
    expect(await src.next()).toBeNull();
  });
  it('withholds evidence whose t_ms is in the future', async () => {
    let t = 0;
    const src = new ScriptedEvidenceSource(jelly as any, () => t);
    expect((await src.next())?.evidence_id).toBe('0xj01'); // t=0 due
    expect(await src.next()).toBeNull();                    // t=2000 not due yet
    t = 5000;
    expect((await src.next())?.evidence_id).toBe('0xj02');
  });
  it('backfills asset from the parent campaign and a default tier', async () => {
    let t = 999999;
    const src = new ScriptedEvidenceSource(jelly as any, () => t);
    const e = await src.next();
    expect(e?.asset).toBe('JELLYJELLY-PERP');
    expect(e?.tier).toBe('TIER_3');
  });
});