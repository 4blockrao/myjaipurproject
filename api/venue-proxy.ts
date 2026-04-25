// api/venue-proxy.ts

export const config = {
  runtime: "edge",
};

const SUPABASE_VENUE_SSR_URL =
  "https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/venue-ssr";

export default async function handler(request: Request) {
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
      headers: {
        "user-agent":
          request.headers.get("user-agent") || "jaipurcircle-venue-proxy",
        "accept": "text/html",
      },
      cache: "no-store",
    });

    const html = await upstream.text();

    return new Response(html, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") || "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "X-Venue-Proxy": "true",
        "X-Upstream-Status": String(upstream.status),
      },
    });
  } catch (error) {
    console.error("[venue-proxy] Failed:", error);

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
  <p><a href="/events">Browse Jaipur events</a></p>
</body>
</html>`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
