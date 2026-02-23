const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const BASE_URL = "https://www.jaipurcircle.com";

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug", {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const dest = `${BASE_URL}/jaipur/${encodeURIComponent(slug)}`;

  return new Response(null, {
    status: 308,
    headers: {
      ...corsHeaders,
      Location: dest,
      "Cache-Control": "public, max-age=3600",
    },
  });
});
