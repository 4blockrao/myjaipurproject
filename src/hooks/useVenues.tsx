import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============= Types =============

export interface Venue {
  id: string;
  name: string;
  slug: string;
  address?: string;
  locality?: string;
  locality_slug?: string;
  zone_name?: string;
  description?: string;
  seating_capacity?: number;
  parking_available?: boolean;
  metro_nearby?: string;
  accessibility_info?: string;
  latitude?: number;
  longitude?: number;
  cover_image?: string;
  gallery_images?: string[];
  contact_phone?: string;
  contact_email?: string;
  website?: string;
}

export interface VenueEvent {
  id: string;
  title: string;
  slug: string;
  start_date: string;
  end_date?: string | null;
  cover_image?: string | null;
  category: string;
  is_free?: boolean | null;
  ticket_price?: number | null;
  status?: string | null;
}

// ============= Hooks =============

/**
 * Get venue by slug (derived from venue_name)
 */
export function useVenue(venueSlug: string | undefined) {
  return useQuery({
    queryKey: ['venue', venueSlug],
    queryFn: async (): Promise<Venue | null> => {
      if (!venueSlug) return null;

      // Convert slug to searchable venue name
      const venueName = venueSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Get events at this venue to build venue profile
      const { data: events, error } = await supabase
        .from('events')
        .select('venue_name, venue_address, locality, latitude, longitude, cover_image')
        .ilike('venue_name', `%${venueName.replace(/-/g, '%')}%`)
        .limit(1);

      if (error || !events?.length) return null;

      const event = events[0];

      // Get locality data for zone enrichment
      let zone_name: string | undefined;
      let locality_slug: string | undefined;
      if (event.locality) {
        const { data: locality } = await supabase
          .from('localities')
          .select('slug, zone_id')
          .ilike('name', event.locality)
          .single();

        if (locality) {
          locality_slug = locality.slug;
          if (locality.zone_id) {
            const { data: zone } = await supabase
              .from('zones')
              .select('name')
              .eq('id', locality.zone_id)
              .single();
            if (zone) zone_name = zone.name;
          }
        }
      }

      return {
        id: venueSlug,
        name: event.venue_name || venueName,
        slug: venueSlug,
        address: event.venue_address || undefined,
        locality: event.locality || undefined,
        locality_slug,
        zone_name,
        latitude: event.latitude || undefined,
        longitude: event.longitude || undefined,
        cover_image: event.cover_image || undefined,
      };
    },
    enabled: !!venueSlug
  });
}

/**
 * Get upcoming events at a venue
 */
export function useVenueUpcomingEvents(venueName: string | undefined, limit = 10) {
  return useQuery({
    queryKey: ['venue-upcoming-events', venueName, limit],
    queryFn: async (): Promise<VenueEvent[]> => {
      if (!venueName) return [];

      const { data, error } = await supabase
        .from('events')
        .select('id, title, slug, start_date, end_date, cover_image, category, is_free, ticket_price, status')
        .ilike('venue_name', `%${venueName}%`)
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: !!venueName
  });
}

/**
 * Get past events at a venue
 */
export function useVenuePastEvents(venueName: string | undefined, limit = 10) {
  return useQuery({
    queryKey: ['venue-past-events', venueName, limit],
    queryFn: async (): Promise<VenueEvent[]> => {
      if (!venueName) return [];

      const { data, error } = await supabase
        .from('events')
        .select('id, title, slug, start_date, end_date, cover_image, category, is_free, ticket_price, status')
        .ilike('venue_name', `%${venueName}%`)
        .lt('start_date', new Date().toISOString())
        .order('start_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: !!venueName
  });
}

/**
 * Get all unique venues from events
 */
export function useAllVenues(limit = 50) {
  return useQuery({
    queryKey: ['all-venues', limit],
    queryFn: async (): Promise<Venue[]> => {
      const { data, error } = await supabase
        .from('events')
        .select('venue_name, venue_address, locality, cover_image')
        .not('venue_name', 'is', null)
        .limit(200);

      if (error) throw error;

      // Deduplicate by venue name
      const venueMap = new Map<string, Venue>();
      (data || []).forEach(event => {
        if (event.venue_name && !venueMap.has(event.venue_name)) {
          const slug = event.venue_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
          
          venueMap.set(event.venue_name, {
            id: slug,
            name: event.venue_name,
            slug,
            address: event.venue_address || undefined,
            locality: event.locality || undefined,
            cover_image: event.cover_image || undefined,
          });
        }
      });

      return Array.from(venueMap.values()).slice(0, limit);
    }
  });
}

/**
 * Generate slug from venue name
 */
export function generateVenueSlug(venueName: string): string {
  return venueName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
