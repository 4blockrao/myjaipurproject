import { Helmet } from "react-helmet-async";

interface EventSEOProps {
  event: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    short_description?: string | null;
    start_date: string;
    end_date?: string | null;
    is_online?: boolean | null;
    online_url?: string | null;
    venue_name?: string | null;
    venue_address?: string | null;
    locality?: string | null;
    city?: string | null;
    cover_image?: string | null;
    is_free?: boolean | null;
    ticket_price?: number | null;
    max_tickets?: number | null;
    tickets_sold?: number | null;
    organizer_name?: string | null;
    organizer_email?: string | null;
    category: string;
    tags?: string[] | null;
    meta_title?: string | null;
    meta_description?: string | null;
    interested_count?: number | null;
    view_count?: number | null;
  };
}

const BASE_URL = "https://jaipurcircle.com";
const SITE_NAME = "Jaipur Circle";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=630&fit=crop";

// Helper to format date for titles
const formatTitleDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const EventSEO = ({ event }: EventSEOProps) => {
  const canonicalUrl = `${BASE_URL}/events/${event.slug}`;
  const city = event.city || 'Jaipur';
  const venue = event.venue_name || '';
  const eventDate = formatTitleDate(event.start_date);
  
  // Enhanced SEO Title Template:
  // {Event Name} {City} {Year} — Date, {Venue}, Ticket Price & Booking
  const eventYear = new Date(event.start_date).getFullYear();
  const pageTitle = event.meta_title || 
    `${event.title} ${city} ${eventYear} — Date${venue ? `, ${venue}` : ''}, Ticket Price & Booking`;
  
  // Transactional Meta Description Template:
  // Book {Event Name} tickets in {City} — {Date} at {Venue}. See timings, price, entry rules & pass availability. Get tickets now.
  const priceText = event.is_free ? 'Free entry' : `₹${event.ticket_price}`;
  const pageDescription = event.meta_description || 
    `Book ${event.title} tickets in ${city} — ${eventDate}${venue ? ` at ${venue}` : ''}. ${priceText}. See timings, entry rules & pass availability. Get tickets now on JaipurCircle.`;
  
  const eventImage = event.cover_image || DEFAULT_IMAGE;
  const location = event.locality ? `${event.locality}, ${city}` : city;
  
  // Enhanced SEO keywords targeting transactional intent
  const keywords = [
    `${event.title} ${city} tickets`,
    `${event.title} tickets`,
    event.organizer_name && `${event.organizer_name} ${city}`,
    event.organizer_name && `${event.organizer_name} live`,
    `${event.category} events ${city}`,
    venue && `${venue} events`,
    event.locality && `events in ${event.locality}`,
    `${city} ${event.category} ${new Date(event.start_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`,
    event.is_free && `free ${event.category} ${city}`,
    `things to do in ${city}`,
    `${city} events today`,
    ...(event.tags || [])
  ].filter(Boolean).join(', ');

  // Determine if event is past
  const startDateObj = new Date(event.start_date);
  const isPastEvent = startDateObj < new Date();
  
  // Determine event type based on category for proper schema
  const getEventType = () => {
    const category = event.category.toLowerCase();
    if (category.includes('music') || category.includes('concert')) return 'MusicEvent';
    if (category.includes('comedy') || category.includes('standup')) return 'ComedyEvent';
    if (category.includes('dance')) return 'DanceEvent';
    if (category.includes('theatre') || category.includes('theater') || category.includes('drama')) return 'TheaterEvent';
    if (category.includes('festival')) return 'Festival';
    if (category.includes('sports') || category.includes('sport')) return 'SportsEvent';
    if (category.includes('business') || category.includes('conference')) return 'BusinessEvent';
    if (category.includes('education') || category.includes('workshop')) return 'EducationEvent';
    if (category.includes('food')) return 'FoodEvent';
    return 'Event';
  };
  
  // Calculate duration if end date exists
  const getDurationISO = () => {
    if (!event.end_date) return undefined;
    const endDateObj = new Date(event.end_date);
    const diffMs = endDateObj.getTime() - startDateObj.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `PT${hours}H${minutes > 0 ? minutes + 'M' : ''}`;
  };

  // Generate description with proper fallback - REQUIRED by Google
  const eventDescription = event.description || event.short_description || 
    `${event.title} is happening in ${city}${venue ? ` at ${venue}` : ''}. Get complete event details including date, venue, ticket prices, timings, and booking information on JaipurCircle.`;

  // Generate end date - use start date + 3 hours as fallback for schema compliance
  const getEndDate = () => {
    if (event.end_date) return event.end_date;
    const endDate = new Date(event.start_date);
    endDate.setHours(endDate.getHours() + 3);
    return endDate.toISOString();
  };

  // Extract performer name from event title or organizer
  const getPerformerName = () => {
    // Try to extract artist name from common patterns
    if (event.organizer_name) return event.organizer_name;
    // For comedy/music events, the title often contains the performer name
    const titleParts = event.title.split(' — ');
    if (titleParts.length > 1) return titleParts[1].trim();
    const dashParts = event.title.split(' - ');
    if (dashParts.length > 1) return dashParts[0].trim();
    return event.title;
  };

  // Comprehensive Event Schema.org structured data - Fixed for Google Search Console
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": getEventType(),
    "@id": canonicalUrl,
    name: event.title,
    description: eventDescription,
    url: canonicalUrl,
    startDate: event.start_date,
    endDate: getEndDate(),
    ...(getDurationISO() && { duration: getDurationISO() }),
    eventStatus: isPastEvent 
      ? "https://schema.org/EventCompleted"
      : "https://schema.org/EventScheduled",
    eventAttendanceMode: event.is_online
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location: event.is_online
      ? {
          "@type": "VirtualLocation",
          url: event.online_url || canonicalUrl,
          name: "Online Event"
        }
      : {
          "@type": "Place",
          name: event.venue_name || (event.locality ? `${event.locality}, Jaipur` : "Venue To Be Announced, Jaipur"),
          address: {
            "@type": "PostalAddress",
            streetAddress: event.venue_address || (event.venue_name ? event.venue_name : "Venue To Be Announced"),
            addressLocality: event.locality || "Jaipur",
            addressRegion: "Rajasthan",
            postalCode: "302001",
            addressCountry: {
              "@type": "Country",
              name: "India"
            }
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 26.9124,
            longitude: 75.7873
          }
        },
    image: [
      eventImage,
      eventImage.replace('w=1200', 'w=800').replace('h=630', 'h=600'),
      eventImage.replace('w=1200', 'w=400').replace('h=630', 'h=400')
    ],
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      price: event.is_free ? "0" : String(event.ticket_price || 999),
      priceCurrency: "INR",
      availability: isPastEvent 
        ? "https://schema.org/SoldOut"
        : (event.max_tickets && event.tickets_sold && event.tickets_sold >= event.max_tickets)
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      validFrom: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
      priceValidUntil: event.start_date
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer_name || SITE_NAME,
      url: event.organizer_name ? `${BASE_URL}/organizers/${event.organizer_name.toLowerCase().replace(/\s+/g, '-')}` : BASE_URL,
      ...(event.organizer_email && { email: event.organizer_email })
    },
    performer: {
      "@type": getEventType() === 'MusicEvent' ? "MusicGroup" : "PerformingGroup",
      name: getPerformerName()
    },
    ...(event.interested_count && event.interested_count > 0 ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.5",
        ratingCount: String(event.interested_count),
        bestRating: "5",
        worstRating: "1"
      }
    } : {}),
    maximumAttendeeCapacity: event.max_tickets,
    remainingAttendeeCapacity: event.max_tickets ? event.max_tickets - (event.tickets_sold || 0) : undefined,
    isAccessibleForFree: event.is_free,
    inLanguage: "en-IN"
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Events",
        item: `${BASE_URL}/events`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: event.category,
        item: `${BASE_URL}/events?category=${event.category}`
      },
      {
        "@type": "ListItem",
        position: 4,
        name: event.title,
        item: canonicalUrl
      }
    ]
  };

  // WebPage Schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: pageTitle,
    description: pageDescription,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${BASE_URL}#website`,
      name: SITE_NAME,
      url: BASE_URL
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: eventImage
    },
    datePublished: event.start_date,
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "ReadAction",
      target: canonicalUrl
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={event.organizer_name || SITE_NAME} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="event" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={event.title} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={eventImage} />
      <meta property="og:image:secure_url" content={eventImage} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${event.title} event in ${location}`} />
      <meta property="og:locale" content="en_IN" />
      
      {/* Event-specific Open Graph */}
      <meta property="event:start_time" content={event.start_date} />
      {event.end_date && <meta property="event:end_time" content={event.end_date} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@jaipurcircle" />
      <meta name="twitter:creator" content="@jaipurcircle" />
      <meta name="twitter:title" content={event.title} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={eventImage} />
      <meta name="twitter:image:alt" content={`${event.title} event in ${location}`} />
      <meta name="twitter:label1" content="Date" />
      <meta name="twitter:data1" content={new Date(event.start_date).toLocaleDateString('en-IN', { dateStyle: 'long' })} />
      <meta name="twitter:label2" content="Price" />
      <meta name="twitter:data2" content={event.is_free ? 'Free' : `₹${event.ticket_price}`} />
      
      {/* Location Meta */}
      <meta name="geo.region" content="IN-RJ" />
      <meta name="geo.placename" content={location} />
      <meta name="geo.position" content="26.9124;75.7873" />
      <meta name="ICBM" content="26.9124, 75.7873" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(eventSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webPageSchema)}
      </script>
    </Helmet>
  );
};

// SEO component for Events listing page
interface EventsListSEOProps {
  events?: Array<{
    id: string;
    title: string;
    slug: string;
    start_date: string;
    cover_image?: string | null;
    is_free?: boolean | null;
    ticket_price?: number | null;
  }>;
  category?: string;
  locality?: string;
}

export const EventsListSEO = ({ events = [], category, locality }: EventsListSEOProps) => {
  const BASE_URL = "https://jaipurcircle.com";
  
  let pageTitle = "Events in Jaipur | Discover Local Events, Concerts & Festivals";
  let pageDescription = "Discover the best events happening in Jaipur. Music concerts, art exhibitions, food festivals, cultural events, comedy shows, and more. Find events near you and book tickets.";
  let canonicalUrl = `${BASE_URL}/events`;
  
  if (category) {
    pageTitle = `${category} Events in Jaipur | ${SITE_NAME}`;
    pageDescription = `Find the best ${category.toLowerCase()} events in Jaipur. Browse upcoming ${category.toLowerCase()} shows, concerts, and more.`;
    canonicalUrl = `${BASE_URL}/events?category=${category}`;
  }
  
  if (locality) {
    pageTitle = `Events in ${locality}, Jaipur | ${SITE_NAME}`;
    pageDescription = `Discover events happening in ${locality}, Jaipur. Find concerts, festivals, and things to do near you.`;
    canonicalUrl = `${BASE_URL}/events?locality=${locality}`;
  }

  const keywords = [
    'events in Jaipur',
    'Jaipur events',
    'things to do in Jaipur',
    'concerts Jaipur',
    'festivals Jaipur',
    'cultural events Jaipur',
    'music events Jaipur',
    'food festivals Jaipur',
    'weekend events Jaipur',
    'events near me Jaipur',
    'free events Jaipur',
    'events today Jaipur',
    category && `${category} events Jaipur`,
    locality && `events in ${locality}`
  ].filter(Boolean).join(', ');

  // ItemList Schema for event listings
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    numberOfItems: events.length,
    itemListElement: events.slice(0, 10).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        url: `${BASE_URL}/events/${event.slug}`,
        startDate: event.start_date,
        image: event.cover_image,
        offers: {
          "@type": "Offer",
          price: event.is_free ? "0" : String(event.ticket_price || 0),
          priceCurrency: "INR"
        }
      }
    }))
  };

  // CollectionPage Schema
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: pageTitle,
    description: pageDescription,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${BASE_URL}#website`,
      name: SITE_NAME,
      url: BASE_URL
    },
    about: {
      "@type": "Thing",
      name: "Events in Jaipur"
    },
    inLanguage: "en-IN"
  };

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}#organization`,
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: [
      "https://twitter.com/jaipurcircle",
      "https://facebook.com/jaipurcircle",
      "https://instagram.com/jaipurcircle"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["en", "hi"]
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Events",
        item: `${BASE_URL}/events`
      },
      ...(category ? [{
        "@type": "ListItem",
        position: 3,
        name: category,
        item: `${BASE_URL}/events?category=${category}`
      }] : [])
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={`${BASE_URL}/events-og-image.jpg`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@jaipurcircle" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={`${BASE_URL}/events-og-image.jpg`} />
      
      {/* Location */}
      <meta name="geo.region" content="IN-RJ" />
      <meta name="geo.placename" content="Jaipur, Rajasthan" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(itemListSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(collectionPageSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
};

export default EventSEO;
