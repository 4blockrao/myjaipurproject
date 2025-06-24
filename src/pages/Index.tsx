import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LocalityPrompt from "@/components/LocalityPrompt";
import AuthModal from "@/components/auth/AuthModal";
import StickyBottomNav from "@/components/home/StickyBottomNav";
import HeroSection from "@/components/home/HeroSection";
import ModernNavigation from "@/components/home/ModernNavigation";
import QuickFilters from "@/components/home/QuickFilters";
import TrustIndicators from "@/components/home/TrustIndicators";
import TodaysTopDeals from "@/components/home/TodaysTopDeals";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import AllProducts from "@/components/home/AllProducts";
import TopProducts from "@/components/home/TopProducts";
import JaiCoinZone from "@/components/home/JaiCoinZone";
import TopSellingDeals from "@/components/home/TopSellingDeals";
import DealsNearMe from "@/components/home/DealsNearMe";
import TopMerchants from "@/components/home/TopMerchants";
import Leaderboard from "@/components/home/Leaderboard";
import LocalityGrid from "@/components/home/LocalityGrid";

interface UserProfile {
  id: string;
  full_name: string;
  locality?: string;
}

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLocalityPrompt, setShowLocalityPrompt] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [deals, setDeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchDeals();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      setUser(session.user);
      const userProfile = await fetchUserProfile(session.user.id);
      if (userProfile && !userProfile.locality) {
        setShowLocalityPrompt(true);
      }
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
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const handleLocalitySelected = async (locality: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ locality })
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, locality } : null);
      setShowLocalityPrompt(false);
      
      toast({
        title: "Location Updated",
        description: `Your locality has been set to ${locality}`,
      });
    } catch (error) {
      console.error('Error updating locality:', error);
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive"
      });
    }
  };

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          merchants(
            business_name,
            is_verified,
            average_rating
          )
        `)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = !searchQuery || 
      deal.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.merchants?.business_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || deal.category === selectedCategory;
    
    const matchesLocation = !profile?.locality || 
      deal.location?.toLowerCase().includes(profile.locality.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const sortedAndFilteredDeals = [...filteredDeals].sort((a, b) => {
    switch (selectedFilter) {
      case "nearby":
        return profile?.locality && a.location?.includes(profile.locality) ? -1 : 1;
      case "trending":
        return (b.current_redemptions || 0) - (a.current_redemptions || 0);
      case "ending-soon":
        if (!a.end_date || !b.end_date) return 0;
        return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
      case "top-rated":
        return (b.merchants?.average_rating || 0) - (a.merchants?.average_rating || 0);
      case "new":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  const categories = [
    "all", "Food & Dining", "Beauty & Wellness", "Shopping", 
    "Electronics", "Services", "Health & Fitness"
  ];

  const dealCounts = categories.reduce((acc, category) => {
    if (category === "all") {
      acc[category] = deals.length;
    } else {
      acc[category] = deals.filter(deal => deal.category === category).length;
    }
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">MyJaipur</h2>
          <p className="text-gray-600">Discovering amazing deals near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Navigation */}
      <ModernNavigation 
        user={user} 
        profile={profile} 
        onAuthModal={() => setShowAuthModal(true)} 
      />

      {/* Hero Section */}
      <HeroSection 
        userLocality={profile?.locality} 
        onSearch={handleSearch} 
      />

      {/* Quick Filters */}
      <QuickFilters
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        selectedFilter={selectedFilter}
        onFilterSelect={setSelectedFilter}
        dealCounts={dealCounts}
      />

      {/* Trust Indicators */}
      <TrustIndicators />

      {/* Main Content */}
      <div className="container mx-auto px-4 space-y-16 py-12">
        
        {/* Featured Products */}
        <FeaturedProducts />

        {/* Today's Hot Deals */}
        <TodaysTopDeals deals={sortedAndFilteredDeals} />

        {/* All Products */}
        <AllProducts />

        {/* Products You Can Buy Today */}
        <TopProducts deals={sortedAndFilteredDeals} />

        {/* JAICoin Gamification Zone - Only show if user is logged in */}
        {user && <JaiCoinZone user={user} />}

        {/* Top Selling Deals */}
        <TopSellingDeals deals={sortedAndFilteredDeals} />

        {/* Deals Near Me */}
        <DealsNearMe deals={sortedAndFilteredDeals} userLocality={profile?.locality} />

        {/* Top Merchants */}
        <TopMerchants />

        {/* Leaderboard - Only show if user is logged in */}
        {user && <Leaderboard />}

        {/* Browse by Locality */}
        <LocalityGrid />
      </div>

      {/* Sticky Bottom Navigation (Mobile) */}
      <StickyBottomNav />

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      <LocalityPrompt
        isOpen={showLocalityPrompt}
        onClose={() => setShowLocalityPrompt(false)}
        onLocalitySelected={handleLocalitySelected}
      />
    </div>
  );
};

export default Index;
