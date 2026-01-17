import { lazy } from 'react';
import type { RouteRecord } from 'vite-react-ssg';
import { Navigate } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';

// Core Pages - eager load for fast initial render
import Index from './pages/Index';
import NotFound from './pages/NotFound';

// Lazy load all other pages for code splitting
const AboutPage = lazy(() => import('./pages/AboutPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const ReferralSuccessPage = lazy(() => import('./pages/ReferralSuccessPage'));
const ReferralProgramPage = lazy(() => import('./pages/ReferralProgramPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const ProMembershipPage = lazy(() => import('./pages/ProMembershipPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const DealsPage = lazy(() => import('./pages/DealsPage'));
const DealDetailPage = lazy(() => import('./pages/DealDetailPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const NewCheckoutPage = lazy(() => import('./pages/NewCheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const NewsArticlePage = lazy(() => import('./pages/NewsArticlePage'));
const NewsCategoryPage = lazy(() => import('./pages/NewsCategoryPage'));
const CreateNewsPage = lazy(() => import('./pages/CreateNewsPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const CreateEventPage = lazy(() => import('./pages/CreateEventPage'));
const EventOrganizerDashboardPage = lazy(() => import('./pages/EventOrganizerDashboardPage'));
const EventsFreeFilterPage = lazy(() => import('./pages/EventsFreeFilterPage'));
const EventsWorkshopsPage = lazy(() => import('./pages/EventsWorkshopsPage'));
const EventsLocalityPage = lazy(() => import('./pages/EventsLocalityPage'));
const EventsTodayPage = lazy(() => import('./pages/EventsTodayPage'));
const EventsThisWeekPage = lazy(() => import('./pages/EventsThisWeekPage'));
const EventsThisWeekendPage = lazy(() => import('./pages/EventsThisWeekendPage'));
const EventCategoryPage = lazy(() => import('./pages/EventCategoryPage'));
const EventFusionPage = lazy(() => import('./pages/EventFusionPage'));
const VenuePage = lazy(() => import('./pages/VenuePage'));
const OrganizerPage = lazy(() => import('./pages/OrganizerPage'));
const PastEventPage = lazy(() => import('./pages/PastEventPage'));
const EventSeriesPage = lazy(() => import('./pages/EventSeriesPage'));
const ArtistPage = lazy(() => import('./pages/ArtistPage'));
const MerchantOnboardingPage = lazy(() => import('./pages/MerchantOnboardingPage'));
const MerchantDashboardPage = lazy(() => import('./pages/MerchantDashboardPage'));
const MerchantPortalPage = lazy(() => import('./pages/MerchantPortalPage'));
const MerchantPage = lazy(() => import('./pages/MerchantPage'));
const MerchantDetailPage = lazy(() => import('./pages/MerchantDetailPage'));
const MerchantsPage = lazy(() => import('./pages/MerchantsPage'));
const PartnerHubPage = lazy(() => import('./pages/PartnerHubPage'));
const VendorRegistrationPage = lazy(() => import('./pages/VendorRegistrationPage'));
const BrokerDashboardPage = lazy(() => import('./pages/BrokerDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const ScanPage = lazy(() => import('./pages/ScanPage'));
const SitemapPage = lazy(() => import('./pages/SitemapPage'));
const LocalityPage = lazy(() => import('./pages/LocalityPage'));
const LocalitiesIndexPage = lazy(() => import('./pages/LocalitiesIndexPage'));
const JaipurPage = lazy(() => import('./pages/JaipurPage'));
const ZonePage = lazy(() => import('./pages/ZonePage'));
const ZonesIndexPage = lazy(() => import('./pages/ZonesIndexPage'));
const InstallPage = lazy(() => import('./pages/InstallPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const LocalityCategoryPage = lazy(() => import('./pages/LocalityCategoryPage'));
const CarsHubPage = lazy(() => import('./pages/CarsHubPage'));
const CarBrandPage = lazy(() => import('./pages/CarBrandPage'));
const CarBrandsPage = lazy(() => import('./pages/CarBrandsPage'));
const CarBrandHubPage = lazy(() => import('./pages/CarBrandHubPage'));
const CarModelPage = lazy(() => import('./pages/CarModelPage'));
const CarModelDetailPage = lazy(() => import('./pages/CarModelDetailPage'));
const CarDealerPage = lazy(() => import('./pages/CarDealerPage'));
const CarDealersListPage = lazy(() => import('./pages/CarDealersListPage'));
const EVCarsPage = lazy(() => import('./pages/EVCarsPage'));
const CarsByBudgetPage = lazy(() => import('./pages/CarsByBudgetPage'));
const CarsByBodyTypePage = lazy(() => import('./pages/CarsByBodyTypePage'));
const CarComparePage = lazy(() => import('./pages/CarComparePage'));
const PropertiesHubPage = lazy(() => import('./pages/PropertiesHubPage'));
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'));
const PropertiesLocalityPage = lazy(() => import('./pages/PropertiesLocalityPage'));

// SSG: Fetch deal slugs at build time for pre-rendering
async function getDealSlugPaths(): Promise<string[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[SSG] Missing Supabase credentials, skipping deal pre-rendering');
    return [];
  }

  try {
    const url = new URL(`${supabaseUrl}/rest/v1/deals`);
    url.searchParams.set('select', 'slug');
    url.searchParams.set('is_active', 'eq.true');
    url.searchParams.set('slug', 'not.is.null');
    url.searchParams.set('limit', '5000');

    const res = await fetch(url.toString(), {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!res.ok) {
      console.error('[SSG] Failed to fetch deals:', res.status);
      return [];
    }

    const deals = await res.json() as Array<{ slug: string }>;
    const paths = deals.map(d => `/deals/${d.slug}`);
    console.log(`[SSG] Pre-rendering ${paths.length} deal slug pages`);
    return paths;
  } catch (error) {
    console.error('[SSG] Error fetching deals:', error);
    return [];
  }
}

async function getDealIdPaths(): Promise<string[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  try {
    const url = new URL(`${supabaseUrl}/rest/v1/deals`);
    url.searchParams.set('select', 'id');
    url.searchParams.set('is_active', 'eq.true');
    url.searchParams.set('limit', '5000');

    const res = await fetch(url.toString(), {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!res.ok) return [];

    const deals = await res.json() as Array<{ id: string }>;
    const paths = deals.map(d => `/deal/${d.id}`);
    console.log(`[SSG] Pre-rendering ${paths.length} deal ID pages`);
    return paths;
  } catch (error) {
    console.error('[SSG] Error fetching deal IDs:', error);
    return [];
  }
}

export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <RootLayout />,
    entry: 'src/components/layout/RootLayout.tsx',
    children: [
      // Core Routes
      { index: true, element: <Index /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'auth', element: <AuthPage /> },

      // Account Hub
      { path: 'account', element: <AccountPage /> },
      { path: 'referral-success', element: <ReferralSuccessPage /> },
      { path: 'referral-program', element: <ReferralProgramPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'help', element: <HelpPage /> },
      { path: 'pro', element: <ProMembershipPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },

      // Legacy redirects
      { path: 'profile', element: <Navigate to="/account" replace /> },
      { path: 'dashboard', element: <Navigate to="/account" replace /> },
      { path: 'wallet', element: <Navigate to="/account?tab=wallet" replace /> },
      { path: 'orders', element: <Navigate to="/account?tab=orders" replace /> },
      { path: 'coupons', element: <Navigate to="/account?tab=orders" replace /> },
      { path: 'favorites', element: <Navigate to="/account" replace /> },
      { path: 'referral', element: <Navigate to="/referral-program" replace /> },
      { path: 'jaicoin-zone', element: <Navigate to="/account" replace /> },
      { path: 'gamification', element: <Navigate to="/account" replace /> },
      { path: 'my-deals', element: <Navigate to="/account?tab=orders" replace /> },
      { path: 'challenges', element: <Navigate to="/account" replace /> },

      // Category Pages
      { path: 'categories/:slug', element: <CategoryPage /> },
      { path: 'categories/:slug/:childSlug', element: <CategoryPage /> },

      // Deals & Shopping - SSG ENABLED
      { path: 'deals', element: <DealsPage /> },
      { 
        path: 'deals/:slug', 
        element: <DealDetailPage />,
        entry: 'src/pages/DealDetailPage.tsx',
        getStaticPaths: getDealSlugPaths,
      },
      { 
        path: 'deal/:id', 
        element: <DealDetailPage />,
        entry: 'src/pages/DealDetailPage.tsx',
        getStaticPaths: getDealIdPaths,
      },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'checkout/deal/:dealId', element: <NewCheckoutPage /> },
      { path: 'checkout/:orderId', element: <CheckoutPage /> },
      { path: 'order-success', element: <OrderSuccessPage /> },
      { path: 'order-success/:orderId', element: <OrderSuccessPage /> },

      // News
      { path: 'news', element: <NewsPage /> },
      { path: 'news/create', element: <CreateNewsPage /> },
      { path: 'news/:category', element: <NewsCategoryPage /> },
      { path: 'news/:category/:slug', element: <NewsArticlePage /> },

      // Events
      { path: 'events', element: <EventsPage /> },
      { path: 'events/create', element: <CreateEventPage /> },
      { path: 'events/organizer', element: <EventOrganizerDashboardPage /> },
      { path: 'events/free', element: <EventsFreeFilterPage /> },
      { path: 'events/workshops', element: <EventsWorkshopsPage /> },
      { path: 'events/today', element: <EventsTodayPage /> },
      { path: 'events/this-week', element: <EventsThisWeekPage /> },
      { path: 'events/this-weekend', element: <EventsThisWeekendPage /> },
      { path: 'events/in/:locality', element: <EventsLocalityPage /> },
      { path: 'events/category/:category', element: <EventCategoryPage /> },
      { path: 'events/past/:slug', element: <PastEventPage /> },
      { path: 'events/series/:seriesSlug', element: <EventSeriesPage /> },
      { path: 'events/:category/:locality', element: <EventFusionPage /> },
      { path: 'events/:slug', element: <EventDetailPage /> },

      // Venue, Organizer & Artist Pages
      { path: 'venues/:slug', element: <VenuePage /> },
      { path: 'organizers/:slug', element: <OrganizerPage /> },
      { path: 'artists/:slug', element: <ArtistPage /> },

      // Merchant
      { path: 'merchant-onboarding', element: <MerchantOnboardingPage /> },
      { path: 'merchant-dashboard', element: <MerchantDashboardPage /> },
      { path: 'merchant-portal', element: <MerchantPortalPage /> },
      { path: 'merchant', element: <MerchantPage /> },
      { path: 'merchant/:id', element: <MerchantDetailPage /> },
      { path: 'merchants', element: <MerchantsPage /> },

      // Partner/Vendor Registration
      { path: 'partner', element: <PartnerHubPage /> },
      { path: 'register/vendor', element: <VendorRegistrationPage /> },
      { path: 'broker/dashboard', element: <BrokerDashboardPage /> },

      // Admin
      { path: 'admin', element: <AdminDashboardPage /> },

      // Utility
      { path: 'scan', element: <ScanPage /> },
      { path: 'install', element: <InstallPage /> },
      { path: 'sitemap', element: <SitemapPage /> },

      // Locality & Zone Pages
      { path: 'jaipur', element: <JaipurPage /> },
      { path: 'jaipur/all', element: <LocalitiesIndexPage /> },
      { path: 'jaipur/zones', element: <ZonesIndexPage /> },
      { path: 'jaipur/zones/:zoneSlug', element: <ZonePage /> },
      { path: 'jaipur/:slug/:category', element: <LocalityCategoryPage /> },
      { path: 'jaipur/:slug', element: <LocalityPage /> },

      // Cars Hub
      { path: 'cars', element: <CarsHubPage /> },
      { path: 'cars/brands', element: <CarBrandsPage /> },
      { path: 'cars/ev', element: <EVCarsPage /> },
      { path: 'cars/compare', element: <CarComparePage /> },
      { path: 'cars/budget/:range', element: <CarsByBudgetPage /> },
      { path: 'cars/body-type/:bodyType', element: <CarsByBodyTypePage /> },
      { path: 'cars/dealers', element: <CarDealersListPage /> },
      { path: 'cars/dealers/:slug', element: <CarDealerPage /> },
      { path: 'cars/:brand', element: <CarBrandHubPage /> },
      { path: 'cars/:brand/:model', element: <CarModelDetailPage /> },
      { path: 'cars/:brand/:model/on-road-price-in-jaipur', element: <CarModelPage /> },

      // Properties Hub
      { path: 'properties', element: <PropertiesHubPage /> },
      { path: 'properties/in/:locality', element: <PropertiesLocalityPage /> },
      { path: 'properties/:slug', element: <PropertyDetailPage /> },

      // Legacy redirects
      { path: 'explore', element: <Navigate to="/deals" replace /> },
      { path: 'pro-membership', element: <Navigate to="/pro" replace /> },
      { path: 'analytics', element: <Navigate to="/account" replace /> },

      // 404
      { path: '*', element: <NotFound /> },
    ],
  },
];
