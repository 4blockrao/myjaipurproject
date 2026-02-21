import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "@/components/ErrorBoundary";
import { GlobalSEO } from "@/components/seo/GlobalSEO";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";

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

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
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
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/pro" element={<ProMembershipPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/referral-program" element={<ReferralProgramPage />} />
                  <Route path="/referral-success" element={<ReferralSuccessPage />} />
                  <Route path="/install" element={<InstallPage />} />
                  <Route path="/scan" element={<ScanPage />} />
                  <Route path="/sitemap" element={<SitemapPage />} />

                  {/* Categories */}
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />

                  {/* Deals */}
                  <Route path="/deals" element={<DealsPage />} />
                  <Route path="/deal/:id" element={<DealDetailPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/new-checkout" element={<NewCheckoutPage />} />
                  <Route path="/order-success" element={<OrderSuccessPage />} />

                  {/* News */}
                  <Route path="/news" element={<NewsPage />} />
                  <Route path="/news/create" element={<CreateNewsPage />} />
                  <Route path="/news/:category" element={<NewsCategoryPage />} />
                  <Route path="/news/:category/:slug" element={<NewsArticlePage />} />

                  {/* Events hub + filters */}
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/today" element={<EventsTodayPage />} />
                  <Route path="/events/this-week" element={<EventsThisWeekPage />} />
                  <Route path="/events/this-weekend" element={<EventsThisWeekendPage />} />
                  <Route path="/events/free" element={<EventsFreeFilterPage />} />
                  <Route path="/events/workshops" element={<EventsWorkshopsPage />} />

                  {/* Events taxonomy / discovery */}
                  <Route path="/events/category/:categorySlug" element={<EventCategoryPage />} />
                  <Route path="/events/locality/:localitySlug" element={<EventsLocalityPage />} />
                  <Route path="/events/fusion" element={<EventFusionPage />} />

                  {/* Events creation + dashboards */}
                  <Route path="/events/create" element={<CreateEventPage />} />
                  <Route path="/events/organizer" element={<EventOrganizerDashboardPage />} />

                  {/* Event entities */}
                  <Route path="/events/series/:seriesSlug" element={<EventSeriesPage />} />
                  <Route path="/events/past/:slug" element={<PastEventPage />} />
                  <Route path="/organizers/:organizerSlug" element={<OrganizerPage />} />
                  <Route path="/artists/:artistSlug" element={<ArtistPage />} />
                  <Route path="/venues/:venueSlug" element={<VenuePage />} />

                  {/* Event detail (SPA route; SSR rewrite will also serve HTML for direct loads) */}
                  <Route path="/events/:slug" element={<EventDetailPage />} />

                  {/* Merchants */}
                  <Route path="/merchants" element={<MerchantsPage />} />
                  <Route path="/merchant-onboarding" element={<MerchantOnboardingPage />} />
                  <Route path="/merchant-dashboard" element={<MerchantDashboardPage />} />
                  <Route path="/merchant-portal" element={<MerchantPortalPage />} />
                  <Route path="/merchant/:id" element={<MerchantDetailPage />} />
                  <Route path="/merchant/:merchantSlug" element={<MerchantPage />} />

                  {/* Partners / Vendor / Broker */}
                  <Route path="/partners" element={<PartnerHubPage />} />
                  <Route path="/vendor-registration" element={<VendorRegistrationPage />} />
                  <Route path="/broker-dashboard" element={<BrokerDashboardPage />} />

                  {/* Admin */}
                  <Route path="/admin" element={<AdminDashboardPage />} />

                  {/* Jaipur localities */}
                  <Route path="/jaipur" element={<JaipurPage />} />
                  <Route path="/jaipur/all" element={<LocalitiesIndexPage />} />
                  <Route path="/jaipur/zones" element={<ZonesIndexPage />} />
                  <Route path="/jaipur/zones/:zoneSlug" element={<ZonePage />} />

                  {/* Canonical Merchant SEO Route */}
                  <Route
                    path="/jaipur/:localitySlug/merchants/:merchantSlug"
                    element={<MerchantDetailPage />}
                  />

                  <Route path="/jaipur/:slug/:category" element={<LocalityCategoryPage />} />
                  <Route path="/jaipur/:slug" element={<LocalityPage />} />

                  {/* Properties */}
                  <Route path="/properties" element={<PropertiesHubPage />} />
                  <Route path="/property/:id" element={<PropertyDetailPage />} />
                  <Route path="/properties/locality/:localitySlug" element={<PropertiesLocalityPage />} />

                  {/* Cars */}
                  <Route path="/cars" element={<CarsHubPage />} />
                  <Route path="/cars/brands" element={<CarBrandsPage />} />
                  <Route path="/cars/brand/:brandSlug" element={<CarBrandHubPage />} />
                  <Route path="/cars/model/:modelSlug" element={<CarModelPage />} />
                  <Route path="/cars/model/:modelSlug/:variantSlug" element={<CarModelDetailPage />} />
                  <Route path="/cars/dealer/:dealerSlug" element={<CarDealerPage />} />
                  <Route path="/cars/dealers" element={<CarDealersListPage />} />
                  <Route path="/cars/ev" element={<EVCarsPage />} />
                  <Route path="/cars/budget" element={<CarsByBudgetPage />} />
                  <Route path="/cars/body-type" element={<CarsByBodyTypePage />} />
                  <Route path="/cars/compare" element={<CarComparePage />} />

                  {/* 404 MUST BE LAST */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnalyticsProvider>
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
