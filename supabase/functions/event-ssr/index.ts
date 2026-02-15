import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const BASE_URL = "https://www.jaipurcircle.com";
const SITE_NAME = "JaipurCircle";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=630&fit=crop";

function esc(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escJson(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function fmtTime(d: string): string {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

function eventType(cat: string): string {
  const c = cat.toLowerCase();
  if (c.includes("music") || c.includes("concert")) return "MusicEvent";
  if (c.includes("comedy") || c.includes("standup")) return "ComedyEvent";
  if (c.includes("dance")) return "DanceEvent";
  if (c.includes("theatre") || c.includes("theater")) return "TheaterEvent";
  if (c.includes("festival")) return "Festival";
  if (c.includes("sports")) return "SportsEvent";
  if (c.includes("workshop")) return "EducationEvent";
  if (c.includes("food")) return "FoodEvent";
  return "Event";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response("Missing slug parameter", { status: 400, headers: { ...corsHeaders, "Content-Type": "text/plain" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: event, error } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the real index.html from production to get correct JS/CSS hashes
    let indexHtml: string;
    try {
      const resp = await fetch(`${BASE_URL}/index.html`, {
        headers: { "User-Agent": "JaipurCircle-SSR/1.0" },
      });
      indexHtml = await resp.text();
    } catch {
      // Fallback minimal shell
      indexHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body><div id="root"></div></body></html>`;
    }

    const city = event.city || "Jaipur";
    const yr = new Date(event.start_date).getFullYear();
    const venue = event.venue_name || "TBA";
    const isPast = new Date(event.start_date) < new Date();
    const canonical = `${BASE_URL}/events/${event.slug}`;
    const img = event.cover_image || DEFAULT_IMAGE;
    const priceText = event.is_free ? "Free Entry" : `₹${event.ticket_price || "TBA"}`;
    const desc = event.description || event.short_description || `${event.title} in ${city}. Get details on JaipurCircle.`;

    const title = event.meta_title || `${event.title} ${city} ${yr} — Date, ${venue !== "TBA" ? venue + ", " : ""}Ticket Price & Booking`;
    const metaDesc = event.meta_description || `Book ${event.title} tickets in ${city} — ${fmtDate(event.start_date)}${venue !== "TBA" ? ` at ${venue}` : ""}. ${priceText}. Timings, entry rules & booking.`;

    // Build JSON-LD schemas
    const schema = {
      "@context": "https://schema.org",
      "@type": eventType(event.category),
      "@id": canonical,
      name: event.title,
      description: desc.substring(0, 500),
      url: canonical,
      startDate: new Date(event.start_date).toISOString(),
      endDate: event.end_date ? new Date(event.end_date).toISOString() : new Date(new Date(event.start_date).getTime() + 3 * 3600000).toISOString(),
      eventStatus: isPast ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
      eventAttendanceMode: event.is_online ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
      location: event.is_online
        ? { "@type": "VirtualLocation", url: event.online_url || canonical }
        : { "@type": "Place", name: venue, address: { "@type": "PostalAddress", streetAddress: event.venue_address || venue, addressLocality: event.locality || "Jaipur", addressRegion: "Rajasthan", addressCountry: "IN" } },
      image: [img],
      offers: { "@type": "Offer", url: canonical, priceCurrency: "INR", ...(event.is_free ? { price: "0" } : event.ticket_price ? { price: String(event.ticket_price) } : {}), availability: isPast ? "https://schema.org/SoldOut" : "https://schema.org/InStock" },
      organizer: { "@type": "Organization", name: event.organizer_name || SITE_NAME, url: BASE_URL },
      ...(event.organizer_name && { performer: { "@type": "Person", name: event.organizer_name } }),
      isAccessibleForFree: event.is_free,
      inLanguage: "en-IN",
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".event-quick-info"] },
    };

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Events", item: `${BASE_URL}/events` },
        { "@type": "ListItem", position: 3, name: event.category, item: `${BASE_URL}/events?category=${event.category}` },
        { "@type": "ListItem", position: 4, name: event.title, item: canonical },
      ],
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: `When is ${event.title} in ${city}?`, acceptedAnswer: { "@type": "Answer", text: `${event.title} is on ${fmtDate(event.start_date)} at ${fmtTime(event.start_date)} in ${city}.` } },
        { "@type": "Question", name: `Where is ${event.title} happening?`, acceptedAnswer: { "@type": "Answer", text: `${event.title} is at ${venue}${event.locality ? `, ${event.locality}` : ""}, ${city}.` } },
        { "@type": "Question", name: `What is the ticket price for ${event.title}?`, acceptedAnswer: { "@type": "Answer", text: event.is_free ? "This is a free event. Registration may be required." : `Tickets start from ₹${event.ticket_price || "TBA"}.` } },
        { "@type": "Question", name: `How to book tickets for ${event.title}?`, acceptedAnswer: { "@type": "Answer", text: `You can book tickets for ${event.title} on JaipurCircle at ${canonical}` } },
      ],
    };

    // Build new <head> meta tags
    const metaTags = `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(metaDesc)}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="event">
    <meta property="og:url" content="${canonical}">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta property="og:title" content="${esc(event.title)}">
    <meta property="og:description" content="${esc(metaDesc)}">
    <meta property="og:image" content="${esc(img)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="en_IN">
    <meta property="event:start_time" content="${event.start_date}">
    ${event.end_date ? `<meta property="event:end_time" content="${event.end_date}">` : ""}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@jaipurcircle">
    <meta name="twitter:title" content="${esc(event.title)}">
    <meta name="twitter:description" content="${esc(metaDesc)}">
    <meta name="twitter:image" content="${esc(img)}">
    <meta name="geo.region" content="IN-RJ">
    <meta name="geo.placename" content="${esc(event.locality || city)}">
    <meta name="citation_title" content="${esc(event.title)}">
    <meta name="citation_date" content="${fmtDate(event.start_date)}">
    <meta name="citation_geo_region" content="IN-RJ">
    <meta property="article:published_time" content="${event.start_date}">
    <meta property="article:modified_time" content="${new Date().toISOString()}">
    <script type="application/ld+json">${escJson(schema)}</script>
    <script type="application/ld+json">${escJson(breadcrumb)}</script>
    <script type="application/ld+json">${escJson(faqSchema)}</script>`;

    // Pre-rendered content block for crawlers (React will hydrate over this)
    const tags = (event.tags || []).slice(0, 8).map((t: string) => `<span style="display:inline-block;background:#f0f0f0;padding:2px 8px;margin:2px;border-radius:4px;font-size:0.85em">${esc(t)}</span>`).join("");

    const preContent = `<div class="ssr-prerender" style="max-width:800px;margin:0 auto;padding:20px;font-family:system-ui,sans-serif">
<nav aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/events">Events</a> › <a href="/events?category=${encodeURIComponent(event.category)}">${esc(event.category)}</a> › ${esc(event.title)}</nav>
<h1>${esc(event.title)} ${esc(city)} ${yr} — Date, Venue, Ticket Price, Timing &amp; Booking Info</h1>
<div class="event-quick-info" aria-label="Event Overview" style="margin:16px 0">
<table style="width:100%;border-collapse:collapse"><tbody>
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Event</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(event.title)}</td></tr>
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Type</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(event.category)}</td></tr>
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Status</th><td style="padding:8px;border-bottom:1px solid #eee">${isPast ? "Completed" : "Upcoming"}</td></tr>
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">City</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(city)}</td></tr>
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Venue</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(venue)}</td></tr>
${event.locality ? `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Locality</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(event.locality)}</td></tr>` : ""}
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Date</th><td style="padding:8px;border-bottom:1px solid #eee"><time datetime="${new Date(event.start_date).toISOString()}">${fmtDate(event.start_date)}</time></td></tr>
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Time</th><td style="padding:8px;border-bottom:1px solid #eee">${fmtTime(event.start_date)}${event.end_date ? ` – ${fmtTime(event.end_date)}` : ""}</td></tr>
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Price</th><td style="padding:8px;border-bottom:1px solid #eee"><strong>${priceText}</strong></td></tr>
${event.organizer_name ? `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Organizer</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(event.organizer_name)}</td></tr>` : ""}
</tbody></table></div>
<section><h2>About ${esc(event.title)}</h2><p>${esc(desc.substring(0, 1500))}</p></section>
${tags ? `<section><h2>Related Tags</h2><div>${tags}</div></section>` : ""}
<section>
<h2>Frequently Asked Questions</h2>
<h3>When is ${esc(event.title)} in ${esc(city)}?</h3>
<p>${esc(event.title)} is on ${fmtDate(event.start_date)} at ${fmtTime(event.start_date)}.</p>
<h3>Where is ${esc(event.title)} happening?</h3>
<p>At ${esc(venue)}${event.locality ? `, ${esc(event.locality)}` : ""}, ${esc(city)}.</p>
<h3>What is the ticket price?</h3>
<p>${event.is_free ? "This is a free event." : `Tickets start from ₹${event.ticket_price || "TBA"}.`}</p>
<h3>How to book tickets?</h3>
<p>Book on <a href="${canonical}">JaipurCircle</a>.</p>
</section>
</div>`;

    // Inject into index.html
    let html = indexHtml;

    // 1. Replace <title> and generic meta
    html = html.replace(/<title>[^<]*<\/title>/, "");
    html = html.replace(/<meta name="description"[^>]*>/, "");
    html = html.replace(/<meta name="keywords"[^>]*>/, "");
    html = html.replace(/<meta property="og:title"[^>]*>/, "");
    html = html.replace(/<meta property="og:description"[^>]*>/, "");
    html = html.replace(/<meta property="og:url"[^>]*>/, "");
    html = html.replace(/<meta property="og:type"[^>]*>/, "");
    html = html.replace(/<meta name="twitter:card"[^>]*>/, "");

    // 2. Inject event-specific meta tags before </head>
    html = html.replace("</head>", `${metaTags}\n</head>`);

    // 3. Inject pre-rendered content into <div id="root">
    html = html.replace('<div id="root"></div>', `<div id="root">${preContent}</div>`);

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("Event SSR error:", err);
    return new Response("Internal Server Error", { status: 500, headers: { ...corsHeaders, "Content-Type": "text/plain" } });
  }
});
