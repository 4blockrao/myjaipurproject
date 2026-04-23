import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "@/components/ErrorBoundary";
import { GlobalSEO } from "@/components/seo/GlobalSEO";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useEffect } from "react";

import Index from "./pages/Index";
import AboutPage from "./pages/AboutPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

import AccountPage from "./pages/AccountPage";
import ReferralSuccessPage from "./pages/ReferralSuccessPage";
import ReferralProgramPage from "./pages/ReferralProgramPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import ProMembershipPage from "./pages/ProMembershipPage";
import LeaderboardPage from "./pages/LeaderboardPage";

import DealsPage from "./pages/DealsPage";
import DealDetailPage from "./pages/DealDetailPage";
import CategoriesPage from "./pages/CategoriesPage";
import CheckoutPage from "./pages/CheckoutPage";
import NewCheckoutPage from "./pages/NewCheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";

import NewsPage from "./pages/NewsPage";
import NewsArticlePage from "./pages/NewsArticlePage";
import NewsCategoryPage from "./pages/NewsCategoryPage";
import CreateNewsPage from "./pages/CreateNewsPage";
import IPL2026Page from "./pages/IPL2026Page";

// NEW: Guides imports
import GuidesPage from "./pages/GuidesPage";
import GuideDetailPage from "./pages/GuideDetailPage";

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
import ArtistPage from "./pages/ArtistPage";

import MerchantOnboardingPage from "./pages/MerchantOnboardingPage";
import MerchantDashboardPage from "./pages/MerchantDashboardPage";
import MerchantPortalPage from "./pages/MerchantPortalPage";
import MerchantPage from "./pages/MerchantPage";
import MerchantDetailPage from "./pages/MerchantDetailPage";
import MerchantsPage from "./pages/MerchantsPage";

import PartnerHubPage from "./pages/PartnerHubPage";
import VendorRegistrationPage from "./pages/VendorRegistrationPage";
import BrokerDashboardPage from "./pages/BrokerDashboardPage";

import AdminDashboardPage from "./pages/AdminDashboardPage";

import ScanPage from "./pages/ScanPage";
import SitemapPage from "./pages/SitemapPage";

import LocalityPage from "./pages/LocalityPage";
import LocalitiesIndexPage from "./pages/LocalitiesIndexPage";
import JaipurPage from "./pages/JaipurPage";
import ZonePage from "./pages/ZonePage";
import ZonesIndexPage from "./pages/ZonesIndexPage";
import InstallPage from "./pages/InstallPage";

import CategoryPage from "./pages/CategoryPage";
import LocalityCategoryPage from "./pages/LocalityCategoryPage";

import CarsHubPage from "./pages/CarsHubPage";
import CarBrandsPage from "./pages/CarBrandsPage";
import CarBrandHubPage from "./pages/CarBrandHubPage";
import CarModelPage from "./pages/CarModelPage";
import CarModelDetailPage from "./pages/CarModelDetailPage";
import CarDealerPage from "./pages/CarDealerPage";
import CarDealersListPage from "./pages/CarDealersListPage";
import EVCarsPage from "./pages/EVCarsPage";
import CarsByBudgetPage from "./pages/CarsByBudgetPage";
import CarsByBodyTypePage from "./pages/CarsByBodyTypePage";
import CarComparePage from "./pages/CarComparePage";

import PropertiesHubPage from "./pages/PropertiesHubPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import PropertiesLocalityPage from "./pages/PropertiesLocalityPage";

const queryClient = new QueryClient();

/**
 * IMPORTANT: Stories are served via SSR rewrites (Supabase edge).
 * If the SPA boots on /stories/* (e.g. cached index.html or client navigation),
 * we force a one-time hard reload so the browser fetches SSR HTML instead.
 */
function SSRHardReload() {
  const loc = useLocation();

  useEffect(() => {
    const url = new URL(window.location.href);

    // Prevent infinite reload loops
    if (url.searchParams.get("__ssr") === "1") return;

    // Add a marker param; SSR functions ignore unknown params.
    url.searchParams.set("__ssr", "1");
    window.location.replace(url.toString());
  }, [loc.pathname, loc.search]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <LanguageProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AnalyticsProvider>
                  <GlobalSEO />
                  <Routes>
                    {/* Core */}
                    <Route path="/" element={<Index />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/auth" element={<AuthPage />} />

                    {/* Account / Utility */}
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/pro" element={<ProMembershipPage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/referral-success" element={<ReferralSuccessPage />} />
                    <Route path="/referral-program" element={<ReferralProgramPage />} />
                    <Route path="/scan" element={<ScanPage />} />
                    <Route path="/sitemap" element={<SitemapPage />} />
                    <Route path="/install" element={<InstallPage />} />

                    {/* Deals */}
                    <Route path="/deals" element={<DealsPage />} />
                    <Route path="/deal/:id" element={<DealDetailPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/checkout/new" element={<NewCheckoutPage />} />
                    <Route path="/order-success" element={<OrderSuccessPage />} />

                    {/* News - ORDER MATTERS! Specific routes first */}
                    <Route path="/news/create" element={<CreateNewsPage />} />
                    <Route path="/news/:slug" element={<NewsArticlePage />} />
                    <Route path="/news/:category" element={<NewsCategoryPage />} />
                    <Route path="/news" element={<NewsPage />} />

                    {/* Guides - NEW ROUTES */}
                    <Route path="/guides" element={<GuidesPage />} />
                    <Route path="/guide/:slug" element={<GuideDetailPage />} />
                    <Route path="/ipl-2026" element={<IPL2026Page />} />

                    {/* Events */}
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/events/create" element={<CreateEventPage />} />
                    <Route path="/events/organizer" element={<EventOrganizerDashboardPage />} />
                    <Route path="/events/free" element={<EventsFreeFilterPage />} />
                    <Route path="/events/workshops" element={<EventsWorkshopsPage />} />
                    <Route path="/events/today" element={<EventsTodayPage />} />
                    <Route path="/events/this-week" element={<EventsThisWeekPage />} />
                    <Route path="/events/this-weekend" element={<EventsThisWeekendPage />} />
                    <Route path="/events/past" element={<PastEventPage />} />
                    <Route path="/events/series/:slug" element={<EventSeriesPage />} />
                    <Route path="/events/artist/:slug" element={<ArtistPage />} />
                    <Route path="/events/category/:category" element={<EventCategoryPage />} />
                    <Route path="/events/fusion" element={<EventFusionPage />} />
                    <Route path="/events/:category/:locality" element={<EventsLocalityPage />} />
                    <Route path="/events/:slug" element={<EventDetailPage />} />

                    {/* Venues */}
                    <Route path="/venues" element={<Navigate to="/events" replace />} />
                    <Route path="/venues/:slug" element={<VenuePage />} />

                    {/* Merchants */}
                    <Route path="/merchants" element={<MerchantsPage />} />
                    <Route path="/merchant-onboarding" element={<MerchantOnboardingPage />} />
                    <Route path="/merchant-dashboard" element={<MerchantDashboardPage />} />
                    <Route path="/merchant-portal" element={<MerchantPortalPage />} />
                    <Route path="/merchant/:id" element={<MerchantDetailPage />} />
                    <Route path="/merchant/:slug" element={<MerchantPage />} />

                    {/* Partner / Vendor / Broker */}
                    <Route path="/partner-hub" element={<PartnerHubPage />} />
                    <Route path="/vendor-registration" element={<VendorRegistrationPage />} />
                    <Route path="/broker-dashboard" element={<BrokerDashboardPage />} />

                    {/* Admin */}
                    <Route path="/admin" element={<AdminDashboardPage />} />

                    {/* Jaipur / Localities */}
                    <Route path="/jaipur" element={<JaipurPage />} />
                    <Route path="/jaipur/all" element={<LocalitiesIndexPage />} />
                    <Route path="/jaipur/zones" element={<ZonesIndexPage />} />
                    <Route path="/jaipur/zones/:zoneSlug" element={<ZonePage />} />

                    {/* Canonical Merchant SEO Route */}
                    <Route path="/jaipur/:localitySlug/merchants/:merchantSlug" element={<MerchantDetailPage />} />

                    <Route path="/jaipur/:slug/:category" element={<LocalityCategoryPage />} />
                    <Route path="/jaipur/:slug" element={<LocalityPage />} />

                    {/* Cars */}
                    <Route path="/cars" element={<CarsHubPage />} />
                    <Route path="/cars/brands" element={<CarBrandsPage />} />
                    <Route path="/cars/brands/:brandSlug" element={<CarBrandHubPage />} />
                    <Route path="/cars/models/:modelSlug" element={<CarModelPage />} />
                    <Route path="/cars/models/:modelSlug/:variantSlug" element={<CarModelDetailPage />} />
                    <Route path="/cars/dealers/:dealerSlug" element={<CarDealerPage />} />
                    <Route path="/cars/dealers" element={<CarDealersListPage />} />
                    <Route path="/cars/ev" element={<EVCarsPage />} />
                    <Route path="/cars/budget" element={<CarsByBudgetPage />} />
                    <Route path="/cars/body-type" element={<CarsByBodyTypePage />} />
                    <Route path="/cars/compare" element={<CarComparePage />} />

                    {/* Properties */}
                    <Route path="/properties" element={<PropertiesHubPage />} />
                    <Route path="/properties/:slug" element={<PropertyDetailPage />} />
                    <Route path="/properties/locality/:slug" element={<PropertiesLocalityPage />} />

                    {/* STORIES (SSR) - force browser load */}
                    <Route path="/stories" element={<SSRHardReload />} />
                    <Route path="/stories/:slug" element={<SSRHardReload />} />

                    {/* Catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AnalyticsProvider>
              </BrowserRouter>
            </LanguageProvider>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
