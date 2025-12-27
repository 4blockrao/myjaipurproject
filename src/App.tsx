import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from "@/components/ErrorBoundary";
import { GlobalSEO } from "@/components/seo/GlobalSEO";
import { AuthProvider } from "@/contexts/AuthContext";

// Core Pages
import Index from "./pages/Index";
import AboutPage from "./pages/AboutPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

// Account & User Pages
import AccountPage from "./pages/AccountPage";
import ReferralSuccessPage from "./pages/ReferralSuccessPage";
import ReferralProgramPage from "./pages/ReferralProgramPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import ProMembershipPage from "./pages/ProMembershipPage";
import LeaderboardPage from "./pages/LeaderboardPage";

// Deals & Shopping
import DealsPage from "./pages/DealsPage";
import DealDetailPage from "./pages/DealDetailPage";
import CategoriesPage from "./pages/CategoriesPage";
import CheckoutPage from "./pages/CheckoutPage";
import NewCheckoutPage from "./pages/NewCheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";

// News
import NewsPage from "./pages/NewsPage";
import NewsArticlePage from "./pages/NewsArticlePage";
import NewsCategoryPage from "./pages/NewsCategoryPage";
import CreateNewsPage from "./pages/CreateNewsPage";

// Events
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import CreateEventPage from "./pages/CreateEventPage";
import EventOrganizerDashboardPage from "./pages/EventOrganizerDashboardPage";
import EventsFreeFilterPage from "./pages/EventsFreeFilterPage";
import EventsWorkshopsPage from "./pages/EventsWorkshopsPage";
import EventsLocalityPage from "./pages/EventsLocalityPage";
import EventsTodayPage from "./pages/EventsTodayPage";
import EventsThisWeekPage from "./pages/EventsThisWeekPage";
import EventsThisWeekendPage from "./pages/EventsThisWeekendPage";
import EventCategoryPage from "./pages/EventCategoryPage";
import EventFusionPage from "./pages/EventFusionPage";
import VenuePage from "./pages/VenuePage";
import OrganizerPage from "./pages/OrganizerPage";
import PastEventPage from "./pages/PastEventPage";
import EventSeriesPage from "./pages/EventSeriesPage";

// Merchant Pages
import MerchantOnboardingPage from "./pages/MerchantOnboardingPage";
import MerchantDashboardPage from "./pages/MerchantDashboardPage";
import MerchantPortalPage from "./pages/MerchantPortalPage";
import MerchantPage from "./pages/MerchantPage";
import MerchantDetailPage from "./pages/MerchantDetailPage";
import MerchantsPage from "./pages/MerchantsPage";

// Admin
import AdminDashboardPage from "./pages/AdminDashboardPage";

// Utility Pages
import ScanPage from "./pages/ScanPage";
import SitemapPage from "./pages/SitemapPage";

// Locality & Zone Pages
import LocalityPage from "./pages/LocalityPage";
import LocalitiesIndexPage from "./pages/LocalitiesIndexPage";
import JaipurPage from "./pages/JaipurPage";
import ZonePage from "./pages/ZonePage";
import ZonesIndexPage from "./pages/ZonesIndexPage";
import InstallPage from "./pages/InstallPage";

// Category Pages
import CategoryPage from "./pages/CategoryPage";
import LocalityCategoryPage from "./pages/LocalityCategoryPage";

// Cars Hub
import CarsHubPage from "./pages/CarsHubPage";
import CarBrandPage from "./pages/CarBrandPage";
import CarModelPage from "./pages/CarModelPage";
import CarDealerPage from "./pages/CarDealerPage";
import CarDealersListPage from "./pages/CarDealersListPage";
import EVCarsPage from "./pages/EVCarsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch when component mounts if data is fresh
      retry: (failureCount, error: any) => {
        // Don't retry on 404 or 403 errors
        if (error?.status === 404 || error?.status === 403) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              {/* Sitewide Default SEO - provides fallback meta for all pages */}
              <GlobalSEO />
              <Routes>
                {/* Core Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/auth" element={<AuthPage />} />
                
              {/* Account Hub */}
              <Route path="/account" element={<AccountPage />} />
              <Route path="/referral-success" element={<ReferralSuccessPage />} />
              <Route path="/referral-program" element={<ReferralProgramPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/pro" element={<ProMembershipPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              
              {/* Legacy redirects */}
              <Route path="/profile" element={<Navigate to="/account" replace />} />
              <Route path="/dashboard" element={<Navigate to="/account" replace />} />
              <Route path="/wallet" element={<Navigate to="/account?tab=wallet" replace />} />
              <Route path="/orders" element={<Navigate to="/account?tab=orders" replace />} />
              <Route path="/coupons" element={<Navigate to="/account?tab=orders" replace />} />
              <Route path="/favorites" element={<Navigate to="/account" replace />} />
              <Route path="/referral" element={<Navigate to="/referral-program" replace />} />
              <Route path="/jaicoin-zone" element={<Navigate to="/account" replace />} />
              <Route path="/gamification" element={<Navigate to="/account" replace />} />
              <Route path="/my-deals" element={<Navigate to="/account?tab=orders" replace />} />
              <Route path="/challenges" element={<Navigate to="/account" replace />} />
              
              {/* Category Pages */}
              <Route path="/categories/:slug" element={<CategoryPage />} />
              <Route path="/categories/:slug/:childSlug" element={<CategoryPage />} />
              
              {/* Deals & Shopping */}
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/deal/:id" element={<DealDetailPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/:orderId" element={<CheckoutPage />} />
              <Route path="/new-checkout" element={<NewCheckoutPage />} />
              <Route path="/new-checkout/:orderId" element={<NewCheckoutPage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
              
              {/* News */}
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/create" element={<CreateNewsPage />} />
              <Route path="/news/:category" element={<NewsCategoryPage />} />
              <Route path="/news/:category/:slug" element={<NewsArticlePage />} />
              
              {/* Events */}
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/create" element={<CreateEventPage />} />
              <Route path="/events/organizer" element={<EventOrganizerDashboardPage />} />
              <Route path="/events/free" element={<EventsFreeFilterPage />} />
              <Route path="/events/workshops" element={<EventsWorkshopsPage />} />
              <Route path="/events/today" element={<EventsTodayPage />} />
              <Route path="/events/this-week" element={<EventsThisWeekPage />} />
              <Route path="/events/this-weekend" element={<EventsThisWeekendPage />} />
              <Route path="/events/in/:locality" element={<EventsLocalityPage />} />
              <Route path="/events/category/:category" element={<EventCategoryPage />} />
              <Route path="/events/past/:slug" element={<PastEventPage />} />
              <Route path="/events/series/:seriesSlug" element={<EventSeriesPage />} />
              <Route path="/events/:category/:locality" element={<EventFusionPage />} />
              <Route path="/events/:slug" element={<EventDetailPage />} />
              
              {/* Venue & Organizer Pages */}
              <Route path="/venues/:slug" element={<VenuePage />} />
              <Route path="/organizer/:slug" element={<OrganizerPage />} />
              
              {/* Merchant */}
              <Route path="/merchant-onboarding" element={<MerchantOnboardingPage />} />
              <Route path="/merchant-dashboard" element={<MerchantDashboardPage />} />
              <Route path="/merchant-portal" element={<MerchantPortalPage />} />
              <Route path="/merchant" element={<MerchantPage />} />
              <Route path="/merchant/:id" element={<MerchantDetailPage />} />
              <Route path="/merchants" element={<MerchantsPage />} />
              
              {/* Admin */}
              <Route path="/admin" element={<AdminDashboardPage />} />
              
              {/* Utility */}
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/install" element={<InstallPage />} />
              <Route path="/sitemap" element={<SitemapPage />} />
              
              {/* Locality & Zone Pages */}
              <Route path="/jaipur" element={<JaipurPage />} />
              <Route path="/jaipur/all" element={<LocalitiesIndexPage />} />
              <Route path="/jaipur/zones" element={<ZonesIndexPage />} />
              <Route path="/jaipur/zones/:zoneSlug" element={<ZonePage />} />
              <Route path="/jaipur/:slug/:category" element={<LocalityCategoryPage />} />
              <Route path="/jaipur/:slug" element={<LocalityPage />} />
              
              {/* Cars Hub */}
              <Route path="/cars" element={<CarsHubPage />} />
              <Route path="/cars/ev" element={<EVCarsPage />} />
              <Route path="/cars/dealers" element={<CarDealersListPage />} />
              <Route path="/cars/dealers/:slug" element={<CarDealerPage />} />
              <Route path="/cars/:brandSlug" element={<CarBrandPage />} />
              <Route path="/cars/:brandSlug/:modelSlug" element={<CarModelPage />} />
              
              {/* Legacy redirects */}
              <Route path="/explore" element={<Navigate to="/deals" replace />} />
              <Route path="/pro-membership" element={<Navigate to="/pro" replace />} />
              <Route path="/analytics" element={<Navigate to="/account" replace />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
