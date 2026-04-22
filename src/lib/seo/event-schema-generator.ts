// lib/seo/event-schema-generator.ts
// Single source of truth for all event schemas

export function generateEventSchema(event: any, venue: any, performer: any, reviews: any[]) {
    const schema: any = {
        "@context": "https://schema.org",
        "@type": getEventType(event.category),
        "name": event.title,
        "description": truncate(event.description || event.short_description, 500),
        "startDate": new Date(event.start_date).toISOString(),
        "endDate": event.end_date ? new Date(event.end_date).toISOString() : undefined,
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": event.is_online 
            ? "https://schema.org/OnlineEventAttendanceMode" 
            : "https://schema.org/OfflineEventAttendanceMode",
        "location": generateLocationSchema(venue, event),
        "image": event.cover_image || DEFAULT_IMAGE,
        "url": `${BASE_URL}/events/${event.slug}`,
        "offers": generateOffersSchema(event),
        "isAccessibleForFree": !!event.is_free,
    };

    // Add performer if exists
    if (performer) {
        schema.performer = {
            "@type": "Person",
            "name": performer.name,
            "description": performer.bio,
            "image": performer.image,
            "sameAs": performer.social_links ? Object.values(performer.social_links) : undefined,
        };
    } else if (event.performer_name) {
        schema.performer = { "@type": "Person", "name": event.performer_name };
    }

    // Add organizer
    if (event.organizer_name) {
        schema.organizer = {
            "@type": "Organization",
            "name": event.organizer_name,
            "url": event.organizer_website,
        };
    }

    // Add aggregate rating from reviews
    if (reviews && reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        schema.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": avgRating.toFixed(1),
            "reviewCount": reviews.length,
            "bestRating": "5",
            "worstRating": "1",
        };
    }

    // Add age range
    if (event.age_restriction) {
        schema.typicalAgeRange = event.age_restriction;
        schema.audience = {
            "@type": "Audience",
            "suggestedMinAge": extractMinAge(event.age_restriction),
        };
    }

    return schema;
}

function generateOffersSchema(event: any) {
    if (event.is_free) {
        return {
            "@type": "Offer",
            "price": 0,
            "priceCurrency": "INR",
            "availability": "https://schema.org/InStock",
        };
    }
    
    if (event.ticket_tiers && event.ticket_tiers.length > 0) {
        return event.ticket_tiers.map((tier: any) => ({
            "@type": "Offer",
            "name": tier.name,
            "price": tier.price,
            "priceCurrency": "INR",
            "availability": tier.available ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
            "validFrom": tier.available_from ? new Date(tier.available_from).toISOString() : undefined,
            "url": `${BASE_URL}/events/${event.slug}/book?tier=${tier.name.toLowerCase().replace(/\s+/g, '-')}`,
        }));
    }
    
    if (event.ticket_price) {
        return {
            "@type": "Offer",
            "price": event.ticket_price,
            "priceCurrency": "INR",
            "availability": "https://schema.org/InStock",
        };
    }
    
    return undefined;
}
