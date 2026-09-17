// api/merchant-proxy.js
export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).send('Missing merchant slug');
  }

  const upstreamUrl = `https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/merchant-ssr?slug=${encodeURIComponent(slug)}`;

  try {
    const upstreamRes = await fetch(upstreamUrl);
    const html = await upstreamRes.text();

    // Forward merchant-ssr's own Cache-Control instead of hardcoding one -
    // this proxy was silently overriding it with a full no-cache header
    // suite (Cache-Control/Pragma/Expires/Surrogate-Control), so
    // merchant-ssr's already-correct public/s-maxage/stale-while-revalidate
    // caching has never actually reached real users. The legacy
    // Pragma/Expires/Surrogate-Control headers are dropped entirely, not
    // just left with stale values - keeping them would fight against
    // whatever Cache-Control is now forwarded. Falls back to no-store (safe
    // default) if upstream didn't set a Cache-Control at all.
    const cacheControl = upstreamRes.headers.get('cache-control') || 'no-store';
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', cacheControl);

    res.status(200).send(html);
  } catch (error) {
    console.error('[merchant-proxy] Error:', error);
    res.status(500).send('Internal Server Error');
  }
}
