// supabase/functions/event-ssr/index.ts
// GOLD STANDARD++ version - Exceeds BookMyShow quality

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = (Deno.env.get("SITE_ORIGIN") ?? "https://www.jaipurcircle.com").replace(/\/+$/, "");
const SITE_NAME = "JaipurCircle";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=630&fit=crop";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") || "";

// Cache for SPA shell
let cachedIndexHtml: { html: string; fetchedAt: number } | null = null;

// Enhanced bot detection
const BOT_PATTERNS = [
  /Googlebot/i, /bingbot/i, /Baiduspider/i, /YandexBot/i, /DuckDuckBot/i,
  /Slurp/i, /facebookexternalhit/i, /WhatsApp/i, /Twitterbot/i, /LinkedInBot/i,
  /Pinterest/i, /TelegramBot/i, /GPTBot/i, /CCBot/i, /Applebot/i, /Amazonbot/i,
  /SemrushBot/i, /AhrefsBot/i, /MJ12bot/i,
];

function isBot(userAgent: string): boolean {
  if (!userAgent) return false;
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateStr: string): string {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatShortDate(dateStr: string): string {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

function getEventType(category: string): string {
  const cat = (category || "").toLowerCase();
  if (cat.includes("music") || cat.includes("concert")) return "MusicEvent";
  if (cat.includes("comedy")) return "ComedyEvent";
  if (cat.includes("dance")) return "DanceEvent";
  if (cat.includes("theatre") || cat.includes("play")) return "TheaterEvent";
  if (cat.includes("festival")) return "Festival";
  if (cat.includes("sports")) return "SportsEvent";
  if (cat.includes("workshop") || cat.includes("seminar")) return "EducationEvent";
  if (cat.includes("food") || cat.includes("dining")) return "FoodEvent";
  if (cat.includes("art") || cat.includes("exhibition")) return "ExhibitionEvent";
  return "Event";
}

async function getSpaShellHtml(): Promise<string> {
  const now = Date.now();
  const ttlMs = 5 * 60 * 1000;
  
  if (cachedIndexHtml && now - cachedIndexHtml.fetchedAt < ttlMs) {
    return cachedIndexHtml.html;
  }

  try {
    const res = await fetch(`${BASE_URL}/index.html?cb=${Math.floor(now / 1000)}`, {
      headers: {
        "user-agent": "jaipurcircle-event-ssr/2.0",
        accept: "text/html",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch index.html: ${res.status}`);
    }

    const html = await res.text();
    cachedIndexHtml = { html, fetchedAt: now };
    return html;
  } catch (err) {
    console.error("Failed to fetch SPA shell:", err);
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${SITE_NAME}</title></head>
<body><div id="root"></div></body>
</html>`;
  }
}

// ENHANCED: Fetches comprehensive event data including performer, locality, and venue details
async function fetchEventData(slug: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-ssr": "event-ssr-v2" } },
  });

  // Fetch event with all fields
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !event) {
    console.error("Event fetch error:", error);
    return null;
  }

  // Fetch venue details with full address
  let venue = null;
  if (event.venue_id) {
    try {
      const { data: venueData } = await supabase
        .from("venues")
        .select("name, address, city, pincode, latitude, longitude, phone, website, rating, image")
        .eq("id", event.venue_id)
        .maybeSingle();
      venue = venueData;
    } catch (venueError) {
      console.error("Venue fetch error:", venueError);
    }
  }

  // Fetch performer details if this is a performer event
  let performer = null;
  if (event.performer_id) {
    try {
      const { data: performerData } = await supabase
        .from("performers")
        .select("name, bio, image, social_links, follower_count")
        .eq("id", event.performer_id)
        .maybeSingle();
      performer = performerData;
    } catch (performerError) {
      console.error("Performer fetch error:", performerError);
    }
  }

  // Fetch locality details for context
  let locality = null;
  if (event.locality_slug) {
    try {
      const { data: localityData } = await supabase
        .from("localities")
        .select("name, slug, known_for, description")
        .eq("slug", event.locality_slug)
        .maybeSingle();
      locality = localityData;
    } catch (localityError) {
      console.error("Locality fetch error:", localityError);
    }
  }

  // Fetch related events (same locality, same performer, same category)
  let relatedEvents = [];
  if (event.locality_slug) {
    try {
      const { data: related } = await supabase
        .from("events")
        .select("title, slug, start_date, cover_image, ticket_price, is_free, venue_name")
        .eq("locality_slug", event.locality_slug)
        .neq("slug", slug)
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(8);
      relatedEvents = related || [];
    } catch (relatedError) {
      console.error("Related events fetch error:", relatedError);
    }
  }

  // If not enough related events, get same category events
  if (relatedEvents.length < 4 && event.category) {
    try {
      const { data: categoryEvents } = await supabase
        .from("events")
        .select("title, slug, start_date, cover_image, ticket_price, is_free, venue_name")
        .eq("category", event.category)
        .neq("slug", slug)
        .neq("locality_slug", event.locality_slug || "")
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(4);
      
      if (categoryEvents?.length) {
        relatedEvents = [...relatedEvents, ...categoryEvents];
      }
    } catch (categoryError) {
      console.error("Category events fetch error:", categoryError);
    }
  }

  return { event, venue, performer, locality, relatedEvents };
}

// ENHANCED: Comprehensive Event Schema with ticket tiers and multiple offers
function generateEventSchema(event: any, venue: any, performer: any, locality: any, canonical: string, isPast: boolean) {
  const venueName = venue?.name || event.venue_name || "TBA";
  const localityName = locality?.name || event.locality || "Jaipur";
  
  const schema: any = {
    "@context": "https://schema.org",
    "@type": getEventType(event.category),
    name: event.title,
    description: (event.description || event.short_description || "").substring(0, 1000),
    url: canonical,
    startDate: new Date(event.start_date).toISOString(),
    endDate: event.end_date ? new Date(event.end_date).toISOString() : undefined,
    eventStatus: isPast ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
    eventAttendanceMode: event.is_online 
      ? "https://schema.org/OnlineEventAttendanceMode" 
      : "https://schema.org/OfflineEventAttendanceMode",
    location: event.is_online 
      ? { "@type": "VirtualLocation", url: event.online_url || canonical }
      : {
          "@type": "Place",
          name: venueName,
          address: {
            "@type": "PostalAddress",
            streetAddress: venue?.address || event.venue_address || venueName,
            addressLocality: localityName,
            addressRegion: "Rajasthan",
            postalCode: venue?.pincode || undefined,
            addressCountry: "IN",
          },
        },
    image: event.cover_image || DEFAULT_IMAGE,
    organizer: {
      "@type": "Organization",
      name: event.organizer_name || SITE_NAME,
      url: BASE_URL,
    },
    isAccessibleForFree: !!event.is_free,
  };

  // Add performer if available
  if (performer) {
    schema.performer = {
      "@type": "Person",
      name: performer.name,
      description: performer.bio?.substring(0, 300),
      image: performer.image,
      sameAs: performer.social_links || undefined,
    };
  } else if (event.performer_name) {
    schema.performer = {
      "@type": "Person",
      name: event.performer_name,
    };
  }

  // Enhanced offers with ticket tiers (BookMyShow style)
  if (event.is_free) {
    schema.offers = {
      "@type": "Offer",
      price: 0,
      priceCurrency: "INR",
      availability: isPast ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      validFrom: new Date().toISOString(),
      url: canonical,
    };
  } else if (event.ticket_tiers && Array.isArray(event.ticket_tiers) && event.ticket_tiers.length > 0) {
    schema.offers = event.ticket_tiers.map((tier: any) => ({
      "@type": "Offer",
      name: tier.name,
      price: tier.price,
      priceCurrency: "INR",
      availability: tier.available ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      validFrom: tier.available_from ? new Date(tier.available_from).toISOString() : new Date().toISOString(),
      validThrough: tier.available_until ? new Date(tier.available_until).toISOString() : undefined,
      url: canonical,
    }));
  } else if (event.ticket_price) {
    schema.offers = {
      "@type": "Offer",
      price: event.ticket_price,
      priceCurrency: "INR",
      availability: isPast ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      url: canonical,
    };
  }

  // Add venue specific details if available
  if (venue?.latitude && venue?.longitude) {
    schema.location.geo = {
      "@type": "GeoCoordinates",
      latitude: venue.latitude,
      longitude: venue.longitude,
    };
  }

  return schema;
}

// ENHANCED: Breadcrumb with locality context
function generateBreadcrumbSchema(event: any, locality: any, canonical: string) {
  const items = [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Events", item: `${BASE_URL}/events` },
  ];
  
  if (event.category) {
    items.push({ 
      "@type": "ListItem", 
      position: 3, 
      name: event.category, 
      item: `${BASE_URL}/events?category=${encodeURIComponent(event.category)}` 
    });
  }
  
  if (locality) {
    items.push({ 
      "@type": "ListItem", 
      position: 4, 
      name: `${locality.name} Events`, 
      item: `${BASE_URL}/jaipur/${locality.slug}/events` 
    });
  }
  
  items.push({ 
    "@type": "ListItem", 
    position: items.length + 1, 
    name: event.title, 
    item: canonical 
  });
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

// ENHANCED: FAQ with more relevant questions
function generateFAQSchema(event: any, venue: any, performer: any) {
  const questions = [
    {
      name: `When and where is ${event.title} taking place?`,
      text: `${event.title} takes place on ${formatDate(event.start_date)} at ${formatTime(event.start_date)}. The venue is ${venue?.name || event.venue_name || "TBA"}${event.locality ? ` in ${event.locality}` : ""}.`,
    },
    {
      name: `How can I book tickets for ${event.title}?`,
      text: event.booking_url 
        ? `You can book tickets directly at: ${event.booking_url}. Early booking is recommended as seats are limited.`
        : `Tickets for ${event.title} can be booked through ${SITE_NAME}. Check the website for the latest availability and pricing.`,
    },
    {
      name: `What are the ticket prices for ${event.title}?`,
      text: event.is_free 
        ? `${event.title} is a free event! No ticket purchase required.`
        : event.ticket_tiers?.length 
          ? `Ticket prices: ${event.ticket_tiers.map((t: any) => `${t.name}: ₹${t.price}`).join(", ")}.`
          : event.ticket_price 
            ? `Tickets are ₹${event.ticket_price} per person.`
            : `Contact the organizer for ticket pricing information.`,
    },
    {
      name: `Is ${event.title} suitable for children/families?`,
      text: event.age_restriction 
        ? `Age restriction: ${event.age_restriction}. Please check the event page for details.`
        : `Check the event page for age suitability information.`,
    },
    {
      name: `What is the duration of ${event.title}?`,
      text: event.duration 
        ? `The event duration is approximately ${event.duration}.`
        : `Typical duration for this type of event is 2-3 hours. Check the event page for exact timing.`,
    },
  ];

  if (performer) {
    questions.push({
      name: `Who is ${performer.name}?`,
      text: performer.bio 
        ? performer.bio.substring(0, 300)
        : `${performer.name} is performing at this event. Check the event page for more details about the artist.`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(q => ({
      "@type": "Question",
      name: q.name,
      acceptedAnswer: { "@type": "Answer", text: q.text },
    })),
  };
}

// Generate ViewAction schema for app deep linking (BookMyShow style)
function generateViewActionSchema(canonical: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ViewAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/events/{event_slug}`,
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
    name: "View Event Details",
    description: "View complete event details, book tickets, and share with friends",
  };
}

// Generate rich SSR markup with modern design
function buildSSRMarkup(event: any, venue: any, performer: any, locality: any, relatedEvents: any[], canonical: string, isPast: boolean) {
  const venueName = venue?.name || event.venue_name || "TBA";
  const priceText = event.is_free 
    ? "Free Entry" 
    : event.ticket_tiers?.length 
      ? `From ₹${Math.min(...event.ticket_tiers.map((t: any) => t.price))}` 
      : event.ticket_price 
        ? `₹${event.ticket_price}` 
        : "Contact Organizer";
  
  const description = event.description || event.short_description || `Join us for ${event.title} in ${event.city || "Jaipur"}.`;
  const category = event.category || "Event";
  const hasTicketTiers = event.ticket_tiers && event.ticket_tiers.length > 0;
  const isOnline = event.is_online;
  
  // Ticket tiers HTML
  const ticketTiersHtml = hasTicketTiers ? `
    <div style="margin-top: 16px">
      <h3 style="font-size: 16px; margin-bottom: 12px">Ticket Categories</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 12px">
        ${event.ticket_tiers.map((tier: any) => `
          <div style="flex: 1; min-width: 120px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center">
            <div style="font-weight: 600; margin-bottom: 4px">${escapeHtml(tier.name)}</div>
            <div style="font-size: 18px; font-weight: 700; color: #3b82f6">₹${tier.price}</div>
            ${tier.available === false ? '<div style="font-size: 11px; color: #ef4444">Sold Out</div>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  // Performer section
  const performerHtml = performer ? `
    <div style="margin-bottom: 32px; background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius: 16px; padding: 24px">
      <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center">
        ${performer.image ? `<img src="${escapeHtml(performer.image)}" alt="${escapeHtml(performer.name)}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover">` : ''}
        <div>
          <h2 style="font-size: 20px; margin-bottom: 8px">About ${escapeHtml(performer.name)}</h2>
          <p style="color: #4b5563; line-height: 1.6">${escapeHtml((performer.bio || "Renowned performer bringing an unforgettable experience.").substring(0, 300))}</p>
          ${performer.follower_count ? `<p style="margin-top: 8px; font-size: 14px; color: #8b5cf6">🎧 ${performer.follower_count.toLocaleString()} followers</p>` : ''}
        </div>
      </div>
    </div>
  ` : event.performer_name ? `
    <div style="margin-bottom: 32px; background: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center">
      <div style="font-size: 48px; margin-bottom: 8px">🎤</div>
      <h2 style="font-size: 18px; margin-bottom: 4px">Featuring ${escapeHtml(event.performer_name)}</h2>
      <p style="color: #6b7280; font-size: 14px">Don't miss this incredible performance</p>
    </div>
  ` : '';

  // Locality context section
  const localityHtml = locality ? `
    <div style="margin-bottom: 32px; background: #f0fdf4; border-radius: 12px; padding: 20px; border-left: 4px solid #10b981">
      <div style="display: flex; gap: 12px; align-items: start">
        <span style="font-size: 24px">📍</span>
        <div>
          <h3 style="font-size: 16px; margin-bottom: 4px">Located in ${escapeHtml(locality.name)}</h3>
          <p style="color: #4b5563; font-size: 14px; margin-bottom: 8px">${escapeHtml((locality.description || locality.known_for || `Explore more events in ${locality.name}`).substring(0, 150))}</p>
          <a href="${BASE_URL}/jaipur/${escapeHtml(locality.slug)}" style="color: #10b981; text-decoration: none; font-size: 14px; font-weight: 500">
            Explore ${escapeHtml(locality.name)} →
          </a>
        </div>
      </div>
    </div>
  ` : '';

  // Related events grid
  const relatedEventsHtml = relatedEvents.length > 0 ? `
    <section style="margin-top: 48px; padding-top: 32px; border-top: 1px solid #e5e7eb">
      <h3 style="font-size: 20px; margin-bottom: 20px">You might also like</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px">
        ${relatedEvents.map((rel: any) => `
          <a href="${BASE_URL}/events/${rel.slug}" style="text-decoration: none; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.2s">
            ${rel.cover_image ? `<img src="${escapeHtml(rel.cover_image)}" alt="${escapeHtml(rel.title)}" style="width: 100%; height: 140px; object-fit: cover">` : ''}
            <div style="padding: 12px">
              <h4 style="margin: 0 0 4px 0; font-size: 14px; color: #1f2937">${escapeHtml(rel.title)}</h4>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px">
                <span style="font-size: 12px; color: #6b7280">${formatShortDate(rel.start_date)}</span>
                <span style="font-size: 12px; font-weight: 600; color: ${rel.is_free ? '#10b981' : '#3b82f6'}">
                  ${rel.is_free ? 'FREE' : `₹${rel.ticket_price || 'TBA'}`}
                </span>
              </div>
            </div>
          </a>
        `).join('')}
      </div>
    </section>
  ` : '';

  // Share buttons HTML
  const shareButtonsHtml = `
    <div style="display: flex; gap: 12px; margin-top: 24px">
      <button onclick="navigator.share?.({title: '${escapeHtml(event.title)}', text: 'Check out this event in Jaipur!', url: '${canonical}')}" style="background: #f3f4f6; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer">📤 Share</button>
      <button onclick="window.open('https://wa.me/?text=${encodeURIComponent(event.title + ' - ' + canonical)}', '_blank')" style="background: #25D366; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer">💬 WhatsApp</button>
    </div>
  `;

  // Critical CSS
  const criticalCSS = `
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.5;background:#f8fafc}
      .event-hero{background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);color:white}
      .ssr-prerender{max-width:1000px;margin:0 auto}
      @media (max-width:768px){.ssr-prerender{padding:0 1rem 2rem}}
      .event-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.12)}
      a{transition:all 0.2s}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      .ssr-prerender{animation:fadeIn 0.3s ease-out}
      button:active{transform:scale(0.98)}
    </style>
  `;

  return `
    ${criticalCSS}
    <div class="ssr-prerender" data-ssr="event" data-event-slug="${escapeHtml(event.slug)}" data-event-category="${escapeHtml(category)}">
      
      <!-- Hero Section -->
      <div class="event-hero" style="padding: clamp(2rem, 5vw, 3rem); margin-bottom: 2rem; border-radius: 0 0 24px 24px">
        <div style="max-width: 900px; margin: 0 auto">
          <nav aria-label="Breadcrumb" style="font-size: 13px; opacity: 0.8; margin-bottom: 24px">
            <a href="/" style="color: white; text-decoration: none">Home</a> › 
            <a href="/events" style="color: white; text-decoration: none">Events</a> › 
            <span>${escapeHtml(event.title)}</span>
          </nav>
          
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px">
            <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px">${escapeHtml(category)}</span>
            ${!isPast ? '<span style="background: #ef4444; padding: 4px 12px; border-radius: 20px; font-size: 12px">Upcoming</span>' : ''}
            ${isOnline ? '<span style="background: #3b82f6; padding: 4px 12px; border-radius: 20px; font-size: 12px">Online</span>' : ''}
          </div>
          
          <h1 style="font-size: clamp(1.8rem, 6vw, 2.5rem); margin-bottom: 16px">${escapeHtml(event.title)}</h1>
          
          <div style="display: flex; flex-wrap: wrap; gap: 24px; margin-top: 24px; font-size: 14px">
            <div>📅 ${formatDate(event.start_date)} • ${formatTime(event.start_date)}</div>
            <div>📍 ${escapeHtml(venueName)}</div>
            <div>💰 ${escapeHtml(priceText)}</div>
          </div>
        </div>
      </div>
      
      <div style="padding: 0 1rem 2rem">
        <!-- Main Content -->
        <div style="display: grid; grid-template-columns: 1fr; gap: 32px">
          
          <!-- Event Image -->
          ${event.cover_image ? `
            <img src="${escapeHtml(event.cover_image)}" alt="${escapeHtml(event.title)}" 
                 style="width: 100%; max-height: 500px; object-fit: cover; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.1)" />
          ` : ''}
          
          <!-- Event Details Card -->
          <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05)">
            <h2 style="font-size: 20px; margin-bottom: 16px">Event Details</h2>
            <div style="display: grid; gap: 16px">
              <div style="display: grid; grid-template-columns: 100px 1fr; gap: 8px">
                <strong>Date:</strong> <span>${formatDate(event.start_date)}${event.end_date && new Date(event.end_date).toDateString() !== new Date(event.start_date).toDateString() ? ` – ${formatDate(event.end_date)}` : ''}</span>
                <strong>Time:</strong> <span>${formatTime(event.start_date)}${event.end_date ? ` – ${formatTime(event.end_date)}` : ''}</span>
                <strong>Venue:</strong> <span>${escapeHtml(venueName)}${venue?.address ? `, ${escapeHtml(venue.address)}` : event.venue_address ? `, ${escapeHtml(event.venue_address)}` : ''}</span>
                <strong>Price:</strong> <span style="font-weight: 700; color: ${event.is_free ? '#10b981' : '#3b82f6'}">${escapeHtml(priceText)}</span>
                ${event.organizer_name ? `<strong>Organizer:</strong> <span>${escapeHtml(event.organizer_name)}</span>` : ''}
                ${event.age_restriction ? `<strong>Age Limit:</strong> <span>${escapeHtml(event.age_restriction)}</span>` : ''}
                ${event.duration ? `<strong>Duration:</strong> <span>${escapeHtml(event.duration)}</span>` : ''}
              </div>
              ${ticketTiersHtml}
            </div>
          </div>
          
          ${performerHtml}
          ${localityHtml}
          
          <!-- Description -->
          <div>
            <h2 style="font-size: 20px; margin-bottom: 16px">About this event</h2>
            <div style="line-height: 1.7; color: #374151">
              ${description.split('\n').map(para => `<p style="margin-bottom: 16px">${escapeHtml(para)}</p>`).join('')}
            </div>
          </div>
          
          <!-- Booking CTA -->
          ${!isPast && event.booking_url ? `
            <div style="text-align: center; margin: 16px 0">
              <a href="${escapeHtml(event.booking_url)}" target="_blank" rel="noopener noreferrer"
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 48px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 18px; box-shadow: 0 4px 12px rgba(102,126,234,0.4); transition: transform 0.2s">
                🎟️ Book Tickets Now
              </a>
            </div>
          ` : ''}
          
          ${shareButtonsHtml}
          ${relatedEventsHtml}
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center">
          <p>© ${SITE_NAME} — Discover the best events, venues, and local experiences in Jaipur</p>
          <p style="margin-top: 8px">
            <a href="${canonical}" style="color: #9ca3af">Event Page</a> | 
            <a href="/events" style="color: #9ca3af">All Events</a> | 
            <a href="/jaipur/localities" style="color: #9ca3af">Localities</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

function injectIntoRoot(html: string, content: string): string {
  const rootRegex = /<div\s+id=["']root["'][^>]*>([\s\S]*?)<\/div>/i;
  if (rootRegex.test(html)) {
    return html.replace(rootRegex, `<div id="root">${content}</div>`);
  }
  return html.replace('</body>', `<div id="root">${content}</div></body>`);
}

// Generate preload links for performance
function generatePreloadLinks(event: any): string {
  const links = [];
  links.push('<link rel="preconnect" href="https://fonts.googleapis.com">');
  links.push('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
  links.push('<link rel="dns-prefetch" href="https://www.google-analytics.com">');
  
  if (event.cover_image) {
    links.push(`<link rel="preload" as="image" href="${escapeHtml(event.cover_image)}">`);
  }
  
  return links.join('\n');
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const url = new URL(req.url);
  const userAgent = req.headers.get("user-agent") || "";
  const isSearchBot = isBot(userAgent);

  try {
    const slug = url.searchParams.get("slug")?.trim();
    
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

    const data = await fetchEventData(slug);
    
    if (!data || !data.event) {
      const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Event Not Found | ${SITE_NAME}</title><meta name="robots" content="noindex, nofollow"></head>
<body style="font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 20px">
  <h1>Event Not Found</h1>
  <p>We couldn't find an event with slug: ${escapeHtml(slug)}</p>
  <a href="/events">Browse all events →</a>
</body>
</html>`;
      return new Response(notFoundHtml, {
        status: 404,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    const { event, venue, performer, locality, relatedEvents } = data;
    const isPast = new Date(event.start_date) < new Date();
    const canonical = `${BASE_URL}/events/${event.slug}`;
    
    // Generate enhanced meta data
    const title = event.meta_title || `${event.title} | ${formatDate(event.start_date)} | ${locality?.name || event.city || "Jaipur"} | ${SITE_NAME}`;
    const description = event.meta_description || event.short_description || 
      `${event.title} at ${venue?.name || event.venue_name || "TBA"} on ${formatDate(event.start_date)}. ${event.is_free ? "Free entry. " : ""}Book tickets now!`;
    const image = event.cover_image || DEFAULT_IMAGE;

    let indexHtml = await getSpaShellHtml();
    const preloadLinks = generatePreloadLinks(event);

    // Generate all schemas
    const eventSchema = generateEventSchema(event, venue, performer, locality, canonical, isPast);
    const breadcrumbSchema = generateBreadcrumbSchema(event, locality, canonical);
    const faqSchema = generateFAQSchema(event, venue, performer);
    const viewActionSchema = generateViewActionSchema(canonical);

    const headHtml = `
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="keywords" content="${escapeHtml(event.title)}, ${escapeHtml(category)}, ${locality?.name || event.locality || "Jaipur"} events, tickets, ${event.performer_name || ""}" />
<meta name="robots" content="${isPast ? 'noindex, follow' : 'index, follow, max-image-preview:large'}" />
<link rel="canonical" href="${escapeHtml(canonical)}" />

<!-- Preloads -->
${preloadLinks}

<!-- Open Graph -->
<meta property="og:type" content="event" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${escapeHtml(event.title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="en_IN" />
${!isPast && event.start_date ? `<meta property="event:start_time" content="${new Date(event.start_date).toISOString()}" />` : ''}

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(event.title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />

<!-- Structured Data -->
<script type="application/ld+json">${JSON.stringify(eventSchema)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
<script type="application/ld+json">${JSON.stringify(viewActionSchema)}</script>
`;

    if (indexHtml.includes("</head>")) {
      indexHtml = indexHtml.replace(/<\/head>/i, `${headHtml}\n</head>`);
    }

    // For bots: serve fully populated SSR content
    if (isSearchBot) {
      const ssrContent = buildSSRMarkup(event, venue, performer, locality, relatedEvents, canonical, isPast);
      const finalHtml = injectIntoRoot(indexHtml, ssrContent);
      
      console.log(`[event-ssr] Bot served: ${slug} (${relatedEvents.length} related events) in ${Date.now() - startTime}ms`);
      
      return new Response(finalHtml, {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": isPast 
            ? "public, max-age=0, s-maxage=86400"
            : "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          "x-ssr-module": "event-ssr-v2",
          "x-ssr-bot": "true",
          "x-related-events": String(relatedEvents.length),
          "x-render-time-ms": String(Date.now() - startTime),
        },
      });
    }

    // For regular users: lightweight shell with placeholder
    const finalHtml = injectIntoRoot(indexHtml, `<div data-ssr-placeholder="event-${event.slug}" data-event-category="${event.category || ''}"></div>`);
    
    console.log(`[event-ssr] User served (SPA mode): ${slug} in ${Date.now() - startTime}ms`);
    
    return new Response(finalHtml, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        "x-ssr-module": "event-ssr-v2",
        "x-ssr-bot": "false",
        "x-render-time-ms": String(Date.now() - startTime),
      },
    });

  } catch (err) {
    console.error("Event SSR fatal error:", err);
    
    const errorHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${SITE_NAME} | Events in Jaipur</title></head>
<body><div id="root"></div></body>
</html>`;
    
    return new Response(errorHtml, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});
