/**
 * Event Ingestion Pipeline
 * Complete flow for importing, normalizing, deduplicating, and enriching external events
 */

import { supabase } from "@/integrations/supabase/client";
import { calculateEventQualityScore, type EventData, type QualityTier } from "./eventQuality";
import { checkForDuplicates, detectEventSeries, generateCanonicalSlug, type DuplicateCheckResult } from "./eventDuplicateResolver";
import { autoEnrichEvent, type EnrichedEventContent } from "./eventAutoEnrichment";

export interface ExternalEventSource {
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  venue_name?: string;
  venue_address?: string;
  locality?: string;
  city?: string;
  category?: string;
  ticket_price?: number;
  is_free?: boolean;
  cover_image?: string;
  registration_url?: string;
  organizer_name?: string;
  source_url?: string;
  source_platform?: string; // 'bookmyshow' | 'insider' | 'meetup' | etc.
  source_event_id?: string;
  tags?: string[];
}

export interface IngestionResult {
  success: boolean;
  action: 'created' | 'merged' | 'skipped' | 'draft' | 'failed';
  eventId?: string;
  eventSlug?: string;
  qualityTier: QualityTier;
  qualityScore: number;
  duplicateCheck: DuplicateCheckResult;
  enrichment: EnrichedEventContent | null;
  error?: string;
  recommendations: string[];
}

export interface IngestionPipelineOptions {
  autoPublish?: boolean; // Publish Tier A/B, save Tier C as draft
  skipDuplicates?: boolean;
  enrichContent?: boolean;
  dryRun?: boolean; // Test without actually inserting
}

/**
 * Normalize external event fields to our schema
 */
function normalizeEventFields(source: ExternalEventSource): Partial<EventData> & { 
  source_url?: string;
  source_platform?: string;
  source_event_id?: string;
} {
  // Map category from various sources
  const categoryMap: Record<string, string> = {
    'stand up comedy': 'comedy',
    'standup comedy': 'comedy',
    'comedy shows': 'comedy',
    'concerts': 'music',
    'club gigs': 'music',
    'music festivals': 'music',
    'music shows': 'music',
    'nye parties': 'party',
    'new year parties': 'party',
    'parties': 'party',
    'workshops': 'workshop',
    'art exhibitions': 'art',
    'exhibitions': 'art',
    'conferences': 'business',
    'meetups': 'community',
    'talks': 'talk',
    'performances': 'performance',
    'kids': 'family',
  };

  const normalizedCategory = source.category 
    ? categoryMap[source.category.toLowerCase()] || source.category.toLowerCase()
    : 'other';

  // Extract locality from venue address if not provided
  let locality = source.locality;
  if (!locality && source.venue_name) {
    // Try to extract locality from venue name (e.g., "ORA: Jaipur" -> try to find area)
    const venueMatch = source.venue_name.match(/:\s*(\w+)/);
    if (venueMatch && venueMatch[1].toLowerCase() !== 'jaipur') {
      locality = venueMatch[1];
    }
  }

  // Parse ticket price
  let ticketPrice = source.ticket_price;
  let isFree = source.is_free;
  
  if (ticketPrice === 0 || (typeof ticketPrice === 'undefined' && isFree !== true)) {
    isFree = false;
  }

  return {
    title: source.title.trim(),
    description: source.description,
    start_date: source.start_date,
    end_date: source.end_date,
    venue_name: source.venue_name?.replace(/:\s*Jaipur$/i, '').trim(),
    venue_address: source.venue_address,
    locality: locality,
    category: normalizedCategory,
    ticket_price: ticketPrice,
    is_free: isFree ?? false,
    cover_image: source.cover_image,
    registration_url: source.registration_url,
    organizer_name: source.organizer_name,
    tags: source.tags,
    source_url: source.source_url,
    source_platform: source.source_platform,
    source_event_id: source.source_event_id,
  };
}

/**
 * Detect and map locality from venue name or address
 */
function detectLocality(venueName?: string, venueAddress?: string): string | null {
  const knownLocalities = [
    'c-scheme', 'raja-park', 'malviya-nagar', 'vaishali-nagar', 'mansarovar',
    'jhotwara', 'sitapura', 'tonk-road', 'ajmer-road', 'jagatpura',
    'sanganer', 'pratap-nagar', 'sodala', 'civil-lines', 'bani-park',
    'mi-road', 'adarsh-nagar', 'nehru-place', 'lal-kothi'
  ];

  const searchText = `${venueName || ''} ${venueAddress || ''}`.toLowerCase();
  
  for (const locality of knownLocalities) {
    if (searchText.includes(locality.replace(/-/g, ' ')) || 
        searchText.includes(locality.replace(/-/g, ''))) {
      return locality;
    }
  }

  // Try common Jaipur venue to locality mappings
  const venueLocalityMap: Record<string, string> = {
    'deep smriti auditorium': 'c-scheme',
    'jecc': 'sitapura',
    'jaipur exhibition': 'sitapura',
    'rajasthan international center': 'jln-marg',
    'birla auditorium': 'statue-circle',
    'jawahar kala kendra': 'jln-marg',
    'albert hall': 'ram-niwas-garden',
    'ora': 'c-scheme',
    'strings': 'c-scheme',
    'gypsy monkey': 'c-scheme',
    'jaipur comedy club': 'raja-park',
    'hyatt place': 'civil-lines',
    'umaid palace': 'bani-park',
    'fomo': 'malviya-nagar',
    'harishchandra totuka': 'raja-park',
  };

  const venueLower = (venueName || '').toLowerCase();
  for (const [venueKey, locality] of Object.entries(venueLocalityMap)) {
    if (venueLower.includes(venueKey)) {
      return locality;
    }
  }

  return null;
}

/**
 * Main ingestion function - processes a single external event
 */
export async function ingestExternalEvent(
  sourceEvent: ExternalEventSource,
  options: IngestionPipelineOptions = {}
): Promise<IngestionResult> {
  const {
    autoPublish = true,
    skipDuplicates = true,
    enrichContent = true,
    dryRun = false,
  } = options;

  const result: IngestionResult = {
    success: false,
    action: 'failed',
    qualityTier: 'C',
    qualityScore: 0,
    duplicateCheck: {
      isDuplicate: false,
      confidence: 'none',
      matchingEvents: [],
      recommendation: 'create',
    },
    enrichment: null,
    recommendations: [],
  };

  try {
    // Step 1: Normalize fields
    const normalizedEvent = normalizeEventFields(sourceEvent);
    
    // Detect locality if not set
    if (!normalizedEvent.locality) {
      normalizedEvent.locality = detectLocality(
        normalizedEvent.venue_name || undefined,
        normalizedEvent.venue_address || undefined
      );
    }

    // Step 2: Check for duplicates
    result.duplicateCheck = await checkForDuplicates({
      title: normalizedEvent.title || '',
      start_date: normalizedEvent.start_date || '',
      end_date: normalizedEvent.end_date || null,
      venue_name: normalizedEvent.venue_name || null,
      organizer_name: normalizedEvent.organizer_name || null,
      locality: normalizedEvent.locality || null,
    });

    // Handle duplicate based on recommendation
    if (result.duplicateCheck.isDuplicate) {
      if (skipDuplicates && result.duplicateCheck.recommendation === 'skip') {
        result.action = 'skipped';
        result.success = true;
        result.eventId = result.duplicateCheck.matchingEvents[0]?.id;
        result.eventSlug = result.duplicateCheck.matchingEvents[0]?.slug;
        result.recommendations.push('Event already exists - skipped to preserve authority');
        return result;
      }

      if (result.duplicateCheck.recommendation === 'merge') {
        // Merge with existing event - enrich it instead of creating new
        const existingEvent = result.duplicateCheck.matchingEvents[0];
        if (existingEvent && !dryRun) {
          // Update existing event with new information
          const { error } = await supabase
            .from('events')
            .update({
              cover_image: normalizedEvent.cover_image || undefined,
              ticket_price: normalizedEvent.ticket_price,
              registration_url: normalizedEvent.registration_url || sourceEvent.source_url,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingEvent.id);

          if (!error) {
            result.action = 'merged';
            result.success = true;
            result.eventId = existingEvent.id;
            result.eventSlug = existingEvent.slug;
            result.recommendations.push('Merged with existing event to consolidate authority');
            return result;
          }
        }
      }
    }

    // Step 3: Detect event series
    const seriesInfo = detectEventSeries(normalizedEvent.title || '');
    
    // Step 4: Generate canonical slug
    const canonicalSlug = generateCanonicalSlug(
      normalizedEvent.title || 'untitled-event',
      normalizedEvent.start_date || new Date().toISOString()
    );

    // Step 5: Auto-enrich content
    let enrichedContent: EnrichedEventContent | null = null;
    if (enrichContent) {
      enrichedContent = autoEnrichEvent({
        title: normalizedEvent.title || '',
        category: normalizedEvent.category || 'other',
        locality: normalizedEvent.locality || null,
        venue_name: normalizedEvent.venue_name || null,
        organizer_name: normalizedEvent.organizer_name || null,
        is_free: normalizedEvent.is_free ?? false,
        ticket_price: normalizedEvent.ticket_price ?? null,
        start_date: normalizedEvent.start_date || '',
        tags: normalizedEvent.tags || [],
        source_platform: normalizedEvent.source_platform,
        source_url: normalizedEvent.source_url,
      });
      result.enrichment = enrichedContent;
    }

    // Step 6: Calculate quality score
    const qualityResult = calculateEventQualityScore({
      ...normalizedEvent,
      description: enrichedContent?.enrichedDescription || normalizedEvent.description,
      short_description: enrichedContent?.shortDescription,
    } as EventData);

    result.qualityTier = qualityResult.tier;
    result.qualityScore = qualityResult.score;
    result.recommendations = qualityResult.recommendations;

    // Step 7: Decide action based on quality
    const shouldPublish = autoPublish && (qualityResult.tier === 'A' || qualityResult.tier === 'B');
    const status = shouldPublish ? 'published' : 'draft';

    if (qualityResult.tier === 'C') {
      result.recommendations.push('Event saved as draft - needs manual enrichment');
    }

    // Step 8: Insert event (if not dry run)
    if (!dryRun) {
      // Build tags with series info and source
      const tags = [
        ...(normalizedEvent.tags || []),
        normalizedEvent.category,
        normalizedEvent.source_platform ? `source-${normalizedEvent.source_platform}` : null,
        seriesInfo.isSeriesEvent ? 'recurring-event' : null,
        normalizedEvent.locality ? normalizedEvent.locality.replace(/-/g, '-') : null,
      ].filter(Boolean) as string[];

      const eventData = {
        title: normalizedEvent.title,
        slug: canonicalSlug,
        description: enrichedContent?.enrichedDescription || normalizedEvent.description || '',
        short_description: enrichedContent?.shortDescription || '',
        start_date: normalizedEvent.start_date,
        end_date: normalizedEvent.end_date,
        venue_name: normalizedEvent.venue_name,
        venue_address: normalizedEvent.venue_address || `${normalizedEvent.venue_name}, Jaipur, Rajasthan`,
        city: 'Jaipur',
        locality: normalizedEvent.locality,
        category: normalizedEvent.category,
        ticket_price: normalizedEvent.ticket_price,
        is_free: normalizedEvent.is_free,
        cover_image: normalizedEvent.cover_image,
        registration_url: normalizedEvent.registration_url || normalizedEvent.source_url,
        organizer_name: normalizedEvent.organizer_name,
        status,
        tags,
        meta_title: enrichedContent?.metaTitle,
        meta_description: enrichedContent?.metaDescription,
      };

      const { data: insertedEvent, error } = await supabase
        .from('events')
        .insert(eventData)
        .select('id, slug')
        .single();

      if (error) {
        result.error = error.message;
        return result;
      }

      result.eventId = insertedEvent.id;
      result.eventSlug = insertedEvent.slug;
      result.action = shouldPublish ? 'created' : 'draft';
      result.success = true;
    } else {
      result.action = shouldPublish ? 'created' : 'draft';
      result.success = true;
      result.recommendations.push('Dry run - no changes made');
    }

    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    return result;
  }
}

/**
 * Batch ingest multiple events
 */
export async function batchIngestEvents(
  events: ExternalEventSource[],
  options: IngestionPipelineOptions = {}
): Promise<{
  total: number;
  created: number;
  merged: number;
  skipped: number;
  drafts: number;
  failed: number;
  results: IngestionResult[];
}> {
  const results: IngestionResult[] = [];
  let created = 0, merged = 0, skipped = 0, drafts = 0, failed = 0;

  for (const event of events) {
    const result = await ingestExternalEvent(event, options);
    results.push(result);

    switch (result.action) {
      case 'created': created++; break;
      case 'merged': merged++; break;
      case 'skipped': skipped++; break;
      case 'draft': drafts++; break;
      case 'failed': failed++; break;
    }
  }

  return {
    total: events.length,
    created,
    merged,
    skipped,
    drafts,
    failed,
    results,
  };
}
