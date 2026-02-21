import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BASE_URL = "https://www.jaipurcircle.com";
const SITE_NAME = "JaipurCircle";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=630&fit=crop";

const INDEX_MIN_UPCOMING = 6;

const TOP_CATEGORIES = [
  "music",
  "comedy",
  "workshops",
  "food",
  "nightlife",
  "sports",
  "theatre",
  "festival",
];

const TOP_LOCALITIES = [
  "vaishali-nagar",
  "mansarovar",
  "malviya-nagar",
  "c-scheme",
  "jagatpura",
  "tonk-road",
  "ajmer-road",
  "bani-park",
];

function esc(str: string): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escJson(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

function titleCase(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmtTime(d: string): string {
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function isLikelyBot(req: Request): boolean {
  const ua = req.headers.get("user-agent") || "";
  return /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|WhatsApp|TelegramBot/i.test(
    ua,
  );
}

function computeRobots(
  url: URL,
  upcomingCount: number,
): string {
  const category = url.searchParams.get("category");
  const locality = url.searchParams.get("locality");
  const isHub = !category && !locality;

  if (isHub) {
    return "index, follow, max-image-preview:large, max-snippet:-1";
  }

  const allowedParams = new Set(["category", "locality"]);
  const noisyKeys = [...url.searchParams.keys()].filter(
    (k) => !allowedParams.has(k),
  );

  if (noisyKeys.length > 0) {
    return "noindex, follow";
  }

  if (!category || !locality) {
    return "noindex, follow";
  }

  if (upcomingCount < INDEX_MIN_UPCOMING) {
    return "noindex, follow";
  }

  return "index, follow, max-image-preview:large, max-snippet:-1";
}

async function fetchIndexHtml(): Promise<string> {
  try {
    const resp = await fetch(`${BASE_URL}/index.html`);
    return await resp.text();
  } catch {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><div id="root"></div></body></html>`;
  }
}

function injectHead(html: string, injection: string): string {
  return html.replace("</head>", `${injection}\n</head>`);
}

function injectPre(html: string, pre: string): string {
  return html.replace(/<body([^>]*)>/i, `<body$1>\n${pre}\n`);
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const locality = url.searchParams.get("locality");
    const isHub = !category && !locality;

    const canonical = isHub
      ? `${BASE_URL}/events`
      : `${BASE_URL}/events/${encodeURIComponent(category || "")}/${encodeURIComponent(locality || "")}`;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const nowIso = new Date().toISOString();

    let q = supabase
      .from("events")
      .select(
        "id,slug,title,category,locality,venue_name,start_date,is_free,ticket_price,short_description,description",
      )
      .gte("start_date", nowIso)
      .order("start_date", { ascending: true })
      .limit(20);

    let countQ = supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .gte("start_date", nowIso);

    if (category) {
      q = q.ilike("category", `%${category}%`);
      countQ = countQ.ilike("category", `%${category}%`);
    }

    if (locality) {
      q = q.ilike("locality", `%${locality}%`);
      countQ = countQ.ilike("locality", `%${locality}%`);
    }

    const [{ data: events }, { count }] = await Promise.all([q, countQ]);

    const upcoming = count ?? events?.length ?? 0;
    const robots = computeRobots(url, upcoming);

    const catLabel = category ? titleCase(category) : "Events";
    const locLabel = locality ? titleCase(locality) : "Jaipur";

    const pageTitle = isHub
      ? `Jaipur Events Calendar | ${SITE_NAME}`
      : `${catLabel} Events in ${locLabel}, Jaipur | ${SITE_NAME}`;

    const pageDesc = isHub
      ? "Discover upcoming events in Jaipur — concerts, comedy, workshops and more."
      : `Explore upcoming ${catLabel.toLowerCase()} events in ${locLabel}, Jaipur.`;

    const meta = `
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(pageDesc)}">
<meta name="robots" content="${esc(robots)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:title" content="${esc(pageTitle)}">
<meta property="og:description" content="${esc(pageDesc)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${DEFAULT_IMAGE}">
`;

    const listHtml =
      !events || events.length === 0
        ? `<p>No upcoming events found.</p>`
        : events
            .map((e: any) => {
              const href = `/events/${e.slug}`;
              return `
<article>
  <h2><a href="${href}">${esc(e.title)}</a></h2>
  <div>${fmtDate(e.start_date)} · ${fmtTime(e.start_date)}</div>
  <div>${esc(e.venue_name || "TBA")}</div>
</article>`;
            })
            .join("");

    const prerender = `
<div class="ssr-prerender" style="max-width:900px;margin:0 auto;padding:20px">
  <h1>${esc(pageTitle)}</h1>
  ${listHtml}
</div>`;

    let html = await fetchIndexHtml();
    html = html.replace(/<title>[^<]*<\/title>/i, "");
    html = html.replace(/<meta name="description"[^>]*>/i, "");
    html = html.replace(/<link rel="canonical"[^>]*>/i, "");
    html = html.replace(/<meta name="robots"[^>]*>/i, "");

    html = injectHead(html, meta);
    html = injectPre(html, prerender);

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": isLikelyBot(req)
          ? "public, max-age=0, must-revalidate"
          : "public, max-age=30",
      },
    });
  } catch {
    return new Response("Error loading events", { status: 500 });
  }
});
