return new Response(html, {
  status: upstream.status,
  headers: {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store, max-age=0, must-revalidate",
    "x-artist-proxy": "true",
    "x-upstream-status": String(upstream.status),
  },
});
