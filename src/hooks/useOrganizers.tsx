import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============= Types =============

export interface Organizer {
  id: string;
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  social_links?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };
  logo?: string;
  total_events: number;
  upcoming_events: number;
  localities_active: string[];
  categories_focus: string[];
}

export interface OrganizerEvent {
  id: string;
  title: string;
  slug: string;
  start_date: string;
  end_date?: string | null;
  cover_image?: string | null;
  category: string;
  is_free?: boolean | null;
  ticket_price?: number | null;
  venue_name?: string | null;
  locality?: string | null;
  status?: string | null;
}

// ============= Hooks =============

/**
 * Get organizer by slug
 */
export function useOrganizer(organizerSlug: string | undefined) {
  return useQuery({
    queryKey: ['organizer', organizerSlug],
    queryFn: async (): Promise<Organizer | null> => {
      if (!organizerSlug) return null;

      // Convert slug back to name pattern
      const organizerName = organizerSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Get all events by this organizer
      const { data: events, error } = await supabase
        .from('events')
        .select('id, title, organizer_name, organizer_email, organizer_phone, category, locality, start_date, status')
        .ilike('organizer_name', `%${organizerName.replace(/-/g, '%')}%`);

      if (error || !events?.length) return null;

      const firstEvent = events[0];
      const now = new Date().toISOString();

      // Calculate statistics
      const upcomingCount = events.filter(e => e.start_date >= now && e.status === 'published').length;
      const localities = [...new Set(events.map(e => e.locality).filter(Boolean))] as string[];
      const categories = [...new Set(events.map(e => e.category).filter(Boolean))] as string[];

      return {
        id: organizerSlug,
        name: firstEvent.organizer_name || organizerName,
        slug: organizerSlug,
        email: firstEvent.organizer_email || undefined,
        phone: firstEvent.organizer_phone || undefined,
        total_events: events.length,
        upcoming_events: upcomingCount,
        localities_active: localities,
        categories_focus: categories,
      };
    },
    enabled: !!organizerSlug
  });
}

/**
 * Get upcoming events by organizer
 */
export function useOrganizerUpcomingEvents(organizerName: string | undefined, limit = 10) {
  return useQuery({
    queryKey: ['organizer-upcoming-events', organizerName, limit],
    queryFn: async (): Promise<OrganizerEvent[]> => {
      if (!organizerName) return [];

      const { data, error } = await supabase
        .from('events')
        .select('id, title, slug, start_date, end_date, cover_image, category, is_free, ticket_price, venue_name, locality, status')
        .ilike('organizer_name', `%${organizerName}%`)
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: !!organizerName
  });
}

/**
 * Get past events by organizer
 */
export function useOrganizerPastEvents(organizerName: string | undefined, limit = 10) {
  return useQuery({
    queryKey: ['organizer-past-events', organizerName, limit],
    queryFn: async (): Promise<OrganizerEvent[]> => {
      if (!organizerName) return [];

      const { data, error } = await supabase
        .from('events')
        .select('id, title, slug, start_date, end_date, cover_image, category, is_free, ticket_price, venue_name, locality, status')
        .ilike('organizer_name', `%${organizerName}%`)
        .lt('start_date', new Date().toISOString())
        .order('start_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: !!organizerName
  });
}

/**
 * Get all unique organizers from events
 */
export function useAllOrganizers(limit = 50) {
  return useQuery({
    queryKey: ['all-organizers', limit],
    queryFn: async (): Promise<Organizer[]> => {
      const { data, error } = await supabase
        .from('events')
        .select('organizer_name, organizer_email, category, locality, start_date, status')
        .not('organizer_name', 'is', null)
        .limit(500);

      if (error) throw error;

      const now = new Date().toISOString();

      // Group by organizer name
      const organizerMap = new Map<string, {
        name: string;
        email?: string;
        events: number;
        upcoming: number;
        localities: Set<string>;
        categories: Set<string>;
      }>();

      (data || []).forEach(event => {
        if (!event.organizer_name) return;

        const existing = organizerMap.get(event.organizer_name);
        if (existing) {
          existing.events++;
          if (event.start_date >= now && event.status === 'published') {
            existing.upcoming++;
          }
          if (event.locality) existing.localities.add(event.locality);
          if (event.category) existing.categories.add(event.category);
        } else {
          organizerMap.set(event.organizer_name, {
            name: event.organizer_name,
            email: event.organizer_email || undefined,
            events: 1,
            upcoming: event.start_date >= now && event.status === 'published' ? 1 : 0,
            localities: new Set(event.locality ? [event.locality] : []),
            categories: new Set(event.category ? [event.category] : []),
          });
        }
      });

      return Array.from(organizerMap.values())
        .map(org => ({
          id: generateOrganizerSlug(org.name),
          name: org.name,
          slug: generateOrganizerSlug(org.name),
          email: org.email,
          total_events: org.events,
          upcoming_events: org.upcoming,
          localities_active: Array.from(org.localities),
          categories_focus: Array.from(org.categories),
        }))
        .sort((a, b) => b.total_events - a.total_events)
        .slice(0, limit);
    }
  });
}

/**
 * Generate slug from organizer name
 */
export function generateOrganizerSlug(organizerName: string): string {
  return organizerName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
