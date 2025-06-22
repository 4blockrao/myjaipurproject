
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Building2, MapPin, Phone, Mail, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Deal {
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  category: string;
  validityDays: number;
  usageTerms: string;
  couponType: 'free' | 'paid_discount' | 'full_value';
  purchasePrice: number;
  minOrderValue: number;
}

const MerchantOnboarding = () => {
  const [formData, setFormData] = useState({
    merchantName: '',
    businessType: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    location: '',
    description: '',
    website: '',
    socialHandles: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });

  const [deals, setDeals] = useState<Deal[]>([{
    title: '',
    description: '',
    originalPrice: 0,
    discountedPrice: 0,
    category: 'Food & Dining',
    validityDays: 30,
    usageTerms: '',
    couponType: 'paid_discount',
    purchasePrice: 0,
    minOrderValue: 0
  }]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useState(() => {
    checkUser();
  });

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const businessTypes = [
    'Restaurant', 'Cafe', 'Retail Store', 'Beauty Salon', 'Gym/Fitness',
    'Electronics Store', 'Fashion Store', 'Home Services', 'Healthcare',
    'Education', 'Entertainment', 'Other'
  ];

  const categories = [
    'Food & Dining', 'Beauty & Wellness', 'Shopping', 'Electronics',
    'Services', 'Health & Fitness', 'Entertainment', 'Education'
  ];

  const locations = [
    'C-Scheme', 'Malviya Nagar', 'Vaishali Nagar', 'Mansarovar',
    'Jagatpura', 'Shyam Nagar', 'Tonk Road', 'Ajmer Road', 'Online Delivery Jaipur'
  ];

  const addDeal = () => {
    setDeals([...deals, {
      title: '',
      description: '',
      originalPrice: 0,
      discountedPrice: 0,
      category: 'Food & Dining',
      validityDays: 30,
      usageTerms: '',
      couponType: 'paid_discount',
      purchasePrice: 0,
      minOrderValue: 0
    }]);
  };

  const removeDeal = (index: number) => {
    if (deals.length > 1) {
      setDeals(deals.filter((_, i) => i !== index));
    }
  };

  const updateDeal = (index: number, field: keyof Deal, value: any) => {
    const updatedDeals = [...deals];
    updatedDeals[index] = { ...updatedDeals[index], [field]: value };
    setDeals(updatedDeals);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit merchant application",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert deals to proper format for database
      const dealsData = deals.map(deal => ({
        title: deal.title,
        description: deal.description,
        original_price: deal.originalPrice,
        discounted_price: deal.discountedPrice,
        category: deal.category,
        validity_days: deal.validityDays,
        usage_terms: deal.usageTerms,
        coupon_type: deal.couponType,
        purchase_price: deal.purchasePrice,
        min_order_value: deal.minOrderValue
      }));

      const { error } = await supabase
        .from('merchant_applications')
        .insert({
          user_id: user.id,
          merchant_name: formData.merchantName,
          business_type: formData.businessType,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          address: formData.address,
          location: formData.location,
          description: formData.description,
          social_handles: formData.socialHandles,
          deals_data: dealsData as any
        });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Your merchant application has been submitted for review. You'll receive an email once it's approved.",
      });

      // Reset form
      setFormData({
        merchantName: '',
        businessType: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        location: '',
        description: '',
        website: '',
        socialHandles: { facebook: '', instagram: '', twitter: '' }
      });
      setDeals([{
        title: '',
        description: '',
        originalPrice: 0,
        discountedPrice: 0,
        category: 'Food & Dining',
        validityDays: 30,
        usageTerms: '',
        couponType: 'paid_discount',
        purchasePrice: 0,
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Merchant Onboarding</h1>
          <p className="text-gray-600 text-lg">Join our platform and start offering amazing deals to customers</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Business Information
              </CardTitle>
              <CardDescription>
                Tell us about your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="merchantName">Business Name *</Label>
                  <Input
                    id="merchantName"
                    value={formData.merchantName}
                    onChange={(e) => setFormData({...formData, merchantName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type *</Label>
                  <select
                    id="businessType"
                    value={formData.businessType}
                    onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                    required
                  >
                    <option value="">Select Business Type</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell customers about your business..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Phone *</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <select
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Online Presence (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.socialHandles.facebook}
                    onChange={(e) => setFormData({
                      ...formData, 
                      socialHandles: {...formData.socialHandles, facebook: e.target.value}
                    })}
                    placeholder="Facebook page URL"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.socialHandles.instagram}
                    onChange={(e) => setFormData({
                      ...formData, 
                      socialHandles: {...formData.socialHandles, instagram: e.target.value}
                    })}
                    placeholder="Instagram handle"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.socialHandles.twitter}
                    onChange={(e) => setFormData({
                      ...formData, 
                      socialHandles: {...formData.socialHandles, twitter: e.target.value}
                    })}
                    placeholder="Twitter handle"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deals */}
          <Card>
            <CardHeader>
              <CardTitle>Deals & Offers</CardTitle>
              <CardDescription>
                Add the deals you want to offer (minimum 1 required)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {deals.map((deal, index) => (
                <div key={index} className="border rounded-lg p-4 relative">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline">Deal {index + 1}</Badge>
                    {deals.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeDeal(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
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
                        <Label>Category</Label>
                        <select
                          value={deal.category}
                          onChange={(e) => updateDeal(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                        >
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Coupon Type</Label>
                        <select
                          value={deal.couponType}
                          onChange={(e) => updateDeal(index, 'couponType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                        >
                          <option value="free">Free Coupon</option>
                          <option value="paid_discount">Paid Discount</option>
                          <option value="full_value">Full Value Voucher</option>
                        </select>
                      </div>
                      <div>
                        <Label>Purchase Price (₹)</Label>
                        <Input
                          type="number"
                          value={deal.purchasePrice}
                          onChange={(e) => updateDeal(index, 'purchasePrice', Number(e.target.value))}
                          min="0"
                          disabled={deal.couponType === 'free'}
                        />
                      </div>
                      <div>
                        <Label>Discount/Value (₹) *</Label>
                        <Input
                          type="number"
                          value={deal.discountedPrice}
                          onChange={(e) => updateDeal(index, 'discountedPrice', Number(e.target.value))}
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Original Price (₹)</Label>
                        <Input
                          type="number"
                          value={deal.originalPrice}
                          onChange={(e) => updateDeal(index, 'originalPrice', Number(e.target.value))}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label>Min Order Value (₹)</Label>
                        <Input
                          type="number"
                          value={deal.minOrderValue}
                          onChange={(e) => updateDeal(index, 'minOrderValue', Number(e.target.value))}
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Validity (Days)</Label>
                        <Input
                          type="number"
                          value={deal.validityDays}
                          onChange={(e) => updateDeal(index, 'validityDays', Number(e.target.value))}
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Usage Terms & Conditions</Label>
                      <Textarea
                        value={deal.usageTerms}
                        onChange={(e) => updateDeal(index, 'usageTerms', e.target.value)}
                        placeholder="e.g., Valid only on weekdays, Not valid on festivals..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addDeal}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Deal
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantOnboarding;
