import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import { useUserBalance } from "@/hooks/useUserBalance";
import { ValidatedInput } from "@/components/ui/validated-input";
import { QuantitySelector } from "@/components/checkout/QuantitySelector";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  ArrowLeft, CreditCard, Coins, Gift, CheckCircle,
  MapPin, Calendar, Phone, Users, Shield, AlertTriangle
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
  max_order_quantity?: number;
  merchants: {
    id: string;
    business_name: string;
    address: string;
    phone: string;
  };
}

const EnhancedCheckoutFlow = () => {
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
  const [validationState, setValidationState] = useState({
    name: false,
    phone: false,
    email: true // Email is pre-filled and validated
  });

  useEffect(() => {
    checkUser();
    if (dealId) {
      // Validate dealId is a proper UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(dealId)) {
        console.error('Invalid deal ID format:', dealId);
        toast({
          title: "Invalid Deal",
          description: "The deal link is invalid",
          variant: "destructive"
        });
        navigate('/deals');
        return;
      }
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
      navigate('/', { replace: true });
    }
  };

  const fetchDealDetails = async () => {
    try {
      setIsLoading(true);
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

  const getTotalSavings = () => {
    if (!deal) return 0;
    const originalTotal = deal.original_price * quantity;
    const finalTotal = getTotalAmount();
    return originalTotal - finalTotal;
  };

  const isFormValid = () => {
    return validationState.name && validationState.phone && validationState.email;
  };

  const handleValidationChange = (field: string, isValid: boolean) => {
    setValidationState(prev => ({
      ...prev,
      [field]: isValid
    }));
  };

  const handleCheckout = async () => {
    if (!deal || !user) return;

    if (!isFormValid()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required contact details correctly",
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
        <LoadingSpinner size="lg" text="Loading deal details..." />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
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
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Secure Checkout</h1>
              <p className="text-gray-600">Complete your purchase safely</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Security Notice */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Secure Checkout</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Your information is encrypted and protected
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  We'll use this information to contact you about your order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ValidatedInput
                    label="Full Name"
                    validationType="name"
                    required
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                    onValidationChange={(isValid) => handleValidationChange('name', isValid)}
                    placeholder="Enter your full name"
                  />
                  <ValidatedInput
                    label="Phone Number"
                    validationType="phone"
                    required
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                    onValidationChange={(isValid) => handleValidationChange('phone', isValid)}
                    placeholder="10-digit mobile number"
                  />
                </div>
                <ValidatedInput
                  label="Email Address"
                  validationType="email"
                  value={contactInfo.email}
                  disabled
                  className="bg-gray-100"
                />
              </CardContent>
            </Card>

            {/* Quantity Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>
                  Adjust the quantity as needed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Quantity</p>
                    <p className="text-sm text-gray-600">
                      Price per item: ₹{deal.discounted_price}
                    </p>
                  </div>
                  <QuantitySelector
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    max={deal.max_order_quantity || 10}
                  />
                </div>
              </CardContent>
            </Card>

            {/* JaiCoins */}
            {jaiCoinsBalance && jaiCoinsBalance > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    Use JaiCoins
                  </CardTitle>
                  <CardDescription>
                    Save money with your JaiCoins balance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="jaicoins"
                        checked={useJaiCoins}
                        onCheckedChange={(checked) => setUseJaiCoins(checked === true)}
                      />
                      <div>
                        <label htmlFor="jaicoins" className="font-medium cursor-pointer">
                          Use JaiCoins (Balance: {jaiCoinsBalance})
                        </label>
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
                    <h4 className="font-medium">{deal.title}</h4>
                    <p className="text-sm text-gray-600">{deal.merchants.business_name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{deal.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Valid for {deal.validity_days} days</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span>Unit Price:</span>
                    <div className="text-right">
                      <span className="text-gray-500 line-through mr-2">₹{deal.original_price}</span>
                      <span className="font-bold text-pink-600">₹{deal.discounted_price}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Quantity:</span>
                    <span className="font-medium">{quantity}</span>
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
                    🎉 You're saving ₹{getTotalSavings()}!
                  </p>
                </div>

                <Button 
                  onClick={handleCheckout}
                  disabled={createOrderMutation.isPending || !isFormValid()}
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-lg py-6"
                >
                  {createOrderMutation.isPending ? (
                    <LoadingSpinner size="sm" text="Processing..." />
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

export default EnhancedCheckoutFlow;
