// api/jaipur-proxy/route.ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  
  if (!slug) {
    return new Response('Missing slug parameter', { status: 400 });
  }
  
  // Fetch the SSR HTML from the Edge Function
  const edgeFunctionUrl = `https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/locality-ssr?slug=${slug}`;
  const response = await fetch(edgeFunctionUrl);
  const html = await response.text();
  
  // Return the HTML with no-cache headers
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
