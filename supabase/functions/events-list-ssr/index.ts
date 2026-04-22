// supabase/functions/events-list-ssr/index.ts
// GOLD STANDARD - Events Hub with Date Filters, Categories, and Smart Routing

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type EventRow = {
  id: string;
  title: string | null;
  slug: string | null;
  start_date: string | null;
  end_date?: string | null;
  cover_image?: string | null;
  is_free?: boolean | null;
  ticket_price?: number | null;
  category?: string | null;
  locality?: string | null;
  venue_name?: string | null;
  venue_slug?: string | null;
  performer_name?: string | null;
};

const BASE_URL = "https://www.jaipurcircle.com";
const SITE_NAME = "JaipurCircle";

// ============================================
// ROUTE PATTERNS
// ============================================
type RoutePattern = 
  | { type: "hub" }
  | { type: "today" }
  | { type: "tomorrow" }
  | { type: "weekend" }
  | { type: "this-week" }
  | { type: "next-month" }
  | { type: "category"; category: string }
  | { type: "category-locality"; category: string; locality: string }
  | { type: "near-me" };

// ============================================
// DATE UTILITIES (IST)
// ============================================
function getTodayIST(): Date {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + istOffset);
}

function formatDateForFilter(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDateRanges() {
  const today = getTodayIST();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  
  // Weekend: Friday to Sunday
  const currentDay = today.getDay();
  const daysUntilFriday = (5 - currentDay + 7) % 7;
  const weekendStart = new Date(today.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
  const weekendEnd = new Date(weekendStart.getTime() + 2 * 24 * 60 * 60 * 1000);
  
  // This week: next 7 days
  const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // Next month: 30-60 days out
  const nextMonthStart = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const nextMonthEnd = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  
  return {
    today: formatDateForFilter(today),
    tomorrow: formatDateForFilter(tomorrow),
    weekendStart: formatDateForFilter(weekendStart),
    weekendEnd: formatDateForFilter(weekendEnd),
    weekEnd: formatDateForFilter(weekEnd),
    nextMonthStart: formatDateForFilter(nextMonthStart),
    nextMonthEnd: formatDateForFilter(nextMonthEnd),
  };
}

function formatHumanDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-IN", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });
}

function formatShortDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-IN", { 
    month: "short", 
    day: "numeric" 
  });
}

// ============================================
// ROUTE PARSING
// ============================================
function parseRoute(pathname: string): RoutePattern {
  // Remove leading/trailing slashes
  const clean = pathname.replace(/^\/|\/$/g, '');
  const parts = clean.split('/').filter(Boolean);
  
  // /events
  if (parts.length === 1 && parts[0] === 'events') {
    return { type: "hub" };
  }
  
  // /events/today
  if (parts.length === 2 && parts[0] === 'events' && parts[1] === 'today') {
    return { type: "today" };
  }
  
  // /events/tomorrow
  if (parts.length === 2 && parts[0] === 'events' && parts[1] === 'tomorrow') {
    return { type: "tomorrow" };
  }
  
  // /events/this-weekend
  if (parts.length === 2 && parts[0] === 'events' && parts[1] === 'this-weekend') {
    return { type: "weekend" };
  }
  
  // /events/this-week
  if (parts.length === 2 && parts[0] === 'events' && parts[1] === 'this-week') {
    return { type: "this-week" };
  }
  
  // /events/next-month
  if (parts.length === 2 && parts[0] === 'events' && parts[1] === 'next-month') {
    return { type: "next-month" };
  }
  
  // /events/near-me
  if (parts.length === 2 && parts[0] === 'events' && parts[1] === 'near-me') {
    return { type: "near-me" };
  }
  
  // /events/category/[category]
  if (parts.length === 3 && parts[0] === 'events' && parts[1] === 'category') {
    return { type: "category", category: parts[2] };
  }
  
  // /events/[category]/[locality]
  if (parts.length === 3 && parts[0] === 'events') {
    return { type: "category-locality", category: parts[1], locality: parts[2] };
  }
  
  // /events/[category]
  if (parts.length === 2 && parts[0] === 'events') {
    return { type: "category", category: parts[1] };
  }
  
  return { type: "hub" };
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function titleCase(str: string): string {
  return str
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ============================================
// DATABASE QUERIES
// ============================================
async function fetchEventsByDateRange(
  supabase: any,
  startDate: string,
  endDate: string,
  limit: number = 50
): Promise<EventRow[]> {
  const { data } = await supabase
    .from("events")
    .select("id,title,slug,start_date,end_date,cover_image,is_free,ticket_price,category,locality,venue_name,venue_slug,performer_name")
    .eq("status", "published")
    .gte("start_date", startDate)
    .lte("start_date", endDate)
    .order("start_date", { ascending: true })
    .limit(limit);
  
  return data || [];
}

async function fetchEventsByCategory(
  supabase: any,
  category: string,
  limit: number = 50
): Promise<EventRow[]> {
  const today = getDateRanges().today;
  const { data } = await supabase
    .from("events")
    .select("id,title,slug,start_date,end_date,cover_image,is_free,ticket_price,category,locality,venue_name,venue_slug,performer_name")
    .eq("status", "published")
    .eq("category", category)
    .gte("start_date", today)
    .order("start_date", { ascending: true })
    .limit(limit);
  
  return data || [];
}

async function fetchEventsByCategoryAndLocality(
  supabase: any,
  category: string,
  locality: string,
  limit: number = 50
): Promise<EventRow[]> {
  const today = getDateRanges().today;
  const { data } = await supabase
    .from("events")
    .select("id,title,slug,start_date,end_date,cover_image,is_free,ticket_price,category,locality,venue_name,venue_slug,performer_name")
    .eq("status", "published")
    .eq("category", category)
    .eq("locality", locality)
    .gte("start_date", today)
    .order("start_date", { ascending: true })
    .limit(limit);
  
  return data || [];
}

async function fetchUpcomingEvents(
  supabase: any,
  limit: number = 50
): Promise<EventRow[]> {
  const today = getDateRanges().today;
  const { data } = await supabase
    .from("events")
    .select("id,title,slug,start_date,end_date,cover_image,is_free,ticket_price,category,locality,venue_name,venue_slug,performer_name")
    .eq("status", "published")
    .gte("start_date", today)
    .order("start_date", { ascending: true })
    .limit(limit);
  
  return data || [];
}

// ============================================
// SCHEMA GENERATION
// ============================================
function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url,
    })),
  };
}

function generateItemListSchema(events: EventRow[], title: string, canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": title,
    "itemListOrder": "https://schema.org/ItemListOrderAscending",
    "numberOfItems": events.length,
    "itemListElement": events.slice(0, 20).map((event, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${BASE_URL}/events/${event.slug}`,
      "name": event.title,
    })),
  };
}

function generateEventSearchActionSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${BASE_URL}/events?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  };
}

// ============================================
// HTML RENDERING
// ============================================
function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderEventCard(event: EventRow): string {
  const date = event.start_date ? formatShortDate(event.start_date) : "Date TBA";
  const price = event.is_free 
    ? '<span class="price-free">FREE</span>' 
    : event.ticket_price 
      ? `<span class="price-paid">₹${event.ticket_price}</span>` 
      : '<span class="price-tba">Price TBA</span>';
  
  const performerHtml = event.performer_name 
    ? `<div class="event-performer">🎤 ${escapeHtml(event.performer_name)}</div>` 
    : '';
  
  return `
    <a href="/events/${escapeHtml(event.slug || '')}" class="event-card">
      ${event.cover_image 
        ? `<img src="${escapeHtml(event.cover_image)}" alt="${escapeHtml(event.title || 'Event')}" loading="lazy" class="event-image">` 
        : '<div class="event-image-placeholder">🎉</div>'}
      <div class="event-details">
        <h3 class="event-title">${escapeHtml(event.title || 'Untitled Event')}</h3>
        ${performerHtml}
        <div class="event-meta">
          <span class="event-date">📅 ${date}</span>
          <span class="event-location">📍 ${escapeHtml(event.venue_name || event.locality || 'Jaipur')}</span>
        </div>
        <div class="event-price">${price}</div>
      </div>
    </a>
  `;
}

function renderCategoryFilter(currentCategory?: string) {
  const categories = [
    { slug: "comedy", name: "Comedy Shows", icon: "😂" },
    { slug: "music", name: "Concerts & Music", icon: "🎵" },
    { slug: "workshop", name: "Workshops", icon: "🔧" },
    { slug: "theatre", name: "Theatre & Plays", icon: "🎭" },
    { slug: "festival", name: "Festivals", icon: "🎪" },
    { slug: "free", name: "Free Events", icon: "🎟️" },
  ];
  
  return `
    <div class="category-filters">
      <a href="/events" class="category-pill ${!currentCategory ? 'active' : ''}">All Events</a>
      ${categories.map(cat => `
        <a href="/events/category/${cat.slug}" class="category-pill ${currentCategory === cat.slug ? 'active' : ''}">
          ${cat.icon} ${cat.name}
        </a>
      `).join('')}
    </div>
  `;
}

function renderTimeFilters(routeType: string) {
  const filters = [
    { type: "today", label: "Today", icon: "☀️" },
    { type: "tomorrow", label: "Tomorrow", icon: "🌅" },
    { type: "weekend", label: "This Weekend", icon: "🎉" },
    { type: "this-week", label: "This Week", icon: "📅" },
    { type: "next-month", label: "Next Month", icon: "📆" },
  ];
  
  return `
    <div class="time-filters">
      ${filters.map(filter => `
        <a href="/events/${filter.type}" class="time-pill ${routeType === filter.type ? 'active' : ''}">
          ${filter.icon} ${filter.label}
        </a>
      `).join('')}
    </div>
  `;
}

function buildSSRHTML(
  route: RoutePattern,
  events: EventRow[],
  title: string,
  description: string,
  canonicalUrl: string
): string {
  const dateRanges = getDateRanges();
  
  // Determine if this is a time-filtered page
  let dateBadge = "";
  if (route.type === "today") dateBadge = `<div class="date-badge">🔥 Happening Today - ${formatHumanDate(dateRanges.today)}</div>`;
  if (route.type === "tomorrow") dateBadge = `<div class="date-badge">🌅 Tomorrow - ${formatHumanDate(dateRanges.tomorrow)}</div>`;
  if (route.type === "weekend") dateBadge = `<div class="date-badge">🎉 This Weekend - ${formatShortDate(dateRanges.weekendStart)} to ${formatShortDate(dateRanges.weekendEnd)}</div>`;
  if (route.type === "this-week") dateBadge = `<div class="date-badge">📅 Next 7 Days</div>`;
  if (route.type === "next-month") dateBadge = `<div class="date-badge">📆 Coming Next Month</div>`;
  
  const eventsHtml = events.length > 0 
    ? `<div class="events-grid">${events.map(renderEventCard).join('')}</div>`
    : `<div class="no-events">
        <div class="no-events-icon">🎫</div>
        <h3>No events found</h3>
        <p>Check back soon for new events in this category.</p>
        <a href="/events" class="browse-link">Browse all events →</a>
       </div>`;
  
  const categoryFilter = renderCategoryFilter(
    route.type === "category" ? route.category : undefined
  );
  
  const timeFilter = renderTimeFilters(route.type);
  
  const criticalCSS = `
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#f8fafc;line-height:1.5}
      .events-page{max-width:1200px;margin:0 auto}
      .hero{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:clamp(2rem,5vw,3rem);text-align:center}
      .hero h1{font-size:clamp(1.8rem,6vw,2.5rem);margin-bottom:0.5rem}
      .hero p{font-size:1.125rem;opacity:0.95;max-width:600px;margin:0 auto}
      .filters-section{background:white;padding:1rem;border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:100}
      .category-filters,.time-filters{display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1rem}
      .category-pill,.time-pill{background:#f3f4f6;padding:0.5rem 1rem;border-radius:24px;text-decoration:none;color:#1f2937;font-size:0.875rem;transition:all 0.2s}
      .category-pill:hover,.time-pill:hover{background:#e5e7eb;transform:translateY(-1px)}
      .category-pill.active,.time-pill.active{background:#667eea;color:white}
      .date-badge{background:#fef3c7;color:#92400e;padding:0.5rem 1rem;border-radius:8px;margin-bottom:1rem;text-align:center;font-weight:500}
      .events-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.5rem;padding:1.5rem}
      .event-card{background:white;border-radius:16px;overflow:hidden;text-decoration:none;color:inherit;transition:transform 0.2s,box-shadow 0.2s;display:flex;flex-direction:column;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
      .event-card:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(0,0,0,0.12)}
      .event-image{width:100%;height:160px;object-fit:cover}
      .event-image-placeholder{width:100%;height:160px;background:linear-gradient(135deg,#667eea20 0%,#764ba220 100%);display:flex;align-items:center;justify-content:center;font-size:3rem}
      .event-details{padding:1rem}
      .event-title{font-size:1rem;font-weight:600;margin-bottom:0.25rem;line-height:1.4}
      .event-performer{font-size:0.75rem;color:#8b5cf6;margin-bottom:0.5rem}
      .event-meta{display:flex;gap:0.75rem;font-size:0.75rem;color:#6b7280;margin:0.5rem 0;flex-wrap:wrap}
      .event-price{margin-top:0.5rem;font-weight:700}
      .price-free{color:#10b981}
      .price-paid{color:#3b82f6}
      .price-tba{color:#6b7280}
      .no-events{text-align:center;padding:3rem;background:white;border-radius:16px;margin:1.5rem}
      .browse-link{display:inline-block;margin-top:1rem;color:#667eea;text-decoration:none}
      .stats-bar{background:#f9fafb;padding:0.75rem 1.5rem;text-align:center;font-size:0.875rem;color:#6b7280;border-bottom:1px solid #e5e7eb}
      @media (max-width:640px){.events-grid{grid-template-columns:1fr;padding:1rem}}
    </style>
  `;
  
  return `
    ${criticalCSS}
    <div class="events-page">
      <div class="hero">
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
      </div>
      <div class="filters-section">
        ${categoryFilter}
        ${timeFilter}
      </div>
      <div class="stats-bar">
        📍 ${events.length} events found • Updated daily
      </div>
      ${dateBadge}
      ${eventsHtml}
    </div>
  `;
}

// ============================================
// MAIN SERVE FUNCTION
// ============================================
serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const route = parseRoute(pathname);
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    
    const dateRanges = getDateRanges();
    let events: EventRow[] = [];
    let title = "";
    let description = "";
    let canonicalUrl = `${BASE_URL}${pathname}`;
    
    // Route handling
    switch (route.type) {
      case "today":
        events = await fetchEventsByDateRange(supabase, dateRanges.today, dateRanges.today, 50);
        title = "Events in Jaipur Today - Live Now (Updated Hourly) | JaipurCircle";
        description = "Find live events, concerts, comedy shows, and cultural programs happening today in Jaipur. Updated hourly with real-time listings.";
        break;
        
      case "tomorrow":
        events = await fetchEventsByDateRange(supabase, dateRanges.tomorrow, dateRanges.tomorrow, 50);
        title = "Events in Jaipur Tomorrow - Plan Your Day | JaipurCircle";
        description = "Discover events happening tomorrow in Jaipur. Concerts, workshops, shows, and more. Book tickets in advance.";
        break;
        
      case "weekend":
        events = await fetchEventsByDateRange(supabase, dateRanges.weekendStart, dateRanges.weekendEnd, 50);
        title = "Weekend Events in Jaipur - Friday to Sunday | JaipurCircle";
        description = "Plan your weekend with the best events, parties, and shows in Jaipur. Friday through Sunday listings with ticket info.";
        break;
        
      case "this-week":
        events = await fetchEventsByDateRange(supabase, dateRanges.today, dateRanges.weekEnd, 50);
        title = "Events in Jaipur This Week - Next 7 Days | JaipurCircle";
        description = "Browse all events happening in Jaipur over the next 7 days. Concerts, comedy, workshops, and cultural events.";
        break;
        
      case "next-month":
        events = await fetchEventsByDateRange(supabase, dateRanges.nextMonthStart, dateRanges.nextMonthEnd, 50);
        title = "Events in Jaipur Next Month - Plan Ahead | JaipurCircle";
        description = "Discover upcoming events in Jaipur for next month. Book tickets early for concerts, festivals, and shows.";
        break;
        
      case "category":
        const categoryName = titleCase(route.category);
        events = await fetchEventsByCategory(supabase, route.category, 50);
        title = `${categoryName} Events in Jaipur - Shows, Tickets & Dates | JaipurCircle`;
        description = `Find upcoming ${categoryName.toLowerCase()} events in Jaipur. Live shows, performances, and entertainment. Book tickets online.`;
        canonicalUrl = `${BASE_URL}/events/category/${route.category}`;
        break;
        
      case "category-locality":
        const catName = titleCase(route.category);
        const locName = titleCase(route.locality);
        events = await fetchEventsByCategoryAndLocality(supabase, route.category, route.locality, 50);
        title = `${catName} Events in ${locName}, Jaipur - Tickets & Dates | JaipurCircle`;
        description = `Browse ${catName.toLowerCase()} events happening in ${locName}, Jaipur. Find dates, venues, and ticket prices for upcoming shows.`;
        canonicalUrl = `${BASE_URL}/events/${route.category}/${route.locality}`;
        break;
        
      case "near-me":
        // For now, fallback to all Jaipur events
        events = await fetchUpcomingEvents(supabase, 50);
        title = "Events Near Me in Jaipur - Local Events in Your Area | JaipurCircle";
        description = "Discover events happening near your location in Jaipur. Concerts, comedy shows, and cultural events nearby.";
        break;
        
      default:
        events = await fetchUpcomingEvents(supabase, 50);
        title = "Jaipur Events Calendar 2026 - Concerts, Comedy, Workshops & Festivals | JaipurCircle";
        description = "Discover upcoming events in Jaipur: concerts, comedy shows, workshops, festivals and more. Browse by category, date, and locality. Book tickets online.";
        break;
    }
    
    // Generate schemas
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: "Home", url: BASE_URL },
      { name: "Events", url: `${BASE_URL}/events` },
    ]);
    const itemListSchema = generateItemListSchema(events, title, canonicalUrl);
    const searchActionSchema = generateEventSearchActionSchema();
    
    // Build HTML
    const ssrContent = buildSSRHTML(route, events, title, description, canonicalUrl);
    
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta name="twitter:card" content="summary_large_image" />
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(itemListSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(searchActionSchema)}</script>
</head>
<body>
  <div id="root">${ssrContent}</div>
</body>
</html>`;
    
    return new Response(fullHtml, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=0, s-maxage=900, stale-while-revalidate=86400",
      },
    });
    
  } catch (error) {
    console.error("Events SSR error:", error);
    return new Response("Service temporarily unavailable", { status: 500 });
  }
});
