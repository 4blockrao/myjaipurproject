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

import JaipurPage from "./pages/JaipurPage";
import LocalitiesIndexPage from "./pages/LocalitiesIndexPage";
import ZonesIndexPage from "./pages/ZonesIndexPage";
import ZonePage from "./pages/ZonePage";
import LocalityPage from "./pages/LocalityPage";
import LocalityCategoryPage from "./pages/LocalityCategoryPage";

import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import CreateEventPage from "./pages/CreateEventPage";
import EventsFreeFilterPage from "./pages/EventsFreeFilterPage";
import EventsWorkshopsPage from "./pages/EventsWorkshopsPage";
import EventsLocalityPage from "./pages/EventsLocalityPage";
import EventsTodayPage from "./pages/EventsTodayPage";
import EventsThisWeekPage from "./pages/EventsThisWeekPage";
import EventsThisWeekendPage from "./pages/EventsThisWeekendPage";
import VenuePage from "./pages/VenuePage";
import OrganizerPage from "./pages/OrganizerPage";
import ArtistPage from "./pages/ArtistPage";
import PastEventPage from "./pages/PastEventPage";
import EventSeriesPage from "./pages/EventSeriesPage";

const queryClient = new QueryClient();

/**
 * ⚠️ CRITICAL ROUTING FILE
 * DO NOT REMOVE OR MODIFY ROUTES WITHOUT VERIFICATION.
 * Missing routes will cause production-wide 404 issues.
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

                  {/* Jaipur locality SEO */}
                  <Route path="/jaipur" element={<JaipurPage />} />
                  <Route path="/jaipur/all" element={<LocalitiesIndexPage />} />
                  <Route path="/jaipur/zones" element={<ZonesIndexPage />} />
                  <Route path="/jaipur/zones/:zoneSlug" element={<ZonePage />} />
                  <Route path="/jaipur/:slug/:category" element={<LocalityCategoryPage />} />
                  <Route path="/jaipur/:slug" element={<LocalityPage />} />

                  {/* Events (IMPORTANT: static routes first, then params) */}
                  <Route path="/events" element={<EventsPage />} />

                  {/* Filter pages used by EventsPage links */}
                  <Route path="/events/today" element={<EventsTodayPage />} />
                  <Route path="/events/this-week" element={<EventsThisWeekPage />} />
                  <Route path="/events/this-weekend" element={<EventsThisWeekendPage />} />
                  <Route path="/events/free" element={<EventsFreeFilterPage />} />
                  <Route path="/events/workshops" element={<EventsWorkshopsPage />} />
                  <Route path="/events/past" element={<PastEventPage />} />
                  <Route path="/events/create" element={<CreateEventPage />} />

                  {/* Listing page (category/locality) */}
                  <Route path="/events/:category/:locality" element={<EventsLocalityPage />} />

                  {/* Event detail must be last */}
                  <Route path="/events/:slug" element={<EventDetailPage />} />

                  {/* Venue / organizer / artist / series */}
                  <Route path="/venues/:venueSlug" element={<VenuePage />} />
                  <Route path="/organizers/:organizerSlug" element={<OrganizerPage />} />
                  <Route path="/artists/:artistSlug" element={<ArtistPage />} />
                  <Route path="/series/:seriesSlug" element={<EventSeriesPage />} />

                  {/* Fallback */}
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
