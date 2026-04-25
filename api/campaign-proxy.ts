// api/campaign-proxy.ts
// Vercel Edge proxy for JaipurCircle campaign SSR.
// Public URL example: /ipl-2026

export const config = {
  runtime: "edge",
};

const SUPABASE_CAMPAIGN_SSR_URL =
  "https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/campaign-ssr";

export default async function handler(request: Request) {
  const startTime = Date.now();
  const url = new URL(request.url);

  const slug = (url.searchParams.get("slug") || "ipl-2026-jaipur").trim().toLowerCase();
  const section = (url.searchParams.get("section") || "hub").trim().toLowerCase();

  const upstreamUrl = `${SUPABASE_CAMPAIGN_SSR_URL}?slug=${encodeURIComponent(slug)}&section=${encodeURIComponent(section)}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        "user-agent": request.headers.get("user-agent") || "jaipurcircle-campaign-proxy",
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
        "X-Campaign-Proxy": "true",
        "X-Campaign-Slug": slug,
        "X-Campaign-Section": section,
        "X-Upstream-Status": String(upstream.status),
        "X-Campaign-Proxy-Time-Ms": String(Date.now() - startTime),
      },
    });
  } catch (error) {
    console.error("[campaign-proxy] Failed:", error);

    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex, nofollow">
  <title>Campaign Temporarily Unavailable | JaipurCircle</title>
</head>
<body style="font-family:system-ui;max-width:680px;margin:40px auto;padding:20px">
  <h1>Campaign temporarily unavailable</h1>
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
