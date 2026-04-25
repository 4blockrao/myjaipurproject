// api/events-list-ssr.ts

export const config = {
  runtime: "edge",
};

const SUPABASE_EVENTS_LIST_SSR_URL =
  "https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/events-list-ssr";

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path") || "/events";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const edgeFunctionUrl = `${SUPABASE_EVENTS_LIST_SSR_URL}${normalizedPath}`;

  try {
    const upstream = await fetch(edgeFunctionUrl, {
      headers: {
        "user-agent":
          request.headers.get("user-agent") || "jaipurcircle-events-list-proxy",
        "accept": "text/html",
      },
      cache: "no-store",
    });

    const html = await upstream.text();

    return new Response(html, {
      status: upstream.status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "X-Events-List-Proxy": "true",
        "X-Upstream-Status": String(upstream.status),
      },
    });
  } catch (error) {
    console.error("[events-list-ssr proxy] Failed:", error);

    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex, nofollow">
  <title>Events Temporarily Unavailable | JaipurCircle</title>
</head>
<body>
  <h1>Events temporarily unavailable</h1>
  <p>Please try again shortly.</p>
  <p><a href="/events">Back to events</a></p>
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
