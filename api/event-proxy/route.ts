// api/event-proxy/route.ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  
  if (!slug) {
    return new Response('Missing slug parameter', { status: 400 });
  }
  
  // Add timestamp to make EVERY request unique
  const timestamp = Date.now();
  const edgeFunctionUrl = `https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/event-ssr?slug=${slug}&_=${timestamp}`;
  
  console.log('[Event Proxy] Fetching:', edgeFunctionUrl);
  
  const response = await fetch(edgeFunctionUrl, {
    cache: 'no-store',  // Force fresh fetch
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  });
  
  const html = await response.text();
  
  // Log first 200 chars to verify
  console.log('[Event Proxy] Response preview:', html.substring(0, 200));
  
  // STRONGEST possible no-cache headers
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate, private, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'CDN-Cache-Control': 'no-cache',  // For CDNs
      'Cloudflare-Cache-Cache': 'no-cache',  // For Cloudflare
      'Vercel-CDN-Cache-Control': 'no-cache',  // For Vercel CDN
    },
  });
}
