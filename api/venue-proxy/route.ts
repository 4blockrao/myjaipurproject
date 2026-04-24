// api/venue-proxy/route.ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  
  if (!slug) {
    return new Response('Missing slug parameter', { status: 400 });
  }
  
  // Call the Edge Function
  const edgeFunctionUrl = `https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/venue-ssr?slug=${slug}`;
  
  console.log('Fetching:', edgeFunctionUrl);
  
  const response = await fetch(edgeFunctionUrl);
  const html = await response.text();
  
  // Log first 200 chars to verify content
  console.log('Response preview:', html.substring(0, 200));
  
  // Return the HTML with proper headers
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
