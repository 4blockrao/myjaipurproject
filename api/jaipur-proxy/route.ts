// api/jaipur-proxy/route.ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  
  if (!slug) {
    return new Response('Missing slug parameter', { status: 400 });
  }
  
  // Call the Edge Function directly
  const edgeFunctionUrl = `https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/locality-ssr?slug=${slug}`;
  
  console.log('[Jaipur Proxy] Fetching:', edgeFunctionUrl);
  
  const response = await fetch(edgeFunctionUrl);
  const html = await response.text();
  
  // Log first 200 chars to verify
  console.log('[Jaipur Proxy] Response preview:', html.substring(0, 200));
  
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
