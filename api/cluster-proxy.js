// api/cluster-proxy.js
export default async function handler(req, res) {
  const url = req.url;
  
  // Extract path from the full URL
  const match = url.match(/\/jaipur\/([^\/]+)\/([^\/]+)/);
  
  if (!match) {
    return res.status(400).send('Invalid URL. Expected: /jaipur/:locality/:cluster_slug');
  }

  const locality = match[1];
  const clusterSlug = match[2];
  
  const upstreamUrl = `https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/cluster-ssr/jaipur/${locality}/${clusterSlug}`;

  try {
    const upstreamRes = await fetch(upstreamUrl);
    const html = await upstreamRes.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    console.error('[cluster-proxy] Error:', error);
    res.status(500).send('Internal Server Error');
  }
}
