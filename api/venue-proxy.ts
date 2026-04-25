// api/venue-proxy.ts

export const config = {
  runtime: "edge",
};

const SUPABASE_VENUE_SSR_URL =
  "https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/venue-ssr";

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim();

  if (!slug) {
    return new Response("Missing venue slug", {
      status: 400,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const edgeFunctionUrl =
    `${SUPABASE_VENUE_SSR_URL}?slug=${encodeURIComponent(slug)}`;

  try {
    const upstream = await fetch(edgeFunctionUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          request.headers.get("user-agent") || "jaipurcircle-venue-proxy",
        "Accept": "text/html",
      },
    });

    const html = await upstream.text();

    return new Response(html, {
      status: upstream.status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "X-Venue-Proxy": "true",
        "X-Upstream-Status": String(upstream.status),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown venue proxy error";

    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex, nofollow">
  <title>Venue Temporarily Unavailable | JaipurCircle</title>
</head>
<body>
  <h1>Venue temporarily unavailable</h1>
  <p>Please try again shortly.</p>
  <pre style="white-space:pre-wrap">${message}</pre>
</body>
</html>`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Venue-Proxy": "true",
          "X-Venue-Proxy-Error": "true",
        },
      },
    );
  }
}
