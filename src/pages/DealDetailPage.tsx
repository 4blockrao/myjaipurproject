import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EnhancedDealSEO } from "@/components/seo/EnhancedDealSEO";
import { DealPrerenderedContent } from "@/components/seo/DealPrerenderedContent";
import { DealImageGallery } from "@/components/deals/DealImageGallery";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { 
  MapPin, Star, Clock, Users, Share2, Heart, 
  ArrowLeft, Calendar, Phone, Globe, Percent,
  ShoppingCart, Gift, Award, CheckCircle, Tag,
  Store, BadgeCheck, Coins, 
  Navigation, MessageCircle, Info, FileText,
  ChevronRight, Sparkles, Shield, Zap, Copy
} from "lucide-react";
import CountdownTimer from "@/components/deals/CountdownTimer";
import SocialProofCounter from "@/components/deals/SocialProofCounter";
import ProgressBar from "@/components/deals/ProgressBar";

interface Deal {
  id: string;
  slug?: string;
  title: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  discount_percentage: number | null;
  original_price: number | null;
  discounted_price: number | null;
  location: string | null;
  image_url: string | null;
  gallery_images: string[] | null;
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
    locality: string | null;
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
  // Support both UUID (/deal/:id) and slug (/deals/:slug) routes
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  
  // Determine if we're using slug or id for the query
  const identifier = slug || id;
  const isSlugQuery = !!slug;

  const { data: deal, isLoading, error } = useQuery({
    queryKey: ['deal', identifier, isSlugQuery],
    queryFn: async () => {
      // Build the query based on whether we have a slug or id
      const query = supabase
        .from('deals')
        .select(`
          id, slug, title, description, category, subcategory,
          discount_percentage, original_price, discounted_price,
          location, image_url, gallery_images, start_date, end_date,
          terms_conditions, max_redemptions, current_redemptions,
          inventory_count, tags, jaicoin_reward, deal_type,
          is_featured, usage_terms,
          merchants (
            id, business_name, business_type, address, locality, phone,
            website, average_rating, total_reviews, description,
            logo_url, is_verified
          )
        `);
      
      // Query by slug or id
      const { data, error } = isSlugQuery
        ? await query.eq('slug', identifier).single()
        : await query.eq('id', identifier).single();

      if (error) throw error;
      return data as unknown as Deal;
    },
    enabled: !!identifier
  });

  const { data: relatedDeals = [] } = useQuery({
    queryKey: ['related-deals', deal?.category, deal?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          id, slug, title, description, category, discount_percentage,
          original_price, discounted_price, location, image_url,
          merchants (id, business_name)
        `)
        .eq('is_active', true)
        .eq('category', deal?.category || '')
        .neq('id', deal?.id || '')
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
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied", description: "Deal link has been copied to clipboard" });
    }
  };

  const handlePurchase = async () => {
    if (!deal) return;
    
    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to purchase this deal",
        variant: "destructive"
      });
      navigate(`/auth?redirect=/deal/${deal.id}`);
      return;
    }
    
    // Navigate to checkout with deal ID
    navigate(`/checkout/deal/${deal.id}`);
  };

  const getAvailability = () => {
    if (!deal) return { available: 0, total: 0, isUnlimited: true, percentage: 100 };
    
    const hasMaxRedemptions = deal.max_redemptions !== null && deal.max_redemptions > 0;
    const hasInventory = deal.inventory_count !== null && deal.inventory_count > 0;
    
    if (!hasMaxRedemptions && !hasInventory) {
      return { available: 999, total: 0, isUnlimited: true, percentage: 100 };
    }
    
    if (hasInventory) {
      return { available: deal.inventory_count || 0, total: deal.inventory_count || 0, isUnlimited: false, percentage: 100 };
    }
    
    const available = (deal.max_redemptions || 0) - (deal.current_redemptions || 0);
    const total = deal.max_redemptions || 0;
    const percentage = total > 0 ? (available / total) * 100 : 100;
    
    return { available: Math.max(0, available), total, isUnlimited: false, percentage };
  };

  const getRemainingTime = () => {
    if (!deal?.end_date) return null;
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
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="aspect-[4/3] rounded-2xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <Tag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4 text-foreground">Deal Not Found</h2>
          <p className="text-muted-foreground mb-6">The deal you're looking for doesn't exist or has been removed.</p>
          <Link to="/deals">
            <Button size="lg">Browse Other Deals</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { available, isUnlimited } = getAvailability();
  const inStock = available > 0;
  const merchant = deal.merchants;
  const locality = deal.location || merchant?.locality || 'Jaipur';
  const remainingTime = getRemainingTime();

  // Prepare SEO data
  const seoData = {
    id: deal.id,
    slug: deal.slug,
    title: deal.title,
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
      locality: merchant.locality || undefined,
      phone: merchant.phone || undefined,
      website: merchant.website || undefined,
      average_rating: merchant.average_rating || undefined,
      total_reviews: merchant.total_reviews || undefined,
      is_verified: merchant.is_verified || undefined,
      logo_url: merchant.logo_url || undefined
    } : undefined
  };

  return (
    <>
      {/* Enhanced SEO with dynamic meta tags and JSON-LD */}
      <EnhancedDealSEO deal={seoData} />
      
      {/* Pre-rendered crawlable content - visible in page source for SEO */}
      <DealPrerenderedContent deal={seoData} />
      
      <div className="min-h-screen bg-background pb-32">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleSaveDeal}>
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-destructive text-destructive' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShareDeal}>
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-4 space-y-5">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground overflow-x-auto">
            <Link to="/" className="hover:text-primary whitespace-nowrap">Home</Link>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <Link to="/deals" className="hover:text-primary whitespace-nowrap">Deals</Link>
            {deal.category && (
              <>
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                <Link to={`/deals?category=${deal.category}`} className="hover:text-primary whitespace-nowrap">{deal.category}</Link>
              </>
            )}
          </nav>

          {/* Image Gallery */}
          <DealImageGallery 
            mainImage={deal.image_url} 
            galleryImages={deal.gallery_images as string[] | null} 
            title={deal.title} 
          />

          {/* Deal Header */}
          <section className="space-y-3">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {deal.discount_percentage && deal.discount_percentage > 0 && (
                <Badge className="bg-destructive text-destructive-foreground gap-1">
                  <Percent className="w-3 h-3" />
                  {deal.discount_percentage}% OFF
                </Badge>
              )}
              {deal.is_featured && (
                <Badge className="bg-amber-500 text-white gap-1">
                  <Sparkles className="w-3 h-3" /> Featured
                </Badge>
              )}
              {deal.jaicoin_reward && deal.jaicoin_reward > 0 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                  <Coins className="w-3 h-3" />
                  Earn {deal.jaicoin_reward}
                </Badge>
              )}
            </div>

            {/* Title - H1 for SEO */}
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              {deal.title}
            </h1>

            {/* Quick Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <Link 
                to={`/jaipur/${locality.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <MapPin className="w-4 h-4 text-primary" />
                {locality}, Jaipur
              </Link>
              {remainingTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  {remainingTime}
                </div>
              )}
              {!isUnlimited && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  {available} left
                </div>
              )}
            </div>

            {/* Category Tags */}
            <div className="flex flex-wrap gap-2">
              {deal.category && (
                <Link to={`/deals?category=${deal.category}`}>
                  <Badge variant="secondary" className="gap-1">
                    <Tag className="w-3 h-3" />
                    {deal.category}
                  </Badge>
                </Link>
              )}
              {deal.subcategory && (
                <Badge variant="outline">{deal.subcategory}</Badge>
              )}
              {deal.deal_type && (
                <Badge variant="outline">{deal.deal_type}</Badge>
              )}
            </div>
          </section>

          {/* Price Card - Sticky on mobile */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-bold text-primary">
                      ₹{deal.discounted_price?.toLocaleString('en-IN') || 0}
                    </span>
                    {deal.original_price && deal.original_price > (deal.discounted_price || 0) && (
                      <span className="text-lg text-muted-foreground line-through">
                        ₹{deal.original_price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  {deal.original_price && deal.discounted_price && deal.original_price > deal.discounted_price && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      You save ₹{(deal.original_price - deal.discounted_price).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={handlePurchase}
                  size="lg"
                  disabled={!inStock}
                  className="gap-2 text-base px-6"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {!inStock ? 'Sold Out' : 'Buy Now'}
                </Button>
              </div>

              {/* Urgency indicator */}
              {inStock && !isUnlimited && available <= 10 && (
                <div className="mt-4 flex items-center gap-2 text-destructive text-sm font-medium animate-pulse">
                  <Zap className="w-4 h-4" />
                  Only {available} left! Hurry up!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description Section */}
          {deal.description && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                About This Deal
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {deal.description}
              </p>
            </section>
          )}

          <Separator />

          {/* Benefits Section */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">What You Get</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <Gift className="w-4 h-4" />
                </div>
                <span className="text-sm">Instant Delivery</span>
              </div>
              {deal.jaicoin_reward && deal.jaicoin_reward > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                    <Coins className="w-4 h-4" />
                  </div>
                  <span className="text-sm">+{deal.jaicoin_reward} JaiCoins</span>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-sm">Verified Merchant</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-sm">100% Genuine</span>
              </div>
            </div>
          </section>

          <Separator />

          {/* Validity Section */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Validity Period
            </h2>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">From</p>
                <p className="font-medium">
                  {deal.start_date 
                    ? new Date(deal.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Now'}
                </p>
              </div>
              <div className="flex-1 h-px bg-border relative">
                <ChevronRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Until</p>
                <p className="font-medium">
                  {deal.end_date 
                    ? new Date(deal.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'No Expiry'}
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Merchant Section */}
          {merchant && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                About the Merchant
              </h2>
              <Card>
                <CardContent className="p-4">
                  <Link to={`/merchant/${merchant.id}`} className="block">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-14 h-14 border-2 border-primary/20">
                        {merchant.logo_url ? (
                          <AvatarImage src={merchant.logo_url} alt={merchant.business_name} />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                          {merchant.business_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg truncate">{merchant.business_name}</h3>
                          {merchant.is_verified && (
                            <BadgeCheck className="w-5 h-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                        {merchant.business_type && (
                          <p className="text-sm text-muted-foreground">{merchant.business_type}</p>
                        )}
                        {merchant.average_rating && (
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium text-sm">{merchant.average_rating.toFixed(1)}</span>
                            <span className="text-muted-foreground text-sm">
                              ({merchant.total_reviews || 0} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Link>

                  {/* Contact Actions */}
                  <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2">
                    {merchant.phone && (
                      <a href={`tel:${merchant.phone}`} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors">
                        <Phone className="w-5 h-5 text-primary" />
                        <span className="text-xs">Call</span>
                      </a>
                    )}
                    {merchant.address && (
                      <a 
                        href={`https://maps.google.com/?q=${encodeURIComponent(merchant.address + ', ' + locality + ', Jaipur')}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Navigation className="w-5 h-5 text-primary" />
                        <span className="text-xs">Directions</span>
                      </a>
                    )}
                    {merchant.website && (
                      <a 
                        href={merchant.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Globe className="w-5 h-5 text-primary" />
                        <span className="text-xs">Website</span>
                      </a>
                    )}
                  </div>

                  {/* Address */}
                  {merchant.address && (
                    <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{merchant.address}, {locality}, Jaipur</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          )}

          <Separator />

          {/* Terms & Conditions */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Terms & Conditions
            </h2>
            <div className="p-4 rounded-xl bg-muted/50 space-y-3">
              {deal.terms_conditions ? (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {deal.terms_conditions}
                </p>
              ) : (
                <div className="space-y-2">
                  {[
                    'Valid at participating locations only',
                    'Cannot be combined with other offers',
                    'Subject to availability',
                    'Merchant reserves right to modify terms'
                  ].map((term, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {term}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* How to Use */}
          {deal.usage_terms && (
            <>
              <Separator />
              <section className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  How to Use This Deal
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {deal.usage_terms}
                </p>
              </section>
            </>
          )}

          {/* Tags */}
          {deal.tags && deal.tags.length > 0 && (
            <>
              <Separator />
              <section className="space-y-3">
                <h2 className="text-lg font-semibold">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {deal.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Related Deals */}
          {relatedDeals.length > 0 && (
            <>
              <Separator />
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Similar Deals</h2>
                  <Link to={`/deals?category=${deal.category}`} className="text-sm text-primary">
                    View all
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {relatedDeals.slice(0, 4).map((relatedDeal: any) => (
                    <Link key={relatedDeal.id} to={relatedDeal.slug ? `/deals/${relatedDeal.slug}` : `/deal/${relatedDeal.id}`}>
                      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                        <div className="aspect-[4/3] bg-muted relative">
                          {relatedDeal.image_url ? (
                            <img 
                              src={relatedDeal.image_url} 
                              alt={relatedDeal.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Tag className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                          {relatedDeal.discount_percentage > 0 && (
                            <Badge className="absolute top-2 left-2 bg-destructive text-xs">
                              {relatedDeal.discount_percentage}% OFF
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium text-sm line-clamp-2 mb-1">{relatedDeal.title}</h3>
                          <p className="text-xs text-muted-foreground mb-2 truncate">
                            {relatedDeal.merchants?.business_name || relatedDeal.location || 'Jaipur'}
                          </p>
                          <span className="font-bold text-primary">
                            ₹{relatedDeal.discounted_price?.toLocaleString('en-IN')}
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>

        {/* Sticky Bottom CTA */}
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t z-40">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">
                  ₹{deal.discounted_price?.toLocaleString('en-IN') || 0}
                </span>
                {deal.original_price && deal.original_price > (deal.discounted_price || 0) && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{deal.original_price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {remainingTime && (
                <p className="text-xs text-muted-foreground">{remainingTime}</p>
              )}
            </div>
            <Button 
              onClick={handlePurchase}
              size="lg"
              disabled={!inStock}
              className="gap-2 px-8"
            >
              <ShoppingCart className="w-5 h-5" />
              {!inStock ? 'Sold Out' : 'Buy Now'}
            </Button>
          </div>
        </div>
        
        <NativeBottomNav />
      </div>
    </>
  );
};

export default DealDetailPage;
