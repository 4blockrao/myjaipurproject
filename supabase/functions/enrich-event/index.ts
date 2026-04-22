// supabase/functions/enrich-event/index.ts
// Automatically enriches event data when created/updated

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

async function enrichEvent(eventId: string) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // 1. Fetch event data
    const { data: event } = await supabase
        .from("events")
        .select("*, venue:venue_id(*), performer:performer_id(*)")
        .eq("id", eventId)
        .single();
    
    // 2. Auto-detect missing fields
    const updates: any = {};
    
    // If no performer, try to extract from title
    if (!event.performer_id && !event.performer_name) {
        const extractedPerformer = extractPerformerFromTitle(event.title);
        if (extractedPerformer) {
            updates.performer_name = extractedPerformer;
        }
    }
    
    // 3. Geocode venue if missing coordinates
    if (event.venue && (!event.venue.latitude || !event.venue.longitude)) {
        const coords = await geocodeAddress(event.venue.address);
        if (coords) {
            await supabase
                .from("venues")
                .update({ latitude: coords.lat, longitude: coords.lng })
                .eq("id", event.venue.id);
        }
    }
    
    // 4. Auto-generate FAQ
    const faq = generateFAQ(event);
    updates.faq_json = faq;
    
    // 5. Calculate ticket tiers from price field
    if (event.ticket_price && !event.ticket_tiers) {
        updates.ticket_tiers = [
            { name: "General Admission", price: event.ticket_price, available: true }
        ];
    }
    
    // 6. Update event with enriched data
    await supabase.from("events").update(updates).eq("id", eventId);
    
    // 7. Trigger re-indexing for search
    await fetch(`${BASE_URL}/api/reindex`, { 
        method: "POST", 
        body: JSON.stringify({ eventId, type: "event" })
    });
}

// Helper: Extract performer from title
function extractPerformerFromTitle(title: string): string | null {
    const patterns = [
        /(.+?) Live/i,
        /(.+?) - India Tour/i,
        /(.+?) in Jaipur/i,
    ];
    
    for (const pattern of patterns) {
        const match = title.match(pattern);
        if (match) return match[1].trim();
    }
    return null;
}

// Helper: Generate FAQ dynamically
function generateFAQ(event: any) {
    return [
        {
            question: `Is ${event.title} confirmed in Jaipur?`,
            answer: `Yes, ${event.title} is confirmed for ${new Date(event.start_date).toLocaleDateString()} at ${event.venue_name}.`
        },
        {
            question: `What are the ticket prices for ${event.title}?`,
            answer: event.ticket_tiers 
                ? `Tickets start from ₹${Math.min(...event.ticket_tiers.map(t => t.price))}. ${event.ticket_tiers.map(t => `${t.name}: ₹${t.price}`).join(", ")}`
                : event.ticket_price 
                    ? `Tickets are ₹${event.ticket_price}`
                    : "Contact organizer for pricing."
        },
        {
            question: `What is the age requirement?`,
            answer: event.age_restriction || "Please check event page for age restrictions."
        },
        {
            question: `Where is ${event.title} taking place?`,
            answer: `${event.title} will be held at ${event.venue_name}, ${event.city || "Jaipur"}.`
        },
        {
            question: `How to reach ${event.venue_name}?`,
            answer: `The venue is located in ${event.locality || "Jaipur"}. Use local transport, cabs, or metro to reach. Parking is available.`
        }
    ];
}
