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
import NativeMobileHeader from "@/components/layout/NativeMobileHeader";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import DealsSEO from "@/components/seo/DealsSEO";
import { 
  Search, MapPin, Clock, Heart, Share2, 
  Percent, Filter, SlidersHorizontal, X
} from "lucide-react";

interface Deal {
  id: string;
  title: string;
  description: string;
  category: string;
  discount_percentage: number;
  original_price: number;
  discounted_price: number;
  location: string;
  image_url?: string;
  end_date: string;
  merchants?: {
    business_name: string;
    average_rating: number;
  };
}

const categories = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "Food & Dining", label: "Food", emoji: "🍽️" },
  { id: "Beauty & Wellness", label: "Beauty", emoji: "💆" },
  { id: "Shopping", label: "Shopping", emoji: "🛍️" },
  { id: "Electronics", label: "Electronics", emoji: "📱" },
  { id: "Health & Fitness", label: "Fitness", emoji: "💪" },
  { id: "Services", label: "Services", emoji: "🔧" },
];

const DealsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [showSearch, setShowSearch] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeals();
  }, [selectedCategory, searchQuery]);

  const fetchDeals = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('deals')
        .select(`
          id, title, description, category, discount_percentage,
          original_price, discounted_price, location, image_url, end_date,
          merchants (business_name, average_rating)
        `)
        .eq('is_active', true)
        .eq('approval_status', 'approved');

      if (selectedCategory !== "all") {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      // Set mock data for demo
      setDeals(getMockDeals());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockDeals = (): Deal[] => [
    {
      id: "1",
      title: "Royal Rajasthani Thali",
      description: "Authentic Rajasthani cuisine with 15+ dishes",
      category: "Food & Dining",
      discount_percentage: 50,
      original_price: 800,
      discounted_price: 400,
      location: "C-Scheme",
      end_date: "2024-12-31T23:59:59Z",
      merchants: { business_name: "Royal Heritage", average_rating: 4.7 }
    },
    {
      id: "2",
      title: "Spa Day Package",
      description: "Full body massage + Steam + Sauna",
      category: "Beauty & Wellness",
      discount_percentage: 30,
      original_price: 1500,
      discounted_price: 1050,
      location: "Vaishali Nagar",
      end_date: "2024-12-31T23:59:59Z",
      merchants: { business_name: "Serene Spa", average_rating: 4.9 }
    },
    {
      id: "3",
      title: "Leather Handbag",
      description: "Handcrafted premium leather bag",
      category: "Shopping",
      discount_percentage: 25,
      original_price: 2500,
      discounted_price: 1875,
      location: "Bapu Bazaar",
      end_date: "2024-12-31T23:59:59Z",
      merchants: { business_name: "Artisan Leather", average_rating: 4.6 }
    },
    {
      id: "4",
      title: "Premium Headphones",
      description: "Noise cancelling wireless headphones",
      category: "Electronics",
      discount_percentage: 40,
      original_price: 3500,
      discounted_price: 2100,
      location: "Raja Park",
      end_date: "2024-12-31T23:59:59Z",
      merchants: { business_name: "Tech Gadgets", average_rating: 4.8 }
    },
    {
      id: "5",
      title: "Yoga Retreat",
      description: "Weekend yoga and meditation package",
      category: "Health & Fitness",
      discount_percentage: 35,
      original_price: 4000,
      discounted_price: 2600,
      location: "Amer Road",
      end_date: "2024-12-31T23:59:59Z",
      merchants: { business_name: "Zenith Wellness", average_rating: 4.9 }
    },
  ];

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

  const getDaysRemaining = (endDate: string) => {
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <DealsSEO category={selectedCategory} />
      
      {/* Native Header */}
      <NativeMobileHeader
        title="Deals"
        subtitle="Exclusive offers in Jaipur"
        showBackButton={true}
        backPath="/"
        rightAction={
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full"
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>
        }
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
                          {categories.find(c => c.id === deal.category)?.emoji || "🎁"}
                        </span>
                      )}
                      <Badge className="absolute top-1.5 left-1.5 bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5">
                        {deal.discount_percentage}% OFF
                      </Badge>
                    </div>

                    {/* Deal Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-1">{deal.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {deal.merchants?.business_name}
                      </p>
                      
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{deal.location}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-primary">₹{deal.discounted_price}</span>
                          <span className="text-xs text-muted-foreground line-through">₹{deal.original_price}</span>
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

      <NativeBottomNav />
    </div>
  );
};

export default DealsPage;
