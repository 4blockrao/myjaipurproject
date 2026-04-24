import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import HeaderMinimal from "@/components/home/HeaderMinimal";
import HeroCarousel from "@/components/home/HeroCarousel";
import SearchBarFloating from "@/components/home/SearchBarFloating";
import CategoryIconGrid from "@/components/home/CategoryIconGrid";
import HotDealsSection from "@/components/home/HotDealsSection";
import TrendingDealsGrid from "@/components/home/TrendingDealsGrid";
import BottomNavHeritage from "@/components/home/BottomNavHeritage";
import { NewsHomeSection } from "@/components/news/NewsHomeSection";
import TopMerchantsSection from "@/components/home/TopMerchantsSection";
import TopLocalitiesSection from "@/components/home/TopLocalitiesSection";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import EventsHomeSection from "@/components/home/EventsHomeSection";
import GuidesHomeSection from "@/components/home/GuidesHomeSection";
import PropertiesSection from "@/components/home/PropertiesSection";
import CarsSection from "@/components/home/CarsSection";
import CategoryPillarSection from "@/components/home/CategoryPillarSection";
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
import { UtensilsCrossed, Sparkles } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  // Locality management
  const { userLocality, setUserLocality, shouldPromptLocality } = useUserLocality();
  const [showLocalityPrompt, setShowLocalityPrompt] = useState(false);
  const [showLocalitySelector, setShowLocalitySelector] = useState(false);

  useEffect(() => {
    if (shouldPromptLocality) {
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

  const { data: hotDeals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ["hot-deals-home", selectedCategory, userLocality?.slug],
    queryFn: async () => {
      let query = supabase
        .from("deals")
        .select(`*, merchants (business_name, is_verified, average_rating, address)`)
        .eq("approval_status", "approved")
        .eq("status", "published")
        .gte("end_date", new Date().toISOString())
        .order("discount_percentage", { ascending: false })
        .limit(10);

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      if (userLocality?.name) {
        query = query.ilike("location", `%${userLocality.name}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Schema for Sitelinks Search Box
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://jaipurcircle.com",
    "name": "JaipurCircle",
    "description": "Jaipur's hyper-local discovery platform for deals, events, property, automobiles, and local businesses.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://jaipurcircle.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(webSiteSchema)}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background flex flex-col">
        <HomeSEO />
        <HomepageSchema />

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
          <HeroCarousel />
          <SearchBarFloating />
          <CategoryIconGrid onCategorySelect={setSelectedCategory} />

          {/* Hot Deals */}
          <HotDealsSection
            deals={hotDeals}
            isLoading={dealsLoading}
            title={userLocality ? `Hot Deals in ${userLocality.name}` : "Hot Deals in Jaipur"}
          />

          {/* 🔥 Trending Deals grid (top 6) */}
          <TrendingDealsGrid />

          {/* Events */}
          <EventsHomeSection />

          {/* Featured Products (1-2 rows) */}
          <FeaturedProductsSection />

          {/* Food & Dining */}
          <CategoryPillarSection
            title="Food & Dining"
            icon={UtensilsCrossed}
            iconColor="bg-orange-500"
            category="food"
            viewAllLink="/deals?category=food"
          />

          {/* Beauty & Wellness */}
          <CategoryPillarSection
            title="Beauty & Wellness"
            icon={Sparkles}
            iconColor="bg-pink-500"
            category="beauty"
            viewAllLink="/deals?category=beauty"
          />

          {/* Properties */}
          <PropertiesSection />

          {/* Cars */}
          <CarsSection />

          {/* Top Merchants */}
          <TopMerchantsSection />

          {/* News */}
          <section className="px-4">
            <NewsHomeSection />
          </section>

          {/* IPL Guides */}
          <section className="px-4">
            <GuidesHomeSection />
          </section>

          {/* Top Localities */}
          <TopLocalitiesSection />
        </main>

        <Footer />
        <BottomNavHeritage />

        <LocalityPromptModal
          open={showLocalityPrompt}
          onOpenChange={setShowLocalityPrompt}
          onSelect={handleLocalitySelect}
        />

        <LocalitySelectorModal
          open={showLocalitySelector}
          onOpenChange={setShowLocalitySelector}
          onSelect={handleLocalitySelect}
        />
      </div>
    </>
  );
};

export default Index;
