// api/jaipur-proxy.js
export default async function handler(req, res) {
  const { slug } = req.query;

  console.log(`[jaipur-proxy] Received slug: ${slug}`);

  if (!slug) {
    console.error('[jaipur-proxy] Missing slug');
    return res.status(400).send('Missing slug parameter');
  }

  const upstreamUrl = `https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/locality-ssr?slug=${encodeURIComponent(slug)}`;
  console.log(`[jaipur-proxy] Fetching: ${upstreamUrl}`);

  try {
    const upstreamRes = await fetch(upstreamUrl);
    const html = await upstreamRes.text();

    console.log(`[jaipur-proxy] Got response: ${upstreamRes.status}, length: ${html.length}`);

    // Forward locality-ssr's own Cache-Control instead of hardcoding one -
    // this proxy was silently overriding it with no-store, so the SSR
    // function's actual caching strategy never reached real users. Falls
    // back to no-store (safe default) if upstream didn't set one at all.
    const cacheControl = upstreamRes.headers.get('cache-control') || 'no-store';
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', cacheControl);
    res.status(200).send(html);
  } catch (error) {
    console.error('[jaipur-proxy] Error:', error);
    res.status(500).send('Internal Server Error');
  }
}
