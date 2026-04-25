// api/events-list-ssr.ts
// JaipurCircle Events List SSR Proxy
// Forwards public event-list paths to Supabase Edge Function as ?path=/events/...

export const config = {
  runtime: "edge",
};

const SUPABASE_EVENTS_LIST_SSR_URL =
  "https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/events-list-ssr";

function normalizeEventsPath(path: string | null): string {
  const raw = String(path || "/events").trim();
  const normalized = raw.startsWith("/") ? raw : `/${raw}`;

  if (!normalized.startsWith("/events")) {
    return "/events";
  }

  return normalized.replace(/\/+$/, "") || "/events";
}

export default async function handler(request: Request) {
  const startedAt = Date.now();
  const url = new URL(request.url);
  const publicPath = normalizeEventsPath(url.searchParams.get("path"));

  const edgeFunctionUrl = new URL(SUPABASE_EVENTS_LIST_SSR_URL);
  edgeFunctionUrl.searchParams.set("path", publicPath);

  // Preserve cache-busting/debug query params like ?v=260, but do not duplicate path.
  for (const [key, value] of url.searchParams.entries()) {
    if (key === "path") continue;
    edgeFunctionUrl.searchParams.set(key, value);
  }

  try {
    const upstream = await fetch(edgeFunctionUrl.toString(), {
      headers: {
        "user-agent":
          request.headers.get("user-agent") || "jaipurcircle-events-list-proxy",
        "accept": "text/html",
        "x-jaipurcircle-public-path": publicPath,
      },
      cache: "no-store",
    });

    const html = await upstream.text();

    const headers = new Headers({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0, must-revalidate",
      "X-Events-List-Proxy": "true",
      "X-Upstream-Status": String(upstream.status),
      "X-Events-List-Public-Path": publicPath,
      "X-Events-List-Proxy-Time-Ms": String(Date.now() - startedAt),
    });

    const passThroughHeaders = [
      "x-ssr-rendered",
      "x-ssr-page",
      "x-effective-path",
      "x-route-type",
      "x-events-count",
      "x-render-time-ms",
    ];

    for (const header of passThroughHeaders) {
      const value = upstream.headers.get(header);
      if (value) headers.set(header, value);
    }

    return new Response(html, {
      status: upstream.status,
      headers,
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
          "X-Events-List-Proxy": "true",
          "X-Upstream-Status": "proxy-error",
        },
      },
    );
  }
}
