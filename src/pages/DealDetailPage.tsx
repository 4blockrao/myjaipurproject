import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DealDetailSEO } from "@/components/seo/DealDetailSEO";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { 
  MapPin, Star, Clock, Users, Share2, Heart, 
  ArrowLeft, Calendar, Phone, Globe, Percent,
  ShoppingCart, Gift, Award, CheckCircle, Tag,
  Store, ExternalLink, BadgeCheck, Coins
} from "lucide-react";

interface Deal {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  discount_percentage: number | null;
  original_price: number | null;
  discounted_price: number | null;
  location: string | null;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  terms_conditions: string | null;
  max_redemptions: number | null;
  current_redemptions: number | null;
  inventory_count: number | null;
  tags: string[] | null;
  jaicoin_reward: number | null;
  deal_type: string | null;
  is_featured: boolean | null;
  usage_terms: string | null;
  merchants: {
    id: string;
    business_name: string;
    business_type: string | null;
    address: string | null;
    phone: string | null;
    website: string | null;
    average_rating: number | null;
    total_reviews: number | null;
    description: string | null;
    logo_url: string | null;
    is_verified: boolean | null;
  } | null;
}

const DealDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  // Fetch deal with merchant details
  const { data: deal, isLoading, error } = useQuery({
    queryKey: ['deal', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          id, title, description, category, subcategory,
          discount_percentage, original_price, discounted_price,
          location, image_url, start_date, end_date,
          terms_conditions, max_redemptions, current_redemptions,
          inventory_count, tags, jaicoin_reward, deal_type,
          is_featured, usage_terms,
          merchants (
            id, business_name, business_type, address, phone,
            website, average_rating, total_reviews, description,
            logo_url, is_verified
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Deal;
    },
    enabled: !!id
  });

  // Fetch related deals based on category
  const { data: relatedDeals = [] } = useQuery({
    queryKey: ['related-deals', deal?.category, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          id, title, description, category, discount_percentage,
          original_price, discounted_price, location, image_url,
          merchants (id, business_name)
        `)
        .eq('is_active', true)
        .eq('category', deal?.category || '')
        .neq('id', id || '')
        .limit(4);

      if (error) throw error;
      return data || [];
    },
    enabled: !!deal?.category && !!id
  });

  const handleSaveDeal = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from favorites" : "Added to favorites",
      description: isSaved ? "Deal removed from your saved list" : "Deal saved to your favorites"
    });
  };

  const handleShareDeal = async () => {
    const shareData = {
      title: deal?.title,
      text: `Check out this amazing deal: ${deal?.discount_percentage}% off at ${deal?.merchants?.business_name || 'JaipurCircle'}!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Deal link has been copied to clipboard"
      });
    }
  };

  const handlePurchase = () => {
    if (!deal) return;
    navigate(`/checkout?dealId=${deal.id}`);
  };

  // Calculate availability - treat null max_redemptions as unlimited
  const getAvailability = () => {
    if (!deal) return { available: 0, total: 0, isUnlimited: true, percentage: 100 };
    
    const hasMaxRedemptions = deal.max_redemptions !== null && deal.max_redemptions > 0;
    const hasInventory = deal.inventory_count !== null && deal.inventory_count > 0;
    
    if (!hasMaxRedemptions && !hasInventory) {
      // Unlimited availability
      return { available: 999, total: 0, isUnlimited: true, percentage: 100 };
    }
    
    if (hasInventory) {
      return { 
        available: deal.inventory_count || 0, 
        total: deal.inventory_count || 0, 
        isUnlimited: false, 
        percentage: 100 
      };
    }
    
    const available = (deal.max_redemptions || 0) - (deal.current_redemptions || 0);
    const total = deal.max_redemptions || 0;
    const percentage = total > 0 ? (available / total) * 100 : 100;
    
    return { available: Math.max(0, available), total, isUnlimited: false, percentage };
  };

  const getRemainingTime = () => {
    if (!deal?.end_date) return 'No expiry';
    const endDate = new Date(deal.end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    
    if (diffTime < 0) return 'Expired';
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 30) return `${Math.floor(diffDays / 30)} months left`;
    if (diffDays > 0) return `${diffDays} days left`;
    return 'Expires today';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-64 rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-64 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Deal Not Found</h2>
          <p className="text-muted-foreground mb-6">The deal you're looking for doesn't exist or has been removed.</p>
          <Link to="/deals">
            <Button>Browse Other Deals</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { available, total, isUnlimited, percentage } = getAvailability();
  const inStock = available > 0;
  const merchant = deal.merchants;

  return (
    <>
      <DealDetailSEO 
        deal={{
          ...deal,
          description: deal.description || undefined,
          category: deal.category || undefined,
          subcategory: deal.subcategory || undefined,
          location: deal.location || undefined,
          image_url: deal.image_url || undefined,
          original_price: deal.original_price || undefined,
          discounted_price: deal.discounted_price || undefined,
          discount_percentage: deal.discount_percentage || undefined,
          start_date: deal.start_date || undefined,
          end_date: deal.end_date || undefined,
          max_redemptions: deal.max_redemptions || undefined,
          current_redemptions: deal.current_redemptions || undefined,
          inventory_count: deal.inventory_count || undefined,
          tags: deal.tags || undefined,
          terms_conditions: deal.terms_conditions || undefined,
          jaicoin_reward: deal.jaicoin_reward || undefined,
          merchant: merchant ? {
            business_name: merchant.business_name,
            business_type: merchant.business_type || undefined,
            address: merchant.address || undefined,
            phone: merchant.phone || undefined,
            website: merchant.website || undefined,
            average_rating: merchant.average_rating || undefined,
            total_reviews: merchant.total_reviews || undefined,
            is_verified: merchant.is_verified || undefined,
            logo_url: merchant.logo_url || undefined
          } : undefined
        }} 
      />
      
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="bg-card border-b shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/deals">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                {/* Breadcrumb */}
                <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                  <Link to="/" className="hover:text-primary">Home</Link>
                  <span>/</span>
                  <Link to="/deals" className="hover:text-primary">Deals</Link>
                  {deal.category && (
                    <>
                      <span>/</span>
                      <Link to={`/deals?category=${deal.category}`} className="hover:text-primary">{deal.category}</Link>
                    </>
                  )}
                </nav>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleSaveDeal}>
                  <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-destructive text-destructive' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShareDeal}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image */}
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 relative">
                  {deal.image_url ? (
                    <img
                      src={deal.image_url}
                      alt={deal.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Tag className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {deal.discount_percentage && deal.discount_percentage > 0 && (
                      <Badge className="bg-destructive text-destructive-foreground text-lg px-3 py-1">
                        <Percent className="w-4 h-4 mr-1" />
                        {deal.discount_percentage}% OFF
                      </Badge>
                    )}
                    {deal.is_featured && (
                      <Badge className="bg-amber-500 text-white">
                        <Star className="w-3 h-3 mr-1" /> Featured
                      </Badge>
                    )}
                  </div>
                  
                  {/* JaiCoin Reward */}
                  {deal.jaicoin_reward && deal.jaicoin_reward > 0 && (
                    <div className="absolute bottom-4 right-4">
                      <Badge className="bg-amber-100 text-amber-800 border border-amber-300">
                        <Coins className="w-3 h-3 mr-1" />
                        Earn {deal.jaicoin_reward} JaiCoins
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>

              {/* Deal Info Card */}
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {deal.category && (
                      <Badge variant="outline">
                        <Tag className="w-3 h-3 mr-1" />
                        {deal.category}
                      </Badge>
                    )}
                    {deal.subcategory && (
                      <Badge variant="secondary">{deal.subcategory}</Badge>
                    )}
                    {deal.deal_type && (
                      <Badge variant="secondary">{deal.deal_type}</Badge>
                    )}
                  </div>
                  
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground deal-title">
                    {deal.title}
                  </h1>
                  
                  {deal.description && (
                    <p className="text-muted-foreground text-base mt-2 deal-description">
                      {deal.description}
                    </p>
                  )}
                  
                  {/* Meta Info Row */}
                  <div className="flex flex-wrap items-center gap-4 pt-4 text-sm">
                    {deal.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{deal.location}, Jaipur</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{getRemainingTime()}</span>
                    </div>
                    {!isUnlimited && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{available} left{total > 0 ? ` of ${total}` : ''}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Tags */}
                  {deal.tags && deal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4">
                      {deal.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="merchant">Merchant</TabsTrigger>
                  <TabsTrigger value="terms">Terms</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">What's Included</h3>
                        <p className="text-muted-foreground">{deal.description || 'Contact merchant for full details.'}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Validity Period</h3>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {deal.start_date 
                                ? new Date(deal.start_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })
                                : 'Now'}
                            </span>
                          </div>
                          <span>→</span>
                          <span>
                            {deal.end_date 
                              ? new Date(deal.end_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })
                              : 'Until stocks last'}
                          </span>
                        </div>
                      </div>

                      {!isUnlimited && (
                        <div>
                          <h3 className="font-semibold text-lg mb-3">Availability</h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-3">
                                <div 
                                  className="bg-primary h-3 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{available} left</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {deal.current_redemptions || 0} already claimed
                            </p>
                          </div>
                        </div>
                      )}

                      {deal.usage_terms && (
                        <div>
                          <h3 className="font-semibold text-lg mb-3">How to Use</h3>
                          <p className="text-muted-foreground">{deal.usage_terms}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="merchant">
                  {merchant ? (
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-6">
                          <Avatar className="w-16 h-16">
                            {merchant.logo_url ? (
                              <AvatarImage src={merchant.logo_url} alt={merchant.business_name} />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                              {merchant.business_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold">{merchant.business_name}</h3>
                              {merchant.is_verified && (
                                <BadgeCheck className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            {merchant.business_type && (
                              <p className="text-muted-foreground">{merchant.business_type}</p>
                            )}
                            {merchant.average_rating && (
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                  <span className="font-medium">{merchant.average_rating.toFixed(1)}</span>
                                </div>
                                <span className="text-muted-foreground">
                                  ({merchant.total_reviews || 0} reviews)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {merchant.description && (
                          <div className="mb-6">
                            <h4 className="font-semibold mb-2">About</h4>
                            <p className="text-muted-foreground">{merchant.description}</p>
                          </div>
                        )}

                        <div className="space-y-3">
                          <h4 className="font-semibold">Contact Information</h4>
                          {merchant.address && (
                            <div className="flex items-start gap-3 text-muted-foreground">
                              <MapPin className="w-4 h-4 mt-1 shrink-0" />
                              <span>{merchant.address}{deal.location ? `, ${deal.location}` : ''}</span>
                            </div>
                          )}
                          {merchant.phone && (
                            <a href={`tel:${merchant.phone}`} className="flex items-center gap-3 text-muted-foreground hover:text-primary">
                              <Phone className="w-4 h-4" />
                              <span>{merchant.phone}</span>
                            </a>
                          )}
                          {merchant.website && (
                            <a href={merchant.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-primary hover:underline">
                              <Globe className="w-4 h-4" />
                              <span>Visit Website</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        <div className="mt-6 pt-6 border-t">
                          <Link to={`/merchant/${merchant.id}`}>
                            <Button variant="outline" className="w-full">
                              <Store className="w-4 h-4 mr-2" />
                              View All Deals from {merchant.business_name}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                        Merchant information not available
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="terms">
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Terms & Conditions</h3>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {deal.terms_conditions || 'Standard terms apply. Please contact the merchant for specific conditions.'}
                        </p>
                      </div>
                      
                      <div className="space-y-2 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Valid at participating locations only</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Cannot be combined with other offers</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Subject to availability</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Purchase Card */}
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  {/* Price Display */}
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-3 mb-2 deal-price">
                      <span className="text-3xl font-bold text-primary">
                        ₹{deal.discounted_price?.toLocaleString('en-IN') || 0}
                      </span>
                      {deal.original_price && deal.original_price > (deal.discounted_price || 0) && (
                        <span className="text-lg text-muted-foreground line-through">
                          ₹{deal.original_price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    {deal.original_price && deal.discounted_price && deal.original_price > deal.discounted_price && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                        Save ₹{(deal.original_price - deal.discounted_price).toLocaleString('en-IN')}
                      </Badge>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button 
                    onClick={handlePurchase}
                    className="w-full text-lg py-6"
                    size="lg"
                    disabled={!inStock}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {!inStock ? 'Sold Out' : 'Buy This Deal'}
                  </Button>

                  {/* Urgency Indicator */}
                  {inStock && !isUnlimited && available <= 10 && (
                    <p className="text-center text-destructive text-sm mt-3 animate-pulse">
                      ⚡ Only {available} left! Hurry up!
                    </p>
                  )}

                  {/* Benefits */}
                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Gift className="w-4 h-4 text-primary" />
                      <span>Instant digital delivery</span>
                    </div>
                    {deal.jaicoin_reward && deal.jaicoin_reward > 0 && (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span>Earn {deal.jaicoin_reward} JaiCoins</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Award className="w-4 h-4 text-primary" />
                      <span>100% verified merchant</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>
                        {deal.end_date 
                          ? `Valid until ${new Date(deal.end_date).toLocaleDateString('en-IN')}`
                          : 'No expiry date'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Deals */}
              {relatedDeals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Similar Deals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {relatedDeals.map((relatedDeal: any) => (
                      <Link key={relatedDeal.id} to={`/deal/${relatedDeal.id}`}>
                        <div className="flex gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                            {relatedDeal.image_url ? (
                              <img 
                                src={relatedDeal.image_url} 
                                alt={relatedDeal.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Tag className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm mb-1 truncate">{relatedDeal.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2 truncate">
                              {relatedDeal.merchants?.business_name || relatedDeal.location || 'Jaipur'}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-primary text-sm">
                                ₹{relatedDeal.discounted_price}
                              </span>
                              {relatedDeal.discount_percentage > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {relatedDeal.discount_percentage}% OFF
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
        
        <NativeBottomNav />
      </div>
    </>
  );
};

export default DealDetailPage;
