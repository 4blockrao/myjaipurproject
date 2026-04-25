// api/deals-list-ssr.ts

export const config = {
  runtime: "edge",
};

const SUPABASE_DEALS_LIST_SSR_URL =
  "https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/deals-list-ssr";

export default async function handler(request: Request) {
  try {
    const upstream = await fetch(SUPABASE_DEALS_LIST_SSR_URL, {
      headers: {
        "user-agent":
          request.headers.get("user-agent") || "jaipurcircle-deals-list-proxy",
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
        "x-deals-list-proxy": "true",
        "x-upstream-status": String(upstream.status),
      },
    });
  } catch (error) {
    console.error("[deals-list-proxy] Failed:", error);

    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex, nofollow">
  <title>Deals Temporarily Unavailable | JaipurCircle</title>
</head>
<body>
  <h1>Deals temporarily unavailable</h1>
  <p>Please try again shortly.</p>
  <p><a href="/">Back to JaipurCircle</a></p>
</body>
</html>`,
      {
        status: 500,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
          "x-deals-list-proxy": "true",
          "x-deals-list-proxy-error": "true",
        },
      },
    );
  }
}
