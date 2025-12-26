import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Types for Knowledge Graph entities
export interface Zone {
  id: string;
  name: string;
  slug: string;
  locality_count: number;
  description?: string;
  geo_center_lat?: number;
  geo_center_lng?: number;
  confidence_score?: number;
  verification_status?: string;
  meta?: Record<string, any>;
}

export interface LocalityWithZone {
  id: number;
  name: string;
  slug: string;
  zone: string;
  zone_id?: string;
  zone_data?: Zone;
  ward_number?: string;
  ward_name?: string;
  pin_codes?: string[];
  police_station?: string;
  municipality?: string;
  assembly_constituency?: string;
  population_estimate?: number;
  geo_lat?: number;
  geo_lng?: number;
  micro_localities?: string[];
  nearby_localities?: string[];
  adjacent_localities?: string[];
  major_landmarks?: any;
  connectivity?: any;
  tags?: string[];
  confidence_score?: number;
  verification_status?: string;
}

export interface EntityLocalityMapping {
  id: string;
  entity_id: string;
  entity_type: 'merchant' | 'deal' | 'event' | 'news_article' | 'product' | 'landmark' | 'poi';
  locality_id: number;
  relation_type: 'located_in' | 'serves' | 'headquartered_in' | 'operates_in' | 'mentioned_in';
  is_primary: boolean;
  confidence_score?: number;
}

export interface EntityCategoryMapping {
  id: string;
  entity_id: string;
  entity_type: 'merchant' | 'deal' | 'event' | 'news_article' | 'product' | 'landmark' | 'poi';
  category_id: number;
  relation_type: 'primary' | 'secondary' | 'related' | 'tagged';
  confidence_score?: number;
}

// Fetch all zones
export const useZones = () => {
  return useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zones")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Zone[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - zones rarely change
  });
};

// Fetch zone by slug
export const useZoneBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["zone", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zones")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (error) throw error;
      return data as Zone;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 30,
  });
};

// Fetch localities by zone
export const useLocalitiesByZone = (zoneId: string) => {
  return useQuery({
    queryKey: ["localities-by-zone", zoneId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("localities")
        .select("*")
        .eq("zone_id", zoneId)
        .order("name");
      
      if (error) throw error;
      return data as LocalityWithZone[];
    },
    enabled: !!zoneId,
    staleTime: 1000 * 60 * 15,
  });
};

// Fetch locality with zone data
export const useLocalityWithZone = (slug: string) => {
  return useQuery({
    queryKey: ["locality-with-zone", slug],
    queryFn: async () => {
      const { data: locality, error: localityError } = await supabase
        .from("localities")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (localityError) throw localityError;
      
      // Fetch zone data if zone_id exists
      let zone_data: Zone | undefined;
      if (locality.zone_id) {
        const { data: zone } = await supabase
          .from("zones")
          .select("*")
          .eq("id", locality.zone_id)
          .single();
        zone_data = zone as Zone;
      }
      
      return { ...locality, zone_data } as LocalityWithZone;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 15,
  });
};

// Map entity to locality
export const mapEntityToLocality = async (
  entityId: string,
  entityType: EntityLocalityMapping['entity_type'],
  localityId: number,
  relationType: EntityLocalityMapping['relation_type'] = 'located_in',
  isPrimary: boolean = true
) => {
  const { data, error } = await supabase
    .from("entity_locality_map")
    .upsert({
      entity_id: entityId,
      entity_type: entityType,
      locality_id: localityId,
      relation_type: relationType,
      is_primary: isPrimary,
    }, {
      onConflict: 'entity_id,entity_type,locality_id,relation_type'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Map entity to category
export const mapEntityToCategory = async (
  entityId: string,
  entityType: EntityCategoryMapping['entity_type'],
  categoryId: number,
  relationType: EntityCategoryMapping['relation_type'] = 'primary'
) => {
  const { data, error } = await supabase
    .from("entity_category_map")
    .upsert({
      entity_id: entityId,
      entity_type: entityType,
      category_id: categoryId,
      relation_type: relationType,
    }, {
      onConflict: 'entity_id,entity_type,category_id,relation_type'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Get entities in a locality
export const useEntitiesInLocality = (localityId: number, entityType?: EntityLocalityMapping['entity_type']) => {
  return useQuery({
    queryKey: ["entities-in-locality", localityId, entityType],
    queryFn: async () => {
      let query = supabase
        .from("entity_locality_map")
        .select("*")
        .eq("locality_id", localityId);
      
      if (entityType) {
        query = query.eq("entity_type", entityType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as EntityLocalityMapping[];
    },
    enabled: !!localityId,
    staleTime: 1000 * 60 * 5,
  });
};

// Get locality coverage stats for graph authority
export const useLocalityCoverageStats = () => {
  return useQuery({
    queryKey: ["locality-coverage-stats"],
    queryFn: async () => {
      const { data: zones } = await supabase
        .from("zones")
        .select("id, name, slug, locality_count");
      
      const { data: localities } = await supabase
        .from("localities")
        .select("id, name, slug, zone_id, verification_status");
      
      const { count: entityMappings } = await supabase
        .from("entity_locality_map")
        .select("*", { count: "exact", head: true });
      
      const { count: categoryMappings } = await supabase
        .from("entity_category_map")
        .select("*", { count: "exact", head: true });
      
      return {
        total_zones: zones?.length || 0,
        total_localities: localities?.length || 0,
        verified_localities: localities?.filter(l => l.verification_status === 'verified').length || 0,
        total_entity_locality_mappings: entityMappings || 0,
        total_entity_category_mappings: categoryMappings || 0,
        zones: zones || [],
      };
    },
    staleTime: 1000 * 60 * 10,
  });
};

// Search localities with fuzzy matching
export const useLocalitySearch = (searchTerm: string) => {
  return useQuery({
    queryKey: ["locality-search", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from("localities")
        .select("id, name, slug, zone, ward_name, pin_codes")
        .or(`name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`)
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: searchTerm.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
};
