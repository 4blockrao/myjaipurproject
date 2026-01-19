import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, ChevronRight, Star, Sparkles } from "lucide-react";
import { getPlaceholderImage } from "@/utils/placeholderImages";

const FeaturedProductsSection = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['featured-products-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          merchants (business_name, is_verified, average_rating)
        `)
        .eq('is_product_sale', true)
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(4); // Only 4 products for 2 rows
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-foreground">Featured Products</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Featured Products</h2>
            <p className="text-[10px] text-muted-foreground">Handpicked deals for you</p>
          </div>
        </div>
        <Link 
          to="/deals?type=products" 
          className="text-xs text-primary flex items-center gap-1 hover:underline font-medium"
        >
          View All
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => {
          const imageUrl = product.image_url || getPlaceholderImage(product.category);
          
          return (
            <Link key={product.id} to={product.slug ? `/deals/${product.slug}` : `/deal/${product.id}`}>
              <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-md group">
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = getPlaceholderImage(product.category);
                    }}
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {product.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-amber-500 text-[10px] gap-1 px-1.5 py-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      Featured
                    </Badge>
                  )}
                  {product.discount_percentage && product.discount_percentage > 0 && (
                    <Badge className="absolute top-2 right-2 bg-primary text-[10px] font-bold px-1.5 py-0.5">
                      {product.discount_percentage}% OFF
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2 leading-tight text-foreground">{product.title}</h3>
                  {product.merchants && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                      <span className="truncate">{product.merchants.business_name}</span>
                      {product.merchants.average_rating && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span>{product.merchants.average_rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-bold text-foreground">
                      ₹{product.discounted_price?.toLocaleString()}
                    </span>
                    {product.original_price && product.original_price > (product.discounted_price || 0) && (
                      <span className="text-[10px] text-muted-foreground line-through">
                        ₹{product.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
