import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NearbyLocality {
  id: number;
  name: string;
  slug: string;
  tags: string[] | null;
  zone_id: string | null;
  isAdjacent?: boolean;
  isSameZone?: boolean;
}

/**
 * Fetches nearby localities based on adjacency and zone relationships.
 * Priority: adjacent_localities > same zone > nearby_localities
 * Zones are used internally but never exposed to UI.
 */
export function useNearbyLocalitiesEnhanced(
  currentSlug: string | undefined,
  adjacentSlugs: string[] | null,
  nearbySlugs: string[] | null,
  zoneId: string | null
) {
  return useQuery({
    queryKey: ['nearby-localities-enhanced', currentSlug, adjacentSlugs, nearbySlugs, zoneId],
    queryFn: async () => {
      if (!currentSlug) return [];

      const results: NearbyLocality[] = [];
      const seenSlugs = new Set<string>([currentSlug]);

      // 1. First priority: Adjacent localities (movement corridors)
      if (adjacentSlugs?.length) {
        const { data: adjacentData } = await supabase
          .from('localities')
          .select('id, name, slug, tags, zone_id')
          .in('slug', adjacentSlugs)
          .limit(5);
        
        adjacentData?.forEach(loc => {
          if (!seenSlugs.has(loc.slug)) {
            seenSlugs.add(loc.slug);
            results.push({ ...loc, isAdjacent: true, isSameZone: loc.zone_id === zoneId });
          }
        });
      }

      // 2. Second priority: Same zone localities
      if (zoneId && results.length < 5) {
        const { data: zoneData } = await supabase
          .from('localities')
          .select('id, name, slug, tags, zone_id')
          .eq('zone_id', zoneId)
          .neq('slug', currentSlug)
          .limit(8);
        
        zoneData?.forEach(loc => {
          if (!seenSlugs.has(loc.slug) && results.length < 5) {
            seenSlugs.add(loc.slug);
            results.push({ ...loc, isAdjacent: false, isSameZone: true });
          }
        });
      }

      // 3. Third priority: nearby_localities from DB
      if (nearbySlugs?.length && results.length < 5) {
        const needed = 5 - results.length;
        const filteredSlugs = nearbySlugs.filter(s => !seenSlugs.has(s)).slice(0, needed);
        
        if (filteredSlugs.length) {
          const { data: nearbyData } = await supabase
            .from('localities')
            .select('id, name, slug, tags, zone_id')
            .in('slug', filteredSlugs);
          
          nearbyData?.forEach(loc => {
            if (!seenSlugs.has(loc.slug) && results.length < 5) {
              seenSlugs.add(loc.slug);
              results.push({ ...loc, isAdjacent: false, isSameZone: loc.zone_id === zoneId });
            }
          });
        }
      }

      return results.slice(0, 5);
    },
    enabled: !!currentSlug,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch nearby localities for category pages
 * Uses zone-based adjacency internally, never exposes zones to UI
 */
export function useNearbyForCategory(
  localitySlug: string | undefined,
  limit: number = 3
) {
  return useQuery({
    queryKey: ['nearby-for-category', localitySlug, limit],
    queryFn: async () => {
      if (!localitySlug) return [];

      // First get the current locality's zone and adjacent areas
      const { data: currentLocality } = await supabase
        .from('localities')
        .select('id, zone_id, adjacent_localities, nearby_localities')
        .eq('slug', localitySlug)
        .maybeSingle();

      if (!currentLocality) return [];

      const results: { name: string; slug: string }[] = [];
      const seenSlugs = new Set<string>([localitySlug]);

      // Priority 1: Adjacent localities
      if (currentLocality.adjacent_localities?.length) {
        const { data: adjacentData } = await supabase
          .from('localities')
          .select('name, slug')
          .in('slug', currentLocality.adjacent_localities)
          .limit(limit);
        
        adjacentData?.forEach(loc => {
          if (!seenSlugs.has(loc.slug) && results.length < limit) {
            seenSlugs.add(loc.slug);
            results.push(loc);
          }
        });
      }

      // Priority 2: Same zone
      if (currentLocality.zone_id && results.length < limit) {
        const { data: zoneData } = await supabase
          .from('localities')
          .select('name, slug')
          .eq('zone_id', currentLocality.zone_id)
          .neq('slug', localitySlug)
          .limit(limit * 2);
        
        zoneData?.forEach(loc => {
          if (!seenSlugs.has(loc.slug) && results.length < limit) {
            seenSlugs.add(loc.slug);
            results.push(loc);
          }
        });
      }

      return results;
    },
    enabled: !!localitySlug,
    staleTime: 5 * 60 * 1000,
  });
}
