// api/cluster-proxy.js
export default async function handler(req, res) {
  const url = req.url;
  const match = url.match(/\/jaipur\/([^\/]+)\/([^\/]+)/);
  
  if (!match) {
    return res.status(400).send('Invalid URL');
  }
  
  const locality = match[1];
  const clusterSlug = match[2];
  
  const upstreamUrl = `https://rbenryjgtbrjvqxbigq.supabase.co/functions/v1/cluster-ssr?locality=${locality}&cluster=${clusterSlug}`;
  
  try {
    const upstreamRes = await fetch(upstreamUrl);
    const html = await upstreamRes.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}
