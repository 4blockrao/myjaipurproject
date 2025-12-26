import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Store, 
  Utensils, 
  Stethoscope, 
  GraduationCap, 
  Home, 
  Sparkles,
  ChevronRight,
  Grid3X3
} from 'lucide-react';

interface LocalityCategoryBrowseProps {
  localityName: string;
  localitySlug: string;
}

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  'restaurants': <Utensils className="w-4 h-4" />,
  'healthcare': <Stethoscope className="w-4 h-4" />,
  'education': <GraduationCap className="w-4 h-4" />,
  'real-estate': <Home className="w-4 h-4" />,
  'beauty': <Sparkles className="w-4 h-4" />,
  'default': <Store className="w-4 h-4" />,
};

// Popular categories for quick access
const popularCategories = [
  { name: 'Restaurants & Food', slug: 'restaurants', icon: 'restaurants' },
  { name: 'Healthcare & Clinics', slug: 'healthcare', icon: 'healthcare' },
  { name: 'Education & Coaching', slug: 'education', icon: 'education' },
  { name: 'Beauty & Wellness', slug: 'beauty-wellness', icon: 'beauty' },
  { name: 'Home Services', slug: 'home-services', icon: 'default' },
  { name: 'Real Estate', slug: 'real-estate', icon: 'real-estate' },
];

export function LocalityCategoryBrowse({ localityName, localitySlug }: LocalityCategoryBrowseProps) {
  // Fetch all parent categories (pillars)
  const { data: pillars = [], isLoading } = useQuery({
    queryKey: ['category-pillars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, icon, pillar_group')
        .is('parent_slug', null)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="mb-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      {/* Quick Action Chips */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-primary" />
          Explore in {localityName}
        </h2>
        <div className="flex flex-wrap gap-2">
          {popularCategories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/jaipur/${localitySlug}/${cat.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 transition-colors"
            >
              {categoryIcons[cat.icon] || categoryIcons.default}
              <span className="text-sm font-medium text-foreground">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* All Categories by Pillar */}
      <div className="border border-border rounded-xl p-4">
        <h3 className="font-semibold text-foreground mb-4">Browse All Categories</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pillars.map((pillar) => (
            <Link
              key={pillar.id}
              to={`/jaipur/${localitySlug}/${pillar.slug}`}
              className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  {categoryIcons[pillar.slug] || categoryIcons.default}
                </div>
                <div>
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {pillar.name}
                  </span>
                  {pillar.pillar_group && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {pillar.pillar_group}
                    </Badge>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
