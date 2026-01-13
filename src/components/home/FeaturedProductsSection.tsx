import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, ChevronRight, Star, Sparkles } from "lucide-react";

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
            <ShoppingBag className="w-5 h-5 text-primary" />
            Featured Products
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
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
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          Featured Products
        </h2>
        <Link 
          to="/deals?type=products" 
          className="text-sm text-primary flex items-center gap-1 hover:underline"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => (
          <Link key={product.id} to={`/deal/${product.id}`}>
            <Card className="hover:shadow-md transition-shadow overflow-hidden">
              <div className="relative aspect-square bg-muted">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                {product.is_featured && (
                  <Badge className="absolute top-2 left-2 bg-amber-500 text-xs gap-1">
                    <Sparkles className="w-3 h-3" />
                    Featured
                  </Badge>
                )}
                {product.discount_percentage && product.discount_percentage > 0 && (
                  <Badge className="absolute top-2 right-2 bg-primary text-xs">
                    {product.discount_percentage}% OFF
                  </Badge>
                )}
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium text-sm line-clamp-2">{product.title}</h3>
                {product.merchants && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {product.merchants.business_name}
                  </p>
                )}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-bold text-foreground">
                    ₹{product.discounted_price?.toLocaleString()}
                  </span>
                  {product.original_price && product.original_price > (product.discounted_price || 0) && (
                    <span className="text-xs text-muted-foreground line-through">
                      ₹{product.original_price.toLocaleString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
