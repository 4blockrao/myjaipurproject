
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Crown, Star, Zap, Gift, Shield, Percent, 
  Clock, Users, Calendar, Check, X,
  Sparkles, Award, TrendingUp, Phone
} from "lucide-react";

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: 'monthly' | 'yearly';
  features: string[];
  popularBadge?: boolean;
  savingsPercent?: number;
}

const ProMembershipPage = () => {
  const [user, setUser] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const membershipPlans: MembershipPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: billingCycle === 'monthly' ? 0 : 0,
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
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      // Fetch current membership status
      setCurrentPlan('basic'); // Mock - in real implementation, fetch from user profile
    }
    setIsLoading(false);
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

    // In a real implementation, this would integrate with payment gateway
    toast({
      title: "Redirecting to Payment",
      description: "You'll be redirected to complete your subscription"
    });
    
    // Mock payment flow
    setTimeout(() => {
      setCurrentPlan(planId);
      toast({
        title: "Subscription Successful!",
        description: `Welcome to ${planId === 'pro' ? 'Pro' : 'Premium'} membership!`
      });
    }, 2000);
  };

  const handleCancelSubscription = async () => {
    // In a real implementation, this would call the subscription management API
    toast({
      title: "Subscription Cancelled",
      description: "Your subscription will remain active until the end of the current billing period"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-3xl mx-auto">
            <Crown className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Unlock Exclusive Benefits with Pro
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Get access to premium deals, priority support, and exclusive features that will transform your Jaipur experience
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-300" />
                <span>Exclusive deals up to 70% off</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-300" />
                <span>Priority customer support</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-300" />
                <span>Ad-free experience</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Current Plan Status */}
        {user && currentPlan && (
          <Card className="mb-12 border-2 border-pink-200 bg-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8 text-pink-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-pink-800">
                      Current Plan: {currentPlan === 'basic' ? 'Basic (Free)' : currentPlan === 'pro' ? 'Pro' : 'Premium'}
                    </h3>
                    <p className="text-pink-600">
                      {currentPlan === 'basic' 
                        ? 'Upgrade to unlock premium features' 
                        : 'You have access to exclusive benefits!'
                      }
                    </p>
                  </div>
                </div>
                {currentPlan !== 'basic' && (
                  <Button variant="outline" onClick={handleCancelSubscription}>
                    Manage Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing Toggle */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-6">Choose Your Plan</h2>
          <div className="flex items-center justify-center gap-4 mb-8">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {membershipPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${
                plan.popularBadge ? 'border-2 border-pink-500 shadow-lg scale-105' : ''
              } ${currentPlan === plan.id ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
            >
              {plan.popularBadge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-pink-500 text-white px-4 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {currentPlan === plan.id && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500 text-white">
                    <Check className="w-3 h-3 mr-1" />
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">
                    ₹{plan.price}
                    <span className="text-base font-normal text-gray-600">
                      /{plan.duration === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {plan.savingsPercent && (
                    <Badge className="bg-green-100 text-green-700">
                      Save {plan.savingsPercent}%
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popularBadge 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700' 
                      : ''
                  }`}
                  variant={plan.id === 'basic' ? 'outline' : 'default'}
                  onClick={() => plan.id !== 'basic' && plan.id !== currentPlan && handleSubscribe(plan.id)}
                  disabled={plan.id === currentPlan || (plan.id === 'basic' && !user)}
                >
                  {plan.id === currentPlan 
                    ? 'Current Plan' 
                    : plan.id === 'basic' 
                      ? 'Free Plan' 
                      : `Upgrade to ${plan.name}`
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pro Features Highlight */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Pro?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {proFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <feature.icon className="w-12 h-12 text-pink-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Customer Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Pro Members Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      Saved {testimonial.savings}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Can I cancel my subscription anytime?</h4>
                <p className="text-gray-600 text-sm">Yes, you can cancel your subscription at any time. Your benefits will continue until the end of your current billing period.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Do I get a refund if I cancel early?</h4>
                <p className="text-gray-600 text-sm">We offer a 7-day money-back guarantee for new subscribers. After that, no refunds are provided for unused time.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                <p className="text-gray-600 text-sm">We accept all major credit cards, debit cards, UPI, net banking, and digital wallets.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Can I upgrade or downgrade my plan?</h4>
                <p className="text-gray-600 text-sm">Yes, you can change your plan at any time. Changes will be prorated and reflected in your next billing cycle.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Need help choosing the right plan?</p>
          <Button variant="outline" className="gap-2">
            <Phone className="w-4 h-4" />
            Contact Our Sales Team
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProMembershipPage;
