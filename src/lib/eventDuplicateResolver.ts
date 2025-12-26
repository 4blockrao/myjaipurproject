/**
 * Event Duplicate Detection & Resolution
 * Prevents duplicate events from being created and consolidates authority
 */

import { supabase } from "@/integrations/supabase/client";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  confidence: 'high' | 'medium' | 'low' | 'none';
  matchingEvents: DuplicateMatch[];
  recommendation: 'skip' | 'merge' | 'create' | 'review';
}

export interface DuplicateMatch {
  id: string;
  title: string;
  slug: string;
  start_date: string;
  venue_name: string | null;
  similarity_score: number;
  match_reasons: string[];
}

interface EventInput {
  title: string;
  start_date: string;
  end_date?: string | null;
  venue_name?: string | null;
  organizer_name?: string | null;
  locality?: string | null;
}

/**
 * Normalize string for comparison
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special chars
    .replace(/\s+/g, ' ')    // Normalize spaces
    .trim();
}

/**
 * Calculate string similarity (Jaccard-like)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(normalizeString(str1).split(' '));
  const words2 = new Set(normalizeString(str2).split(' '));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Check if dates are on the same day
 */
function isSameDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.toISOString().split('T')[0] === d2.toISOString().split('T')[0];
}

/**
 * Check if dates are within a range (for multi-day events)
 */
function datesOverlap(start1: string, end1: string | null, start2: string, end2: string | null): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = end1 ? new Date(end1).getTime() : s1 + 86400000; // Default 1 day
  const s2 = new Date(start2).getTime();
  const e2 = end2 ? new Date(end2).getTime() : s2 + 86400000;
  
  return s1 <= e2 && s2 <= e1;
}

/**
 * Check for potential duplicate events
 */
export async function checkForDuplicates(event: EventInput): Promise<DuplicateCheckResult> {
  const result: DuplicateCheckResult = {
    isDuplicate: false,
    confidence: 'none',
    matchingEvents: [],
    recommendation: 'create',
  };

  // Get events within ±3 days of the target date
  const targetDate = new Date(event.start_date);
  const startRange = new Date(targetDate);
  startRange.setDate(startRange.getDate() - 3);
  const endRange = new Date(targetDate);
  endRange.setDate(endRange.getDate() + 3);

  const { data: candidates, error } = await supabase
    .from('events')
    .select('id, title, slug, start_date, end_date, venue_name, organizer_name, locality')
    .gte('start_date', startRange.toISOString())
    .lte('start_date', endRange.toISOString())
    .eq('status', 'published');

  if (error || !candidates || candidates.length === 0) {
    return result;
  }

  const normalizedTitle = normalizeString(event.title);

  for (const candidate of candidates) {
    const matchReasons: string[] = [];
    let score = 0;

    // Title similarity (highest weight)
    const titleSimilarity = calculateSimilarity(event.title, candidate.title);
    if (titleSimilarity > 0.8) {
      matchReasons.push('Very similar title');
      score += 50;
    } else if (titleSimilarity > 0.6) {
      matchReasons.push('Similar title');
      score += 30;
    } else if (titleSimilarity > 0.4) {
      matchReasons.push('Partially similar title');
      score += 15;
    }

    // Same date
    if (isSameDay(event.start_date, candidate.start_date)) {
      matchReasons.push('Same date');
      score += 25;
    } else if (datesOverlap(event.start_date, event.end_date || null, candidate.start_date, candidate.end_date)) {
      matchReasons.push('Overlapping dates');
      score += 15;
    }

    // Same venue
    if (event.venue_name && candidate.venue_name) {
      const venueSimilarity = calculateSimilarity(event.venue_name, candidate.venue_name);
      if (venueSimilarity > 0.7) {
        matchReasons.push('Same venue');
        score += 20;
      }
    }

    // Same organizer
    if (event.organizer_name && candidate.organizer_name) {
      const orgSimilarity = calculateSimilarity(event.organizer_name, candidate.organizer_name);
      if (orgSimilarity > 0.7) {
        matchReasons.push('Same organizer');
        score += 10;
      }
    }

    // Same locality
    if (event.locality && candidate.locality) {
      if (normalizeString(event.locality) === normalizeString(candidate.locality)) {
        matchReasons.push('Same locality');
        score += 5;
      }
    }

    // If score is significant, add to matches
    if (score >= 40) {
      result.matchingEvents.push({
        id: candidate.id,
        title: candidate.title,
        slug: candidate.slug,
        start_date: candidate.start_date,
        venue_name: candidate.venue_name,
        similarity_score: score,
        match_reasons: matchReasons,
      });
    }
  }

  // Sort by similarity score
  result.matchingEvents.sort((a, b) => b.similarity_score - a.similarity_score);

  // Determine overall result
  if (result.matchingEvents.length > 0) {
    const topMatch = result.matchingEvents[0];
    
    if (topMatch.similarity_score >= 85) {
      result.isDuplicate = true;
      result.confidence = 'high';
      result.recommendation = 'skip';
    } else if (topMatch.similarity_score >= 65) {
      result.isDuplicate = true;
      result.confidence = 'medium';
      result.recommendation = 'merge';
    } else {
      result.isDuplicate = false;
      result.confidence = 'low';
      result.recommendation = 'review';
    }
  }

  return result;
}

/**
 * Detect event series from title
 */
export function detectEventSeries(title: string): {
  isSeriesEvent: boolean;
  seriesName: string | null;
  edition: string | null;
} {
  // Common patterns for series events
  const yearPattern = /\s*(\d{4})\s*$/;
  const editionPattern = /\s*(edition|vol\.?|volume|part|ep\.?|episode)\s*(\d+|\w+)/i;
  const tourPattern = /\s*(tour|show|concert|workshop|meetup)\s*(jaipur|india)?/i;

  let seriesName = title;
  let edition: string | null = null;
  let isSeriesEvent = false;

  // Check for year in title
  const yearMatch = title.match(yearPattern);
  if (yearMatch) {
    seriesName = title.replace(yearPattern, '').trim();
    edition = yearMatch[1];
    isSeriesEvent = true;
  }

  // Check for edition/volume patterns
  const editionMatch = title.match(editionPattern);
  if (editionMatch) {
    seriesName = title.replace(editionPattern, '').trim();
    edition = editionMatch[2];
    isSeriesEvent = true;
  }

  // Check for tour patterns
  const tourMatch = title.match(tourPattern);
  if (tourMatch) {
    isSeriesEvent = true;
  }

  return {
    isSeriesEvent,
    seriesName: isSeriesEvent ? seriesName : null,
    edition,
  };
}

/**
 * Generate canonical slug for an event
 */
export function generateCanonicalSlug(title: string, date: string): string {
  const year = new Date(date).getFullYear();
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  // Remove existing year if present
  const withoutYear = baseSlug.replace(/-\d{4}$/, '');
  
  return `${withoutYear}-jaipur-${year}`;
}
