import { Suspense, type ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { GlobalSEO } from '@/components/seo/GlobalSEO';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: (failureCount, error: unknown) => {
        const err = error as { status?: number };
        if (err?.status === 404 || err?.status === 403) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      <Skeleton className="h-12 w-48" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

interface RootLayoutProps {
  children?: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <LanguageProvider>
              <Toaster />
              <Sonner />
              <AnalyticsProvider>
                <GlobalSEO />
                <Suspense fallback={<PageLoader />}>
                  {children || <Outlet />}
                </Suspense>
              </AnalyticsProvider>
            </LanguageProvider>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
