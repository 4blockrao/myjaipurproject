export default async function handler(req, res) {
  const { slug } = req.query;
  if (!slug) return res.status(400).send('Missing slug');
  const upstream = `https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/venue-ssr?slug=${encodeURIComponent(slug)}`;
  const upstreamRes = await fetch(upstream);
  const html = await upstreamRes.text();
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}
