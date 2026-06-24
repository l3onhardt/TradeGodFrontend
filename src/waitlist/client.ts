export interface WaitlistResult { ok: boolean; message?: string; aborted?: boolean }

export interface SubmitOpts {
  fetch?: typeof fetch;
  endpoint?: string;
  signal?: AbortSignal;
}

export async function submitEmail(email: string, opts: SubmitOpts = {}): Promise<WaitlistResult> {
  const fetcher = opts.fetch ?? fetch.bind(globalThis);
  const endpoint = opts.endpoint ?? '/api/waitlist';
  try {
    const res = await fetcher(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
      signal: opts.signal,
    });
    const body: any = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, message: body?.error ?? 'request failed' };
    return { ok: true, message: body?.message };
  } catch (e: any) {
    if (e?.name === 'AbortError') return { ok: false, aborted: true };
    return { ok: false, message: 'network error' };
  }
}