
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MembershipPlans from "@/components/membership/MembershipPlans";
import MembershipTestimonials from "@/components/membership/MembershipTestimonials";
import { 
  Crown, Gift, Shield, Calendar, Check, Phone,
  Zap, Star, TrendingUp
} from "lucide-react";

const ProMembershipPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const membershipPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      duration: billingCycle,
      features: [
        'Access to basic deals',
        'Standard customer support',
        'Basic profile features',
        'Email notifications',
        'Mobile app access'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingCycle === 'monthly' ? 299 : 2990,
      duration: billingCycle,
      popularBadge: true,
      savingsPercent: billingCycle === 'yearly' ? 17 : undefined,
      features: [
        'All Basic features',
        'Exclusive Pro deals & early access',
        'Priority customer support',
        'Advanced profile customization',
        'Unlimited deal saves',
        'No ads experience',
        'Monthly exclusive events access',
        'Bonus JaiCoins (2x earning rate)',
        'Priority merchant verification'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: billingCycle === 'monthly' ? 499 : 4990,
      duration: billingCycle,
      savingsPercent: billingCycle === 'yearly' ? 17 : undefined,
      features: [
        'All Pro features',
        'VIP-only exclusive deals',
        'Dedicated account manager',
        'Custom deal recommendations',
        'Unlimited guest passes',
        'Premium event invitations',
        'Concierge booking service',
        'Triple JaiCoins earning rate',
        'Personal shopping assistance',
        'Premium merchant partnerships'
      ]
    }
  ];

  const proFeatures = [
    {
      icon: Zap,
      title: 'Exclusive Deals',
      description: 'Access to member-only deals with up to 70% off'
    },
    {
      icon: Crown,
      title: 'Priority Support',
      description: 'Get help faster with our dedicated support team'
    },
    {
      icon: Gift,
      title: 'Bonus Rewards',
      description: 'Earn 2x JaiCoins on every purchase and activity'
    },
    {
      icon: Shield,
      title: 'Ad-Free Experience',
      description: 'Enjoy the app without any advertisements'
    },
    {
      icon: Calendar,
      title: 'Exclusive Events',
      description: 'VIP access to special events and experiences'
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Track your savings and optimize your deals'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'C-Scheme, Jaipur',
      rating: 5,
      text: 'Pro membership has saved me thousands! The exclusive deals are amazing.',
      savings: '₹15,000'
    },
    {
      name: 'Rajesh Kumar',
      location: 'Malviya Nagar, Jaipur',
      rating: 5,
      text: 'Priority support and ad-free experience make it totally worth it.',
      savings: '₹8,500'
    },
    {
      name: 'Anita Gupta',
      location: 'Vaishali Nagar, Jaipur',
      rating: 5,
      text: 'The VIP events and personalized recommendations are fantastic!',
      savings: '₹12,200'
    }
  ];

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
        setCurrentPlan('basic');
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to subscribe to a membership plan",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Redirecting to Payment",
      description: "You'll be redirected to complete your subscription"
    });
    
    setTimeout(() => {
      setCurrentPlan(planId);
      toast({
        title: "Subscription Successful!",
        description: `Welcome to ${planId === 'pro' ? 'Pro' : 'Premium'} membership!`
      });
    }, 2000);
  };

  if (isLoading) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="Pro Membership" showBackButton>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Loading membership plans...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile} pageTitle="Pro Membership" showBackButton>
      <div className="space-y-6 p-4 max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 text-white rounded-2xl">
          <div className="p-8 text-center">
            <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Unlock Exclusive Benefits with Pro
            </h1>
            <p className="text-lg opacity-90 mb-6">
              Get access to premium deals, priority support, and exclusive features
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-300" />
                <span>Exclusive deals up to 70% off</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-300" />
                <span>Priority customer support</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-300" />
                <span>Ad-free experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Plan Status */}
        {user && currentPlan && (
          <Card className="border-2 border-pink-200 bg-pink-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-pink-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-pink-800">
                      Current Plan: {currentPlan === 'basic' ? 'Basic (Free)' : currentPlan === 'pro' ? 'Pro' : 'Premium'}
                    </h3>
                    <p className="text-pink-600 text-sm">
                      {currentPlan === 'basic' 
                        ? 'Upgrade to unlock premium features' 
                        : 'You have access to exclusive benefits!'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing Toggle */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Choose Your Plan</h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className={`font-medium ${billingCycle === 'monthly' ? 'text-pink-600' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch
              checked={billingCycle === 'yearly'}
              onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
            />
            <span className={`font-medium ${billingCycle === 'yearly' ? 'text-pink-600' : 'text-gray-500'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <Badge className="bg-green-100 text-green-700">Save 17%</Badge>
            )}
          </div>
        </div>

        {/* Pricing Plans */}
        <MembershipPlans 
          plans={membershipPlans}
          currentPlan={currentPlan}
          onSubscribe={handleSubscribe}
          user={user}
        />

        {/* Pro Features Highlight */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">Why Choose Pro?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <feature.icon className="w-8 h-8 text-pink-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Customer Testimonials */}
        <MembershipTestimonials testimonials={testimonials} />

        {/* Contact Support */}
        <div className="text-center">
          <p className="text-gray-600 mb-3 text-sm">Need help choosing the right plan?</p>
          <Button variant="outline" className="gap-2" size="sm">
            <Phone className="w-4 h-4" />
            Contact Our Sales Team
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProMembershipPage;
