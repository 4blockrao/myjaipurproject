import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import DealsSEO from "@/components/seo/DealsSEO";
import { PillarSchema } from "@/components/seo/SchemaInjector";
import { 
  Search, MapPin, Clock, Heart, Share2, 
  SlidersHorizontal, X, Store, Star, ChevronRight,
  Sparkles
} from "lucide-react";

interface Deal {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  discount_percentage: number | null;
  original_price: number | null;
  discounted_price: number | null;
  location: string | null;
  image_url: string | null;
  end_date: string | null;
  merchants?: {
    business_name: string;
    average_rating: number | null;
  } | null;
}

interface Merchant {
  id: string;
  business_name: string;
  business_type: string | null;
  address: string | null;
  logo_url: string | null;
  average_rating: number | null;
  total_reviews: number | null;
  is_verified: boolean | null;
}

const categories = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "Food & Dining", label: "Food", emoji: "🍽️" },
  { id: "Beauty & Wellness", label: "Beauty", emoji: "💆" },
  { id: "Fashion", label: "Fashion", emoji: "👗" },
  { id: "Electronics", label: "Electronics", emoji: "📱" },
  { id: "Health & Fitness", label: "Fitness", emoji: "💪" },
  { id: "Home & Garden", label: "Home", emoji: "🏠" },
];

const categoryEmojis: Record<string, string> = {
  "Food & Dining": "🍽️",
  "Beauty & Wellness": "💆",
  "Fashion": "👗",
  "Electronics": "📱",
  "Health & Fitness": "💪",
  "Home & Garden": "🏠",
  "Shopping": "🛍️",
  "Services": "🔧",
};

const businessTypeEmojis: Record<string, string> = {
  "Restaurant": "🍽️",
  "Beauty & Wellness": "💆",
  "Electronics": "📱",
  "Health & Fitness": "💪",
  "Retail": "🛍️",
  "Technology": "💻",
  "Education": "📚",
  "Automotive": "🚗",
  "Recreation": "🎮",
  "Pet Services": "🐕",
};

const DealsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [showSearch, setShowSearch] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [selectedCategory, searchQuery]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch deals
      let dealsQuery = supabase
        .from('deals')
        .select(`
          id, title, description, category, discount_percentage,
          original_price, discounted_price, location, image_url, end_date,
          merchants (business_name, average_rating)
        `)
        .eq('is_active', true);

      if (selectedCategory !== "all") {
        dealsQuery = dealsQuery.eq('category', selectedCategory);
      }

      if (searchQuery) {
        dealsQuery = dealsQuery.ilike('title', `%${searchQuery}%`);
      }

      // Fetch merchants
      const merchantsQuery = supabase
        .from('merchants')
        .select('id, business_name, business_type, address, logo_url, average_rating, total_reviews, is_verified')
        .eq('is_active', true)
        .order('average_rating', { ascending: false })
        .limit(10);

      const [dealsResult, merchantsResult] = await Promise.all([
        dealsQuery.order('created_at', { ascending: false }),
        merchantsQuery
      ]);

      if (dealsResult.error) throw dealsResult.error;
      if (merchantsResult.error) throw merchantsResult.error;

      setDeals(dealsResult.data || []);
      setMerchants(merchantsResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setDeals([]);
      setMerchants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchParams(categoryId !== "all" ? { category: categoryId } : {});
  };

  const handleSaveDeal = (dealId: string, e: React.MouseEvent) => {
    e.preventDefault();
    toast({ title: "Saved", description: "Deal added to favorites" });
  };

  const handleShareDeal = (dealId: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigator.share?.({ url: `${window.location.origin}/deal/${dealId}` });
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return 30;
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <AppLayout
      title="Deals"
      subtitle="Exclusive offers in Jaipur"
      showBackButton={true}
      backPath="/"
      showHeader={true}
      headerRightAction={
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 rounded-full"
          onClick={() => setShowSearch(!showSearch)}
        >
          {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
        </Button>
      }
    >
      <DealsSEO category={selectedCategory} />
      <PillarSchema 
        title="Best Deals in Jaipur"
        description="Discover exclusive offers, discounts and deals from local businesses in Jaipur. Save on dining, shopping, wellness and more."
        items={deals.map(d => ({ url: `https://www.jaipurcircle.com/deal/${d.id}`, name: d.title }))}
      />

      {/* Search Bar - Collapsible */}
      {showSearch && (
        <div className="px-4 py-3 bg-background border-b animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search deals..."
              className="pl-10 bg-muted/50 border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Category Chips - Horizontal Scroll */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-14 z-40">
        <ScrollArea className="w-full">
          <div className="flex gap-2 p-4">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                className={`rounded-full shrink-0 gap-1.5 ${
                  selectedCategory === cat.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-background"
                }`}
                onClick={() => handleCategorySelect(cat.id)}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>

      {/* Top Merchants Section */}
      {!searchQuery && selectedCategory === "all" && merchants.length > 0 && (
        <div className="px-4 py-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Top Merchants</h2>
            </div>
            <Link to="/merchants" className="text-xs text-primary flex items-center gap-0.5">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          
          <ScrollArea className="w-full -mx-4 px-4">
            <div className="flex gap-3">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="shrink-0 w-32">
                    <Skeleton className="h-20 w-20 rounded-full mx-auto mb-2" />
                    <Skeleton className="h-3 w-24 mx-auto" />
                    <Skeleton className="h-2 w-16 mx-auto mt-1" />
                  </div>
                ))
              ) : (
                merchants.map((merchant) => (
                  <Link 
                    key={merchant.id} 
                    to={`/merchant/${merchant.id}`}
                    className="shrink-0 w-28 text-center group"
                  >
                    <div className="relative mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      {merchant.logo_url ? (
                        <img 
                          src={merchant.logo_url} 
                          alt={merchant.business_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">
                          {businessTypeEmojis[merchant.business_type || ""] || "🏪"}
                        </span>
                      )}
                      {merchant.is_verified && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-primary rounded-full p-0.5">
                          <Sparkles className="h-2.5 w-2.5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium line-clamp-1">{merchant.business_name}</p>
                    <div className="flex items-center justify-center gap-0.5 mt-0.5">
                      <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] text-muted-foreground">
                        {merchant.average_rating?.toFixed(1) || "New"}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>
      )}

      {/* Results Count */}
      <div className="px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${deals.length} deals found`}
        </p>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          Sort
        </Button>
      </div>

      {/* Deals Grid */}
      <div className="px-4 space-y-3">
        {isLoading ? (
          // Loading Skeletons
          [...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="flex gap-3 p-3">
                <Skeleton className="h-24 w-24 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              </div>
            </Card>
          ))
        ) : deals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-semibold text-lg mb-1">No deals found</h3>
            <p className="text-muted-foreground text-sm">Try a different category or search term</p>
          </div>
        ) : (
          deals.map((deal) => (
            <Link key={deal.id} to={`/deal/${deal.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow active:scale-[0.99]">
                <CardContent className="p-0">
                  <div className="flex gap-3 p-3">
                    {/* Deal Image */}
                    <div className="relative h-24 w-24 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 overflow-hidden">
                      {deal.image_url ? (
                        <img 
                          src={deal.image_url} 
                          alt={deal.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">
                          {categoryEmojis[deal.category || ""] || "🎁"}
                        </span>
                      )}
                      {deal.discount_percentage && (
                        <Badge className="absolute top-1.5 left-1.5 bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5">
                          {deal.discount_percentage}% OFF
                        </Badge>
                      )}
                    </div>

                    {/* Deal Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-1">{deal.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {deal.merchants?.business_name || "Local Merchant"}
                      </p>
                      
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{deal.location || "Jaipur"}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-primary">₹{deal.discounted_price?.toLocaleString('en-IN')}</span>
                          {deal.original_price && (
                            <span className="text-xs text-muted-foreground line-through">₹{deal.original_price?.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{getDaysRemaining(deal.end_date)}d left</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={(e) => handleSaveDeal(deal.id, e)}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={(e) => handleShareDeal(deal.id, e)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </AppLayout>
  );
};

export default DealsPage;
