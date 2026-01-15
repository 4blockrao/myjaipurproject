
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import { useUserBalance } from "@/hooks/useUserBalance";
import { 
  ArrowLeft, CreditCard, Coins, Gift, CheckCircle,
  MapPin, Calendar, Phone, Users
} from "lucide-react";

interface Deal {
  id: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  jaicoin_reward: number;
  location: string;
  validity_days: number;
  coupon_type: string;
  merchants: {
    id: string;
    business_name: string;
    address: string;
    phone: string;
  };
}

const CheckoutFlow = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: jaiCoinsBalance } = useUserBalance();
  const createOrderMutation = useCreateOrder();

  const [deal, setDeal] = useState<Deal | null>(null);
  const [user, setUser] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [useJaiCoins, setUseJaiCoins] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: "",
    phone: "",
    email: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
    if (dealId) {
      fetchDealDetails();
    }
  }, [dealId]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      setContactInfo(prev => ({
        ...prev,
        email: session.user.email || ""
      }));
    } else {
      // Redirect to auth with return URL
      navigate(`/auth?redirect=/checkout/deal/${dealId}`);
    }
  };

  const fetchDealDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          merchants!inner(
            id,
            business_name,
            address,
            phone
          )
        `)
        .eq('id', dealId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setDeal(data);
    } catch (error) {
      console.error('Error fetching deal:', error);
      toast({
        title: "Error",
        description: "Failed to load deal details",
        variant: "destructive"
      });
      navigate('/deals');
    } finally {
      setIsLoading(false);
    }
  };

  const getSubtotal = () => {
    if (!deal) return 0;
    return deal.discounted_price * quantity;
  };

  const getJaiCoinsDiscount = () => {
    if (!useJaiCoins || !jaiCoinsBalance) return 0;
    const maxDiscount = Math.min(jaiCoinsBalance, Math.floor(getSubtotal() * 0.1));
    return Math.floor(maxDiscount);
  };

  const getTotalAmount = () => {
    const subtotal = getSubtotal();
    const jaiCoinsDiscount = getJaiCoinsDiscount();
    return Math.max(0, subtotal - jaiCoinsDiscount);
  };

  const handleCheckout = async () => {
    if (!deal || !user) return;

    if (!contactInfo.name || !contactInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required contact details",
        variant: "destructive"
      });
      return;
    }

    const orderData = {
      dealId: deal.id,
      quantity,
      totalAmount: getTotalAmount(),
      jaicoinsUsed: getJaiCoinsDiscount(),
      customerInfo: contactInfo
    };

    createOrderMutation.mutate(orderData, {
      onSuccess: (order) => {
        navigate(`/order-success/${order.id}`);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Deal Not Found</h2>
          <p className="text-gray-600 mb-6">The deal you're looking for is not available.</p>
          <Button onClick={() => navigate('/deals')}>
            Browse Deals
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/deals')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deals
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Checkout</h1>
              <p className="text-gray-600">Complete your purchase</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={contactInfo.name}
                      onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quantity Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Quantity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* JaiCoins */}
            {jaiCoinsBalance > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    Use JaiCoins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="jaicoins"
                        checked={useJaiCoins}
                        onCheckedChange={(checked) => setUseJaiCoins(checked === true)}
                      />
                      <div>
                        <Label htmlFor="jaicoins" className="font-medium cursor-pointer">
                          Use JaiCoins (Balance: {jaiCoinsBalance})
                        </Label>
                        <p className="text-sm text-gray-600">
                          Save up to ₹{Math.min(jaiCoinsBalance, Math.floor(getSubtotal() * 0.1))}
                        </p>
                      </div>
                    </div>
                    {useJaiCoins && (
                      <span className="font-bold text-yellow-600">-₹{getJaiCoinsDiscount()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Deal Details */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">{deal.title}</h4>
                    <p className="text-xs text-gray-600">{deal.merchants.business_name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{deal.location}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Unit Price:</span>
                    <div>
                      <span className="text-gray-500 line-through mr-2">₹{deal.original_price}</span>
                      <span className="font-bold text-pink-600">₹{deal.discounted_price}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Quantity:</span>
                    <span>{quantity}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{getSubtotal()}</span>
                  </div>
                  
                  {useJaiCoins && getJaiCoinsDiscount() > 0 && (
                    <div className="flex justify-between text-yellow-600">
                      <span>JaiCoins Discount</span>
                      <span>-₹{getJaiCoinsDiscount()}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{getTotalAmount()}</span>
                  </div>
                </div>

                <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium text-sm">
                    🎉 You're saving ₹{(deal.original_price * quantity) - getTotalAmount()}!
                  </p>
                </div>

                <Button 
                  onClick={handleCheckout}
                  disabled={createOrderMutation.isPending}
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-lg py-6"
                >
                  {createOrderMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Complete Purchase - ₹{getTotalAmount()}
                    </div>
                  )}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  By completing your purchase, you agree to our Terms of Service
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFlow;
