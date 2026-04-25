// api/merchant-proxy.ts

export const config = {
  runtime: "edge",
};

const SUPABASE_MERCHANT_SSR_URL =
  "https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/merchant-ssr";

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim();

  if (!slug) {
    return new Response("Missing merchant slug", {
      status: 400,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  const edgeFunctionUrl =
    `${SUPABASE_MERCHANT_SSR_URL}?slug=${encodeURIComponent(slug)}`;

  try {
    const upstream = await fetch(edgeFunctionUrl, {
      headers: {
        "user-agent":
          request.headers.get("user-agent") || "jaipurcircle-merchant-proxy",
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
        "x-merchant-proxy": "true",
        "x-upstream-status": String(upstream.status),
      },
    });
  } catch (error) {
    console.error("[merchant-proxy] Failed:", error);

    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex, nofollow">
  <title>Merchant Temporarily Unavailable | JaipurCircle</title>
</head>
<body>
  <h1>Merchant temporarily unavailable</h1>
  <p>Please try again shortly.</p>
  <p><a href="/deals">Browse Jaipur deals</a></p>
</body>
</html>`,
      {
        status: 500,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
          "x-merchant-proxy": "true",
          "x-merchant-proxy-error": "true",
        },
      },
    );
  }
}
