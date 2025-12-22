import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, Star, BadgeCheck, ChevronRight } from "lucide-react";

const TopMerchantsSection = () => {
  const { data: merchants = [], isLoading } = useQuery({
    queryKey: ['top-merchants-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('is_active', true)
        .order('average_rating', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
  });

  const categoryEmojis: Record<string, string> = {
    'Food & Dining': '🍽️',
    'Beauty & Wellness': '💅',
    'Shopping': '🛍️',
    'Electronics': '📱',
    'Health & Fitness': '💪',
    'Automotive': '🚗',
    'Services': '🔧',
    'Travel': '✈️',
    'Education': '📚',
  };

  if (isLoading) {
    return (
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            Top Merchants
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-40 h-28 rounded-xl shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  if (merchants.length === 0) return null;

  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Store className="w-5 h-5 text-primary" />
          Top Merchants in Jaipur
        </h2>
        <Link 
          to="/merchants" 
          className="text-sm text-primary flex items-center gap-1 hover:underline"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {merchants.map((merchant) => (
          <Link key={merchant.id} to={`/merchant/${merchant.id}`}>
            <Card className="w-40 shrink-0 hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex flex-col items-center text-center">
                  {merchant.logo_url ? (
                    <img 
                      src={merchant.logo_url} 
                      alt={merchant.business_name}
                      className="w-12 h-12 rounded-xl object-cover mb-2"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                      <span className="text-xl">{categoryEmojis[merchant.business_type || ''] || '🏪'}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 mb-1">
                    <h3 className="font-medium text-xs line-clamp-1">{merchant.business_name}</h3>
                    {merchant.is_verified && (
                      <BadgeCheck className="w-3 h-3 text-primary shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{merchant.average_rating?.toFixed(1) || '4.5'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TopMerchantsSection;
