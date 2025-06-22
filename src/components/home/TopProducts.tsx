
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Package, Truck } from "lucide-react";
import { Link } from "react-router-dom";

interface Deal {
  id: string;
  title: string;
  description?: string;
  discounted_price: number;
  original_price: number;
  discount_percentage: number;
  location: string;
  category: string;
  subcategory?: string;
  is_featured: boolean;
  jaicoin_reward: number;
  is_product_sale: boolean;
  inventory_count: number;
  product_details?: any;
  merchants?: {
    business_name: string;
    is_verified: boolean;
    average_rating: number;
  };
}

interface TopProductsProps {
  deals: Deal[];
}

const TopProducts = ({ deals }: TopProductsProps) => {
  const productDeals = deals
    .filter(deal => deal.is_product_sale)
    .slice(0, 6);

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Package className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">Top Products</h2>
        </div>
        <Button variant="outline" size="sm">View All Products</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productDeals.map((deal) => (
          <Card key={deal.id} className="group hover:shadow-lg transition-all duration-300 border-indigo-200">
            <div className="relative">
              <div className="h-32 bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl mb-2">📦</div>
                  <div className="text-sm font-medium text-gray-600">{deal.subcategory}</div>
                </div>
              </div>
              
              <div className="absolute top-2 left-2">
                <Badge className="bg-indigo-500 text-white font-bold">
                  Product
                </Badge>
              </div>
              
              {deal.discount_percentage > 0 && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-red-500 text-white font-bold">
                    {deal.discount_percentage}% OFF
                  </Badge>
                </div>
              )}
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors line-clamp-2">
                {deal.title}
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{deal.merchants?.business_name}</span>
                {deal.merchants?.is_verified && (
                  <Badge variant="outline" className="text-green-700 border-green-200">
                    ✓ Verified
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">₹{deal.discounted_price?.toLocaleString()}</span>
                    {deal.original_price > 0 && (
                      <span className="text-sm line-through text-gray-500">₹{deal.original_price?.toLocaleString()}</span>
                    )}
                  </div>
                  {deal.merchants?.average_rating > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{deal.merchants.average_rating}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Truck className="w-4 h-4" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="text-indigo-600 font-medium">
                    {deal.inventory_count > 0 ? `${deal.inventory_count} in stock` : 'Limited stock'}
                  </div>
                </div>

                {deal.jaicoin_reward > 0 && (
                  <div className="flex items-center justify-center text-yellow-700 bg-yellow-50 py-1 px-2 rounded">
                    <span className="text-xs mr-1">🪙</span>
                    <span className="text-sm font-medium">Earn +{deal.jaicoin_reward} JaiCoins</span>
                  </div>
                )}

                <Link to={`/deal/${deal.id}`}>
                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600">
                    Buy Now
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

export default TopProducts;
