// api/deals-proxy.ts

export const config = {
  runtime: "edge",
};

const SUPABASE_DEAL_SSR_URL =
  "https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/deals-ssr";

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim();

  if (!slug) {
    return new Response("Missing deal slug", {
      status: 400,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  const edgeFunctionUrl =
    `${SUPABASE_DEAL_SSR_URL}?slug=${encodeURIComponent(slug)}`;

  try {
    const upstream = await fetch(edgeFunctionUrl, {
      headers: {
        "user-agent":
          request.headers.get("user-agent") || "jaipurcircle-deal-proxy",
        "accept": "text/html",
      },
      cache: "no-store",
    });

    const html = await upstream.text();

    return new Response(html, {
      status: upstream.status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store, max-age=0, must-revalidate",
        "x-deal-proxy": "true",
        "x-upstream-status": String(upstream.status),
        "x-deal-upstream": "deals-ssr"
      },
    });
  } catch (error) {
    console.error("[deal-proxy] Failed:", error);

    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex, nofollow">
  <title>Deal Temporarily Unavailable | JaipurCircle</title>
</head>
<body>
  <h1>Deal temporarily unavailable</h1>
  <p>Please try again shortly.</p>
  <p><a href="/deals">Browse Jaipur deals</a></p>
</body>
</html>`,
      {
        status: 500,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
          "x-deal-proxy": "true",
          "x-deal-proxy-error": "true",
        },
      },
    );
  }
}
