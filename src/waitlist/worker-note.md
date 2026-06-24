# Waitlist serverless endpoint (deploy-time)

Deploy a serverless function (Vercel `functions/api/waitlist.ts` or Cloudflare Worker)
that accepts `{ email }`, writes it to KV / D1, and returns `{ ok: true }` or `{ error }`.

Drop-in example (Vercel):

```ts
export default async function handler(req: Request) {
  const { email } = await req.json();
  if (!email || !email.includes('@')) return Response.json({ error: 'bad email' }, { status: 400 });
  // await KV.put('wl:' + Date.now(), email);  // or D1 insert
  return Response.json({ ok: true });
}
```

Until deployed, `submitEmail` POSTs to `/api/waitlist` and the page shows the
fallback "try again" message — acceptable for the founding launch preview.

The page never POSTs to a real third party; no email is sent anywhere by default
during development. Wire this function at deploy time only.