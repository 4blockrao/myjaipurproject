import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, ArrowLeft, Building2, Users, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ZoneSEO } from '@/components/zone/ZoneSEO';
import { ZoneOverview } from '@/components/zone/ZoneOverview';
import { ZoneGovernance } from '@/components/zone/ZoneGovernance';
import { ZoneResidentialBelts } from '@/components/zone/ZoneResidentialBelts';
import { ZoneCommercialClusters } from '@/components/zone/ZoneCommercialClusters';
import { ZoneConnectivity } from '@/components/zone/ZoneConnectivity';
import { ZoneLocalities } from '@/components/zone/ZoneLocalities';
import { ZoneFAQ } from '@/components/zone/ZoneFAQ';
import { ZoneLongTailFooter } from '@/components/zone/ZoneLongTailFooter';

export default function ZonePage() {
  const { zoneSlug } = useParams<{ zoneSlug: string }>();
  
  // Convert slug to zone name (e.g., "north-west" -> "North West")
  const zoneName = zoneSlug
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || '';

  // Fetch all localities in this zone
  const { data: localities, isLoading, error } = useQuery({
    queryKey: ['zone-localities', zoneName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('localities')
        .select('*')
        .ilike('zone', zoneName)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!zoneName,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-10 w-72 mb-2" />
          <Skeleton className="h-5 w-96 mb-8" />
          <Skeleton className="h-32 w-full mb-8 rounded-xl" />
          <Skeleton className="h-48 w-full mb-8" />
        </div>
      </AppLayout>
    );
  }

  if (error || !localities?.length) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 max-w-5xl text-center">
          <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Zone Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The zone "{zoneName}" could not be found or has no localities.
          </p>
          <Button asChild>
            <Link to="/jaipur">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse All Localities
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Aggregate zone data from localities
  const zoneData = {
    name: zoneName,
    slug: zoneSlug,
    localities: localities,
    totalLocalities: localities.length,
    totalPopulation: localities.reduce((sum, l) => sum + (l.population_estimate || 0), 0),
    uniqueWards: [...new Set(localities.map(l => l.ward_number).filter(Boolean))],
    uniqueMunicipalities: [...new Set(localities.map(l => l.municipality).filter(Boolean))],
    uniquePoliceStations: [...new Set(localities.map(l => l.police_station).filter(Boolean))],
    allPinCodes: [...new Set(localities.flatMap(l => l.pin_codes || []))],
    allTags: [...new Set(localities.flatMap(l => l.tags || []))],
  };

  return (
    <AppLayout>
      {/* SEO */}
      <ZoneSEO zone={zoneData} />
      
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/jaipur" className="hover:text-primary">Jaipur</Link>
          <span>/</span>
          <Link to="/jaipur/all" className="hover:text-primary">Localities</Link>
          <span>/</span>
          <span className="text-foreground">{zoneName} Zone</span>
        </nav>
        
        {/* Page Header */}
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
            <Map className="h-8 w-8 text-primary" />
            {zoneName} Zone, Jaipur
          </h1>
          <p className="text-muted-foreground mt-2">
            {zoneData.totalLocalities} localities • {zoneData.uniqueWards.length} wards • Jaipur, Rajasthan
          </p>
        </header>

        {/* Zone Overview */}
        <ZoneOverview zone={zoneData} />

        {/* Governance Summary */}
        <ZoneGovernance zone={zoneData} />

        {/* Residential Belts */}
        <ZoneResidentialBelts zone={zoneData} />

        {/* Commercial Clusters */}
        <ZoneCommercialClusters zone={zoneData} />

        {/* Connectivity */}
        <ZoneConnectivity zone={zoneData} />

        {/* All Localities in Zone */}
        <ZoneLocalities zone={zoneData} />

        {/* FAQ */}
        <ZoneFAQ zone={zoneData} />

        {/* Long Tail SEO Footer */}
        <ZoneLongTailFooter zone={zoneData} />

        {/* Internal Links */}
        <section className="mb-8 p-6 bg-muted/30 rounded-lg">
          <h3 className="font-semibold text-foreground mb-4">Explore More</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/jaipur"
              className="px-4 py-2 bg-background border border-border rounded-lg text-sm hover:border-primary transition-colors"
            >
              Jaipur Overview
            </Link>
            <Link
              to="/jaipur/all"
              className="px-4 py-2 bg-background border border-border rounded-lg text-sm hover:border-primary transition-colors"
            >
              All Localities
            </Link>
            <Link
              to="/news"
              className="px-4 py-2 bg-background border border-border rounded-lg text-sm hover:border-primary transition-colors"
            >
              Jaipur News
            </Link>
            <Link
              to="/events"
              className="px-4 py-2 bg-background border border-border rounded-lg text-sm hover:border-primary transition-colors"
            >
              Events
            </Link>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}
