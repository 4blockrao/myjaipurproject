import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MerchantSEO } from "@/components/seo/MerchantSEO";
import FloatingHeader from "@/components/layout/FloatingHeader";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, Phone, Mail, Globe, Star, ShieldCheck, 
  Clock, Tag, ChevronRight, Store, BadgeCheck,
  Navigation, MessageCircle, Share2, ExternalLink,
  Percent, Award, Users, Calendar, Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MerchantDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: merchant, isLoading } = useQuery({
    queryKey: ['merchant', id],
    queryFn: async () => {
      // Try to find by ID first, then by slug
      let query = supabase.from('merchants').select('*');
      
      // Check if 'id' looks like a UUID or a slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');
      
      if (isUUID) {
        query = query.eq('id', id);
      } else {
        query = query.eq('slug', id);
      }
      
      const { data, error } = await query.single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['merchant-deals', merchant?.id],
    queryFn: async () => {
      // Direct merchant_id deals
      const { data: directDeals } = await supabase
        .from('deals')
        .select('*')
        .eq('merchant_id', merchant.id)
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(20);

      // Junction-table deals
      const { data: linked } = await supabase
        .from('deals_merchants')
        .select('deal:deals(id, slug, title, description, discount_percentage, image_url, original_price, discounted_price, is_featured, is_active, approval_status)')
        .eq('merchant_id', merchant.id);

      const linkedDeals = (linked || [])
        .map((row: any) => row.deal)
        .filter((d: any) => d && d.is_active !== false);

      const all = [...(directDeals || []), ...linkedDeals];
      const seen = new Set<string>();
      return all.filter((d: any) => (d && !seen.has(d.id) && seen.add(d.id)));
    },
    enabled: !!merchant?.id,
  });

  const { data: featuredArticles = [] } = useQuery({
    queryKey: ['merchant-articles', merchant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('article_merchants')
        .select('article:articles(id, slug, title, type, article_type, status)')
        .eq('merchant_id', merchant.id);
      if (error) throw error;
      return (data || [])
        .map((row: any) => row.article)
        .filter((a: any) => a && a.status === 'published');
    },
    enabled: !!merchant?.id,
  });

  const handleShare = async () => {
    const shareData = {
      title: merchant?.business_name,
      text: `Check out ${merchant?.business_name} on JaipurCircle - Great deals and offers!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied", description: "Merchant link copied to clipboard" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <FloatingHeader title="Loading..." showBackButton />
        <main className="pt-16 px-4 space-y-4 max-w-2xl mx-auto">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
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

  const locality = merchant.locality || 'Jaipur';
  const currentYear = new Date().getFullYear();

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

  // Stats
  const featuredDeals = deals.filter(d => d.is_featured);
  const totalSavings = deals.reduce((acc, d) => {
    if (d.original_price && d.discounted_price) {
      return acc + (d.original_price - d.discounted_price);
    }
    return acc;
  }, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <MerchantSEO merchant={merchant} dealsCount={deals.length} />

      <FloatingHeader 
        title={merchant.business_name} 
        showBackButton 
        rightAction={
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
          </Button>
        }
      />

      <main className="pt-16 px-4 space-y-5 max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground overflow-x-auto pt-2">
          <Link to="/" className="hover:text-primary whitespace-nowrap">Home</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <Link to="/merchants" className="hover:text-primary whitespace-nowrap">Merchants</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span className="text-foreground truncate">{merchant.business_name}</span>
        </nav>

        {/* Hero Card */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                {merchant.logo_url ? (
                  <AvatarImage src={merchant.logo_url} alt={merchant.business_name} />
                ) : null}
                <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                  {merchant.business_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold truncate">{merchant.business_name}</h1>
                  {merchant.is_verified && (
                    <BadgeCheck className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
                {merchant.business_type && (
                  <Badge variant="secondary" className="mb-2">
                    {categoryEmojis[merchant.business_type] || '🏪'} {merchant.business_type}
                  </Badge>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{merchant.average_rating?.toFixed(1) || '4.5'}</span>
                  <span>•</span>
                  <span>{merchant.total_reviews || 0} reviews</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="text-center p-3 rounded-xl bg-background/80">
                <div className="text-xl font-bold text-primary">{deals.length}</div>
                <div className="text-xs text-muted-foreground">Active Deals</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-background/80">
                <div className="text-xl font-bold text-amber-600">{featuredDeals.length}</div>
                <div className="text-xs text-muted-foreground">Featured</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-background/80">
                <div className="text-xl font-bold text-green-600">₹{(totalSavings / 1000).toFixed(0)}K+</div>
                <div className="text-xs text-muted-foreground">Total Savings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {merchant.is_verified && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Verified Merchant</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 flex-shrink-0">
            <Award className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium">Trusted Partner</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200 flex-shrink-0">
            <Clock className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-700 font-medium">Active Since {currentYear}</span>
          </div>
        </div>

        {/* Description */}
        {merchant.description && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">About {merchant.business_name}</h2>
            <p className="text-muted-foreground leading-relaxed">{merchant.description}</p>
          </section>
        )}

        {/* Known For & Features */}
        {(Array.isArray((merchant as any).known_for) && (merchant as any).known_for.length > 0) && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" /> Known For
            </h3>
            <div className="flex flex-wrap gap-2">
              {(merchant as any).known_for.map((item: string, i: number) => (
                <Badge key={i} variant="secondary">{item}</Badge>
              ))}
            </div>
          </section>
        )}
        {(Array.isArray((merchant as any).features) && (merchant as any).features.length > 0) && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Features
            </h3>
            <div className="flex flex-wrap gap-2">
              {(merchant as any).features.map((item: string, i: number) => (
                <Badge key={i} variant="outline">{item}</Badge>
              ))}
            </div>
          </section>
        )}

        <Separator />

        {/* Contact Info */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Contact Information
          </h2>
          
          <Card>
            <CardContent className="p-4 space-y-3">
              {merchant.address && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{merchant.address}, {locality}, Jaipur</p>
                  </div>
                </div>
              )}
              
              {merchant.phone && (
                <a href={`tel:${merchant.phone}`} className="flex items-start gap-3 hover:bg-muted/50 -mx-2 px-2 py-1 rounded-lg transition-colors">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{merchant.phone}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground mt-2" />
                </a>
              )}
              
              {merchant.email && (
                <a href={`mailto:${merchant.email}`} className="flex items-start gap-3 hover:bg-muted/50 -mx-2 px-2 py-1 rounded-lg transition-colors">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{merchant.email}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground mt-2" />
                </a>
              )}
              
              {merchant.website && (
                <a href={merchant.website} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:bg-muted/50 -mx-2 px-2 py-1 rounded-lg transition-colors">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Website</p>
                    <p className="text-sm text-primary">{merchant.website}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground mt-2" />
                </a>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            {merchant.phone && (
              <a href={`tel:${merchant.phone}`}>
                <Button variant="outline" className="w-full flex-col h-auto py-3 gap-1">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="text-xs">Call Now</span>
                </Button>
              </a>
            )}
            {merchant.address && (
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(merchant.address + ', ' + locality + ', Jaipur')}`}
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full flex-col h-auto py-3 gap-1">
                  <Navigation className="w-5 h-5 text-primary" />
                  <span className="text-xs">Directions</span>
                </Button>
              </a>
            )}
            <Button variant="outline" className="w-full flex-col h-auto py-3 gap-1" onClick={handleShare}>
              <Share2 className="w-5 h-5 text-primary" />
              <span className="text-xs">Share</span>
            </Button>
          </div>
        </section>

        <Separator />

        {/* Active Deals */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              Active Deals
            </h2>
            <Badge variant="secondary">{deals.length} offers</Badge>
          </div>
          
          {deals.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {deals.map((deal) => (
                <Link key={deal.id} to={`/deal/${deal.id}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-all">
                    <CardContent className="p-0">
                      <div className="flex gap-3">
                        <div className="w-24 h-24 bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                          {deal.image_url ? (
                            <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover" />
                          ) : (
                            <Tag className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 py-3 pr-3 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm line-clamp-2">{deal.title}</h3>
                              <div className="flex items-center gap-2 mt-2">
                                {deal.discount_percentage && deal.discount_percentage > 0 && (
                                  <Badge className="bg-destructive/10 text-destructive text-xs gap-1">
                                    <Percent className="w-3 h-3" />
                                    {deal.discount_percentage}% OFF
                                  </Badge>
                                )}
                                {deal.is_featured && (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-lg font-bold text-primary">
                                  ₹{deal.discounted_price?.toLocaleString('en-IN')}
                                </span>
                                {deal.original_price && deal.original_price > (deal.discounted_price || 0) && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    ₹{deal.original_price.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="p-8 text-center">
                <Tag className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No active deals at the moment</p>
                <p className="text-sm text-muted-foreground mt-1">Check back soon for new offers!</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Location Link */}
        {locality && locality !== 'Jaipur' && (
          <>
            <Separator />
            <section className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Explore {locality}
              </h2>
              <Link to={`/jaipur/${locality.toLowerCase().replace(/\s+/g, '-')}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">More in {locality}</p>
                      <p className="text-sm text-muted-foreground">
                        Discover other merchants and deals in this area
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </section>
          </>
        )}

        {/* Featured In (Articles) */}
        {featuredArticles.length > 0 && (
          <>
            <Separator />
            <section className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Featured In
              </h2>
              <div className="space-y-2">
                {featuredArticles.map((a: any) => {
                  const base = a.type === 'news' ? '/news' : '/guide';
                  return (
                    <Link key={a.id} to={`${base}/${a.slug}`}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between gap-3">
                          <p className="text-sm font-medium line-clamp-2">{a.title}</p>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Back to IPL campaign */}
        <Separator />
        <Link to="/ipl-2026" className="block">
          <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">← Back to IPL 2026 Guide</p>
                <p className="text-xs text-muted-foreground">Tickets, schedules & more</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </main>

      <NativeBottomNav />
    </div>
  );
};

export default MerchantDetailPage;
