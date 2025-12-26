import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// ============= Core Types =============

export type EventRow = Database['public']['Tables']['events']['Row'];

export interface Event extends EventRow {
  // Computed/joined fields
  locality_data?: LocalityReference | null;
  zone_data?: ZoneReference | null;
  venue_data?: VenueReference | null;
  nearby_localities?: string[];
  mapped_categories?: string[];
}

export interface LocalityReference {
  id: number;
  name: string;
  slug: string;
  zone_id?: string | null;
  zone_name?: string | null;
}

export interface ZoneReference {
  id: string;
  name: string;
  slug: string;
}

export interface VenueReference {
  id: string;
  name: string;
  address?: string;
  locality_slug?: string;
  latitude?: number;
  longitude?: number;
}

export interface EventFilters {
  search?: string;
  category?: string;
  locality?: string;
  zone?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isFree?: boolean;
  isOnline?: boolean;
  isFeatured?: boolean;
  limit?: number;
}

// ============= Event Category Types =============

export const EVENT_CATEGORIES = [
  'concerts',
  'workshops',
  'exhibitions',
  'festivals',
  'sports',
  'nightlife',
  'food',
  'business',
  'wellness',
  'kids',
  'community',
  'cultural',
  'tech',
  'art',
  'education',
  'other'
] as const;

export type EventCategory = typeof EVENT_CATEGORIES[number];

// ============= Recurrence Types =============

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // Every X days/weeks/months
  daysOfWeek?: number[]; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  endDate?: string;
  occurrences?: number;
}

// ============= Core Hooks =============

/**
 * Fetch a single event by slug with locality enrichment
 */
export function useEvent(slug: string | undefined) {
  return useQuery({
    queryKey: ['event-detail', slug],
    queryFn: async (): Promise<Event | null> => {
      if (!slug) return null;
      
      const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      if (!event) return null;

      // Enrich with locality data if available
      let locality_data: LocalityReference | null = null;
      if (event.locality) {
        const { data: locality } = await supabase
          .from('localities')
          .select('id, name, slug, zone_id')
          .ilike('name', event.locality)
          .single();
        
        if (locality) {
          locality_data = {
            id: locality.id,
            name: locality.name,
            slug: locality.slug,
            zone_id: locality.zone_id
          };

          // Get zone name if zone_id exists
          if (locality.zone_id) {
            const { data: zone } = await supabase
              .from('zones')
              .select('name')
              .eq('id', locality.zone_id)
              .single();
            
            if (zone) {
              locality_data.zone_name = zone.name;
            }
          }
        }
      }

      return {
        ...event,
        locality_data
      };
    },
    enabled: !!slug
  });
}

/**
 * Fetch events with filters and locality enrichment
 */
export function useEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async (): Promise<Event[]> => {
      let query = supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      // Apply filters
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters.locality) {
        query = query.ilike('locality', filters.locality);
      }
      if (filters.dateFrom) {
        query = query.gte('start_date', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        query = query.lte('start_date', filters.dateTo.toISOString());
      }
      if (filters.isFree) {
        query = query.eq('is_free', true);
      }
      if (filters.isOnline !== undefined) {
        query = query.eq('is_online', filters.isOnline);
      }
      if (filters.isFeatured) {
        query = query.eq('is_featured', true);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Apply search filter client-side
      let events = data || [];
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        events = events.filter(e => 
          e.title.toLowerCase().includes(searchLower) ||
          e.description?.toLowerCase().includes(searchLower) ||
          e.venue_name?.toLowerCase().includes(searchLower)
        );
      }

      return events;
    }
  });
}

/**
 * Fetch events by zone using knowledge graph
 */
export function useEventsByZone(zoneSlug: string | undefined) {
  return useQuery({
    queryKey: ['events-by-zone', zoneSlug],
    queryFn: async (): Promise<Event[]> => {
      if (!zoneSlug) return [];

      // First get zone ID
      const { data: zone, error: zoneError } = await supabase
        .from('zones')
        .select('id, name')
        .eq('slug', zoneSlug)
        .single();

      if (zoneError || !zone) return [];

      // Get localities in this zone
      const { data: localities, error: localitiesError } = await supabase
        .from('localities')
        .select('name')
        .eq('zone_id', zone.id);

      if (localitiesError || !localities?.length) return [];

      const localityNames = localities.map(l => l.name);

      // Get events in these localities
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())
        .in('locality', localityNames)
        .order('start_date', { ascending: true })
        .limit(20);

      if (eventsError) throw eventsError;

      return events || [];
    },
    enabled: !!zoneSlug
  });
}

/**
 * Fetch events in a locality and its nearby localities
 */
export function useEventsNearLocality(localitySlug: string | undefined) {
  return useQuery({
    queryKey: ['events-near-locality', localitySlug],
    queryFn: async (): Promise<{ locality: Event[]; nearby: Event[] }> => {
      if (!localitySlug) return { locality: [], nearby: [] };

      // Get locality with nearby localities
      const { data: locality, error: localityError } = await supabase
        .from('localities')
        .select('name, nearby_localities, adjacent_localities')
        .eq('slug', localitySlug)
        .single();

      if (localityError || !locality) return { locality: [], nearby: [] };

      // Get events in the main locality
      const { data: localityEvents, error: localityEventsError } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())
        .ilike('locality', locality.name)
        .order('start_date', { ascending: true })
        .limit(10);

      if (localityEventsError) throw localityEventsError;

      // Get nearby locality names
      const nearbyNames = [
        ...(locality.nearby_localities || []),
        ...(locality.adjacent_localities || [])
      ].slice(0, 5);

      // Get events in nearby localities
      let nearbyEvents: Event[] = [];
      if (nearbyNames.length > 0) {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'published')
          .gte('start_date', new Date().toISOString())
          .in('locality', nearbyNames)
          .order('start_date', { ascending: true })
          .limit(10);

        if (!error && data) {
          nearbyEvents = data;
        }
      }

      return {
        locality: localityEvents || [],
        nearby: nearbyEvents
      };
    },
    enabled: !!localitySlug
  });
}

/**
 * Fetch featured events
 */
export function useFeaturedEvents(limit = 5) {
  return useEvents({
    isFeatured: true,
    limit
  });
}

/**
 * Fetch events by category
 */
export function useEventsByCategory(category: string, limit = 20) {
  return useEvents({
    category,
    limit
  });
}

/**
 * Fetch free events
 */
export function useFreeEvents(limit = 20) {
  return useEvents({
    isFree: true,
    limit
  });
}

/**
 * Fetch online events
 */
export function useOnlineEvents(limit = 20) {
  return useEvents({
    isOnline: true,
    limit
  });
}

// ============= Entity Mapping Functions =============

/**
 * Map an event to a locality in the knowledge graph
 */
export async function mapEventToLocality(
  eventId: string,
  localityId: number,
  options: {
    isPrimary?: boolean;
    confidenceScore?: number;
    relationType?: string;
  } = {}
) {
  const { isPrimary = true, confidenceScore = 0.85, relationType = 'hosted_in' } = options;

  const { data, error } = await supabase
    .from('entity_locality_map')
    .upsert({
      entity_id: eventId,
      entity_type: 'event',
      locality_id: localityId,
      is_primary: isPrimary,
      confidence_score: confidenceScore,
      relation_type: relationType,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'entity_id,locality_id'
    });

  if (error) throw error;
  return data;
}

/**
 * Map an event to a category in the knowledge graph
 */
export async function mapEventToCategory(
  eventId: string,
  categoryId: number,
  options: {
    confidenceScore?: number;
    relationType?: string;
  } = {}
) {
  const { confidenceScore = 0.9, relationType = 'belongs_to' } = options;

  const { data, error } = await supabase
    .from('entity_category_map')
    .upsert({
      entity_id: eventId,
      entity_type: 'event',
      category_id: categoryId,
      confidence_score: confidenceScore,
      relation_type: relationType
    }, {
      onConflict: 'entity_id,category_id'
    });

  if (error) throw error;
  return data;
}

/**
 * Create a relationship between event and venue
 */
export async function createEventVenueRelationship(
  eventId: string,
  venueId: string,
  options: {
    weight?: number;
    meta?: Record<string, string | number | boolean | null>;
  } = {}
) {
  const { weight = 1.0, meta = {} } = options;

  const { data, error } = await supabase
    .from('entity_relationships')
    .insert([{
      source_entity_id: eventId,
      source_entity_type: 'event',
      target_entity_id: venueId,
      target_entity_type: 'venue',
      relationship_type: 'hosted_at',
      weight,
      meta: meta as Record<string, string | number | boolean | null>
    }]);

  if (error) throw error;
  return data;
}

/**
 * Create a relationship between event and organizer
 */
export async function createEventOrganizerRelationship(
  eventId: string,
  organizerId: string,
  relationshipType: 'organized_by' | 'performed_by' | 'sponsored_by' = 'organized_by',
  options: {
    weight?: number;
    meta?: Record<string, string | number | boolean | null>;
  } = {}
) {
  const { weight = 1.0, meta = {} } = options;

  const { data, error } = await supabase
    .from('entity_relationships')
    .insert([{
      source_entity_id: eventId,
      source_entity_type: 'event',
      target_entity_id: organizerId,
      target_entity_type: 'organizer',
      relationship_type: relationshipType,
      weight,
      meta: meta as Record<string, string | number | boolean | null>
    }]);

  if (error) throw error;
  return data;
}

// ============= Event Interest Hook =============

export function useEventInterest(eventId: string | undefined, userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: isInterested } = useQuery({
    queryKey: ['event-interest', eventId, userId],
    queryFn: async () => {
      if (!eventId || !userId) return false;
      
      const { data } = await supabase
        .from('event_interests')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();
      
      return !!data;
    },
    enabled: !!eventId && !!userId
  });

  const toggleInterest = useMutation({
    mutationFn: async () => {
      if (!eventId || !userId) throw new Error('Missing event or user ID');
      
      if (isInterested) {
        await supabase
          .from('event_interests')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('event_interests')
          .insert({ event_id: eventId, user_id: userId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-interest', eventId, userId] });
      queryClient.invalidateQueries({ queryKey: ['event-detail'] });
    }
  });

  return {
    isInterested: isInterested || false,
    toggleInterest
  };
}

// ============= Event Statistics =============

export function useEventStats() {
  return useQuery({
    queryKey: ['event-stats'],
    queryFn: async () => {
      const now = new Date().toISOString();

      // Get counts in parallel
      const [
        { count: totalUpcoming },
        { count: freeEvents },
        { count: featuredEvents }
      ] = await Promise.all([
        supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published')
          .gte('start_date', now),
        supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published')
          .eq('is_free', true)
          .gte('start_date', now),
        supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published')
          .eq('is_featured', true)
          .gte('start_date', now)
      ]);

      // Get category distribution
      const { data: categories } = await supabase
        .from('events')
        .select('category')
        .eq('status', 'published')
        .gte('start_date', now);

      const categoryDistribution: Record<string, number> = {};
      categories?.forEach(e => {
        categoryDistribution[e.category] = (categoryDistribution[e.category] || 0) + 1;
      });

      return {
        totalUpcoming: totalUpcoming || 0,
        freeEvents: freeEvents || 0,
        featuredEvents: featuredEvents || 0,
        categoryDistribution
      };
    }
  });
}

// ============= Locality Detection Helper =============

/**
 * Detect locality from venue address/name
 * Returns matched locality slug or null
 */
export async function detectLocalityFromVenue(
  venueName: string,
  venueAddress?: string
): Promise<{ localityId: number; localitySlug: string; confidence: number } | null> {
  const searchText = `${venueName} ${venueAddress || ''}`.toLowerCase();

  // Get all localities
  const { data: localities } = await supabase
    .from('localities')
    .select('id, name, slug, micro_localities');

  if (!localities) return null;

  for (const locality of localities) {
    // Check main locality name
    if (searchText.includes(locality.name.toLowerCase())) {
      return {
        localityId: locality.id,
        localitySlug: locality.slug,
        confidence: 0.9
      };
    }

    // Check micro localities
    const microLocalities = locality.micro_localities as string[] | null;
    if (microLocalities) {
      for (const micro of microLocalities) {
        if (searchText.includes(micro.toLowerCase())) {
          return {
            localityId: locality.id,
            localitySlug: locality.slug,
            confidence: 0.75
          };
        }
      }
    }
  }

  return null;
}
