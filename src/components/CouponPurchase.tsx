import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, MapPin, Clock, ShoppingCart, Gift, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Deal {
  id: string;
  title: string;
  description: string;
  coupon_type: 'free' | 'paid_discount' | 'full_value';
  purchase_price: number;
  original_price: number;
  discounted_price: number;
  validity_days: number;
  usage_terms: string;
  min_order_value: number;
  jaicoin_reward: number;
  location: string;
  merchants: {
    id: string;
    business_name: string;
    is_verified: boolean;
  };
}

const CouponPurchase = ({ dealId }: { dealId: string }) => {
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchDeal();
  }, [dealId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchDeal = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('deals')
        .select(`
          *,
          merchants!inner(
            id,
            name,
            status
          )
        `)
        .eq('id', dealId)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      
      const merchant = Array.isArray(data.merchants) ? data.merchants[0] : data.merchants;
      const formattedDeal: Deal = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        coupon_type: data.coupon_type || 'free',
        purchase_price: data.purchase_price || 0,
        original_price: data.original_price || 0,
        discounted_price: data.discounted_price || 0,
        validity_days: data.validity_days || 30,
        usage_terms: data.usage_terms || '',
        min_order_value: data.min_order_value || 0,
        jaicoin_reward: data.jaicoin_reward || 0,
        location: data.location || '',
        merchants: {
          id: merchant?.id || '',
          business_name: merchant?.name || '',
          is_verified: merchant?.status === 'published'
        }
      };
      
      setDeal(formattedDeal);
    } catch (error) {
      console.error('Error fetching deal:', error);
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
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase this coupon",
        variant: "destructive"
      });
      return;
    }

    if (!deal) return;

    if (deal.coupon_type === 'free') {
      // For free coupons, create directly
      setIsPurchasing(true);
      try {
        const couponCode = `A${Math.floor(Math.random() * 90000) + 10000}`;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + deal.validity_days);

        const { error } = await (supabase as any)
          .from('coupons')
          .insert({
            deal_id: deal.id,
            user_id: user.id,
            merchant_id: deal.merchants.id,
            coupon_code: couponCode,
            coupon_type: deal.coupon_type,
            purchase_amount: 0,
            discount_amount: deal.discounted_price,
            expires_at: expiresAt.toISOString(),
            min_order_value: deal.min_order_value,
            usage_terms: deal.usage_terms
          });

        if (error) throw error;

        // Award JaiCoins for free coupon claim
        await (supabase as any)
          .from('jaicoin_transactions')
          .insert({
            user_id: user.id,
            amount: deal.jaicoin_reward,
            type: 'earned',
            source: 'coupon_claim',
            description: `Earned for claiming: ${deal.title}`
          });

        toast({
          title: "Coupon Claimed!",
          description: `Your free coupon (${couponCode}) has been added to your wallet`,
        });

        navigate('/coupons');
      } catch (error) {
        console.error('Error claiming coupon:', error);
        toast({
          title: "Claim Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsPurchasing(false);
      }
    } else {
      // For paid coupons, go to checkout
      navigate(`/checkout/${deal.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Deal not found or no longer available</p>
      </div>
    );
  }

  const getCouponTypeLabel = (type: string) => {
    switch (type) {
      case 'free': return 'Free Coupon';
      case 'paid_discount': return 'Discount Coupon';
      case 'full_value': return 'Voucher';
      default: return 'Coupon';
    }
  };

  const getCouponTypeIcon = (type: string) => {
    switch (type) {
      case 'free': return <Gift className="w-5 h-5" />;
      case 'paid_discount': return <Zap className="w-5 h-5" />;
      case 'full_value': return <ShoppingCart className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="border-2 border-pink-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="mb-2">
              {getCouponTypeIcon(deal.coupon_type)}
              <span className="ml-1">{getCouponTypeLabel(deal.coupon_type)}</span>
            </Badge>
            {deal.merchants?.is_verified && (
              <Badge className="bg-green-100 text-green-800">✓ Verified</Badge>
            )}
          </div>
          <CardTitle className="text-2xl">{deal.title}</CardTitle>
          <CardDescription className="text-lg">
            <span className="font-medium">{deal.merchants?.business_name}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-gray-700">{deal.description}</p>

          {/* Pricing Information */}
          <div className="bg-gradient-to-r from-pink-50 to-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {deal.coupon_type === 'free' ? 'FREE' : `₹${deal.purchase_price}`}
                </div>
                {deal.coupon_type !== 'free' && (
                  <div className="text-sm text-gray-600">Purchase Price</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-pink-600">₹{deal.discounted_price}</div>
                <div className="text-sm text-gray-600">
                  {deal.coupon_type === 'full_value' ? 'Voucher Value' : 'Discount Value'}
                </div>
              </div>
            </div>
            
            {deal.original_price > 0 && (
              <div className="text-center">
                <span className="text-sm text-gray-600">Original Price: </span>
                <span className="line-through text-gray-500">₹{deal.original_price}</span>
              </div>
            )}
          </div>

          {/* Deal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{deal.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Valid for {deal.validity_days} days</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span>+{deal.jaicoin_reward} JaiCoins</span>
            </div>
            {deal.min_order_value > 0 && (
              <div className="text-sm text-gray-600">
                Min Order: ₹{deal.min_order_value}
              </div>
            )}
          </div>

          {deal.usage_terms && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Terms & Conditions:</h4>
              <p className="text-sm text-gray-600">{deal.usage_terms}</p>
            </div>
          )}

          <Button 
            onClick={handlePurchase} 
            disabled={isPurchasing}
            className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-lg py-3"
          >
            {isPurchasing ? 'Processing...' : (
              deal.coupon_type === 'free' ? 'Claim Free Coupon' : `Purchase for ₹${deal.purchase_price}`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponPurchase;
