// (imports unchanged)

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

                  <Route
                    path="/jaipur/:localitySlug/merchants/:merchantSlug"
                    element={<MerchantDetailPage />}
                  />

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

                  {/* ---------------- STORIES (SSR SAFE ROUTES) ---------------- */}
                  <Route path="/stories" element={<div />} />
                  <Route path="/stories/:slug" element={<div />} />

                  {/* Catch-all */}
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
