import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_slug: string | null;
  pillar_slug: string;
  pillar_group: string | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  schema_type: string | null;
  icon: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CategoryLocalityPage {
  id: number;
  category_slug: string;
  locality_slug: string;
  seo_title: string | null;
  seo_description: string | null;
  is_enabled: boolean | null;
}

// Fetch a single category by slug
export function useCategoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async (): Promise<Category | null> => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Error fetching category:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!slug,
  });
}

// Fetch child categories of a parent
export function useChildCategories(parentSlug: string | undefined | null) {
  return useQuery({
    queryKey: ['child-categories', parentSlug],
    queryFn: async (): Promise<Category[]> => {
      const query = supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (parentSlug) {
        query.eq('parent_slug', parentSlug);
      } else {
        query.is('parent_slug', null);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching child categories:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: true,
  });
}

// Fetch all pillars (top-level categories)
export function usePillarCategories() {
  return useQuery({
    queryKey: ['pillar-categories'],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .is('parent_slug', null)
        .eq('is_active', true)
        .order('pillar_group', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching pillar categories:', error);
        return [];
      }
      
      return data || [];
    },
  });
}

// Fetch sibling categories (same parent)
export function useSiblingCategories(parentSlug: string | null, currentSlug: string) {
  return useQuery({
    queryKey: ['sibling-categories', parentSlug, currentSlug],
    queryFn: async (): Promise<Category[]> => {
      const query = supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .neq('slug', currentSlug)
        .order('name', { ascending: true })
        .limit(4);
      
      if (parentSlug) {
        query.eq('parent_slug', parentSlug);
      } else {
        query.is('parent_slug', null);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching sibling categories:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: true,
  });
}

// Fetch category listings - prioritizes services, merchants, events, deals, news
export function useCategoryListings(categorySlug: string | undefined) {
  return useQuery({
    queryKey: ['category-listings', categorySlug],
    queryFn: async () => {
      if (!categorySlug) return { merchants: [], deals: [], events: [], news: [], hasContent: false };
      
      // Fetch merchants matching category
      const { data: merchants } = await supabase
        .from('merchants')
        .select('*')
        .eq('is_active', true)
        .or(`business_type.ilike.%${categorySlug}%`)
        .limit(12);
      
      // Fetch deals matching category
      const { data: deals } = await supabase
        .from('deals')
        .select('*, merchants(business_name, address)')
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .or(`category.ilike.%${categorySlug}%,subcategory.ilike.%${categorySlug}%`)
        .limit(12);
      
      // Fetch events matching category
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .or(`category.ilike.%${categorySlug}%`)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(12);
      
      // Fetch news matching category
      const { data: news } = await supabase
        .from('news_articles')
        .select('*')
        .eq('status', 'published')
        .or(`category.eq.${categorySlug},tags.cs.{${categorySlug}}`)
        .order('published_at', { ascending: false })
        .limit(12);
      
      const hasContent = (merchants?.length || 0) + (deals?.length || 0) + 
                         (events?.length || 0) + (news?.length || 0) > 0;
      
      return {
        merchants: merchants || [],
        deals: deals || [],
        events: events || [],
        news: news || [],
        hasContent,
      };
    },
    enabled: !!categorySlug,
  });
}

// Fetch locality-specific category listings
export function useLocalityCategoryListings(categorySlug: string | undefined, localitySlug: string | undefined) {
  return useQuery({
    queryKey: ['locality-category-listings', categorySlug, localitySlug],
    queryFn: async () => {
      if (!categorySlug || !localitySlug) {
        return { merchants: [], deals: [], events: [], news: [], hasContent: false };
      }
      
      // Fetch merchants in locality matching category
      const { data: merchants } = await supabase
        .from('merchants')
        .select('*')
        .eq('is_active', true)
        .ilike('address', `%${localitySlug.replace(/-/g, ' ')}%`)
        .or(`business_type.ilike.%${categorySlug}%`)
        .limit(12);
      
      // Fetch deals in locality matching category
      const { data: deals } = await supabase
        .from('deals')
        .select('*, merchants(business_name, address)')
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .ilike('location', `%${localitySlug.replace(/-/g, ' ')}%`)
        .or(`category.ilike.%${categorySlug}%,subcategory.ilike.%${categorySlug}%`)
        .limit(12);
      
      // Fetch events in locality matching category
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .ilike('locality', `%${localitySlug.replace(/-/g, ' ')}%`)
        .or(`category.ilike.%${categorySlug}%`)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(12);
      
      // Fetch news about locality matching category
      const { data: news } = await supabase
        .from('news_articles')
        .select('*')
        .eq('status', 'published')
        .ilike('locality', `%${localitySlug.replace(/-/g, ' ')}%`)
        .or(`category.eq.${categorySlug},tags.cs.{${categorySlug}}`)
        .order('published_at', { ascending: false })
        .limit(12);
      
      const hasContent = (merchants?.length || 0) + (deals?.length || 0) + 
                         (events?.length || 0) + (news?.length || 0) > 0;
      
      return {
        merchants: merchants || [],
        deals: deals || [],
        events: events || [],
        news: news || [],
        hasContent,
      };
    },
    enabled: !!categorySlug && !!localitySlug,
  });
}

// Check if category-locality page is enabled
export function useCategoryLocalityPage(categorySlug: string | undefined, localitySlug: string | undefined) {
  return useQuery({
    queryKey: ['category-locality-page', categorySlug, localitySlug],
    queryFn: async (): Promise<CategoryLocalityPage | null> => {
      if (!categorySlug || !localitySlug) return null;
      
      const { data, error } = await supabase
        .from('category_locality_pages')
        .select('*')
        .eq('category_slug', categorySlug)
        .eq('locality_slug', localitySlug)
        .eq('is_enabled', true)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Error fetching category locality page:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!categorySlug && !!localitySlug,
  });
}

// Fetch related categories (same pillar, different parent or siblings)
export function useRelatedCategories(pillarSlug: string | undefined, currentSlug: string) {
  return useQuery({
    queryKey: ['related-categories', pillarSlug, currentSlug],
    queryFn: async (): Promise<Category[]> => {
      if (!pillarSlug) return [];
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('pillar_slug', pillarSlug)
        .eq('is_active', true)
        .neq('slug', currentSlug)
        .limit(6);
      
      if (error) {
        console.error('Error fetching related categories:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!pillarSlug,
  });
}

// Fetch categories by pillar group
export function useCategoriesByGroup(pillarGroup: string | undefined) {
  return useQuery({
    queryKey: ['categories-by-group', pillarGroup],
    queryFn: async (): Promise<Category[]> => {
      if (!pillarGroup) return [];
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('pillar_group', pillarGroup)
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching categories by group:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!pillarGroup,
  });
}

// Get breadcrumb trail for a category
export function useCategoryBreadcrumbs(category: Category | null | undefined) {
  return useQuery({
    queryKey: ['category-breadcrumbs', category?.slug],
    queryFn: async (): Promise<Category[]> => {
      if (!category) return [];
      
      const breadcrumbs: Category[] = [category];
      let currentParent = category.parent_slug;
      
      while (currentParent) {
        const { data } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', currentParent)
          .single();
        
        if (data) {
          breadcrumbs.unshift(data);
          currentParent = data.parent_slug;
        } else {
          break;
        }
      }
      
      return breadcrumbs;
    },
    enabled: !!category,
  });
}
