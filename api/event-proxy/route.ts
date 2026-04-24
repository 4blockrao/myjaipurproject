export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  
  const edgeFunctionUrl = `https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/event-ssr?slug=${slug}`;
  
  const response = await fetch(edgeFunctionUrl);
  const html = await response.text();
  
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',  // ← CRITICAL
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
