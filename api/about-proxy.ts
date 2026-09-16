// api/about-proxy.ts
//
// Serves real, crawlable content for /about — a route that vercel.json
// previously had no dedicated proxy for, so it fell through to the generic
// SPA `index.html` shell (same homepage-oriented hidden content, same
// title, regardless of path). That's a problem specifically because the
// site's own JSON-LD already points at this URL: Article.author.url and
// Article.publisher.url on every /guide, /story, /explore page reference
// "https://www.jaipurcircle.com/about" as the author/publisher entity.
//
// This still mounts the same React app (`<div id="root">` +
// `/src/main.tsx`), so real users get the existing client-side
// `AboutPage.tsx` route exactly as before — this only changes what a
// non-JS-executing fetch (crawlers, curl) sees before hydration.
//
// No Supabase/DB dependency by design: this is static editorial copy, not
// data-driven content, so there's nothing to keep in sync and nothing that
// can fail at request time.

export const config = {
  runtime: "edge",
};

const PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <link rel="icon" href="/favicon.png" type="image/png" />
    <link rel="apple-touch-icon" href="/pwa-192x192.png" />
    <title>About JaipurCircle | Local Deals, Reviews &amp; Guides for Jaipur</title>
    <meta name="description" content="JaipurCircle is a hyperlocal platform for Jaipur, India — local deals, verified merchant reviews, and neighbourhood guides. Learn how JaipurCircle sources and verifies what it publishes." />
    <link rel="canonical" href="https://www.jaipurcircle.com/about" />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="About JaipurCircle" />
    <meta property="og:description" content="What JaipurCircle is, how it's run, and how content is sourced and verified." />
    <meta property="og:url" content="https://www.jaipurcircle.com/about" />
    <meta property="og:site_name" content="JaipurCircle" />
    <meta property="og:type" content="website" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "url": "https://www.jaipurcircle.com/about",
      "name": "About JaipurCircle",
      "isPartOf": {
        "@type": "WebSite",
        "name": "JaipurCircle",
        "url": "https://www.jaipurcircle.com"
      },
      "about": {
        "@type": "Organization",
        "name": "JaipurCircle",
        "url": "https://www.jaipurcircle.com",
        "logo": "https://www.jaipurcircle.com/logo.png",
        "sameAs": ["https://www.instagram.com/jaipurcircle"]
      }
    }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <div id="ssr-crawler-about" aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0;padding:0;margin:-1px;">
      <h1>About JaipurCircle</h1>
      <p>
        JaipurCircle is an independent, hyperlocal platform focused on Jaipur, India.
        It covers local merchant discovery and customer reviews, neighbourhood
        guides for Jaipur's localities, a calendar of local events, and editorial
        coverage of city news, food, culture and travel.
      </p>
      <h2>How content is sourced and verified</h2>
      <p>
        Locality guides (pin codes, police stations, schools, hospitals) are
        compiled from official public sources and cross-checked for accuracy.
        Merchant listings and reviews are contributed by real users; merchant
        details are periodically re-verified against the business itself.
        Local events are sourced from public listings (including BookMyShow)
        and refreshed on a weekly schedule. Most content &mdash; locality
        guides, merchant details, and longer articles &mdash; is reviewed by
        the JaipurCircle editorial team before it goes live. A narrow set of
        short-lived, low-stakes updates (same-day weather and local-news
        alerts) can publish immediately from verified contributors; that
        split is enforced automatically by the platform, not left to
        individual judgment on each post. Some content is drafted with AI
        assistance and always goes through this same review process before
        publishing.
      </p>
      <h2>Contact</h2>
      <p>
        For merchant listings, corrections, or partnership queries, see
        <a href="/merchant-onboarding">Merchant Onboarding</a> or
        <a href="/help">Help</a>.
      </p>
    </div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

export default async function handler(_request: Request) {
  return new Response(PAGE_HTML, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
