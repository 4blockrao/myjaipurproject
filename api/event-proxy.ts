// api/event-proxy.ts

export const config = {
  runtime: "edge",
};

const SUPABASE_EVENT_SSR_URL =
  "https://rbenryjgtbrjvqvxbigq.supabase.co/functions/v1/event-ssr";

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim();

  if (!slug) {
    return new Response("Missing slug parameter", {
      status: 400,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  const edgeFunctionUrl =
    `${SUPABASE_EVENT_SSR_URL}?slug=${encodeURIComponent(slug)}`;

  try {
    const upstream = await fetch(edgeFunctionUrl, {
      headers: {
        "user-agent":
          request.headers.get("user-agent") || "jaipurcircle-event-proxy",
        "accept": "text/html",
      },
      cache: "no-store",
    });

    const html = await upstream.text();

    return new Response(html, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") || "text/html; charset=utf-8",
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "x-event-proxy": "true",
        "x-upstream-status": String(upstream.status),
      },
    });
  } catch (error) {
    console.error("[event-proxy] Failed:", error);

    return new Response("Event SSR proxy failed", {
      status: 500,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }
}
