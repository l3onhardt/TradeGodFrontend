import { describe, it, expect } from 'vitest';
import { step } from '../src/terminal/state-machine';
import { emptyCampaign, evidence } from './helpers/campaign-factory';

describe('Campaign state machine', () => {
  it('stays WATCH with < 3 qualifying channels', () => {
    let c = emptyCampaign();
    c = step(c, evidence({ source_channel: 'EVENT_NEWS' }));
    c = step(c, evidence({ source_channel: 'ONCHAIN_DEX' }));
    expect(c.state).toBe('WATCH');
  });
  it('advances WATCH -> ARMED at 3 qualifying channels', () => {
    let c = emptyCampaign();
    c = step(c, evidence({ source_channel: 'EVENT_NEWS' }));
    c = step(c, evidence({ source_channel: 'ONCHAIN_DEX' }));
    c = step(c, evidence({ source_channel: 'CROSS_VENUE' }));
    expect(c.state).toBe('ARMED');
  });
  it('ARMED -> PROBE on next evidence', () => {
    let c = emptyCampaign();
    c = step(c, evidence({ source_channel: 'EVENT_NEWS' }));
    c = step(c, evidence({ source_channel: 'ONCHAIN_DEX' }));
    c = step(c, evidence({ source_channel: 'CROSS_VENUE' }));
    c = step(c, evidence({ source_channel: 'SOCIAL_KOL' }));
    expect(c.state).toBe('PROBE');
  });
  it('PROBE -> SCALE on MICROSTRUCTURE HIGH validation', () => {
    let c = emptyCampaign();
    c = step(c, evidence({ source_channel: 'EVENT_NEWS' }));
    c = step(c, evidence({ source_channel: 'ONCHAIN_DEX' }));
    c = step(c, evidence({ source_channel: 'CROSS_VENUE' }));
    c = step(c, evidence({ source_channel: 'SOCIAL_KOL' }));
    c = step(c, evidence({ source_channel: 'MICROSTRUCTURE', confidence: 'HIGH' }));
    expect(c.state).toBe('SCALE');
  });
  it('invalidation drives CLOSE', () => {
    let c = emptyCampaign();
    c = step(c, evidence({ source_channel: 'EVENT_NEWS' }));
    c = step(c, evidence({ source_channel: 'ONCHAIN_DEX' }));
    c = step(c, evidence({ source_channel: 'CROSS_VENUE' }));
    c = step(c, evidence({ source_channel: 'SOCIAL_KOL' }));
    c = step(c, evidence({ source_channel: 'MICROSTRUCTURE', confidence: 'HIGH' }));
    c = step(c, evidence({ source_channel: 'ONCHAIN_DEX', confidence: 'HIGH', invalidates: true }));
    expect(c.state).toBe('CLOSE');
  });
  it('CLOSE is terminal', () => {
    let c = emptyCampaign();
    c = step(c, evidence({ source_channel: 'EVENT_NEWS' }));
    c = step(c, evidence({ source_channel: 'ONCHAIN_DEX' }));
    c = step(c, evidence({ source_channel: 'CROSS_VENUE' }));
    c = step(c, evidence({ source_channel: 'ONCHAIN_DEX', invalidates: true }));
    expect(c.state).toBe('CLOSE');
    c = step(c, evidence({ source_channel: 'EVENT_NEWS' }));
    expect(c.state).toBe('CLOSE');
  });
});