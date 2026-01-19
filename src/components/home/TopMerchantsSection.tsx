import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, Star, BadgeCheck, ChevronRight } from "lucide-react";
import { getMerchantPlaceholder } from "@/utils/placeholderImages";

const TopMerchantsSection = () => {
  const { data: merchants = [], isLoading } = useQuery({
    queryKey: ['top-merchants-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('is_active', true)
        .order('average_rating', { ascending: false })
        .limit(8);
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
      <section className="py-4">
        <div className="px-4 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500">
              <Store className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-foreground">Top Merchants</h2>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pl-4 pb-2 scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-32 h-36 rounded-xl shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  if (merchants.length === 0) return null;

  return (
    <section className="py-4">
      <div className="px-4 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-500">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Top Merchants</h2>
            <p className="text-[10px] text-muted-foreground">Trusted local businesses</p>
          </div>
        </div>
        <Link 
          to="/merchants" 
          className="text-xs text-primary flex items-center gap-1 hover:underline font-medium"
        >
          View All
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pl-4 pb-2 scrollbar-hide">
        {merchants.map((merchant) => (
          <Link key={merchant.id} to={`/merchant/${merchant.slug || merchant.id}`}>
            <Card className="w-32 shrink-0 hover:shadow-lg transition-all duration-300 border-0 shadow-md group overflow-hidden">
              <CardContent className="p-3">
                <div className="flex flex-col items-center text-center">
                  {/* Logo */}
                  <div className="relative mb-2">
                    {merchant.logo_url ? (
                      <img 
                        src={merchant.logo_url} 
                        alt={merchant.business_name}
                        className="w-14 h-14 rounded-2xl object-cover shadow-md ring-2 ring-white group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.src = getMerchantPlaceholder(merchant.business_type);
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-md ring-2 ring-white">
                        <span className="text-2xl">{categoryEmojis[merchant.business_type || ''] || '🏪'}</span>
                      </div>
                    )}
                    {merchant.is_verified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <BadgeCheck className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Name */}
                  <h3 className="font-semibold text-xs line-clamp-2 text-foreground leading-tight mb-1">
                    {merchant.business_name}
                  </h3>
                  
                  {/* Category */}
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mb-1">
                    {merchant.business_type || 'Business'}
                  </p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-foreground">
                      {merchant.average_rating?.toFixed(1) || '4.5'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        
        {/* View More Card */}
        <Link to="/merchants">
          <Card className="w-32 h-36 shrink-0 flex items-center justify-center bg-teal-50 border-dashed border-2 border-teal-200 hover:border-teal-400 transition-colors">
            <CardContent className="p-3 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-teal-500 flex items-center justify-center mb-2">
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-medium text-teal-700">View All</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  );
};

export default TopMerchantsSection;
