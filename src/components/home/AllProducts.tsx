
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Package } from "lucide-react";
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

const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const categories = [
    "all", "Electronics", "Fashion", "Food & Dining", 
    "Beauty & Wellness", "Home & Garden", "Books & Media", "Grocery"
  ];

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, selectedCategory, sortBy]);

  const fetchAllProducts = async () => {
    try {
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
        .gt('inventory_count', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts = data?.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        category: item.category,
        subcategory: item.subcategory || '',
        brand: item.brand || '',
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
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products.filter(product => {
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.discounted_price || a.original_price) - (b.discounted_price || b.original_price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.discounted_price || b.original_price) - (a.discounted_price || a.original_price));
        break;
      case 'rating':
        filtered.sort((a, b) => b.average_rating - a.average_rating);
        break;
      case 'discount':
        filtered.sort((a, b) => b.discount_percentage - a.discount_percentage);
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    setFilteredProducts(filtered);
  };

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-16 bg-gray-200 rounded animate-pulse mb-6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <Package className="w-8 h-8 mr-3 text-blue-600" />
          All Products ({filteredProducts.length})
        </h2>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="discount">Best Discounts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default AllProducts;
