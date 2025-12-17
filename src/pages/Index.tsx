import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/auth/AuthModal";
import NativeHomeHeader from "@/components/home/NativeHomeHeader";
import NativeCategoryGrid from "@/components/home/NativeCategoryGrid";
import NativeDealsSection from "@/components/home/NativeDealsSection";
import NativeQuickActions from "@/components/home/NativeQuickActions";
import NativeStatsBar from "@/components/home/NativeStatsBar";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { NewsHomeSection } from "@/components/news/NewsHomeSection";
import EventHomeSection from "@/components/events/EventHomeSection";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch user balance
  const { data: userBalance = 0 } = useQuery({
    queryKey: ['userBalance', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { data, error } = await supabase.rpc('get_user_balance', { user_uuid: user.id });
      if (error) {
        console.error('Error fetching balance:', error);
        return 0;
      }
      return data || 0;
    },
    enabled: !!user?.id,
  });

  // Fetch deals with React Query
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['deals', selectedCategory, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('deals')
        .select(`
          *,
          merchants (
            business_name,
            is_verified,
            average_rating
          )
        `)
        .eq('approval_status', 'approved')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching deals:', error);
        toast({
          title: "Error loading deals",
          description: "Please refresh the page to try again.",
          variant: "destructive",
        });
        throw error;
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Get categories and deal counts
  const categories = [
    "all", "Food & Dining", "Beauty & Wellness", "Shopping", "Electronics", 
    "Health & Fitness", "Automotive", "Services", "Travel", "Education"
  ];
  
  const dealCounts = categories.reduce((acc, category) => {
    if (category === "all") {
      acc[category] = deals.length;
    } else {
      acc[category] = deals.filter(deal => deal.category === category).length;
    }
    return acc;
  }, {} as Record<string, number>);

  // Featured deals (those with is_featured = true)
  const featuredDeals = deals.filter(deal => deal.is_featured);
  
  // Hot deals (high discount)
  const hotDeals = [...deals].sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0)).slice(0, 8);
  
  // Recent deals
  const recentDeals = deals.slice(0, 6);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Toaster />
      <Sonner />
      
      {/* Native Home Header with Search */}
      <NativeHomeHeader 
        userLocality={profile?.locality}
        userName={profile?.full_name}
        jaiCoins={userBalance}
        onSearch={handleSearch}
      />

      {/* Stats Bar */}
      <NativeStatsBar />

      {/* Categories Grid */}
      <NativeCategoryGrid 
        dealCounts={dealCounts}
        onCategorySelect={handleCategorySelect}
      />

      {/* Featured Deals - Horizontal Scroll */}
      {featuredDeals.length > 0 && (
        <NativeDealsSection 
          deals={featuredDeals}
          isLoading={dealsLoading}
          title="Featured Deals"
          icon="sparkles"
          variant="horizontal-scroll"
          maxDeals={8}
        />
      )}

      {/* Quick Actions */}
      <NativeQuickActions />

      {/* News Section */}
      <div className="px-4">
        <NewsHomeSection />
      </div>

      {/* Events Section */}
      <div className="px-4">
        <EventHomeSection />
      </div>

      {/* Hot Deals - Horizontal Scroll */}
      <NativeDealsSection 
        deals={hotDeals}
        isLoading={dealsLoading}
        title="🔥 Hot Deals"
        icon="flame"
        variant="horizontal-scroll"
        maxDeals={8}
      />

      {/* All Recent Deals - Vertical List */}
      <NativeDealsSection 
        deals={recentDeals}
        isLoading={dealsLoading}
        title="Latest Deals"
        icon="trending"
        variant="vertical-list"
        maxDeals={6}
      />

      {/* Bottom spacing for nav */}
      <div className="h-24" />

      {/* Native Bottom Navigation */}
      <NativeBottomNav />
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default Index;
