/**
 * Event Quality Scoring System
 * Computes quality tier based on content signals for SEO indexing decisions
 */

export type QualityTier = 'A' | 'B' | 'C';

export interface EventQualityScore {
  score: number;        // 0-100
  tier: QualityTier;    // A/B/C classification
  shouldIndex: boolean; // Whether to index this page
  signals: {
    hasImage: boolean;
    hasLocality: boolean;
    hasVenue: boolean;
    hasOrganizer: boolean;
    hasDescription: boolean;
    hasTicketInfo: boolean;
    hasCategory: boolean;
    hasTags: boolean;
    isEnriched: boolean;
    hasEngagement: boolean;
  };
  recommendations: string[];
}

export interface EventData {
  id?: string;
  title: string;
  description?: string | null;
  short_description?: string | null;
  cover_image?: string | null;
  locality?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  organizer_name?: string | null;
  organizer_id?: string | null;
  category?: string;
  tags?: string[] | null;
  is_free?: boolean | null;
  ticket_price?: number | null;
  registration_url?: string | null;
  view_count?: number | null;
  interested_count?: number | null;
  start_date?: string;
  end_date?: string | null;
  status?: string | null;
}

/**
 * Calculate quality score for an event
 */
export function calculateEventQualityScore(event: EventData): EventQualityScore {
  const signals = {
    hasImage: !!event.cover_image && event.cover_image.length > 0,
    hasLocality: !!event.locality && event.locality.length > 0,
    hasVenue: !!event.venue_name && event.venue_name.length > 0,
    hasOrganizer: !!(event.organizer_name || event.organizer_id),
    hasDescription: !!(event.description && event.description.length > 100) || 
                   !!(event.short_description && event.short_description.length > 50),
    hasTicketInfo: event.is_free === true || 
                   (!!event.ticket_price && event.ticket_price > 0) ||
                   !!event.registration_url,
    hasCategory: !!event.category && event.category !== 'Other',
    hasTags: !!event.tags && event.tags.length > 0,
    isEnriched: !!(event.description && event.description.length > 300),
    hasEngagement: (event.view_count || 0) > 10 || (event.interested_count || 0) > 5,
  };

  // Weighted scoring
  let score = 0;
  
  // Core signals (high weight)
  if (signals.hasImage) score += 15;
  if (signals.hasLocality) score += 15;
  if (signals.hasVenue) score += 12;
  if (signals.hasDescription) score += 15;
  
  // Important signals (medium weight)
  if (signals.hasOrganizer) score += 10;
  if (signals.hasTicketInfo) score += 10;
  if (signals.hasCategory) score += 8;
  
  // Enrichment signals (bonus)
  if (signals.hasTags) score += 5;
  if (signals.isEnriched) score += 5;
  if (signals.hasEngagement) score += 5;

  // Determine tier
  let tier: QualityTier;
  let shouldIndex: boolean;

  if (score >= 70) {
    tier = 'A';
    shouldIndex = true;
  } else if (score >= 45) {
    tier = 'B';
    shouldIndex = true;
  } else {
    tier = 'C';
    shouldIndex = false; // Thin content - noindex
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (!signals.hasImage) recommendations.push('Add a cover image');
  if (!signals.hasLocality) recommendations.push('Add locality/area information');
  if (!signals.hasVenue) recommendations.push('Add venue details');
  if (!signals.hasDescription) recommendations.push('Add a detailed description (100+ chars)');
  if (!signals.hasOrganizer) recommendations.push('Add organizer information');
  if (!signals.hasTicketInfo) recommendations.push('Add ticket/pricing information');

  return {
    score,
    tier,
    shouldIndex,
    signals,
    recommendations,
  };
}

/**
 * Check if an event should be indexed based on its status and quality
 */
export function shouldIndexEvent(event: EventData): boolean {
  // Never index draft/cancelled events
  if (event.status && !['published', 'live'].includes(event.status)) {
    return false;
  }

  const quality = calculateEventQualityScore(event);
  
  // Past events: only index if they're part of a series or high quality
  if (event.start_date && new Date(event.start_date) < new Date()) {
    // Past events get stricter requirements
    return quality.tier === 'A';
  }

  return quality.shouldIndex;
}

/**
 * Get indexing meta tag based on event quality
 */
export function getEventIndexingMeta(event: EventData): { 
  robots: string; 
  reason: string;
} {
  const quality = calculateEventQualityScore(event);
  const isPast = event.start_date && new Date(event.start_date) < new Date();

  if (event.status && !['published', 'live'].includes(event.status)) {
    return { robots: 'noindex, nofollow', reason: 'Event not published' };
  }

  if (isPast && quality.tier !== 'A') {
    return { robots: 'noindex, follow', reason: 'Past event with insufficient quality' };
  }

  if (quality.tier === 'C') {
    return { robots: 'noindex, follow', reason: 'Thin content - needs enrichment' };
  }

  return { robots: 'index, follow', reason: 'Quality content' };
}

/**
 * Quality tier display helpers
 */
export function getQualityTierLabel(tier: QualityTier): string {
  switch (tier) {
    case 'A': return 'High Quality';
    case 'B': return 'Good Quality';
    case 'C': return 'Needs Improvement';
  }
}

export function getQualityTierColor(tier: QualityTier): string {
  switch (tier) {
    case 'A': return 'text-green-600 bg-green-100';
    case 'B': return 'text-yellow-600 bg-yellow-100';
    case 'C': return 'text-red-600 bg-red-100';
  }
}
