import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import FloatingHeader from "@/components/layout/FloatingHeader";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, Phone, Mail, Globe, Star, ShieldCheck, 
  Clock, Tag, ChevronRight, Store, BadgeCheck
} from "lucide-react";

const MerchantDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: merchant, isLoading } = useQuery({
    queryKey: ['merchant', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['merchant-deals', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('merchant_id', id)
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <FloatingHeader title="Loading..." showBackButton />
        <main className="pt-16 px-4 space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </main>
        <NativeBottomNav />
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <FloatingHeader title="Not Found" showBackButton />
        <main className="pt-16 px-4 flex flex-col items-center justify-center min-h-[60vh]">
          <Store className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-xl font-semibold mb-2">Merchant Not Found</h1>
          <p className="text-muted-foreground text-center mb-4">
            This merchant doesn't exist or has been removed.
          </p>
          <Link to="/merchants">
            <Button>View All Merchants</Button>
          </Link>
        </main>
        <NativeBottomNav />
      </div>
    );
  }

  const categoryEmojis: Record<string, string> = {
    'Food & Dining': '🍽️',
    'Beauty & Wellness': '💅',
    'Shopping': '🛍️',
    'Electronics': '📱',
    'Health & Fitness': '💪',
    'Automotive': '🚗',
    'Services': '🔧',
    'Travel': '✈️',
    'Education': '📚',
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>{merchant.business_name} - Deals & Offers in Jaipur | JaipurCircle</title>
        <meta name="description" content={`Explore exclusive deals and offers from ${merchant.business_name} in Jaipur. ${merchant.description || ''}`} />
        <link rel="canonical" href={`https://jaipurcircle.com/merchant/${merchant.id}`} />
      </Helmet>

      <FloatingHeader title={merchant.business_name} showBackButton />

      <main className="pt-16 px-4 space-y-4 max-w-2xl mx-auto">
        {/* Hero Card */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {merchant.logo_url ? (
                <img 
                  src={merchant.logo_url} 
                  alt={merchant.business_name}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-background shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Store className="w-10 h-10 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold">{merchant.business_name}</h1>
                  {merchant.is_verified && (
                    <BadgeCheck className="w-5 h-5 text-primary" />
                  )}
                </div>
                {merchant.business_type && (
                  <Badge variant="secondary" className="mb-2">
                    {categoryEmojis[merchant.business_type] || '🏪'} {merchant.business_type}
                  </Badge>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{merchant.average_rating?.toFixed(1) || '4.5'}</span>
                  <span>•</span>
                  <span>{merchant.total_reviews || 0} reviews</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {merchant.description && (
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-2">About</h2>
              <p className="text-sm text-muted-foreground">{merchant.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Contact Info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold mb-2">Contact Information</h2>
            
            {merchant.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm">{merchant.address}</span>
              </div>
            )}
            
            {merchant.phone && (
              <a href={`tel:${merchant.phone}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">{merchant.phone}</span>
              </a>
            )}
            
            {merchant.email && (
              <a href={`mailto:${merchant.email}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">{merchant.email}</span>
              </a>
            )}
            
            {merchant.website && (
              <a href={merchant.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">{merchant.website}</span>
              </a>
            )}
          </CardContent>
        </Card>

        {/* Active Deals */}
        {deals.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Active Deals
              </h2>
              <span className="text-sm text-muted-foreground">{deals.length} offers</span>
            </div>
            <div className="space-y-3">
              {deals.map((deal) => (
                <Link key={deal.id} to={`/deal/${deal.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                          {deal.image_url ? (
                            <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover" />
                          ) : (
                            <Tag className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm line-clamp-1">{deal.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {deal.discount_percentage && (
                              <Badge className="bg-red-500/10 text-red-600 text-xs">
                                {deal.discount_percentage}% OFF
                              </Badge>
                            )}
                            {deal.discounted_price && (
                              <span className="text-sm font-semibold text-primary">
                                ₹{deal.discounted_price}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Trust Badges */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-around">
              {merchant.is_verified && (
                <div className="flex flex-col items-center gap-1 text-center">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                  <span className="text-xs text-muted-foreground">Verified</span>
                </div>
              )}
              <div className="flex flex-col items-center gap-1 text-center">
                <Tag className="w-6 h-6 text-primary" />
                <span className="text-xs text-muted-foreground">{deals.length} Deals</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <Clock className="w-6 h-6 text-amber-600" />
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <NativeBottomNav />
    </div>
  );
};

export default MerchantDetailPage;
