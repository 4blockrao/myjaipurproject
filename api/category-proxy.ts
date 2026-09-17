// api/category-proxy.ts
// Deployed 2026-09-17. Modeled on venue-proxy.ts/publication-proxy.ts
// (genuinely edge-runtime, unlike merchant-proxy.ts which is Node req/res
// style despite its .ts extension - confirmed by reading it directly before
// writing this file, not assumed from the filename).

export const config = {
  runtime: "edge",
};

const SUPABASE_CATEGORY_SSR_URL =
  "https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/category-ssr";

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim();

  if (!slug) {
    return new Response("Missing category slug", {
      status: 400,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  const edgeFunctionUrl =
    `${SUPABASE_CATEGORY_SSR_URL}?slug=${encodeURIComponent(slug)}`;

  try {
    const upstream = await fetch(edgeFunctionUrl, {
      headers: {
        "user-agent":
          request.headers.get("user-agent") || "jaipurcircle-category-proxy",
        "accept": "text/html",
      },
      cache: "no-store",
    });

    const html = await upstream.text();

    // Forward category-ssr's own Cache-Control instead of hardcoding one -
    // this proxy was silently overriding it with no-store, copied from the
    // venue-proxy.ts pattern this file was modeled on without noticing the
    // bug. Falls back to no-store (safe default) if upstream didn't set one.
    const cacheControl = upstream.headers.get("cache-control") || "no-store";

    return new Response(html, {
      status: upstream.status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": cacheControl,
        "x-category-proxy": "true",
        "x-upstream-status": String(upstream.status),
      },
    });
  } catch (error) {
    console.error("[category-proxy] Failed:", error);

    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex, nofollow">
  <title>Category Page Temporarily Unavailable | JaipurCircle</title>
</head>
<body>
  <h1>Category page temporarily unavailable</h1>
  <p>Please try again shortly.</p>
  <p><a href="/categories">Browse categories</a></p>
</body>
</html>`,
      {
        status: 500,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
          "x-category-proxy": "true",
          "x-category-proxy-error": "true",
        },
      },
    );
  }
}
