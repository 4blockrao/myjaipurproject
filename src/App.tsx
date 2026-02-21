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

import LocalityPage from "./pages/LocalityPage";
import LocalitiesIndexPage from "./pages/LocalitiesIndexPage";
import JaipurPage from "./pages/JaipurPage";
import ZonePage from "./pages/ZonePage";
import ZonesIndexPage from "./pages/ZonesIndexPage";
import LocalityCategoryPage from "./pages/LocalityCategoryPage";

// Events
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import CreateEventPage from "./pages/CreateEventPage";
import EventsTodayPage from "./pages/EventsTodayPage";
import EventsThisWeekPage from "./pages/EventsThisWeekPage";
import EventsThisWeekendPage from "./pages/EventsThisWeekendPage";
import EventsFreeFilterPage from "./pages/EventsFreeFilterPage";
import EventsWorkshopsPage from "./pages/EventsWorkshopsPage";
import EventsLocalityPage from "./pages/EventsLocalityPage";
import EventCategoryPage from "./pages/EventCategoryPage";
import VenuePage from "./pages/VenuePage";

const queryClient = new QueryClient();

/**
 * ⚠️ ROUTE ORDER MATTERS
 * More specific routes must come BEFORE dynamic routes like /events/:slug
 * Otherwise /events/create, /events/today etc will be treated as :slug.
 */
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

                  {/* Jaipur / Localities */}
                  <Route path="/jaipur" element={<JaipurPage />} />
                  <Route path="/jaipur/all" element={<LocalitiesIndexPage />} />
                  <Route path="/jaipur/zones" element={<ZonesIndexPage />} />
                  <Route path="/jaipur/zones/:zoneSlug" element={<ZonePage />} />
                  <Route path="/jaipur/:slug/:category" element={<LocalityCategoryPage />} />
                  <Route path="/jaipur/:slug" element={<LocalityPage />} />

                  {/* ---------------------------------
                      EVENTS (restore missing routes)
                      --------------------------------- */}
                  <Route path="/events" element={<EventsPage />} />

                  {/* Filters from the Events hub UI */}
                  <Route path="/events/today" element={<EventsTodayPage />} />
                  <Route path="/events/this-week" element={<EventsThisWeekPage />} />
                  <Route path="/events/this-weekend" element={<EventsThisWeekendPage />} />
                  <Route path="/events/free" element={<EventsFreeFilterPage />} />
                  <Route path="/events/workshops" element={<EventsWorkshopsPage />} />

                  {/* Create Event must be BEFORE /events/:slug */}
                  <Route path="/events/create" element={<CreateEventPage />} />

                  {/* Events by category page (used by "Events by category in Jaipur") */}
                  <Route path="/events/category/:categorySlug" element={<EventCategoryPage />} />

                  {/* Scoped listing SSR route: /events/:category/:locality */}
                  <Route path="/events/:category/:locality" element={<EventsLocalityPage />} />

                  {/* Event detail (keep LAST among /events/*) */}
                  <Route path="/events/:slug" element={<EventDetailPage />} />

                  {/* Venues (your broken example is /venues/strings-cocktail-lounge) */}
                  <Route path="/venues/:venueSlug" element={<VenuePage />} />

                  {/* 404 */}
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
