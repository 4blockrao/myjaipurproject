
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  MapPin, 
  Clock, 
  Shield, 
  Truck,
  Star,
  Phone,
  Mail,
  Globe,
  Package,
  Coins,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/AuthModal";

interface DealDetail {
  id: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  category: string;
  subcategory: string;
  location: string;
  primary_locality?: string;
  deal_type?: string;
  is_product_sale?: boolean;
  inventory_count?: number;
  jaicoin_reward: number;
  terms_conditions: string;
  usage_terms: string;
  product_details?: {
    brand?: string;
    warranty?: string;
    delivery_time?: string;
    return_policy?: string;
  };
  start_date: string;
  end_date: string;
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDealDetails();
    }

    // Check auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && isAuthModalOpen) {
        setIsAuthModalOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [id, isAuthModalOpen]);

  const fetchDealDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          merchants!inner(
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
        .eq('is_active', true)
        .single();

      if (error) throw error;

      if (data) {
        setDeal({
          id: data.id,
          title: data.title,
          description: data.description || '',
          original_price: data.original_price || 0,
          discounted_price: data.discounted_price || 0,
          discount_percentage: data.discount_percentage || 0,
          category: data.category || '',
          subcategory: data.subcategory || '',
          location: data.location || '',
          primary_locality: (data as any).primary_locality || '',
          deal_type: (data as any).deal_type || 'discount',
          is_product_sale: (data as any).is_product_sale || false,
          inventory_count: (data as any).inventory_count || 0,
          jaicoin_reward: data.jaicoin_reward || 0,
          terms_conditions: data.terms_conditions || '',
          usage_terms: data.usage_terms || '',
          product_details: (data as any).product_details,
          start_date: data.start_date,
          end_date: data.end_date,
          merchant: {
            id: data.merchants.i,
            business_name: data.merchants.business_name || 'Unknown Merchant',
            description: data.merchants.description || '',
            phone: data.merchants.phone || '',
            email: data.merchants.email || '',
            website: data.merchants.website || '',
            address: data.merchants.address || '',
            is_verified: data.merchants.is_verified || false,
            average_rating: data.merchants.average_rating || 0,
            total_reviews: data.merchants.total_reviews || 0
          }
        });
      }
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

  const handleQuantityChange = (increment: boolean) => {
    if (increment && quantity < (deal?.inventory_count || 1)) {
      setQuantity(quantity + 1);
    } else if (!increment && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!deal) return;

    setIsProcessingOrder(true);
    try {
      const totalAmount = deal.discounted_price * quantity;
      
      // For demo purposes, create a mock order ID and navigate to checkout
      const mockOrderId = `order_${Date.now()}`;
      
      // Store order data temporarily in localStorage for checkout page
      localStorage.setItem(`order_${mockOrderId}`, JSON.stringify({
        id: mockOrderId,
        deal_id: deal.id,
        quantity: quantity,
        total_amount: totalAmount,
        status: 'pending',
        deal: {
          title: deal.title,
          discounted_price: deal.discounted_price,
          jaicoin_reward: deal.jaicoin_reward,
          is_product_sale: deal.is_product_sale
        },
        merchant: deal.merchant
      }));

      // Navigate to checkout page
      navigate(`/checkout/${mockOrderId}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: deal?.title,
          text: `Check out this amazing deal: ${deal?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Deal link has been copied to clipboard",
      });
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
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = deal.discounted_price * quantity;
  const totalSavings = (deal.original_price - deal.discounted_price) * quantity;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product/Deal Image */}
            <Card className="overflow-hidden">
              <div className="h-80 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center relative">
                <Package className="w-24 h-24 text-gray-400" />
                
                {deal.discount_percentage > 0 && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-500 text-white font-bold text-lg px-3 py-2">
                      {deal.discount_percentage}% OFF
                    </Badge>
                  </div>
                )}
                
                {deal.is_product_sale && deal.inventory_count && deal.inventory_count <= 10 && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="destructive" className="font-bold">
                      Only {deal.inventory_count} left!
                    </Badge>
                  </div>
                )}
              </div>
            </Card>

            {/* Deal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="w-fit">
                    {deal.category}
                  </Badge>
                  {deal.merchant.is_verified && (
                    <Badge className="bg-green-100 text-green-700">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified Merchant
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl lg:text-3xl text-gray-900">
                  {deal.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {deal.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{deal.discounted_price.toLocaleString()}
                    </span>
                    {deal.original_price > 0 && (
                      <span className="text-xl line-through text-gray-500">
                        ₹{deal.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {totalSavings > 0 && (
                    <p className="text-green-600 font-medium">
                      You save ₹{totalSavings.toLocaleString()}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Product Details */}
                {deal.product_details && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Product Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {deal.product_details.brand && (
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Brand</Badge>
                          <span>{deal.product_details.brand}</span>
                        </div>
                      )}
                      {deal.product_details.warranty && (
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span>{deal.product_details.warranty}</span>
                        </div>
                      )}
                      {deal.product_details.delivery_time && (
                        <div className="flex items-center space-x-2">
                          <Truck className="w-4 h-4 text-green-500" />
                          <span>Delivery: {deal.product_details.delivery_time}</span>
                        </div>
                      )}
                      {deal.product_details.return_policy && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{deal.product_details.return_policy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Location & Availability */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Availability</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>{deal.primary_locality || deal.location}</span>
                    </div>
                    {deal.jaicoin_reward > 0 && (
                      <div className="flex items-center space-x-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span>Earn {deal.jaicoin_reward} JaiCoins on purchase</span>
                      </div>
                    )}
                    {deal.end_date && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>Valid until {new Date(deal.end_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms & Conditions */}
                {(deal.terms_conditions || deal.usage_terms) && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Terms & Conditions</h3>
                      <div className="text-sm text-gray-600 space-y-2">
                        {deal.terms_conditions && (
                          <p>{deal.terms_conditions}</p>
                        )}
                        {deal.usage_terms && (
                          <p>{deal.usage_terms}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Merchant Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>About {deal.merchant.business_name}</span>
                  {deal.merchant.average_rating > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {deal.merchant.average_rating.toFixed(1)} ({deal.merchant.total_reviews} reviews)
                      </span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deal.merchant.description && (
                  <p className="text-gray-600">{deal.merchant.description}</p>
                )}
                
                <div className="space-y-2 text-sm">
                  {deal.merchant.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{deal.merchant.address}</span>
                    </div>
                  )}
                  {deal.merchant.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{deal.merchant.phone}</span>
                    </div>
                  )}
                  {deal.merchant.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{deal.merchant.email}</span>
                    </div>
                  )}
                  {deal.merchant.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a href={deal.merchant.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Purchase Options */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {deal.is_product_sale ? 'Purchase Product' : 'Get This Deal'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quantity Selector for Products */}
                  {deal.is_product_sale && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Quantity</label>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(false)}
                          disabled={quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-lg font-medium px-4">{quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(true)}
                          disabled={quantity >= (deal.inventory_count || 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {deal.inventory_count || 0} items available
                      </p>
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Price {deal.is_product_sale && `(${quantity} items)`}
                      </span>
                      <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
                    </div>
                    {totalSavings > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="text-sm">You save</span>
                        <span className="font-medium">₹{totalSavings.toLocaleString()}</span>
                      </div>
                    )}
                    {deal.jaicoin_reward > 0 && (
                      <div className="flex justify-between items-center text-yellow-600">
                        <span className="text-sm">JaiCoins earned</span>
                        <span className="font-medium">+{deal.jaicoin_reward * quantity}</span>
                      </div>
                    )}
                  </div>

                  {/* Purchase Button */}
                  <Button
                    onClick={handlePurchase}
                    disabled={isProcessingOrder || (deal.is_product_sale && (deal.inventory_count || 0) <= 0)}
                    className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    {isProcessingOrder ? (
                      'Processing...'
                    ) : deal.is_product_sale ? (
                      (deal.inventory_count || 0) <= 0 ? (
                        'Out of Stock'
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Buy Now - ₹{totalPrice.toLocaleString()}
                        </>
                      )
                    ) : (
                      'Get This Deal'
                    )}
                  </Button>

                  {/* Security Note */}
                  <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                    <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium">Secure Transaction</p>
                      <p>Your payment information is protected and encrypted.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default DealDetailPage;
