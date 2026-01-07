import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Store, Building2, Calendar, CheckCircle, Loader2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

type VendorType = 'merchant' | 'real_estate_broker' | 'event_organizer';

const vendorConfig = {
  merchant: {
    title: "Merchant Registration",
    description: "Register your business to offer deals and products on our platform",
    icon: Store,
    color: "from-blue-500 to-purple-600",
    businessTypes: ["Restaurant", "Retail Store", "Salon & Spa", "Gym & Fitness", "Healthcare", "Education", "Other"],
    redirectPath: "/merchant-portal"
  },
  real_estate_broker: {
    title: "Property Broker Registration", 
    description: "List properties and connect with buyers in Jaipur",
    icon: Building2,
    color: "from-green-500 to-teal-600",
    businessTypes: ["Individual Broker", "Real Estate Agency", "Builder", "Property Consultant", "Other"],
    redirectPath: "/broker/dashboard"
  },
  event_organizer: {
    title: "Event Organizer Registration",
    description: "Create and manage events on our platform",
    icon: Calendar,
    color: "from-orange-500 to-red-600",
    businessTypes: ["Event Management Company", "Individual Organizer", "Venue Owner", "Artist/Performer", "Other"],
    redirectPath: "/events/organizer"
  }
};

const VendorRegistrationPage = () => {
  const [searchParams] = useSearchParams();
  const vendorType = (searchParams.get('type') as VendorType) || 'merchant';
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "",
    description: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    locality: ""
  });

  const config = vendorConfig[vendorType];
  const IconComponent = config.icon;

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      checkExistingApplication();
    }
  }, [user, vendorType]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate('/auth?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
    setUser(session.user);
    setFormData(prev => ({ ...prev, contact_email: session.user.email || "" }));
    setIsLoading(false);
  };

  const checkExistingApplication = async () => {
    const { data } = await supabase
      .from('vendor_applications')
      .select('*')
      .eq('user_id', user.id)
      .eq('vendor_type', vendorType)
      .single();
    
    if (data) {
      setExistingApplication(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('vendor_applications').insert({
        user_id: user.id,
        vendor_type: vendorType,
        business_name: formData.business_name,
        business_type: formData.business_type,
        description: formData.description,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        address: formData.address,
        locality: formData.locality
      });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you within 24-48 hours."
      });
      
      checkExistingApplication();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (existingApplication) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center mx-auto mb-4`}>
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Application {existingApplication.status === 'approved' ? 'Approved!' : 'Submitted'}</h2>
              <p className="text-muted-foreground mb-4">
                {existingApplication.status === 'approved' 
                  ? "Congratulations! Your application has been approved."
                  : existingApplication.status === 'rejected'
                    ? "Your application was not approved. Please contact support for more details."
                    : "Your application is under review. We'll notify you once it's processed."
                }
              </p>
              <div className="inline-block px-4 py-2 rounded-full text-sm font-medium capitalize" 
                   style={{ 
                     backgroundColor: existingApplication.status === 'approved' ? 'hsl(var(--primary) / 0.1)' : 
                                     existingApplication.status === 'rejected' ? 'hsl(var(--destructive) / 0.1)' : 'hsl(var(--muted))',
                     color: existingApplication.status === 'approved' ? 'hsl(var(--primary))' : 
                            existingApplication.status === 'rejected' ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))'
                   }}>
                {existingApplication.status.replace('_', ' ')}
              </div>
              
              {existingApplication.status === 'approved' && (
                <div className="mt-6">
                  <Button onClick={() => navigate(config.redirectPath)} className={`bg-gradient-to-r ${config.color}`}>
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <Card>
          <CardHeader className={`bg-gradient-to-r ${config.color} text-white rounded-t-lg`}>
            <div className="flex items-center gap-3">
              <IconComponent className="w-8 h-8" />
              <div>
                <CardTitle>{config.title}</CardTitle>
                <CardDescription className="text-white/80">{config.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Business/Organization Name *</Label>
                <Input
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  placeholder="Enter your business name"
                  required
                />
              </div>

              <div>
                <Label>Business Type *</Label>
                <Select value={formData.business_type} onValueChange={(v) => setFormData({ ...formData, business_type: v })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {config.businessTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us about your business..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contact Email *</Label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Contact Phone *</Label>
                  <Input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Business Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                />
              </div>

              <div>
                <Label>Locality in Jaipur</Label>
                <Input
                  value={formData.locality}
                  onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                  placeholder="e.g., Malviya Nagar, C-Scheme"
                />
              </div>

              <Button type="submit" className={`w-full bg-gradient-to-r ${config.color}`} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default VendorRegistrationPage;
