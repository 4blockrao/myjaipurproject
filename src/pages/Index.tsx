import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HeaderMinimal from "@/components/home/HeaderMinimal";
import HeroCarousel from "@/components/home/HeroCarousel";
import SearchBarFloating from "@/components/home/SearchBarFloating";
import CategoryIconGrid from "@/components/home/CategoryIconGrid";
import HotDealsSection from "@/components/home/HotDealsSection";
import BottomNavHeritage from "@/components/home/BottomNavHeritage";
import { NewsHomeSection } from "@/components/news/NewsHomeSection";
import TopMerchantsSection from "@/components/home/TopMerchantsSection";
import TopLocalitiesSection from "@/components/home/TopLocalitiesSection";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import TrendingDealsSection from "@/components/home/TrendingDealsSection";
import UpcomingEventsSection from "@/components/home/UpcomingEventsSection";
import RecentDealsSection from "@/components/home/RecentDealsSection";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import HomeSEO from "@/components/seo/HomeSEO";
import Footer from "@/components/layout/Footer";
import { HomepageSchema } from "@/components/seo/SchemaInjector";
import { useUserLocality } from "@/hooks/useUserLocality";
import { LocalityPromptModal } from "@/components/home/LocalityPromptModal";
import { LocalityBadge } from "@/components/home/LocalityBadge";
import { LocalitySelectorModal } from "@/components/locality/LocalitySelectorModal";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  // Locality management
  const { userLocality, setUserLocality, shouldPromptLocality } = useUserLocality();
  const [showLocalityPrompt, setShowLocalityPrompt] = useState(false);
  const [showLocalitySelector, setShowLocalitySelector] = useState(false);

  // Show locality prompt when needed
  useEffect(() => {
    if (shouldPromptLocality) {
      // Small delay to let the page load first
      const timer = setTimeout(() => setShowLocalityPrompt(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldPromptLocality]);

  const handleLocalitySelect = (locality: { name: string; slug: string }) => {
    setUserLocality(locality.name, locality.slug);
    toast({
      title: `Location set to ${locality.name}`,
      description: "We'll show you deals and events near you.",
    });
  };

  const isAuthenticated = !!user;

  // Fetch user balance
  const { data: userBalance = 0 } = useQuery({
    queryKey: ["userBalance", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { data, error } = await supabase.rpc("get_user_balance", {
        user_uuid: user.id,
      });
      if (error) return 0;
      return data || 0;
    },
    enabled: !!user?.id,
  });

  // Fetch hot deals - filter by locality if set
  const { data: hotDeals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ["hot-deals-home", selectedCategory, userLocality?.slug],
    queryFn: async () => {
      let query = supabase
        .from("deals")
        .select(`*, merchants (business_name, is_verified, average_rating, address)`)
        .eq("approval_status", "approved")
        .eq("is_active", true)
        .gte("end_date", new Date().toISOString())
        .order("discount_percentage", { ascending: false })
        .limit(10);

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      // Filter by locality if user has one set
      if (userLocality?.name) {
        query = query.ilike("location", `%${userLocality.name}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeSEO />
      <HomepageSchema />

      {/* Premium Header with Locality Badge */}
      <HeaderMinimal
        isAuthenticated={isAuthenticated}
        onSignIn={() => navigate('/auth')}
        jaiCoins={userBalance}
        localityBadge={
          userLocality ? (
            <LocalityBadge
              localityName={userLocality.name}
              onClick={() => setShowLocalitySelector(true)}
              variant="header"
            />
          ) : null
        }
      />

      <main className="flex-1 pb-24">
        {/* Hero Carousel with multiple slides */}
        <HeroCarousel />

        {/* Floating Search Bar */}
        <SearchBarFloating />

        {/* Category Icons - includes Property & Cars */}
        <CategoryIconGrid onCategorySelect={setSelectedCategory} />

        {/* Hot Deals Section - Locality filtered */}
        <HotDealsSection
          deals={hotDeals}
          isLoading={dealsLoading}
          title={userLocality ? `Hot Deals in ${userLocality.name}` : "Hot Deals in Jaipur"}
        />

        {/* Trending Deals - Featured deals */}
        <TrendingDealsSection />

        {/* Upcoming Events */}
        <UpcomingEventsSection />

        {/* Featured Products */}
        <FeaturedProductsSection />

        {/* Recently Added Deals */}
        <RecentDealsSection />

        {/* News Section */}
        <section className="px-4">
          <NewsHomeSection />
        </section>

        {/* Top Merchants */}
        <TopMerchantsSection />

        {/* Top Localities */}
        <TopLocalitiesSection />
      </main>

      <Footer />
      <BottomNavHeritage />

      {/* Locality Prompt Modal - shown on first visit */}
      <LocalityPromptModal
        open={showLocalityPrompt}
        onOpenChange={setShowLocalityPrompt}
        onSelect={handleLocalitySelect}
      />

      {/* Locality Selector Modal - for changing locality */}
      <LocalitySelectorModal
        open={showLocalitySelector}
        onOpenChange={setShowLocalitySelector}
        onSelect={handleLocalitySelect}
      />
    </div>
  );
};

export default Index;

