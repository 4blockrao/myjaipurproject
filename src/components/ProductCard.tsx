
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Shield, Package } from "lucide-react";
import { Link } from "react-router-dom";

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

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'Electronics': return '📱';
      case 'Fashion': return '👗';
      case 'Food & Dining': return '🍽️';
      case 'Beauty & Wellness': return '💄';
      case 'Home & Garden': return '🏡';
      case 'Books & Media': return '📚';
      case 'Grocery': return '🛒';
      default: return '🛍️';
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-white">
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">{getCategoryEmoji(product.category)}</div>
            <div className="text-sm font-medium text-gray-600">{product.subcategory}</div>
          </div>
        </div>
        
        {product.is_featured && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold animate-pulse">
              ⭐ FEATURED
            </Badge>
          </div>
        )}
        
        {product.discount_percentage > 0 && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-red-500 text-white font-bold">
              {product.discount_percentage}% OFF
            </Badge>
          </div>
        )}

        {product.inventory_count <= 10 && product.inventory_count > 0 && (
          <div className="absolute bottom-4 left-4">
            <Badge variant="destructive" className="font-bold text-xs">
              Only {product.inventory_count} left!
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
          {product.name}
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span className="font-medium text-gray-900">{product.merchants?.business_name}</span>
          {product.merchants?.is_verified && (
            <Badge variant="outline" className="text-green-700 border-green-200">
              <Shield className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Brand & Description */}
          {product.brand && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Brand:</span> {product.brand}
            </div>
          )}
          
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                ₹{product.discounted_price?.toLocaleString() || product.original_price?.toLocaleString()}
              </span>
              {product.original_price > 0 && product.discounted_price && product.discounted_price < product.original_price && (
                <span className="text-sm line-through text-gray-500">
                  ₹{product.original_price?.toLocaleString()}
                </span>
              )}
            </div>
            {product.average_rating > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{product.average_rating}</span>
                <span className="text-xs text-gray-500">({product.total_reviews})</span>
              </div>
            )}
          </div>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="space-y-1 text-sm text-gray-600">
              {Object.entries(product.specifications || {}).slice(0, 2).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize">{key.replace('_', ' ')}:</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          {/* JaiCoin Reward */}
          {product.jaicoin_reward > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-yellow-700 font-medium">
                +{product.jaicoin_reward} JaiCoins
              </span>
              <span className="text-green-600 font-medium">
                {product.inventory_count} in stock
              </span>
            </div>
          )}

          {/* Action Button */}
          <Link to={`/deal/${product.id}`}>
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy Now - ₹{(product.discounted_price || product.original_price)?.toLocaleString()}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
