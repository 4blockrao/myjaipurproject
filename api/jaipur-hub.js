// api/jaipur-hub.js
// Server-rendered directory of all Jaipur localities.
// Fixes crawlability: /jaipur (hub) and /jaipur/all previously rendered an empty
// SPA shell to crawlers, so link equity never flowed to the 100+ locality pages.
// This renders every published locality as an in-HTML link, grouped by zone.

const SUPABASE_URL = "https://rbenryjgtbrjvqvxbigq.supabase.co";
// Public anon key (already shipped in the client bundle / .env — safe to embed).
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZW5yeWpndGJyanZxdnhiaWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5Njc5NzQsImV4cCI6MjA5MTU0Mzk3NH0.-ExObEYUegSEjhQh2IfKXmOvw8cKT8h1ISXbAPnHgo0";

const SITE = "https://www.jaipurcircle.com";

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default async function handler(req, res) {
  let localities = [];
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/localities` +
      `?select=slug,name,zone&status=eq.published&is_indexable=eq.true&order=name.asc`;
    const r = await fetch(url, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    });
    if (r.ok) localities = await r.json();
  } catch (e) {
    console.error("[jaipur-hub] fetch error:", e);
  }

  // Group by zone (fall back to "Other Areas" when a zone is missing).
  const byZone = {};
  for (const l of localities) {
    if (!l.slug || !l.name) continue;
    const z = l.zone && String(l.zone).trim() ? l.zone : "Other Areas";
    (byZone[z] = byZone[z] || []).push(l);
  }
  const zones = Object.keys(byZone).sort();

  const total = localities.length;
  const title = `Explore All ${total}+ Localities & Neighborhoods in Jaipur | JaipurCircle`;
  const desc = `Browse every locality and neighborhood in Jaipur — from C-Scheme and Malviya Nagar to Vaishali Nagar and Mansarovar. Find local guides, deals, events and businesses in each area.`;

  const zoneSections = zones
    .map((z) => {
      const items = byZone[z]
        .map(
          (l) =>
            `<li><a href="/jaipur/${esc(l.slug)}">${esc(l.name)}</a></li>`
        )
        .join("");
      return `<section class="zone"><h2>${esc(z)}</h2><ul class="localities">${items}</ul></section>`;
    })
    .join("");

  const fallback =
    total === 0
      ? `<p class="empty">Localities are loading — please refresh in a moment.</p>`
      : "";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${SITE}/jaipur" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${SITE}/jaipur" />
<script type="application/ld+json">
${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: title,
  description: desc,
  url: `${SITE}/jaipur`,
  hasPart: localities.slice(0, 500).map((l) => ({
    "@type": "Place",
    name: l.name,
    url: `${SITE}/jaipur/${l.slug}`,
  })),
})}
</script>
<style>
  :root{--ink:#231A1C;--muted:#6E5F61;--rani:#B12A5B;--line:#E9DED9;--paper:#FAF7F5}
  *{box-sizing:border-box}
  body{margin:0;background:var(--paper);color:var(--ink);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.55}
  .wrap{max-width:1080px;margin:0 auto;padding:32px 20px 64px}
  header h1{font-size:clamp(26px,4vw,38px);letter-spacing:-.02em;margin:0 0 10px}
  header p{color:var(--muted);max-width:65ch;margin:0 0 8px}
  nav.top{font-size:14px;margin-bottom:18px}
  nav.top a{color:var(--rani);text-decoration:none;margin-right:16px}
  .zone{margin-top:28px}
  .zone h2{font-size:16px;letter-spacing:.02em;margin:0 0 12px;padding-bottom:8px;border-bottom:1px solid var(--line);color:var(--rani)}
  ul.localities{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px 20px}
  ul.localities a{color:var(--ink);text-decoration:none;font-size:15px}
  ul.localities a:hover{color:var(--rani);text-decoration:underline}
  footer{margin-top:48px;padding-top:20px;border-top:1px solid var(--line);font-size:14px}
  footer a{color:var(--rani);text-decoration:none;margin-right:16px}
  .empty{color:var(--muted)}
</style>
</head>
<body>
<div class="wrap">
  <nav class="top"><a href="/">Home</a><a href="/events">Events</a><a href="/deals">Deals</a><a href="/merchants">Merchants</a></nav>
  <header>
    <h1>Localities &amp; Neighborhoods of Jaipur</h1>
    <p>${esc(desc)}</p>
    <p>${total} neighborhoods across Jaipur — tap any area for its local guide, deals, events and businesses.</p>
  </header>
  ${fallback}
  ${zoneSections}
  <footer>
    <a href="/jaipur">All Localities</a>
    <a href="/events">Events in Jaipur</a>
    <a href="/deals">Deals</a>
    <a href="/merchants">Local Merchants</a>
  </footer>
</div>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, must-revalidate");
  res.status(200).send(html);
}
