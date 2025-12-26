import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// Landmark type for major_landmarks field
export interface Landmark {
  name: string;
  type: string;
  lat?: number;
  lng?: number;
}

// Connectivity type
export interface Connectivity {
  nearest_metro?: string;
  nearest_bus_stops?: string[];
  nearest_railway_station?: string;
  distance_to_airport?: string;
}

export interface Locality {
  id: number;
  name: string;
  slug: string;
  zone: string | null;
  zone_id?: string | null;
  municipality: string | null;
  ward_number: string | null;
  ward_name: string | null;
  police_station: string | null;
  pin_codes: string[] | null;
  assembly_constituency: string | null;
  population_estimate: number | null;
  geo_lat: number | null;
  geo_lng: number | null;
  micro_localities: string[] | null;
  nearby_localities: string[] | null;
  adjacent_localities: string[] | null;
  major_landmarks: Landmark[] | Json | null;
  connectivity: Connectivity | Json | null;
  tags: string[] | null;
  confidence_score?: number | null;
  verification_status?: string | null;
  meta?: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

// Helper to safely parse landmarks from JSON
export const parseLandmarks = (landmarks: Landmark[] | Json | null): Landmark[] => {
  if (!landmarks) return [];
  if (Array.isArray(landmarks)) return landmarks as Landmark[];
  return [];
};

// Helper to safely parse connectivity from JSON
export const parseConnectivity = (connectivity: Connectivity | Json | null): Connectivity | null => {
  if (!connectivity) return null;
  if (typeof connectivity === 'object' && !Array.isArray(connectivity)) {
    return connectivity as Connectivity;
  }
  return null;
};

export function useLocality(slug: string) {
  return useQuery({
    queryKey: ['locality', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('localities')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data as Locality | null;
    },
    enabled: !!slug,
  });
}

export function useNearbyLocalities(slugs: string[] | null) {
  return useQuery({
    queryKey: ['nearby-localities', slugs],
    queryFn: async () => {
      if (!slugs || slugs.length === 0) return [];
      
      const { data, error } = await supabase
        .from('localities')
        .select('id, name, slug, zone, tags')
        .in('slug', slugs);

      if (error) throw error;
      return data as Pick<Locality, 'id' | 'name' | 'slug' | 'zone' | 'tags'>[];
    },
    enabled: !!slugs && slugs.length > 0,
  });
}

export function useLocalityNews(localityName: string) {
  return useQuery({
    queryKey: ['locality-news', localityName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('id, title, slug, category, excerpt, cover_image, published_at')
        .eq('locality', localityName)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!localityName,
  });
}

export function useLocalityEvents(localityName: string) {
  return useQuery({
    queryKey: ['locality-events', localityName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, slug, start_date, venue_name, cover_image, is_free, ticket_price')
        .eq('locality', localityName)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!localityName,
  });
}

export function useLocalityDeals(localityName: string) {
  return useQuery({
    queryKey: ['locality-deals', localityName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('id, title, image_url, discounted_price, original_price, discount_percentage, category')
        .eq('location', localityName)
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
    enabled: !!localityName,
  });
}

export function useLocalityMerchants(localityName: string) {
  return useQuery({
    queryKey: ['locality-merchants', localityName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchants')
        .select('id, business_name, business_type, address, logo_url, average_rating, total_reviews')
        .ilike('address', `%${localityName}%`)
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .limit(6);

      if (error) throw error;
      return data || [];
    },
    enabled: !!localityName,
  });
}
