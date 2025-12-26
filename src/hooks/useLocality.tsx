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

// Connectivity type - extended to handle all variations
export interface Connectivity {
  nearest_metro?: string;
  nearest_bus_stops?: string[];
  nearest_bus_stations?: string[]; // Alternative field name
  nearest_railway_station?: string;
  distance_to_airport?: string;
  distance_to_airport_km?: number; // Numeric variant
}

// Future profile types for meta field expansion
export interface EconomyProfile {
  commercial_zones?: string[];
  business_density?: 'low' | 'medium' | 'high';
  major_markets?: string[];
  employment_hubs?: string[];
}

export interface SocialProfile {
  healthcare_access?: 'low' | 'medium' | 'high';
  education_facilities?: string[];
  recreation_options?: string[];
  community_centers?: string[];
}

export interface LocalityMeta {
  economy_profile?: EconomyProfile;
  social_profile?: SocialProfile;
  seo_focus_keywords?: string[];
  data_sources?: string[];
  last_verified_at?: string;
  verified_by?: string;
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
  meta?: LocalityMeta | Json | null;
  created_at: string | null;
  updated_at: string | null;
}

// Helper to safely parse landmarks from JSON
export const parseLandmarks = (landmarks: Landmark[] | Json | null): Landmark[] => {
  if (!landmarks) return [];
  if (Array.isArray(landmarks)) {
    // Validate each landmark has required fields
    return landmarks.filter(
      (l): l is Landmark => 
        typeof l === 'object' && 
        l !== null && 
        'name' in l && 
        'type' in l
    );
  }
  return [];
};

// Helper to safely parse connectivity from JSON
export const parseConnectivity = (connectivity: Connectivity | Json | null): Connectivity => {
  if (!connectivity) return {};
  if (typeof connectivity === 'object' && !Array.isArray(connectivity)) {
    return connectivity as Connectivity;
  }
  return {};
};

// Helper to safely parse meta field from JSON
export const parseMeta = (meta: LocalityMeta | Json | null): LocalityMeta => {
  if (!meta) return {};
  if (typeof meta === 'object' && !Array.isArray(meta)) {
    return meta as LocalityMeta;
  }
  return {};
};

// Helper to get bus stops from connectivity (handles both field names)
export const getBusStops = (connectivity: Connectivity): string[] => {
  return connectivity.nearest_bus_stops || connectivity.nearest_bus_stations || [];
};

// Helper to get airport distance (handles both formats)
export const getAirportDistance = (connectivity: Connectivity): string | null => {
  if (typeof connectivity.distance_to_airport_km === 'number') {
    return `${connectivity.distance_to_airport_km} km`;
  }
  return connectivity.distance_to_airport || null;
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
