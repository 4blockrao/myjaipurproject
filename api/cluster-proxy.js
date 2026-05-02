// api/cluster-proxy.js
export default async function handler(req, res) {
  const url = req.url;
  const match = url.match(/\/jaipur\/([^\/]+)\/([^\/]+)/);
  
  if (!match) {
    return res.status(400).send('Invalid URL');
  }

  const locality = match[1];
  const clusterSlug = match[2];
  
  const upstreamUrl = `https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/cluster-ssr/jaipur/${locality}/${clusterSlug}`;

  try {
    const upstreamRes = await fetch(upstreamUrl);
    const html = await upstreamRes.text();
    
    // Disable caching
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.status(200).send(html);
  } catch (error) {
    console.error('[cluster-proxy] Error:', error);
    res.status(500).send('Internal Server Error');
  }
}
