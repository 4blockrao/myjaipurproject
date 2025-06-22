
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  inventory_count: number;
  specifications: any;
  images: string[];
  tags: string[];
  is_featured: boolean;
  jaicoin_reward: number;
  average_rating: number;
  total_reviews: number;
  merchants?: {
    business_name: string;
    is_verified: boolean;
  };
}

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      // Fetch featured products from the products table
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          merchants!inner(
            business_name,
            is_verified
          )
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .gt('inventory_count', 0)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Transform products data to match Product interface
      const formattedProducts = data?.map(item => ({
        id: item.id,
        name: item.name || 'Untitled Product',
        description: item.description || '',
        category: item.category || 'General',
        subcategory: item.subcategory || '',
        brand: item.brand || 'Generic',
        original_price: item.original_price || 0,
        discounted_price: item.discounted_price || 0,
        discount_percentage: item.discount_percentage || 0,
        inventory_count: item.inventory_count || 0,
        specifications: item.specifications || {},
        images: item.images || [],
        tags: item.tags || [],
        is_featured: item.is_featured || false,
        jaicoin_reward: item.jaicoin_reward || 0,
        average_rating: item.average_rating || 0,
        total_reviews: item.total_reviews || 0,
        merchants: {
          business_name: item.merchants?.business_name || 'Unknown Merchant',
          is_verified: item.merchants?.is_verified || false
        }
      })) || [];

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-12">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Featured Products</h3>
          <p className="text-gray-500">Check back later for amazing product deals!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
            <Package className="w-8 h-8 mr-3 text-blue-600" />
            Featured Products
          </h2>
          <p className="text-lg text-gray-600">
            Premium products from our verified merchants
          </p>
        </div>
        <Button variant="outline" size="sm" className="text-blue-600 border-blue-300 hover:bg-blue-50">
          View All Products
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
