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

const CouponsPage = () => {
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
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Coupons</h1>
        <p className="text-gray-600">Here are the coupons you've collected. Use them wisely!</p>
      </div>

      {coupons.length === 0 ? (
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have any coupons yet. Go grab some <a href="/deals" className="underline font-medium">deals</a>!
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultvalue="active" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="active">
              <Ticket className="mr-2 h-4 w-4" />
              Active Coupons
            </TabsTrigger>
            <TabsTrigger value="used">
              <CheckCircle className="mr-2 h-4 w-4" />
              Used Coupons
            </TabsTrigger>
            <TabsTrigger value="expired">
              <XCircle className="mr-2 h-4 w-4" />
              Expired Coupons
            </TabsTrigger>
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

      <Dialog open={selectedCoupon !== null} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCoupon?.deal.title}</DialogTitle>
            <DialogDescription>
              {selectedCoupon?.deal.description}
            </DialogDescription>
          </DialogHeader>

          {selectedCoupon && (
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coupon Details */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Coupon Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Ticket className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-medium">Code: {selectedCoupon.coupon_code}</p>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => copyCouponCode(selectedCoupon.coupon_code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {copiedCode === selectedCoupon.coupon_code && (
                          <span className="text-green-500 text-xs">Copied!</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <p className="text-sm">Expires: {new Date(selectedCoupon.expires_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <p className="text-sm">Status: {selectedCoupon.status}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Coins className="h-4 w-4 text-gray-500" />
                        <p className="text-sm">Discount: ₹{selectedCoupon.discount_amount}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Store className="h-4 w-4 text-gray-500" />
                        <p className="text-sm">Min. Order: ₹{selectedCoupon.min_order_value}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Terms and Conditions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Terms & Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{selectedCoupon.usage_terms}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Merchant Details */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Merchant Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Store className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-medium">{selectedCoupon.deal.merchant.business_name}</p>
                        {selectedCoupon.deal.merchant.is_verified && (
                          <Badge className="ml-2 bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 w-3 h-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <p className="text-sm">{selectedCoupon.deal.location}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <p className="text-sm">{selectedCoupon.deal.merchant.phone}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <a href={selectedCoupon.deal.merchant.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                          Website
                        </a>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <p className="text-sm">Rating: {selectedCoupon.deal.merchant.rating} ({selectedCoupon.deal.merchant.total_reviews} reviews)</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* QR Code */}
                  <Card>
                    <CardHeader>
                      <CardTitle>QR Code</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center">
                      {showQRCode === selectedCoupon.coupon_code ? (
                        <>
                          <QRCodeGenerator value={selectedCoupon.coupon_code} size={150} />
                          <Button variant="ghost" size="sm" onClick={() => toggleQRCode(selectedCoupon.coupon_code)}>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Hide QR Code
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" onClick={() => toggleQRCode(selectedCoupon.coupon_code)}>
                          <QrCode className="mr-2 h-4 w-4" />
                          Show QR Code
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end mt-4 space-x-2">
                <Button variant="outline" onClick={() => shareCoupon(selectedCoupon)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="secondary" onClick={downloadCoupon}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="destructive" onClick={handleCloseDialog}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponsPage;
