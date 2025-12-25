import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Map, MapPin, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const ZONES = [
  { name: 'North', slug: 'north' },
  { name: 'South', slug: 'south' },
  { name: 'East', slug: 'east' },
  { name: 'West', slug: 'west' },
  { name: 'Central', slug: 'central' },
  { name: 'North West', slug: 'north-west' },
  { name: 'North East', slug: 'north-east' },
  { name: 'South West', slug: 'south-west' },
  { name: 'South East', slug: 'south-east' },
];

export default function ZonesIndexPage() {
  const { data: localityCounts, isLoading } = useQuery({
    queryKey: ['zone-locality-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('localities')
        .select('zone');
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(l => {
        const zone = l.zone?.toLowerCase() || 'other';
        counts[zone] = (counts[zone] || 0) + 1;
      });
      return counts;
    },
  });

  return (
    <AppLayout>
      <Helmet>
        <title>Jaipur Zones – All Administrative Zones & Localities (2025)</title>
        <meta name="description" content="Explore all Jaipur zones including North, South, East, West, Central zones. Find localities, wards, pin codes and local information for each zone." />
        <link rel="canonical" href="https://www.jaipurcircle.com/jaipur/zones" />
      </Helmet>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/jaipur" className="hover:text-primary">Jaipur</Link>
          <span>/</span>
          <span className="text-foreground">Zones</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
            <Map className="h-8 w-8 text-primary" />
            Jaipur Zones
          </h1>
          <p className="text-muted-foreground mt-2">
            Explore all administrative zones in Jaipur, Rajasthan
          </p>
        </header>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ZONES.map(zone => {
              const count = localityCounts?.[zone.name.toLowerCase()] || 0;
              return (
                <Link
                  key={zone.slug}
                  to={`/jaipur/zones/${zone.slug}`}
                  className="group p-6 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {zone.name} Zone
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {count} {count === 1 ? 'locality' : 'localities'}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <section className="mt-12 p-6 bg-muted/30 rounded-xl">
          <h2 className="font-semibold text-foreground mb-3">About Jaipur Zones</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Jaipur is divided into multiple administrative zones for civic governance and urban planning. 
            Each zone comprises several localities and wards under the Jaipur Municipal Corporation. 
            Browse individual zone pages for detailed locality information, ward details, and local services.
          </p>
        </section>
      </main>
    </AppLayout>
  );
}
