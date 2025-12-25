import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, ArrowLeft, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ZoneSEO } from '@/components/zone/ZoneSEO';
import { ZoneQuickInfo } from '@/components/zone/ZoneQuickInfo';
import { ZoneTOC } from '@/components/zone/ZoneTOC';
import { ZoneOverview } from '@/components/zone/ZoneOverview';
import { ZoneGovernance } from '@/components/zone/ZoneGovernance';
import { ZoneResidentialBelts } from '@/components/zone/ZoneResidentialBelts';
import { ZoneCommercialClusters } from '@/components/zone/ZoneCommercialClusters';
import { ZoneConnectivity } from '@/components/zone/ZoneConnectivity';
import { ZoneLocalities } from '@/components/zone/ZoneLocalities';
import { ZoneFAQ } from '@/components/zone/ZoneFAQ';
import { ZoneMiniMap } from '@/components/zone/ZoneMiniMap';
import { ZoneLongTailFooter } from '@/components/zone/ZoneLongTailFooter';
import { ZoneIntentFooter } from '@/components/zone/ZoneIntentFooter';

export default function ZonePage() {
  const { zoneSlug } = useParams<{ zoneSlug: string }>();
  
  const zoneName = zoneSlug
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || '';

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
          <Skeleton className="h-32 w-full mb-8 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (error || !localities?.length) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 max-w-5xl text-center">
          <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Zone Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The zone "{zoneName}" could not be found or has no localities.
          </p>
          <Button asChild>
            <Link to="/jaipur/zones">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse All Zones
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

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
      <ZoneSEO zone={zoneData} />
      
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/jaipur" className="hover:text-primary">Jaipur</Link>
          <span>/</span>
          <Link to="/jaipur/zones" className="hover:text-primary">Zones</Link>
          <span>/</span>
          <span className="text-foreground">{zoneName}</span>
        </nav>
        
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
            <Map className="h-8 w-8 text-primary" />
            {zoneName} Zone, Jaipur
          </h1>
          <p className="text-muted-foreground mt-2">
            {zoneData.totalLocalities} localities • {zoneData.uniqueWards.length} wards • Jaipur, Rajasthan
          </p>
        </header>

        <ZoneQuickInfo zone={zoneData} />
        <ZoneTOC zoneName={zoneName} />

        <section id="overview"><ZoneOverview zone={zoneData} /></section>
        <section id="governance"><ZoneGovernance zone={zoneData} /></section>
        <section id="residential"><ZoneResidentialBelts zone={zoneData} /></section>
        <section id="commercial"><ZoneCommercialClusters zone={zoneData} /></section>
        <section id="connectivity"><ZoneConnectivity zone={zoneData} /></section>
        <section id="localities"><ZoneLocalities zone={zoneData} /></section>
        <section id="faq"><ZoneFAQ zone={zoneData} /></section>
        
        <ZoneMiniMap zone={zoneData} />
        <ZoneLongTailFooter zone={zoneData} />
        <ZoneIntentFooter zone={zoneData} />
      </main>
    </AppLayout>
  );
}
