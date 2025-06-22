
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Store, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Deal {
  title: string;
  description: string;
  couponType: 'free' | 'paid_discount' | 'full_value';
  originalPrice: number;
  discountedPrice: number;
  purchasePrice: number;
  validityDays: number;
  usageTerms: string;
  minOrderValue: number;
}

const MerchantOnboarding = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [merchantData, setMerchantData] = useState({
    merchantName: '',
    businessType: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    location: '',
    description: '',
    website: '',
    instagram: '',
    facebook: ''
  });
  
  const [deals, setDeals] = useState<Deal[]>([{
    title: '',
    description: '',
    couponType: 'paid_discount',
    originalPrice: 0,
    discountedPrice: 0,
    purchasePrice: 0,
    validityDays: 30,
    usageTerms: '',
    minOrderValue: 0
  }]);

  const { toast } = useToast();

  const businessTypes = [
    'Restaurant', 'Cafe', 'Retail Store', 'Beauty Salon', 'Gym/Fitness',
    'Electronics', 'Fashion', 'Home Services', 'Healthcare', 'Education',
    'Entertainment', 'Automotive', 'Other'
  ];

  const addDeal = () => {
    setDeals([...deals, {
      title: '',
      description: '',
      couponType: 'paid_discount',
      originalPrice: 0,
      discountedPrice: 0,
      purchasePrice: 0,
      validityDays: 30,
      usageTerms: '',
      minOrderValue: 0
    }]);
  };

  const removeDeal = (index: number) => {
    if (deals.length > 1) {
      setDeals(deals.filter((_, i) => i !== index));
    }
  };

  const updateDeal = (index: number, field: keyof Deal, value: any) => {
    const updatedDeals = deals.map((deal, i) => 
      i === index ? { ...deal, [field]: value } : deal
    );
    setDeals(updatedDeals);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to submit a merchant application",
          variant: "destructive"
        });
        return;
      }

      // Prepare social handles
      const socialHandles = {
        website: merchantData.website,
        instagram: merchantData.instagram,
        facebook: merchantData.facebook
      };

      // Submit merchant application
      const { error } = await supabase
        .from('merchant_applications')
        .insert({
          user_id: user.id,
          merchant_name: merchantData.merchantName,
          business_type: merchantData.businessType,
          contact_email: merchantData.contactEmail,
          contact_phone: merchantData.contactPhone,
          address: merchantData.address,
          location: merchantData.location,
          description: merchantData.description,
          social_handles: socialHandles,
          deals_data: deals,
          submitted_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Your merchant application has been submitted for review. You'll receive an email once approved."
      });

      // Reset form
      setMerchantData({
        merchantName: '',
        businessType: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        location: '',
        description: '',
        website: '',
        instagram: '',
        facebook: ''
      });
      setDeals([{
        title: '',
        description: '',
        couponType: 'paid_discount',
        originalPrice: 0,
        discountedPrice: 0,
        purchasePrice: 0,
        validityDays: 30,
        usageTerms: '',
        minOrderValue: 0
      }]);

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Store className="w-12 h-12 text-pink-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Onboard a Merchant</h1>
          <p className="text-gray-600 text-lg">Help local businesses join HiJaipur and earn JaiCoins!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Merchant Information */}
          <Card className="border-2 border-pink-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Store className="w-5 h-5" />
                <span>Merchant Information</span>
              </CardTitle>
              <CardDescription>Basic details about the business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="merchantName">Business Name *</Label>
                  <Input
                    id="merchantName"
                    value={merchantData.merchantName}
                    onChange={(e) => setMerchantData({...merchantData, merchantName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select value={merchantData.businessType} onValueChange={(value) => setMerchantData({...merchantData, businessType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={merchantData.contactEmail}
                    onChange={(e) => setMerchantData({...merchantData, contactEmail: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <Input
                    id="contactPhone"
                    value={merchantData.contactPhone}
                    onChange={(e) => setMerchantData({...merchantData, contactPhone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={merchantData.address}
                  onChange={(e) => setMerchantData({...merchantData, address: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Location/Area in Jaipur *</Label>
                <Input
                  id="location"
                  value={merchantData.location}
                  onChange={(e) => setMerchantData({...merchantData, location: e.target.value})}
                  placeholder="e.g., Malviya Nagar, Pink City, etc."
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={merchantData.description}
                  onChange={(e) => setMerchantData({...merchantData, description: e.target.value})}
                  placeholder="Brief description of the business..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={merchantData.website}
                    onChange={(e) => setMerchantData({...merchantData, website: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={merchantData.instagram}
                    onChange={(e) => setMerchantData({...merchantData, instagram: e.target.value})}
                    placeholder="@username"
                  />
                </div>
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={merchantData.facebook}
                    onChange={(e) => setMerchantData({...merchantData, facebook: e.target.value})}
                    placeholder="Page name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deals Section */}
          <Card className="border-2 border-yellow-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Deals & Offers</CardTitle>
                  <CardDescription>Create attractive deals for customers</CardDescription>
                </div>
                <Button type="button" onClick={addDeal} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Deal
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {deals.map((deal, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Deal {index + 1}</h4>
                    {deals.length > 1 && (
                      <Button type="button" onClick={() => removeDeal(index)} size="sm" variant="destructive">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Deal Title *</Label>
                      <Input
                        value={deal.title}
                        onChange={(e) => updateDeal(index, 'title', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Coupon Type *</Label>
                      <Select value={deal.couponType} onValueChange={(value: any) => updateDeal(index, 'couponType', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free Coupon</SelectItem>
                          <SelectItem value="paid_discount">Paid Discount</SelectItem>
                          <SelectItem value="full_value">Full Value Voucher</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Description *</Label>
                    <Textarea
                      value={deal.description}
                      onChange={(e) => updateDeal(index, 'description', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Original Price (₹)</Label>
                      <Input
                        type="number"
                        value={deal.originalPrice}
                        onChange={(e) => updateDeal(index, 'originalPrice', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Discount Value (₹)</Label>
                      <Input
                        type="number"
                        value={deal.discountedPrice}
                        onChange={(e) => updateDeal(index, 'discountedPrice', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Purchase Price (₹)</Label>
                      <Input
                        type="number"
                        value={deal.purchasePrice}
                        onChange={(e) => updateDeal(index, 'purchasePrice', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Validity (Days)</Label>
                      <Input
                        type="number"
                        value={deal.validityDays}
                        onChange={(e) => updateDeal(index, 'validityDays', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Min Order Value (₹)</Label>
                      <Input
                        type="number"
                        value={deal.minOrderValue}
                        onChange={(e) => updateDeal(index, 'minOrderValue', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Usage Terms</Label>
                      <Input
                        value={deal.usageTerms}
                        onChange={(e) => updateDeal(index, 'usageTerms', e.target.value)}
                        placeholder="e.g., Valid only on weekdays"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="text-center">
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 px-8 py-3 text-lg">
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantOnboarding;
