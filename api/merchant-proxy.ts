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
    
    // Disable caching completely
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    res.status(200).send(html);
  } catch (error) {
    console.error('[merchant-proxy] Error:', error);
    res.status(500).send('Internal Server Error');
  }
}
