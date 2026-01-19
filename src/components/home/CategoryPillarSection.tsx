import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, MapPin, Star, LucideIcon } from "lucide-react";
import { getPlaceholderImage } from "@/utils/placeholderImages";

interface CategoryPillarSectionProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  category: string;
  viewAllLink: string;
  limit?: number;
}

const CategoryPillarSection = ({
  title,
  icon: Icon,
  iconColor,
  category,
  viewAllLink,
  limit = 6
}: CategoryPillarSectionProps) => {
  const navigate = useNavigate();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: [`category-pillar-${category}`],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          merchants (business_name, is_verified, average_rating, locality)
        `)
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .ilike('category', `%${category}%`)
        .gte('end_date', new Date().toISOString())
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="py-4">
        <div className="px-4 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${iconColor}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-foreground">{title}</h2>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pl-4 pb-2 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-44 h-52 rounded-2xl shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  if (deals.length === 0) {
    return null;
  }

  return (
    <section className="py-4">
      <div className="px-4 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${iconColor}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-bold text-foreground">{title}</h2>
        </div>
        <Link 
          to={viewAllLink} 
          className="text-xs text-primary flex items-center gap-1 hover:underline font-medium"
        >
          View All
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pl-4 pb-2 scrollbar-hide">
        {deals.map((deal) => {
          const imageUrl = deal.image_url || getPlaceholderImage(category);
          
          return (
            <Card 
              key={deal.id}
              onClick={() => navigate(deal.slug ? `/deals/${deal.slug}` : `/deal/${deal.id}`)}
              className="w-44 shrink-0 cursor-pointer group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-28 overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt={deal.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = getPlaceholderImage(category);
                  }}
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Discount badge */}
                {deal.discount_percentage && deal.discount_percentage > 0 && (
                  <Badge className="absolute top-2 right-2 bg-primary text-[10px] font-bold px-1.5 py-0.5">
                    {deal.discount_percentage}% OFF
                  </Badge>
                )}
                
                {/* Location */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <MapPin className="w-2.5 h-2.5 text-white" />
                    <span className="text-[10px] text-white font-medium truncate max-w-[80px]">
                      {deal.location || deal.merchants?.locality || 'Jaipur'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-2.5">
                <h3 className="font-semibold text-xs line-clamp-2 leading-tight text-foreground mb-1">
                  {deal.title}
                </h3>
                
                {deal.merchants && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1.5">
                    <span className="truncate">{deal.merchants.business_name}</span>
                    {deal.merchants.average_rating && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>{deal.merchants.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Price */}
                <div className="flex items-baseline gap-1.5">
                  {deal.discounted_price && (
                    <span className="text-sm font-bold text-foreground">
                      ₹{deal.discounted_price.toLocaleString()}
                    </span>
                  )}
                  {deal.original_price && deal.discounted_price && deal.original_price > deal.discounted_price && (
                    <span className="text-[10px] text-muted-foreground line-through">
                      ₹{deal.original_price.toLocaleString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {/* View More Card */}
        <Link to={viewAllLink}>
          <Card className="w-32 h-52 shrink-0 flex items-center justify-center bg-muted/30 border-dashed border-2 border-muted-foreground/20 hover:border-primary/50 transition-colors">
            <CardContent className="p-4 text-center">
              <div className={`w-10 h-10 mx-auto rounded-full ${iconColor} flex items-center justify-center mb-2`}>
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">View All</p>
              <p className="text-xs text-muted-foreground">{title}</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  );
};

export default CategoryPillarSection;
