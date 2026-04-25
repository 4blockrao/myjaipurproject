// api/publication-proxy.ts
// Vercel Edge proxy for JaipurCircle universal publication SSR.
//
// Supports:
// /news/:slug
// /guide/:slug
// /explore/:slug
// /story/:slug

export const config = {
  runtime: "edge",
};

const SUPABASE_PUBLICATION_SSR_URL =
  "https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/publication-ssr";

export default async function handler(request: Request) {
  const startTime = Date.now();
  const url = new URL(request.url);

  const type = (url.searchParams.get("type") || "news").trim().toLowerCase();
  const slug = (url.searchParams.get("slug") || "").trim().toLowerCase();

  if (!slug) {
    return new Response("Missing slug", {
      status: 400,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const upstreamUrl =
    `${SUPABASE_PUBLICATION_SSR_URL}?type=${encodeURIComponent(type)}&slug=${encodeURIComponent(slug)}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        "user-agent": request.headers.get("user-agent") || "jaipurcircle-publication-proxy",
        "accept": "text/html",
      },
      cache: "no-store",
    });

    const html = await upstream.text();

    return new Response(html, {
      status: upstream.status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "X-Publication-Proxy": "true",
        "X-Publication-Type": type,
        "X-Publication-Slug": slug,
        "X-Upstream-Status": String(upstream.status),
        "X-Publication-Proxy-Time-Ms": String(Date.now() - startTime),
      },
    });
  } catch (error) {
    console.error("[publication-proxy] Failed:", error);

    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex, nofollow">
  <title>Publication Temporarily Unavailable | JaipurCircle</title>
</head>
<body style="font-family:system-ui;max-width:680px;margin:40px auto;padding:20px">
  <h1>Publication temporarily unavailable</h1>
  <p>Please try again shortly.</p>
  <a href="/">Back to JaipurCircle</a>
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
