
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Star, Truck, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  inventory_count: number;
  product_details: any;
  merchant: {
    business_name: string;
    is_verified: boolean;
  };
}

const ProductShowcase = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          merchants!inner(
            business_name,
            is_verified
          )
        `)
        .eq('is_active', true)
        .eq('is_product_sale', true)
        .gt('inventory_count', 0)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      const formattedProducts = data?.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        original_price: item.original_price || 0,
        discounted_price: item.discounted_price || 0,
        discount_percentage: item.discount_percentage || 0,
        inventory_count: item.inventory_count || 0,
        product_details: item.product_details,
        merchant: {
          business_name: item.merchants?.business_name || 'Unknown Merchant',
          is_verified: item.merchants?.is_verified || false
        }
      })) || [];

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (product: Product) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to purchase products",
          variant: "destructive"
        });
        return;
      }

      // Navigate to deal detail page
      window.location.href = `/deal/${product.id}`;
    } catch (error) {
      console.error('Purchase error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
          <Package className="w-8 h-8 mr-3 text-blue-600" />
          Featured Products
        </h2>
        <p className="text-lg text-gray-600">
          Buy directly from our verified merchants with instant delivery
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
            <div className="relative">
              <div className="h-48 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
              
              {product.discount_percentage > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-500 text-white font-bold">
                    {product.discount_percentage}% OFF
                  </Badge>
                </div>
              )}
              
              {product.inventory_count && product.inventory_count <= 10 && (
                <div className="absolute top-4 right-4">
                  <Badge variant="destructive" className="font-bold">
                    Only {product.inventory_count} left!
                  </Badge>
                </div>
              )}
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                {product.title}
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{product.merchant.business_name}</span>
                {product.merchant.is_verified && (
                  <Badge variant="outline" className="text-green-700 border-green-200">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900">₹{product.discounted_price.toLocaleString()}</span>
                    {product.original_price > 0 && (
                      <span className="text-sm line-through text-gray-500">₹{product.original_price.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                {/* Product Details */}
                {product.product_details && (
                  <div className="space-y-2 text-sm text-gray-600">
                    {product.product_details.warranty && (
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>{product.product_details.warranty} warranty</span>
                      </div>
                    )}
                    {product.product_details.delivery_time && (
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4" />
                        <span>Delivery in {product.product_details.delivery_time}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                {product.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                )}

                {/* View Details Button */}
                <Link to={`/deal/${product.id}`}>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    View Details - ₹{product.discounted_price.toLocaleString()}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default ProductShowcase;
