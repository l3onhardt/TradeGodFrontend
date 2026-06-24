import { describe, it, expect, vi } from 'vitest';
import { submitEmail } from '../src/waitlist/client';

describe('waitlist client', () => {
  it('posts JSON {email} to endpoint', async () => {
    let lastBody = '';
    const f = vi.fn(async (_url: string, opt: any) => {
      lastBody = opt.body;
      return { ok: true, status: 200, json: async () => ({ ok: true }) };
    });
    const r = await submitEmail('a@b.com', { fetch: f as any, endpoint: '/api/waitlist' });
    expect(f).toHaveBeenCalledWith('/api/waitlist', expect.objectContaining({
      method: 'POST', headers: { 'content-type': 'application/json' },
    }));
    expect(lastBody).toBe(JSON.stringify({ email: 'a@b.com' }));
    expect(r.ok).toBe(true);
  });
  it('returns ok:false on 4xx', async () => {
    const f = vi.fn(async () => ({ ok: false, status: 400, json: async () => ({ error: 'bad email' }) }));
    const r = await submitEmail('x', { fetch: f as any, endpoint: '/api/w' });
    expect(r.ok).toBe(false);
    expect(r.message).toBe('bad email');
  });
  it('supports AbortSignal', async () => {
    const ctrl = new AbortController(); ctrl.abort();
    const f = vi.fn(async () => { throw new DOMException('aborted', 'AbortError'); });
    const r = await submitEmail('a@b.com', { fetch: f as any, endpoint: '/api/w', signal: ctrl.signal });
    expect(r.ok).toBe(false);
    expect(r.aborted).toBe(true);
  });
});