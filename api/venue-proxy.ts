return new Response(html, {
  status: upstream.status,
  headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store, max-age=0, must-revalidate",
    "X-Venue-Proxy": "true",
    "X-Upstream-Status": String(upstream.status),
  },
});
