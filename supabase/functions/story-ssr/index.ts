// supabase/functions/story-ssr/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
type StoryRow = {
  slug: string;
  title: string;
  excerpt: string | null;

  content_html: string | null;
  content: string | null;

  cover_image_url: string | null;
  cover_image: string | null;

  meta_title: string | null;
  meta_description: string | null;

  published_at: string | null;
  updated_at: string | null;

  status: string;
};

type RelatedEvent = {
  slug: string;
  title: string | null;
  start_date: string | null;
  locality: string | null;
  venue_name: string | null;
  category: string | null;
};

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function jsonLd(obj: unknown) {
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}

function getOrigin(req: Request) {
  const xfHost = req.headers.get("x-forwarded-host");
  if (xfHost) return `https://${xfHost}`;
  const origin = req.headers.get("origin");
  if (origin) return origin;
  return "https://www.jaipurcircle.com";
}

function err(msg: string, status = 500) {
  return new Response(msg, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function notFoundHtml(_origin: string) {
  return `<!doctype html><html><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Story not found | JaipurCircle</title>
<meta name="robots" content="noindex"/>
</head><body style="font-family:system-ui;padding:30px">
<h1>Story not found</h1>
<meta name="jc-build" content="story-ssr-build-REL-EVENTS-001" />
<p>Try browsing <a href="/stories/">Stories</a>.</p>
</body></html>`;
}

function normalizeSlug(raw: string | null | undefined): string | null {
  const s = (raw || "").trim().toLowerCase();
  if (!s) return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) return null;
  return s;
}

function humanizeSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function tryParseTags(raw: unknown): string[] | null {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    const t = raw
      .map((x) => String(x || "").trim())
      .filter(Boolean)
      .slice(0, 12);
    return t.length ? t : null;
  }
  return null;
}

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

Deno.serve(async (req) => {
  try {
    const u = new URL(req.url);
    const slug = (u.searchParams.get("slug") || "").trim();

    if (!slug) return err("Missing slug", 400);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return err("Invalid slug", 400);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!SUPABASE_URL) return err("Missing env: SUPABASE_URL");
    if (!SUPABASE_ANON_KEY) return err("Missing env: SUPABASE_ANON_KEY");

    const origin = getOrigin(req);
    const canonical = `${origin}/stories/${slug}`;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
      global: { headers: { "X-Client-Info": "story-ssr" } },
    });

    // PASS 1: stable story columns
    const { data: baseStory, error: baseErr } = await supabase
      .from("stories")
      .select(
        "slug,title,excerpt,content_html,content,cover_image_url,cover_image,meta_title,meta_description,published_at,updated_at,status"
      )
      .eq("slug", slug)
      .limit(1)
      .maybeSingle<StoryRow>();

    if (baseErr) return err(`Query error: ${baseErr.message}`);

    if (!baseStory) {
      return new Response(notFoundHtml(origin), {
        status: 404,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      });
    }

    if ((baseStory.status || "").toLowerCase() !== "published") {
      return new Response(notFoundHtml(origin), {
        status: 404,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    }

    // PASS 2: optional story columns
    let relatedLocalitySlug: string | null = null;
    let relatedCategorySlug: string | null = null;
    let tags: string[] | null = null;

    {
      const { data: optStory, error: optErr } = await supabase
        .from("stories")
        .select("related_locality_slug,related_category_slug,tags")
        .eq("slug", slug)
        .limit(1)
        .maybeSingle<any>();

      if (!optErr && optStory) {
        relatedLocalitySlug = normalizeSlug(optStory.related_locality_slug);
        relatedCategorySlug = normalizeSlug(optStory.related_category_slug);
        tags = tryParseTags(optStory.tags);
      }
    }

    // ---------- Related Events (3-stage fallback; matches your schema) ----------
    let relatedEvents: RelatedEvent[] = [];
    let relatedEventsMode: "upcoming" | "recent" | "any" | "none" = "none";

    const localityLabel = relatedLocalitySlug ? humanizeSlug(relatedLocalitySlug) : null;

    if (relatedLocalitySlug) {
      const nowIso = new Date().toISOString();

      // 1) Upcoming (future)
      const { data: upcoming, error: upErr } = await supabase
        .from("events")
        .select("slug,title,start_date,locality,venue_name,category,status")
        .eq("status", "published")
        .eq("locality", relatedLocalitySlug)
        .gte("start_date", nowIso)
        .order("start_date", { ascending: true })
        .limit(3);

      if (!upErr && Array.isArray(upcoming) && upcoming.length > 0) {
        relatedEvents = upcoming as any;
        relatedEventsMode = "upcoming";
      } else {
        // 2) Recent past (last 365 days)
        const oneYearAgo = isoDaysAgo(365);

        const { data: recent, error: recErr } = await supabase
          .from("events")
          .select("slug,title,start_date,locality,venue_name,category,status")
          .eq("status", "published")
          .eq("locality", relatedLocalitySlug)
          .gte("start_date", oneYearAgo)
          .lt("start_date", nowIso)
          .order("start_date", { ascending: false })
          .limit(3);

        if (!recErr && Array.isArray(recent) && recent.length > 0) {
          relatedEvents = recent as any;
          relatedEventsMode = "recent";
        } else {
          // 3) Final fallback: ANY published events for locality (handles NULL start_date too)
          const { data: anyEv, error: anyErr } = await supabase
            .from("events")
            .select("slug,title,start_date,locality,venue_name,category,status,updated_at")
            .eq("status", "published")
            .eq("locality", relatedLocalitySlug)
            .order("start_date", { ascending: false, nullsFirst: false })
            .order("updated_at", { ascending: false })
            .limit(3);

          if (!anyErr && Array.isArray(anyEv) && anyEv.length > 0) {
            relatedEvents = anyEv as any;
            relatedEventsMode = "any";
          }
        }
      }
    }

    // ---------- Related Stories by tags ----------
    let relatedStories: Array<{ slug: string; title: string }> = [];
    if (tags && tags.length) {
      const { data: rs, error: rsErr } = await supabase
        .from("stories")
        .select("slug,title,status,published_at")
        .contains("tags", tags)
        .neq("slug", slug)
        .order("published_at", { ascending: false })
        .limit(3);

      if (!rsErr && Array.isArray(rs)) {
        relatedStories = (rs as any[])
          .filter((r) => String(r.status || "").toLowerCase() === "published")
          .map((r) => ({ slug: String(r.slug), title: String(r.title) }));
      }
    }

    // ---------- SEO/meta ----------
    const title = (baseStory.meta_title?.trim() || baseStory.title).trim();
    const description =
      (baseStory.meta_description?.trim() || baseStory.excerpt?.trim() || "").trim();

    const ogImage =
      baseStory.cover_image_url || baseStory.cover_image || `${origin}/og-default.png`;

    const publishedISO = baseStory.published_at
      ? new Date(baseStory.published_at).toISOString()
      : null;

    const updatedISO = new Date(
      baseStory.updated_at || baseStory.published_at || Date.now()
    ).toISOString();

    const keywordList = (tags && tags.length ? tags : [])
      .map((t) => String(t).trim())
      .filter(Boolean)
      .slice(0, 12);

    const articleSection = relatedCategorySlug ? humanizeSlug(relatedCategorySlug) : "Culture";

    const articleLd: any = {
      "@context": "https://schema.org",
      "@type": "Article",
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      headline: baseStory.title,
      description: description || undefined,
      image:
        baseStory.cover_image_url || baseStory.cover_image
          ? [baseStory.cover_image_url || baseStory.cover_image]
          : undefined,
      datePublished: publishedISO || undefined,
      dateModified: updatedISO,
      articleSection,
      keywords: keywordList.length ? keywordList.join(", ") : undefined,
      about: { "@type": "Place", name: "Jaipur" },
      isPartOf: { "@type": "WebSite", name: "JaipurCircle", url: origin },
      publisher: {
        "@type": "Organization",
        name: "JaipurCircle",
        logo: { "@type": "ImageObject", url: `${origin}/logo.png` },
      },
    };

    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
        { "@type": "ListItem", position: 2, name: "Stories", item: `${origin}/stories/` },
        { "@type": "ListItem", position: 3, name: baseStory.title, item: canonical },
      ],
    };

    const relatedEventsLd =
      relatedEvents.length > 0
        ? {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: localityLabel ? `Events in ${localityLabel}` : "Events in Jaipur",
            itemListElement: relatedEvents.map((e, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${origin}/events/${e.slug}`,
              name: e.title || undefined,
            })),
          }
        : null;

    const bodyHtml =
      baseStory.content_html && baseStory.content_html.trim()
        ? baseStory.content_html
        : baseStory.content || "";

    const safeTitle = escapeHtml(baseStory.title);

    const relatedHeading =
      relatedEventsMode === "upcoming"
        ? "Related Upcoming Events"
        : relatedEventsMode === "recent"
        ? "Related Recent Events"
        : "Related Events";

    const relatedEventsHtml =
      relatedEvents.length > 0
        ? `
<div class="rel">
  <h3>${relatedHeading}${localityLabel ? ` in ${escapeHtml(localityLabel)}` : ""}</h3>
  <ul>
    ${relatedEvents
      .map((e) => {
        const t = e.title ? escapeHtml(e.title) : "Event";
        const when = e.start_date
          ? new Date(e.start_date).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })
          : "";
        const meta = [when, e.venue_name ? escapeHtml(e.venue_name) : ""]
          .filter(Boolean)
          .join(" · ");
        return `<li><a href="/events/${escapeHtml(e.slug)}">${t}</a>${
          meta ? ` <span style="opacity:.75;font-size:13px">(${meta})</span>` : ""
        }</li>`;
      })
      .join("")}
  </ul>
  <div class="rel-links">
    <a href="/events/">Browse all events</a>
    ${
      relatedLocalitySlug
        ? ` · <a href="/jaipur/${escapeHtml(relatedLocalitySlug)}">Explore ${escapeHtml(
            localityLabel || "this locality"
          )}</a>`
        : ""
    }
  </div>
</div>`
        : `
<div class="rel">
  <h3>Explore Jaipur</h3>
  <div class="rel-links">
    <a href="/events/">Upcoming events</a> · <a href="/stories/">More stories</a> · <a href="/jaipur/">Localities</a>
  </div>
</div>`;

    const relatedStoriesHtml =
      relatedStories.length > 0
        ? `
<div class="rel">
  <h3>Related Stories</h3>
  <ul>
    ${relatedStories
      .map((s) => `<li><a href="/stories/${escapeHtml(s.slug)}">${escapeHtml(s.title)}</a></li>`)
      .join("")}
  </ul>
</div>`
        : "";

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  ${description ? `<meta name="description" content="${escapeHtml(description)}" />` : ""}
  <link rel="canonical" href="${canonical}" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  ${description ? `<meta property="og:description" content="${escapeHtml(description)}" />` : ""}
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${ogImage}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  ${description ? `<meta name="twitter:description" content="${escapeHtml(description)}" />` : ""}
  <meta name="twitter:image" content="${ogImage}" />

  ${jsonLd(articleLd)}
  ${jsonLd(breadcrumbLd)}
  ${relatedEventsLd ? jsonLd(relatedEventsLd) : ""}

  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:0;color:#111;background:#fff}
    .wrap{max-width:860px;margin:0 auto;padding:24px 16px 56px}
    .crumbs{font-size:13px;opacity:.75;margin:6px 0 18px}
    h1{font-size:36px;line-height:1.15;margin:10px 0 10px}
    .meta{font-size:14px;opacity:.75;margin-bottom:18px}
    .cover{width:100%;height:auto;border-radius:14px;margin:12px 0 22px}
    .content{font-size:18px;line-height:1.7}
    .content img{max-width:100%;height:auto;border-radius:12px}
    .content a{color:inherit;text-decoration:underline}
    .rel{margin-top:34px;border-top:1px solid #eee;padding-top:18px}
    .rel h3{margin:0 0 10px}
    .rel ul{margin:8px 0 0;padding-left:18px}
    .rel li{margin:6px 0}
    .rel-links{margin-top:10px;font-size:14px;opacity:.8}
    .rel-links a{color:inherit}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="crumbs"><a href="/">Home</a> / <a href="/stories/">Stories</a> / ${safeTitle}</div>

    <div id="ssr-prerender">
      <article>
        <h1>${safeTitle}</h1>
        <div class="meta">
          ${publishedISO ? new Date(publishedISO).toLocaleDateString("en-IN", { year:"numeric", month:"short", day:"2-digit" }) : ""}
        </div>

        ${(baseStory.cover_image_url || baseStory.cover_image) ? `<img class="cover" src="${baseStory.cover_image_url || baseStory.cover_image}" alt="${safeTitle}" />` : ""}

        <div class="content">
          ${bodyHtml}
        </div>

        ${relatedEventsHtml}
        ${relatedStoriesHtml}
      </article>
    </div>
  </div>

  <div id="root" style="display:none"></div>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",

        // 🔎 Debug headers (safe to keep temporarily; remove later if you want)
        "x-jc-related-locality": relatedLocalitySlug || "",
        "x-jc-related-events": String(relatedEvents.length),
        "x-jc-related-events-mode": relatedEventsMode,
      },
    });
  } catch (e) {
    return err(`Server error: ${e?.message || String(e)}`);
  }
});