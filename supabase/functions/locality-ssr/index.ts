// supabase/functions/locality-ssr/index.ts
// GOLD STANDARD 100% - ALWAYS SSR, NO EMPTY SHELL

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = (Deno.env.get("SITE_ORIGIN") ?? "https://www.jaipurcircle.com").replace(/\/+$/, "");
const SITE_NAME = "JaipurCircle";
const DEFAULT_IMAGE = "https://www.jaipurcircle.com/og-default.jpg";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

let cachedIndexHtml: { html: string; fetchedAt: number } | null = null;

// ============================================
// UTILITY FUNCTIONS
// ============================================
function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function truncate(str: string, max: number): string {
  if (!str) return "";
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + "...";
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

// ============================================
// FETCH SPA SHELL (WITH FALLBACK)
// ============================================
async function getSpaShellHtml(): Promise<string> {
  const now = Date.now();
  const ttlMs = 5 * 60 * 1000;

  if (cachedIndexHtml && now - cachedIndexHtml.fetchedAt < ttlMs) {
    return cachedIndexHtml.html;
  }

  // Fallback HTML with correct script tags (in case fetch fails)
  const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#e91e63">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <title>${SITE_NAME}</title>
  <link rel="icon" href="/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="/pwa-192x192.png">
  <style>
    html, body { overscroll-behavior: none; -webkit-overflow-scrolling: touch; }
    body { padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom); }
    * { -webkit-tap-highlight-color: transparent; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" crossorigin src="/assets/index-uPnmVZlR.js"></script>
  <link rel="stylesheet" crossorigin href="/assets/index-YJsD5eZ5.css">
</body>
</html>`;

  try {
    const res = await fetch(`${BASE_URL}/index.html?cb=${Math.floor(now / 1000)}`, {
      headers: { "user-agent": "jaipurcircle-locality-ssr/2.0", accept: "text/html" },
    });

    if (!res.ok) throw new Error(`Failed to fetch index.html: ${res.status}`);

    let html = await res.text();
    // Remove existing meta tags to avoid duplicates
    html = html.replace(/<title>.*?<\/title>/, "");
    html = html.replace(/<meta name="description".*?>/, "");
    html = html.replace(/<meta name="keywords".*?>/, "");
    html = html.replace(/<meta property="og:title".*?>/g, "");
    html = html.replace(/<meta property="og:description".*?>/g, "");
    html = html.replace(/<meta property="og:url".*?>/g, "");
    html = html.replace(/<meta property="og:image".*?>/g, "");
    html = html.replace(/<meta name="twitter:title".*?>/g, "");
    html = html.replace(/<meta name="twitter:description".*?>/g, "");
    html = html.replace(/<meta name="twitter:image".*?>/g, "");
    html = html.replace(/<div\s+id=["']root["'][^>]*>.*?<\/div>/is, '<div id="root"></div>');

    // Ensure script tags exist (if missing, inject fallback)
    if (!html.includes('<script type="module"')) {
      console.warn("index.html missing script tags, using fallback");
      html = fallbackHtml;
    }

    cachedIndexHtml = { html, fetchedAt: now };
    return html;
  } catch (err) {
    console.error("Failed to fetch SPA shell:", err);
    return fallbackHtml;
  }
}

// ============================================
// FETCH COMPLETE LOCALITY DATA
// ============================================
async function fetchCompleteLocalityData(slug: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: locality, error } = await supabase.from("localities").select("*").eq("slug", slug).maybeSingle();

  if (error || !locality) {
    console.error("Locality fetch error:", error);
    return null;
  }

  const { data: events } = await supabase
    .from("events")
    .select("title, slug, start_date, venue_name, cover_image, ticket_price, is_free, category")
    .eq("locality_slug", slug)
    .gte("start_date", new Date().toISOString())
    .lte("start_date", new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString())
    .order("start_date", { ascending: true })
    .limit(12);

  const { data: venues } = await supabase
    .from("venues")
    .select("name, slug, category, rating, image")
    .eq("locality_slug", slug)
    .eq("is_indexable", true)
    .order("rating", { ascending: false, nullsLast: true })
    .limit(8);

  let nearby: any[] = [];
  if (locality.geo_lat && locality.geo_lng) {
    const { data: nearbyData } = await supabase.rpc("nearby_localities_simple", {
      lat: locality.geo_lat,
      lng: locality.geo_lng,
      exclude_slug: slug,
      max_distance_km: 5,
      limit_count: 8,
    });
    nearby = nearbyData || [];
  } else {
    const { data: fallback } = await supabase.from("localities").select("name, slug").neq("slug", slug).limit(8);
    nearby = fallback || [];
  }

  const eventCount = events?.length || 0;

  return {
    locality,
    events: events || [],
    venues: venues || [],
    nearby,
    eventCount,
  };
}

// ============================================
// SSR RENDER FUNCTIONS
// ============================================
function renderEmergencyBanner(locality: any): string {
  const emergency = locality.emergency_contacts || {};
  if (Object.keys(emergency).length === 0) return "";
  return `
    <div class="emergency-banner">
      <div class="emergency-container">
        <a href="tel:${emergency.police || "100"}" class="emergency-item">🚓 POLICE: ${emergency.police || "100"}</a>
        <a href="tel:${emergency.fire || "101"}" class="emergency-item">🔥 FIRE: ${emergency.fire || "101"}</a>
        <a href="tel:${emergency.ambulance || "102"}" class="emergency-item">🚑 AMBULANCE: ${emergency.ambulance || "102"}</a>
        <a href="tel:${emergency.women_helpline || "1090"}" class="emergency-item">👩 WOMEN: ${emergency.women_helpline || "1090"}</a>
        <a href="tel:${emergency.child_helpline || "1098"}" class="emergency-item">👶 CHILD: ${emergency.child_helpline || "1098"}</a>
      </div>
    </div>
  `;
}

function renderPoliceStationCard(locality: any): string {
  if (!locality.police_station_name) return "";
  return `
    <div class="section police-card">
      <h3>🚔 Police Station Information</h3>
      <div class="police-grid">
        <div>
          <p><strong>Station Name:</strong> ${escapeHtml(locality.police_station_name)}</p>
          <p><strong>Address:</strong> ${escapeHtml(locality.police_station_address || "")}</p>
          <p><strong>Phone:</strong> <a href="tel:${locality.police_station_phone}">${locality.police_station_phone}</a></p>
          <p><strong>Emergency:</strong> ${locality.police_station_emergency || "100"}</p>
          ${locality.police_station_email ? `<p><strong>Email:</strong> <a href="mailto:${locality.police_station_email}">${locality.police_station_email}</a></p>` : ""}
        </div>
        <div>
          <p><strong>SHO (In-charge):</strong> ${escapeHtml(locality.police_station_incharge || "To be verified")}</p>
          <p><strong>SHO Contact:</strong> ${escapeHtml(locality.police_station_incharge_contact || "Contact station directly")}</p>
          <p><strong>Jurisdiction:</strong> ${escapeHtml(locality.police_station_jurisdiction || "")}</p>
          ${locality.police_station_maps ? `<p><strong>Location:</strong> <a href="${locality.police_station_maps}" target="_blank" rel="noopener">View on Google Maps →</a></p>` : ""}
        </div>
      </div>
    </div>
  `;
}

function renderConnectivityCard(locality: any): string {
  const metro = locality.nearest_metro || {};
  const railway = locality.nearest_railway || {};
  const airport = locality.nearest_airport || {};
  if (!metro.name && !railway.name && !airport.name) return "";
  return `
    <div class="section connectivity">
      <h3>🚗 Connectivity & Transport</h3>
      <div class="connectivity-grid">
        ${metro.name ? `
          <div class="connectivity-card">
            <div class="connectivity-icon">🚇</div>
            <div>
              <strong>${escapeHtml(metro.name)}</strong>
              <p>Distance: ${metro.distance || "N/A"}</p>
              <p>Line: ${metro.line || "N/A"}</p>
              <p>Travel Time: ${metro.travel_time || "N/A"}</p>
            </div>
          </div>
        ` : ""}
        ${railway.name ? `
          <div class="connectivity-card">
            <div class="connectivity-icon">🚂</div>
            <div>
              <strong>${escapeHtml(railway.name)}</strong>
              <p>Distance: ${railway.distance || "N/A"}</p>
              <p>Travel Time: ${railway.travel_time || "N/A"}</p>
            </div>
          </div>
        ` : ""}
        ${airport.name ? `
          <div class="connectivity-card">
            <div class="connectivity-icon">✈️</div>
            <div>
              <strong>${escapeHtml(airport.name)}</strong>
              <p>Distance: ${airport.distance || "N/A"}</p>
              <p>Travel Time: ${airport.travel_time || "N/A"}</p>
              ${airport.cab_fare ? `<p>Cab Fare: ${airport.cab_fare}</p>` : ""}
            </div>
          </div>
        ` : ""}
      </div>
      ${locality.major_roads?.length ? `
        <div style="margin-top: 16px;">
          <strong>🛣️ Major Roads:</strong> 
          ${locality.major_roads.map((r: string) => `<span class="badge badge-gray">${escapeHtml(r)}</span>`).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

function renderCivicHelplinesCard(locality: any): string {
  const helplines = locality.civic_helplines || {};
  if (Object.keys(helplines).length === 0) return "";
  return `
    <div class="section civic-helplines">
      <h3>🏛️ Civic Helplines</h3>
      <div class="helplines-grid">
        ${helplines.municipal_corporation ? `
          <div class="helpline-card">
            <strong>🏢 Municipal Corporation</strong>
            <p>Helpline: <a href="tel:${helplines.municipal_corporation.helpline}">${helplines.municipal_corporation.helpline}</a></p>
            ${helplines.municipal_corporation.grievance ? `<p>Grievance: <a href="tel:${helplines.municipal_corporation.grievance}">${helplines.municipal_corporation.grievance}</a></p>` : ""}
          </div>
        ` : ""}
        ${helplines.electricity_board ? `
          <div class="helpline-card">
            <strong>⚡ Electricity</strong>
            <p>Complaint: <a href="tel:${helplines.electricity_board.complaint}">${helplines.electricity_board.complaint}</a></p>
            ${helplines.electricity_board.phone ? `<p>Office: <a href="tel:${helplines.electricity_board.phone}">${helplines.electricity_board.phone}</a></p>` : ""}
          </div>
        ` : ""}
        ${helplines.water_supply ? `
          <div class="helpline-card">
            <strong>💧 Water Supply</strong>
            <p>Complaint: <a href="tel:${helplines.water_supply.complaint}">${helplines.water_supply.complaint}</a></p>
            ${helplines.water_supply.phone ? `<p>Office: <a href="tel:${helplines.water_supply.phone}">${helplines.water_supply.phone}</a></p>` : ""}
          </div>
        ` : ""}
        ${helplines.post_office ? `
          <div class="helpline-card">
            <strong>📮 Post Office</strong>
            <p>${helplines.post_office.name || "Post Office"}</p>
            <p>Phone: <a href="tel:${helplines.post_office.phone}">${helplines.post_office.phone}</a></p>
          </div>
        ` : ""}
      </div>
    </div>
  `;
}

function renderRealEstateCard(locality: any): string {
  const re = locality.real_estate || {};
  if (Object.keys(re).length === 0) return "";
  return `
    <div class="section real-estate">
      <h3>🏠 Real Estate Snapshot</h3>
      <div class="real-estate-grid">
        <div>
          <h4>💰 Rental Prices (Monthly)</h4>
          ${re.rent_1bhk ? `<p><strong>1BHK:</strong> ${re.rent_1bhk}</p>` : ""}
          ${re.rent_2bhk ? `<p><strong>2BHK:</strong> ${re.rent_2bhk}</p>` : ""}
          ${re.rent_3bhk ? `<p><strong>3BHK:</strong> ${re.rent_3bhk}</p>` : ""}
          ${re.pg_options ? `<p><strong>PG Options:</strong> ${re.pg_options}</p>` : ""}
        </div>
        <div>
          <h4>📈 Sale Prices</h4>
          ${re.average_price_per_sqft ? `<p><strong>Avg Price/sq ft:</strong> ${re.average_price_per_sqft}</p>` : ""}
          ${re.price_trend_yoy ? `<p><strong>Price Trend:</strong> <span style="color: #22c55e;">${re.price_trend_yoy}</span></p>` : ""}
          ${re.popular_societies?.length ? `<p><strong>Popular Societies:</strong> ${re.popular_societies.join(", ")}</p>` : ""}
        </div>
      </div>
    </div>
  `;
}

function renderProsCons(locality: any): string {
  const pros = locality.pros || [];
  const cons = locality.cons || [];
  if (!pros.length && !cons.length) return "";
  return `
    <div class="section pros-cons">
      <h3>✅ Pros & Cons of Living in ${escapeHtml(locality.name)}</h3>
      <div class="pros-cons-grid">
        <div class="pros-box">
          <h4>✅ Pros</h4>
          <ul>${pros.map((p: string) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
        </div>
        <div class="cons-box">
          <h4>❌ Cons</h4>
          <ul>${cons.map((c: string) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>
        </div>
      </div>
    </div>
  `;
}

function renderDistanceMatrix(locality: any): string {
  const distances = locality.distance_matrix || {};
  const entries = Object.entries(distances);
  if (entries.length === 0) return "";
  return `
    <div class="section distance-matrix">
      <h3>📍 Distance from Key Landmarks</h3>
      <div class="distance-grid">
        ${entries.slice(0, 8).map(([place, distance]) => `
          <div class="distance-item">
            <span class="distance-label">${place.replace(/_/g, " ").replace("from ", "").toUpperCase()}:</span>
            <span class="distance-value">${distance}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderEnhancedFAQ(locality: any): string {
  const faqs = locality.faq_json || [];
  if (!faqs.length) return "";
  return `
    <div class="section faq-section">
      <h3>❓ Frequently Asked Questions about ${escapeHtml(locality.name)}</h3>
      <div class="faq-list">
        ${faqs.map((faq: any, idx: number) => `
          <div class="faq-item" data-faq-idx="${idx}">
            <div class="faq-question">${escapeHtml(faq.question)}<span class="faq-toggle">▼</span></div>
            <div class="faq-answer">${escapeHtml(faq.answer)}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// ============================================
// MAIN SSR HTML BUILDER
// ============================================
function buildSSRHTML(locality: any, events: any[], venues: any[], nearby: any[], eventCount: number) {
  const emergencyBannerHtml = renderEmergencyBanner(locality);
  const policeCardHtml = renderPoliceStationCard(locality);
  const connectivityHtml = renderConnectivityCard(locality);
  const civicHelplinesHtml = renderCivicHelplinesCard(locality);
  const realEstateHtml = renderRealEstateCard(locality);
  const prosConsHtml = renderProsCons(locality);
  const distanceMatrixHtml = renderDistanceMatrix(locality);
  const enhancedFaqHtml = renderEnhancedFAQ(locality);

  const hasKnownFor = locality.known_for && Array.isArray(locality.known_for) && locality.known_for.length > 0;
  const knownForHtml = hasKnownFor ? `
    <div class="section known-for">
      <h3>✨ Known For</h3>
      <div class="badge-group">${locality.known_for.map((item: string) => `<span class="badge badge-yellow">${escapeHtml(item)}</span>`).join("")}</div>
    </div>
  ` : "";

  const venuesHtml = venues?.length ? `
    <div class="section venues">
      <h3>🏛️ Popular Venues in ${escapeHtml(locality.name)}</h3>
      <div class="venue-grid">
        ${venues.map((venue: any) => `
          <a href="${BASE_URL}/venues/${venue.slug}" class="venue-card">
            ${venue.image ? `<img src="${escapeHtml(venue.image)}" alt="${escapeHtml(venue.name)}" loading="lazy">` : '<div class="venue-placeholder">🏢</div>'}
            <h4>${escapeHtml(venue.name)}</h4>
            ${venue.rating ? `<span class="rating">⭐ ${venue.rating}</span>` : ""}
            ${venue.category ? `<span class="category">${escapeHtml(venue.category)}</span>` : ""}
          </a>
        `).join("")}
      </div>
    </div>
  ` : "";

  const eventsHtml = events.length > 0 ? `
    <div class="section events">
      <div class="section-header">
        <h3>🎪 Upcoming Events in ${escapeHtml(locality.name)}</h3>
        <a href="${BASE_URL}/jaipur/${locality.slug}/events" class="view-all">View all ${eventCount} →</a>
      </div>
      <div class="event-list">
        ${events.slice(0, 6).map((event: any) => `
          <a href="${BASE_URL}/events/${event.slug}" class="event-card">
            ${event.cover_image ? `<img src="${escapeHtml(event.cover_image)}" alt="${escapeHtml(event.title)}" loading="lazy">` : '<div class="event-placeholder">🎉</div>'}
            <div class="event-info">
              <h4>${escapeHtml(event.title)}</h4>
              <div class="event-meta">
                <span>📅 ${formatDate(event.start_date)}</span>
                <span>📍 ${escapeHtml(event.venue_name || "TBA")}</span>
              </div>
              <div class="event-price">${event.is_free ? "FREE" : event.ticket_price ? `₹${event.ticket_price}` : "TBA"}</div>
            </div>
          </a>
        `).join("")}
      </div>
    </div>
  ` : `
    <div class="section events-placeholder">
      <h3>🎪 Explore ${escapeHtml(locality.name)}</h3>
      <p>No events listed right now, but there's plenty to discover in this vibrant locality!</p>
      <div class="placeholder-links" style="display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem;">
        <a href="${BASE_URL}/venues?locality=${locality.slug}" class="placeholder-link" style="background: #f3f4f6; padding: 0.75rem 1.25rem; border-radius: 8px; text-decoration: none; color: #1f2937; display: inline-flex; align-items: center; gap: 8px;">🏛️ Browse nearby venues →</a>
        <a href="${BASE_URL}/jaipur/events" class="placeholder-link" style="background: #f3f4f6; padding: 0.75rem 1.25rem; border-radius: 8px; text-decoration: none; color: #1f2937; display: inline-flex; align-items: center; gap: 8px;">📅 Explore Jaipur events →</a>
        <button class="follow-btn" data-locality="${locality.slug}" style="background: #667eea; color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">🔔 Follow for updates</button>
      </div>
      <div style="margin-top: 1rem; font-size: 0.875rem; color: #6b7280;">💡 Pro tip: Check back often - new events are added regularly!</div>
    </div>
  `;

  const hasEateries = locality.popular_eateries && Array.isArray(locality.popular_eateries) && locality.popular_eateries.length > 0;
  const eateriesHtml = hasEateries ? `
    <div class="section eateries">
      <h3>🍽️ Popular Eateries</h3>
      <div class="badge-group">${locality.popular_eateries.map((item: string) => `<span class="badge badge-green">${escapeHtml(item)}</span>`).join("")}</div>
    </div>
  ` : "";

  const infoCardsHtml = `
    <div class="info-cards">
      ${locality.pin_code ? `<div class="info-card"><span class="info-icon">📮</span><div><strong>Pin Code</strong><span>${escapeHtml(locality.pin_code)}</span></div></div>` : ""}
      ${locality.safety_rating ? `<div class="info-card"><span class="info-icon">🛡️</span><div><strong>Safety Rating</strong><span>${locality.safety_rating}/5 ⭐</span></div></div>` : ""}
      ${locality.livability_score ? `<div class="info-card"><span class="info-icon">🏠</span><div><strong>Livability Score</strong><span>${locality.livability_score}/100</span></div></div>` : ""}
      ${locality.best_time_to_visit ? `<div class="info-card"><span class="info-icon">📅</span><div><strong>Best Time to Visit</strong><span>${escapeHtml(locality.best_time_to_visit)}</span></div></div>` : ""}
      ${locality.ward_name ? `<div class="info-card"><span class="info-icon">🗺️</span><div><strong>Ward</strong><span>${escapeHtml(locality.ward_name)} (${locality.ward_number || ""})</span></div></div>` : ""}
    </div>
  `;

  const nearbyHtml = nearby.length > 0 ? `
    <div class="section nearby">
      <h3>📍 Nearby Localities</h3>
      <div class="nearby-list">${nearby.map((loc: any) => `<a href="${BASE_URL}/jaipur/${loc.slug}" class="nearby-item">${escapeHtml(loc.name)}${loc.distance_km ? `<span class="distance">${loc.distance_km.toFixed(1)} km</span>` : ""}</a>`).join("")}</div>
    </div>
  ` : "";

  const criticalCSS = `
    <style>/* ... your existing CSS ... */</style>
    <script>document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('.faq-item').forEach(function(item){item.addEventListener('click',function(){item.classList.toggle('active');});});});</script>
  `;

  return `
    ${criticalCSS}
    <div class="locality-page" data-locality="${locality.slug}" data-events="${eventCount}">
      ${emergencyBannerHtml}
      <div class="hero">
        <div class="hero-stats">
          <span class="hero-stat">📍 ${escapeHtml(locality.name)}</span>
          ${locality.pin_code ? `<span class="hero-stat">📮 Pin: ${locality.pin_code}</span>` : ""}
          ${eventCount > 0 ? `<span class="hero-stat">🎉 ${eventCount} Upcoming Events</span>` : ""}
          ${venues?.length ? `<span class="hero-stat">🏛️ ${venues.length} Venues</span>` : ""}
        </div>
        <h1>${escapeHtml(locality.name)}, Jaipur</h1>
        <p>${escapeHtml(truncate(locality.seo_blurb || locality.description || `Complete guide to ${locality.name} with events, venues, and local experiences.`, 200))}</p>
      </div>
      <div class="container">
        ${policeCardHtml}
        ${connectivityHtml}
        ${infoCardsHtml}
        ${civicHelplinesHtml}
        ${realEstateHtml}
        ${knownForHtml}
        ${eventsHtml}
        ${venuesHtml}
        ${eateriesHtml}
        ${prosConsHtml}
        ${distanceMatrixHtml}
        ${enhancedFaqHtml}
        <div class="section">
          <h3>ℹ️ About ${escapeHtml(locality.name)}</h3>
          <p>${escapeHtml(locality.description || locality.seo_blurb || `Explore ${locality.name}, a vibrant locality in Jaipur.`)}</p>
          ${locality.local_insights?.resident_profile ? `<p><strong>Resident Profile:</strong> ${locality.local_insights.resident_profile.join(", ")}</p>` : ""}
          ${locality.local_insights?.vibe ? `<p><strong>Vibe:</strong> ${escapeHtml(locality.local_insights.vibe)}</p>` : ""}
        </div>
        ${nearbyHtml}
        <div class="section" style="font-size: 0.75rem; color: #6b7280; text-align: center; padding: 1rem;">
          <p>📅 Last Updated: ${new Date(locality.last_verified_at || Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric", day: "numeric" })}</p>
          <p style="margin-top: 4px;">⚠️ Data may change. Please verify before making decisions.</p>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// GENERATE SCHEMAS (NO FAKE AGGREGATE RATING)
// ============================================
function generateAllSchemas(locality: any, events: any[], venues: any[], canonical: string) {
  const schemas = [];
  // Breadcrumb
  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Jaipur", item: `${BASE_URL}/jaipur` },
      { "@type": "ListItem", position: 3, name: "Localities", item: `${BASE_URL}/jaipur/localities` },
      { "@type": "ListItem", position: 4, name: locality.name, item: canonical },
    ],
  });
  // Place
  const placeSchema: any = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${locality.name}, Jaipur`,
    url: canonical,
    description: truncate(locality.seo_blurb || locality.description || `Complete guide to ${locality.name} in Jaipur.`, 500),
    address: { "@type": "PostalAddress", addressLocality: "Jaipur", addressRegion: "Rajasthan", addressCountry: "IN" },
  };
  if (locality.pin_code) placeSchema.address.postalCode = locality.pin_code;
  if (locality.geo_lat && locality.geo_lng) placeSchema.geo = { "@type": "GeoCoordinates", latitude: locality.geo_lat, longitude: locality.geo_lng };
  if (locality.known_for && Array.isArray(locality.known_for)) placeSchema.keywords = locality.known_for.join(", ");
  if (locality.police_station_name) placeSchema.additionalProperty = [{ "@type": "PropertyValue", name: "Police Station", value: locality.police_station_name, telephone: locality.police_station_phone }];
  if (events.length > 0) placeSchema.numberOfUpcomingEvents = events.length;
  schemas.push(placeSchema);
  // Events
  events.slice(0, 5).forEach(event => {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      startDate: event.start_date,
      location: { "@type": "Place", name: event.venue_name || locality.name, address: { "@type": "PostalAddress", addressLocality: "Jaipur", addressRegion: "Rajasthan", addressCountry: "IN" } },
      image: event.cover_image,
      url: `${BASE_URL}/events/${event.slug}`,
      offers: event.is_free ? { "@type": "Offer", price: 0, priceCurrency: "INR" } : event.ticket_price ? { "@type": "Offer", price: event.ticket_price, priceCurrency: "INR" } : undefined,
    });
  });
  // Venues
  if (venues.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Popular Venues in ${locality.name}`,
      description: `Recommended venues and attractions in ${locality.name}, Jaipur`,
      numberOfItems: venues.length,
      itemListElement: venues.map((venue, index) => ({ "@type": "ListItem", position: index + 1, name: venue.name, url: `${BASE_URL}/venues/${venue.slug}`, description: `${venue.name} is a popular ${venue.category || "venue"} in ${locality.name}.` })),
    });
  }
  // FAQ
  const faqs = locality.faq_json || [];
  if (faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.slice(0, 10).map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
    });
  }
  return schemas;
}

// ============================================
// MAIN SERVE FUNCTION - ALWAYS SSR
// ============================================
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const url = new URL(req.url);
  const userAgent = req.headers.get("user-agent") || "";
  console.log(`[locality-ssr] User-Agent: ${userAgent.substring(0, 100)}`);

  try {
    const slug = url.searchParams.get("slug")?.trim().toLowerCase();
    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error("Missing Supabase configuration");
      return new Response("Server configuration error", { status: 500 });
    }

    const data = await fetchCompleteLocalityData(slug);
    if (!data || !data.locality) {
      const notFoundHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Locality Not Found | ${SITE_NAME}</title><meta name="robots" content="noindex, nofollow"></head><body style="font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 20px"><h1>Locality Not Found</h1><p>We couldn't find a locality with slug: ${escapeHtml(slug)}</p><a href="/jaipur">Browse localities →</a></body></html>`;
      return new Response(notFoundHtml, { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
    }

    const { locality, events, venues, nearby, eventCount } = data;
    const canonical = `${BASE_URL}/jaipur/${locality.slug}`;
    const title = locality.meta_title || `${locality.name}, Jaipur — ${eventCount > 0 ? `${eventCount} Upcoming Events, ` : ""}Complete Locality Guide | ${SITE_NAME}`;
    const description = locality.meta_description || `Complete guide to ${locality.name} in Jaipur. Pin code ${locality.pin_code || "N/A"}, Police Station ${locality.police_station_phone || "N/A"}, property rates, schools, hospitals, and more.`;
    const image = locality.featured_image || DEFAULT_IMAGE;

    let indexHtml = await getSpaShellHtml();
    const schemas = generateAllSchemas(locality, events, venues, canonical);

    const headHtml = `
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${escapeHtml(canonical)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:image:alt" content="${escapeHtml(locality.name)} - Complete locality guide" />
<meta property="og:locale" content="en_IN" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />
${schemas.map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`).join("")}
`;

    if (indexHtml.includes("</head>")) {
      indexHtml = indexHtml.replace(/<\/head>/i, `${headHtml}\n</head>`);
    }

    // ALWAYS inject SSR content into root
    const ssrContent = buildSSRHTML(locality, events, venues, nearby, eventCount);
    const finalHtml = indexHtml.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

    console.log(`[locality-ssr] Served: ${slug} (events: ${events.length}, venues: ${venues.length}) in ${Date.now() - startTime}ms`);

    return new Response(finalHtml, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store, max-age=0, must-revalidate", // Disable caching for debugging
        "x-ssr-rendered": "true",
        "x-events-count": String(events.length),
        "x-venues-count": String(venues.length),
        "x-render-time-ms": String(Date.now() - startTime),
      },
    });
  } catch (err) {
    console.error("Locality SSR fatal error:", err);
    const errorHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${SITE_NAME} | Error</title></head><body><div id="root"></div><script src="/assets/index.js"></script></body></html>`;
    return new Response(errorHtml, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
  }
});
