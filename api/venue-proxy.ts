return new Response(html, {
  status: upstream.status,
  headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    "X-Venue-Proxy": "true",
    "X-Upstream-Status": String(upstream.status),
  },
});
