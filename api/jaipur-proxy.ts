// api/jaipur-proxy.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;

  if (!slug || Array.isArray(slug)) {
    return res.status(400).send('Missing slug parameter');
  }

  const upstreamUrl = `https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/locality-ssr?slug=${encodeURIComponent(slug)}`;

  try {
    const upstreamRes = await fetch(upstreamUrl);
    const html = await upstreamRes.text();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
    res.status(200).send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}
