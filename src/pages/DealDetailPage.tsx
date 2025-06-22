
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Star, Share2, Heart, ShoppingCart, Package, Shield, Truck, Users, Calendar, Phone, Mail, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Deal {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  location: string;
  deal_type: string;
  is_product_sale: boolean;
  inventory_count: number;
  jaicoin_reward: number;
  is_featured: boolean;
  max_redemptions: number;
  current_redemptions: number;
  product_details: any;
  start_date: string;
  end_date: string;
  terms_conditions: string;
  merchant: {
    id: string;
    business_name: string;
    description: string;
    phone: string;
    email: string;
    website: string;
    address: string;
    is_verified: boolean;
    average_rating: number;
    total_reviews: number;
  };
}

const DealDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchDealDetails();
    }
  }, [id]);

  const fetchDealDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          merchants(
            id,
            business_name,
            description,
            phone,
            email,
            website,
            address,
            is_verified,
            average_rating,
            total_reviews
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const dealData = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        category: data.category,
        subcategory: data.subcategory,
        original_price: data.original_price || 0,
        discounted_price: data.discounted_price || 0,
        discount_percentage: data.discount_percentage || 0,
        location: data.location,
        deal_type: data.deal_type || 'service',
        is_product_sale: data.is_product_sale || false,
        inventory_count: data.inventory_count || 0,
        jaicoin_reward: data.jaicoin_reward || 0,
        is_featured: data.is_featured || false,
        max_redemptions: data.max_redemptions || 0,
        current_redemptions: data.current_redemptions || 0,
        product_details: data.product_details || {},
        start_date: data.start_date,
        end_date: data.end_date,
        terms_conditions: data.terms_conditions || '',
        merchant: {
          id: data.merchants?.id || '',
          business_name: data.merchants?.business_name || 'Unknown Merchant',
          description: data.merchants?.description || '',
          phone: data.merchants?.phone || '',
          email: data.merchants?.email || '',
          website: data.merchants?.website || '',
          address: data.merchants?.address || '',
          is_verified: data.merchants?.is_verified || false,
          average_rating: data.merchants?.average_rating || 0,
          total_reviews: data.merchants?.total_reviews || 0
        }
      };

      setDeal(dealData);
    } catch (error) {
      console.error('Error fetching deal details:', error);
      toast({
        title: "Error",
        description: "Failed to load deal details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!deal) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to make a purchase",
          variant: "destructive"
        });
        return;
      }

      // Create a demo order and redirect to checkout
      const orderId = 'demo-' + Math.random().toString(36).substring(7);
      window.location.href = `/checkout/${orderId}`;
    } catch (error) {
      console.error('Error during purchase:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: deal?.title || 'Amazing Deal on HiJaipur',
      text: `Check out this amazing deal: ${deal?.title} at ${deal?.merchant.business_name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Deal link has been copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Loading deal details...</div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Deal not found</h2>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const availableStock = deal.inventory_count - deal.current_redemptions;
  const isOutOfStock = deal.is_product_sale && availableStock <= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? "text-red-500" : ""}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deal Image */}
            <Card className="overflow-hidden">
              <div className="h-80 bg-gradient-to-br from-pink-100 via-orange-100 to-yellow-100 flex items-center justify-center relative">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {deal.category === 'Food & Dining' ? '🍽️' : 
                     deal.category === 'Beauty & Wellness' ? '💆‍♀️' : 
                     deal.category === 'Shopping' ? '🛍️' : 
                     deal.category === 'Electronics' ? '📱' : 
                     deal.category === 'Health & Fitness' ? '💪' : '✨'}
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {deal.subcategory}
                  </Badge>
                </div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4 space-y-2">
                  {deal.is_featured && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold">
                      ⭐ FEATURED
                    </Badge>
                  )}
                  {deal.discount_percentage > 0 && (
                    <Badge className="bg-red-500 text-white font-bold text-lg px-3 py-1">
                      {deal.discount_percentage}% OFF
                    </Badge>
                  )}
                </div>

                {/* Stock Badge */}
                {deal.is_product_sale && (
                  <div className="absolute top-4 right-4">
                    {isOutOfStock ? (
                      <Badge variant="destructive" className="font-bold">
                        Out of Stock
                      </Badge>
                    ) : availableStock <= 10 && (
                      <Badge variant="destructive" className="font-bold">
                        Only {availableStock} left!
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Deal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{deal.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-4">
                      <span className="font-medium text-lg text-gray-900">{deal.merchant.business_name}</span>
                      {deal.merchant.is_verified && (
                        <Badge variant="outline" className="text-green-700 border-green-200">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-3xl font-bold text-gray-900">₹{deal.discounted_price.toLocaleString()}</span>
                      {deal.original_price > 0 && (
                        <span className="text-lg line-through text-gray-500">₹{deal.original_price.toLocaleString()}</span>
                      )}
                    </div>
                    {deal.jaicoin_reward > 0 && (
                      <div className="flex items-center justify-end space-x-1 text-yellow-700">
                        <span className="text-sm">🪙</span>
                        <span className="text-sm font-medium">Earn {deal.jaicoin_reward} JaiCoins</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location and Type */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{deal.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {deal.is_product_sale ? <Package className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    <span>{deal.is_product_sale ? 'Product' : 'Service'}</span>
                  </div>
                  {deal.end_date && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Valid till {new Date(deal.end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {deal.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-gray-700">{deal.description}</p>
                  </div>
                )}

                {/* Product Details */}
                {deal.is_product_sale && deal.product_details && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Product Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {deal.product_details.brand && (
                        <div>
                          <span className="text-gray-600">Brand:</span>
                          <span className="ml-2 font-medium">{deal.product_details.brand}</span>
                        </div>
                      )}
                      {deal.product_details.warranty && (
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span>{deal.product_details.warranty} warranty</span>
                        </div>
                      )}
                      {deal.product_details.delivery_time && (
                        <div className="flex items-center space-x-2">
                          <Truck className="w-4 h-4 text-blue-500" />
                          <span>Delivery in {deal.product_details.delivery_time}</span>
                        </div>
                      )}
                      {deal.product_details.return_policy && (
                        <div>
                          <span className="text-gray-600">Returns:</span>
                          <span className="ml-2 font-medium">{deal.product_details.return_policy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabs for additional information */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="merchant">Merchant</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    {deal.terms_conditions ? (
                      <div>
                        <h4 className="font-semibold mb-3">Terms & Conditions</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{deal.terms_conditions}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No additional terms and conditions.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="merchant" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{deal.merchant.business_name}</CardTitle>
                      {deal.merchant.average_rating > 0 && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{deal.merchant.average_rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-600">({deal.merchant.total_reviews} reviews)</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {deal.merchant.description && (
                      <p className="text-gray-700">{deal.merchant.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      {deal.merchant.address && (
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{deal.merchant.address}</span>
                        </div>
                      )}
                      {deal.merchant.phone && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{deal.merchant.phone}</span>
                        </div>
                      )}
                      {deal.merchant.email && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{deal.merchant.email}</span>
                        </div>
                      )}
                      {deal.merchant.website && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <a href={deal.merchant.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Reviews coming soon!</p>
                      <p className="text-sm">Be the first to review this deal.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Purchase Options */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Purchase Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quantity Selector (for products) */}
                  {deal.is_product_sale && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <div className="flex items-center space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="font-medium">{quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setQuantity(quantity + 1)}
                          disabled={quantity >= availableStock}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-medium">₹{deal.discounted_price.toLocaleString()}</span>
                    </div>
                    {deal.is_product_sale && quantity > 1 && (
                      <>
                        <div className="flex justify-between">
                          <span>Quantity:</span>
                          <span>{quantity}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>₹{(deal.discounted_price * quantity).toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <Separator />

                  {/* Purchase Button */}
                  <Button 
                    onClick={handlePurchase}
                    disabled={isOutOfStock}
                    className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    {isOutOfStock ? (
                      'Out of Stock'
                    ) : deal.is_product_sale ? (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Buy Now - ₹{(deal.discounted_price * quantity).toLocaleString()}
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5 mr-2" />
                        Book Now - ₹{deal.discounted_price.toLocaleString()}
                      </>
                    )}
                  </Button>

                  {/* Stats */}
                  {deal.current_redemptions > 0 && (
                    <div className="text-center text-sm text-gray-600">
                      <Users className="w-4 h-4 inline mr-1" />
                      {deal.current_redemptions} people have bought this deal
                    </div>
                  )}

                  {/* Security Note */}
                  <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                    <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium">Secure Payment</p>
                      <p>Your transaction is protected and encrypted.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealDetailPage;
