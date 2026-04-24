export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.searchParams.get('path');
  
  const edgeFunctionUrl = `https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/events-list-ssr${path}`;
  
  const response = await fetch(edgeFunctionUrl);
  const html = await response.text();
  
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html', 'Cache-Control': 'public, max-age=3600' },
  });
}
