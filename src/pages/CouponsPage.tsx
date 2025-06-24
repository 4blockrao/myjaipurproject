import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Ticket, Clock, MapPin, Phone, Globe, Star, 
  QrCode, Copy, Share2, Download, Calendar,
  CheckCircle, XCircle, AlertCircle, Gift,
  Shield, History, Store, Info, Coins,
  ChevronRight, Eye, EyeOff
} from "lucide-react";

interface Coupon {
  id: string;
  coupon_code: string;
  deal: {
    id: string;
    title: string;
    description: string;
    discount_percentage: number;
    original_price: number;
    discounted_price: number;
    location: string;
    end_date: string;
    merchant: {
      id: string;
      business_name: string;
      description: string;
      address: string;
      phone: string;
      email: string;
      website: string;
      rating: number;
      total_reviews: number;
      cuisine_type: string;
      operating_hours: string;
      is_verified: boolean;
    };
  };
  status: "active" | "used" | "expired";
  expires_at: string;
  purchase_amount: number;
  discount_amount: number;
  min_order_value: number;
  usage_terms: string;
  created_at: string;
  used_at: string | null;
  redemption_history: {
    id: string;
    attempted_at: string;
    status: "attempted" | "success" | "failed";
    location: string;
    notes: string;
  }[];
}

interface Merchant {
  id: string;
  business_name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  rating: number;
  total_reviews: number;
  cuisine_type: string;
  operating_hours: string;
  is_verified: boolean;
}

interface Deal {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  original_price: number;
  discounted_price: number;
  location: string;
  end_date: string;
  merchant: Merchant;
}

const CouponsPage = ({ user, profile }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      // Mock data with A + 5-digit numeric coupon codes
      const mockCoupons: Coupon[] = [
        {
          id: "1",
          coupon_code: "A12345",
          deal: {
            id: "1",
            title: "Royal Rajasthani Thali Experience",
            description: "Authentic Royal Rajasthani Thali featuring over 15 traditional dishes including Dal Baati Churma, Gatte ki Sabzi, and traditional sweets",
            discount_percentage: 50,
            original_price: 800,
            discounted_price: 400,
            location: "C-Scheme, Jaipur",
            end_date: "2024-12-31T23:59:59Z",
            merchant: {
              id: "1",
              business_name: "Royal Heritage Restaurant",
              description: "Experience the royal taste of Rajasthan with our authentic traditional cuisine served in a heritage ambiance.",
              address: "123 Heritage Plaza, C-Scheme, Jaipur, Rajasthan 302001",
              phone: "+91 141-555-0123",
              email: "contact@royalheritage.com",
              website: "www.royalheritage.com",
              rating: 4.7,
              total_reviews: 1250,
              cuisine_type: "Rajasthani, North Indian",
              operating_hours: "11:00 AM - 11:00 PM",
              is_verified: true
            }
          },
          status: "active",
          expires_at: "2024-12-31T23:59:59Z",
          purchase_amount: 400,
          discount_amount: 400,
          min_order_value: 500,
          usage_terms: "Valid for dine-in only. Cannot be combined with other offers. Valid for up to 4 people.",
          created_at: "2024-06-20T10:30:00Z",
          used_at: null,
          redemption_history: [
            {
              id: "1",
              attempted_at: "2024-06-22T14:30:00Z",
              status: "attempted",
              location: "Royal Heritage Restaurant - C-Scheme",
              notes: "Customer visited but order was below minimum value"
            }
          ]
        },
        {
          id: "2",
          coupon_code: "A67890",
          deal: {
            id: "2",
            title: "Premium Food Delivery Discount",
            description: "Get 30% off on your next food order with free delivery",
            discount_percentage: 30,
            original_price: 100,
            discounted_price: 70,
            location: "Citywide Delivery",
            end_date: "2024-11-30T23:59:59Z",
            merchant: {
              id: "2",
              business_name: "FoodHub Jaipur",
              description: "Your favorite local restaurants delivered to your doorstep with the freshest ingredients and fastest delivery.",
              address: "Multiple Locations across Jaipur",
              phone: "+91 141-555-0456",
              email: "support@foodhubjaipur.com",
              website: "www.foodhubjaipur.com",
              rating: 4.3,
              total_reviews: 890,
              cuisine_type: "Multi-cuisine",
              operating_hours: "10:00 AM - 12:00 AM",
              is_verified: true
            }
          },
          status: "used",
          expires_at: "2024-11-30T23:59:59Z",
          purchase_amount: 0,
          discount_amount: 150,
          min_order_value: 300,
          usage_terms: "Valid for delivery orders only. Minimum order value ₹300. Free delivery included.",
          created_at: "2024-06-15T09:15:00Z",
          used_at: "2024-06-18T19:45:00Z",
          redemption_history: [
            {
              id: "2",
              attempted_at: "2024-06-18T19:45:00Z",
              status: "success",
              location: "Online Delivery",
              notes: "Successfully redeemed for ₹450 order"
            }
          ]
        }
      ];
      
      setCoupons(mockCoupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast({
        title: "Error",
        description: "Failed to load your coupons",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCouponClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
  };

  const handleCloseDialog = () => {
    setSelectedCoupon(null);
    setShowQRCode(null);
  };

  const copyCouponCode = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    toast({
      title: "Coupon Code Copied",
      description: "Show this code at the merchant to redeem your deal"
    });
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const shareCoupon = (coupon: Coupon) => {
    if (navigator.share) {
      navigator.share({
        title: `I have a coupon for ${coupon.deal.title} at ${coupon.deal.merchant.business_name}!`,
        text: `Get ${coupon.deal.discount_percentage}% off using code: ${coupon.coupon_code}`,
        url: window.location.href,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.error('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(`Check out this deal: ${coupon.deal.title} at ${coupon.deal.merchant.business_name}! Get ${coupon.deal.discount_percentage}% off using code: ${coupon.coupon_code}`);
      toast({
        title: "Share Link Copied",
        description: "Share this deal with your friends!"
      });
    }
  };

  const downloadCoupon = () => {
    toast({
      title: "Download Not Available",
      description: "This feature is not yet implemented."
    });
  };

  const toggleQRCode = (couponCode: string) => {
    setShowQRCode(showQRCode === couponCode ? null : couponCode);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile} pageTitle="My Coupons" showBackButton>
      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Coupons</h1>
          <p className="text-gray-600">Manage and redeem your purchased coupons</p>
        </div>

        {/* Balance Overview */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available JAICoins</p>
                <p className="text-2xl font-bold text-green-600">{userBalance} JC</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Active Coupons</p>
                <p className="text-2xl font-bold text-blue-600">{mockCoupons.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {mockCoupons.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Coupons Yet</h3>
              <p className="text-gray-600 mb-4">
                Start exploring deals and purchase your first coupon to see it here.
              </p>
              <Button className="bg-pink-500 hover:bg-pink-600">
                Browse Deals
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Active ({activeCoupons.length})</TabsTrigger>
              <TabsTrigger value="used">Used ({usedCoupons.length})</TabsTrigger>
              <TabsTrigger value="expired">Expired ({expiredCoupons.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {coupons
                .filter(coupon => coupon.status === "active")
                .map(coupon => (
                  <Card key={coupon.id} className="border-2 border-green-200 hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{coupon.deal.title}</CardTitle>
                      <Badge variant="secondary">
                        <Clock className="mr-1 w-4 h-4" />
                        Expires: {new Date(coupon.expires_at).toLocaleDateString()}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">{coupon.deal.description.substring(0, 80)}...</p>
                      <Button variant="link" className="mt-2" onClick={() => handleCouponClick(coupon)}>
                        View Details <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
            <TabsContent value="used" className="space-y-4">
              {coupons
                .filter(coupon => coupon.status === "used")
                .map(coupon => (
                  <Card key={coupon.id} className="border-2 border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{coupon.deal.title}</CardTitle>
                      <Badge variant="outline">
                        <CheckCircle className="mr-1 w-4 h-4" />
                        Used On: {new Date(coupon.used_at!).toLocaleDateString()}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">{coupon.deal.description.substring(0, 80)}...</p>
                      <Button variant="link" className="mt-2" onClick={() => handleCouponClick(coupon)}>
                        View Details <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
            <TabsContent value="expired" className="space-y-4">
              {coupons
                .filter(coupon => coupon.status === "expired")
                .map(coupon => (
                  <Card key={coupon.id} className="border-2 border-red-200 hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{coupon.deal.title}</CardTitle>
                      <Badge variant="destructive">
                        <XCircle className="mr-1 w-4 h-4" />
                        Expired On: {new Date(coupon.expires_at).toLocaleDateString()}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">{coupon.deal.description.substring(0, 80)}...</p>
                      <Button variant="link" className="mt-2" onClick={() => handleCouponClick(coupon)}>
                        View Details <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CouponsPage;
