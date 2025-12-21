import { useParams } from 'react-router-dom';
import { useLocality } from '@/hooks/useLocality';
import AppLayout from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';

// SEO & Schema
import { LocalitySEO } from '@/components/locality/LocalitySEO';

// Locality Sections
import { LocalityBreadcrumb } from '@/components/locality/LocalityBreadcrumb';
import { LocalityAISummary } from '@/components/locality/LocalityAISummary';
import { LocalitySnapshot } from '@/components/locality/LocalitySnapshot';
import { LocalityAbout } from '@/components/locality/LocalityAbout';
import { LocalityMicroLocalities } from '@/components/locality/LocalityMicroLocalities';
import { LocalityNearby } from '@/components/locality/LocalityNearby';
import { LocalityLandmarks } from '@/components/locality/LocalityLandmarks';
import { LocalityConnectivity } from '@/components/locality/LocalityConnectivity';
import { LocalityNews } from '@/components/locality/LocalityNews';
import { LocalityEvents } from '@/components/locality/LocalityEvents';
import { LocalityDeals } from '@/components/locality/LocalityDeals';
import { LocalityMerchants } from '@/components/locality/LocalityMerchants';
import { LocalityFAQ } from '@/components/locality/LocalityFAQ';
import { Link } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LocalityPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: locality, isLoading, error } = useLocality(slug || '');

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-32 w-full mb-8 rounded-xl" />
          <Skeleton className="h-48 w-full mb-8" />
          <Skeleton className="h-24 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (error || !locality) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 max-w-5xl text-center">
          <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Locality Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The locality "{slug}" could not be found. It may not be added yet.
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <LocalitySEO locality={locality} />
      
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Breadcrumb */}
        <LocalityBreadcrumb locality={locality} />
        
        {/* Page Title */}
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {locality.name}, Jaipur
          </h1>
          <p className="text-muted-foreground mt-2">
            {locality.zone && `${locality.zone} Zone`}
            {locality.zone && locality.municipality && ' • '}
            {locality.municipality}
            {(locality.zone || locality.municipality) && locality.pin_codes?.length && ' • '}
            {locality.pin_codes?.length && `PIN: ${locality.pin_codes[0]}`}
          </p>
        </header>

        {/* AI Summary */}
        <LocalityAISummary locality={locality} />

        {/* Snapshot Table */}
        <LocalitySnapshot locality={locality} />

        {/* About */}
        <LocalityAbout locality={locality} />

        {/* Micro Localities */}
        <LocalityMicroLocalities locality={locality} />

        {/* Nearby Localities */}
        <LocalityNearby locality={locality} />

        {/* Major Landmarks */}
        <LocalityLandmarks locality={locality} />

        {/* Connectivity */}
        <LocalityConnectivity locality={locality} />

        {/* Local News */}
        <LocalityNews localityName={locality.name} />

        {/* Upcoming Events */}
        <LocalityEvents localityName={locality.name} />

        {/* Deals & Offers */}
        <LocalityDeals localityName={locality.name} />

        {/* Restaurants & Services */}
        <LocalityMerchants localityName={locality.name} />

        {/* FAQ */}
        <LocalityFAQ locality={locality} />

        {/* Internal Links Footer */}
        <footer className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Explore More on JaipurCircle
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link 
              to="/jaipur" 
              className="text-sm text-primary hover:underline"
            >
              All Jaipur Localities
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              to="/deals" 
              className="text-sm text-primary hover:underline"
            >
              Deals in Jaipur
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              to="/events" 
              className="text-sm text-primary hover:underline"
            >
              Events in Jaipur
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              to="/news" 
              className="text-sm text-primary hover:underline"
            >
              Jaipur News
            </Link>
          </div>
        </footer>
      </main>
    </AppLayout>
  );
}
