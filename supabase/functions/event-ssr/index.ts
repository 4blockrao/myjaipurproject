// supabase/functions/event-ssr/index.ts
// Gold Standard - Works for ALL events automatically

async function fetchCompleteEventData(slug: string) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Single query with all joins
    const { data: event, error } = await supabase
        .from("events")
        .select(`
            *,
            performer:performer_id(*),
            venue:venue_id(*),
            locality:locality_slug(*),
            reviews:event_reviews(rating, comment, verified),
            similar_events:events!similar_events_id(
                title, slug, start_date, ticket_price, is_free, cover_image
            )
        `)
        .eq("slug", slug)
        .single();
    
    if (error || !event) return null;
    
    // Calculate derived fields
    const enrichedEvent = {
        ...event,
        avg_rating: event.reviews?.length 
            ? event.reviews.reduce((sum, r) => sum + r.rating, 0) / event.reviews.length 
            : null,
        review_count: event.reviews?.length || 0,
        ticket_tiers: event.ticket_tiers || (event.ticket_price ? [
            { name: "General Admission", price: event.ticket_price, available: true }
        ] : []),
    };
    
    // Find related events (algorithmic)
    const { data: related } = await supabase
        .from("events")
        .select("title, slug, start_date, ticket_price, is_free, cover_image, venue_name")
        .or(`category.eq.${event.category},locality_slug.eq.${event.locality_slug}`)
        .neq("slug", slug)
        .gte("start_date", new Date().toISOString())
        .limit(8);
    
    return { event: enrichedEvent, relatedEvents: related || [] };
}
