import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Grid3X3, ChevronRight } from "lucide-react";

const categoryIcons: Record<string, string> = {
  'food-dining': '🍽️',
  'beauty-wellness': '💅',
  'shopping': '🛍️',
  'electronics': '📱',
  'health-fitness': '💪',
  'automotive': '🚗',
  'services': '🔧',
  'travel': '✈️',
  'education': '📚',
  'entertainment': '🎭',
  'home': '🏠',
  'fashion': '👗',
};

const PopularCategoriesSection = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['popular-categories-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('level', 1)
        .eq('is_active', true)
        .order('name')
        .limit(8);
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-primary" />
            Browse Categories
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-primary" />
          Browse Categories
        </h2>
        <Link 
          to="/categories" 
          className="text-sm text-primary flex items-center gap-1 hover:underline"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {categories.map((category) => (
          <Link key={category.id} to={`/categories/${category.slug}`}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <span className="text-lg">
                    {category.icon || categoryIcons[category.slug] || '📦'}
                  </span>
                </div>
                <h3 className="font-medium text-xs line-clamp-2">{category.name}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PopularCategoriesSection;
