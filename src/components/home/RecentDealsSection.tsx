import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ChevronRight, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const RecentDealsSection = () => {
  const navigate = useNavigate();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['recent-deals-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          merchants (business_name, is_verified, average_rating)
        `)
        .eq('status', 'published')
        .eq('approval_status', 'approved')
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(6);
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
            <Clock className="w-5 h-5 text-primary" />
            Just Added
          </h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-72 h-44 rounded-xl shrink-0" />
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
          <Clock className="w-5 h-5 text-primary" />
          Just Added
        </h2>
        <Link 
          to="/deals" 
          className="text-sm text-primary flex items-center gap-1 hover:underline"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {deals.map((deal) => (
          <article 
            key={deal.id}
            onClick={() => navigate(`/deal/${deal.id}`)}
            className="w-72 shrink-0 cursor-pointer group"
          >
            {/* Image */}
            <div className="relative h-36 rounded-t-2xl overflow-hidden bg-muted">
              {deal.image_url ? (
                <img 
                  src={deal.image_url} 
                  alt={deal.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              
              {/* Discount badge */}
              {deal.discount_percentage && deal.discount_percentage > 0 && (
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-bold">
                  {deal.discount_percentage}% OFF
                </Badge>
              )}
              
              {/* New badge */}
              <Badge className="absolute top-3 right-3 bg-green-500 text-white text-xs">
                New
              </Badge>
            </div>

            {/* Content */}
            <div className="p-4 bg-card rounded-b-2xl border border-t-0 border-border/50">
              <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-tight mb-1">
                {deal.title}
              </h3>
              
              {deal.merchants && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span className="truncate">{deal.merchants.business_name}</span>
                  {deal.merchants.average_rating && (
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{deal.merchants.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Price and time */}
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-2">
                  {deal.discounted_price && (
                    <span className="text-lg font-bold text-foreground">
                      ₹{deal.discounted_price.toLocaleString()}
                    </span>
                  )}
                  {deal.original_price && deal.discounted_price && deal.original_price > deal.discounted_price && (
                    <span className="text-xs text-muted-foreground line-through">
                      ₹{deal.original_price.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(deal.created_at || new Date()), { addSuffix: true })}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RecentDealsSection;
