export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  
  if (!slug) {
    return new Response('Missing slug parameter', { status: 400 });
  }
  
  const edgeFunctionUrl = `https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/venue-ssr?slug=${slug}`;
  
  console.log('Fetching venue from:', edgeFunctionUrl);
  
  const response = await fetch(edgeFunctionUrl);
  
  if (!response.ok) {
    console.error('Edge function returned:', response.status);
    return new Response(`Venue not found: ${slug}`, { status: 404 });
  }
  
  const html = await response.text();
  
  return new Response(html, {
    status: 200,
    headers: { 
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
