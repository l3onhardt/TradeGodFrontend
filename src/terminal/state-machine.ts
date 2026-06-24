import type { Campaign, CampaignState, Evidence } from './types';

const ARM_THRESHOLD = 3;

export function step(c: Campaign, e: Evidence): Campaign {
  const stack = [...c.evidence_stack, e];
  if (c.state === 'CLOSE') return { ...c, evidence_stack: stack };
  if (e.invalidates) return { ...c, evidence_stack: stack, state: 'CLOSE', state_since: stack.length };

  let state: CampaignState = c.state;
  const qualifying = distinctChannels(stack);
  if (c.state === 'WATCH')        state = qualifying >= ARM_THRESHOLD ? 'ARMED' : 'WATCH';
  else if (c.state === 'ARMED')   state = 'PROBE';
  else if (c.state === 'PROBE')   state = e.source_channel === 'MICROSTRUCTURE' && e.confidence === 'HIGH' ? 'SCALE' : 'PROBE';
  // SCALE persists until invalidation closes it.

  return { ...c, evidence_stack: stack, state, state_since: state === c.state ? c.state_since : stack.length };
}

function distinctChannels(stack: Evidence[]): number {
  const seen = new Set<string>();
  for (const e of stack) if (e.confidence !== 'LOW') seen.add(e.source_channel);
  return seen.size;
}