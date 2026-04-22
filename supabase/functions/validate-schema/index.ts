// supabase/functions/validate-schema/index.ts
// Runs daily to check all events have complete schema

async function validateAllEvents() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    const { data: events } = await supabase
        .from("events")
        .select("id, title, slug, start_date");
    
    const results = [];
    
    for (const event of events) {
        const issues = [];
        
        // Check required fields
        if (!event.start_date) issues.push("missing_start_date");
        if (!event.venue_name && !event.venue_id) issues.push("missing_venue");
        
        // Check schema completeness
        const hasPerformer = event.performer_id || event.performer_name;
        if (!hasPerformer) issues.push("missing_performer");
        
        const hasTicketInfo = event.ticket_price || event.ticket_tiers || event.is_free;
        if (!hasTicketInfo) issues.push("missing_ticket_info");
        
        if (issues.length > 0) {
            results.push({ eventId: event.id, title: event.title, issues });
            
            // Send alert
            await sendAlert({
                type: "schema_issue",
                event: event.title,
                issues,
                action: `https://supabase.com/dashboard/project/xxx/editor/events?id=${event.id}`
            });
        }
    }
    
    return results;
}
