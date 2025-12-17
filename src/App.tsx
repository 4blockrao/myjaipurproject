import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from "@/components/ErrorBoundary";

// Core Pages
import Index from "./pages/Index";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";

// Account & User Pages
import AccountPage from "./pages/AccountPage";
import ReferralSuccessPage from "./pages/ReferralSuccessPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import ProMembershipPage from "./pages/ProMembershipPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ChallengesPage from "./pages/ChallengesPage";

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

// Merchant Pages
import MerchantOnboardingPage from "./pages/MerchantOnboardingPage";
import MerchantDashboardPage from "./pages/MerchantDashboardPage";
import MerchantPortalPage from "./pages/MerchantPortalPage";
import MerchantPage from "./pages/MerchantPage";

// Admin
import AdminDashboardPage from "./pages/AdminDashboardPage";

// Utility Pages
import ScanPage from "./pages/ScanPage";
import InstallPage from "./pages/InstallPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        if (error?.status === 404 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Core Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<AboutPage />} />
              
              {/* Account Hub - Main user section */}
              <Route path="/account" element={<AccountPage />} />
              <Route path="/referral-success" element={<ReferralSuccessPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/pro" element={<ProMembershipPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/challenges" element={<ChallengesPage />} />
              
              {/* Legacy redirects to Account */}
              <Route path="/profile" element={<Navigate to="/account" replace />} />
              <Route path="/dashboard" element={<Navigate to="/account" replace />} />
              <Route path="/wallet" element={<Navigate to="/account?tab=wallet" replace />} />
              <Route path="/orders" element={<Navigate to="/account?tab=orders" replace />} />
              <Route path="/coupons" element={<Navigate to="/account?tab=orders" replace />} />
              <Route path="/favorites" element={<Navigate to="/account?tab=saved" replace />} />
              <Route path="/referral" element={<Navigate to="/account?tab=referral" replace />} />
              <Route path="/referral-program" element={<Navigate to="/account?tab=referral" replace />} />
              <Route path="/jaicoin-zone" element={<Navigate to="/account" replace />} />
              <Route path="/gamification" element={<Navigate to="/account" replace />} />
              <Route path="/my-deals" element={<Navigate to="/account?tab=orders" replace />} />
              
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
              <Route path="/events/:slug" element={<EventDetailPage />} />
              
              {/* Merchant */}
              <Route path="/merchant-onboarding" element={<MerchantOnboardingPage />} />
              <Route path="/merchant-dashboard" element={<MerchantDashboardPage />} />
              <Route path="/merchant-portal" element={<MerchantPortalPage />} />
              <Route path="/merchant" element={<MerchantPage />} />
              
              {/* Admin */}
              <Route path="/admin" element={<AdminDashboardPage />} />
              
              {/* Utility */}
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/install" element={<InstallPage />} />
              
              {/* Legacy redirects */}
              <Route path="/explore" element={<Navigate to="/deals" replace />} />
              <Route path="/pro-membership" element={<Navigate to="/pro" replace />} />
              <Route path="/analytics" element={<Navigate to="/account" replace />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
