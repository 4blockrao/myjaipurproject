// api/event-proxy/route.ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  
  if (!slug) {
    return new Response('Missing slug parameter', { status: 400 });
  }
  
  // Add timestamp to bypass all caches
  const edgeFunctionUrl = `https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/event-ssr?slug=${slug}&t=${Date.now()}`;
  
  const response = await fetch(edgeFunctionUrl);
  const html = await response.text();
  
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
