import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, ChevronRight, Star, Clock, Flame } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TrendingDealsSection = () => {
  const navigate = useNavigate();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['trending-deals-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          merchants (business_name, is_verified, average_rating)
        `)
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .eq('is_featured', true)
        .gte('end_date', new Date().toISOString())
        .order('current_redemptions', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trending Now
          </h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (deals.length === 0) {
    return null;
  }

  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Trending Now
        </h2>
        <Link 
          to="/deals?featured=true" 
          className="text-sm text-primary flex items-center gap-1 hover:underline"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {deals.map((deal, index) => (
          <Card 
            key={deal.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/deal/${deal.id}`)}
          >
            <CardContent className="p-3 flex gap-3">
              {/* Rank Number */}
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="font-bold text-primary">{index + 1}</span>
              </div>
              
              {/* Deal Image */}
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                {deal.image_url ? (
                  <img 
                    src={deal.image_url} 
                    alt={deal.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Deal Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-1">{deal.title}</h3>
                {deal.merchants && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {deal.merchants.business_name}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {deal.discount_percentage && deal.discount_percentage > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {deal.discount_percentage}% OFF
                    </Badge>
                  )}
                  {deal.end_date && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(deal.end_date), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-right shrink-0">
                <p className="font-bold text-sm">₹{deal.discounted_price?.toLocaleString()}</p>
                {deal.original_price && deal.original_price > (deal.discounted_price || 0) && (
                  <p className="text-xs text-muted-foreground line-through">
                    ₹{deal.original_price.toLocaleString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default TrendingDealsSection;
