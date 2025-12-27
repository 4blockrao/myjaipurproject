import { Link } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, MapPin, Tag, Sparkles, Calendar, TrendingUp, Repeat, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from "@/components/ui/card";
import { detectEventSeries } from "@/lib/eventDuplicateResolver";

interface EventInternalLinksProps {
  event: {
    id?: string;
    title?: string;
    slug?: string;
    category: string;
    locality?: string | null;
    city?: string | null;
    tags?: string[] | null;
    organizer_name?: string | null;
    venue_name?: string | null;
    start_date?: string;
  };
}

/**
 * Enhanced Internal Linking Component for Events
 * Implements contextual cross-linking for SEO authority stacking
 */
export const EventInternalLinks = ({ event }: EventInternalLinksProps) => {
  const { category, locality, venue_name, title, id } = event;
  const categorySlug = category?.toLowerCase().replace(/\s+/g, '-') || 'general';
  const localitySlug = locality?.toLowerCase().replace(/\s+/g, '-');
  
  // Detect if this is a series event
  const seriesInfo = title ? detectEventSeries(title) : { isSeriesEvent: false, seriesName: null, edition: null };

  // Fetch related events count for locality
  const { data: localityEventCount } = useQuery({
    queryKey: ['locality-event-count', locality],
    queryFn: async () => {
      if (!locality) return 0;
      const { count } = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .ilike('locality', locality)
        .gte('start_date', new Date().toISOString())
        .eq('status', 'published');
      return count || 0;
    },
    enabled: !!locality,
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  });

  // Fetch category event count
  const { data: categoryEventCount } = useQuery({
    queryKey: ['category-event-count', category],
    queryFn: async () => {
      const { count } = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('category', category)
        .gte('start_date', new Date().toISOString())
        .eq('status', 'published');
      return count || 0;
    },
    enabled: !!category,
    staleTime: 1000 * 60 * 15,
  });

  // Fetch series events if applicable
  const { data: seriesEvents } = useQuery({
    queryKey: ['series-events', seriesInfo.seriesName],
    queryFn: async () => {
      if (!seriesInfo.seriesName) return [];
      const { data } = await supabase
        .from('events')
        .select('id, title, slug, start_date')
        .ilike('title', `%${seriesInfo.seriesName}%`)
        .neq('id', id || '')
        .order('start_date', { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: seriesInfo.isSeriesEvent && !!seriesInfo.seriesName && !!id,
    staleTime: 1000 * 60 * 15,
  });

  const links = [];

  // 1. Series Link (highest priority if applicable)
  if (seriesInfo.isSeriesEvent && seriesEvents && seriesEvents.length > 0) {
    const seriesSlug = seriesInfo.seriesName?.toLowerCase().replace(/\s+/g, '-') || '';
    links.push({
      type: 'series',
      icon: Repeat,
      label: `All editions of ${seriesInfo.seriesName}`,
      href: `/events/series/${seriesSlug}`,
      count: seriesEvents.length + 1,
      priority: 0,
    });
  }

  // 2. Locality Event Hub Link
  if (locality && localitySlug) {
    links.push({
      type: 'locality',
      icon: MapPin,
      label: `Events in ${locality}`,
      href: `/events/in/${localitySlug}`,
      count: localityEventCount,
      priority: 1,
    });
  }

  // 3. Category Hub Link
  if (category) {
    links.push({
      type: 'category',
      icon: Tag,
      label: `All ${category} events`,
      href: `/events/category/${categorySlug}`,
      count: categoryEventCount,
      priority: 2,
    });
  }

  // 4. Category × Locality Fusion Link
  if (category && localitySlug) {
    links.push({
      type: 'fusion',
      icon: Sparkles,
      label: `${category} in ${locality}`,
      href: `/events/${categorySlug}/${localitySlug}`,
      priority: 3,
    });
  }

  // 5. Venue Link
  if (venue_name) {
    links.push({
      type: 'venue',
      icon: Building2,
      label: `More at ${venue_name}`,
      href: `/venues/${venue_name.toLowerCase().replace(/\s+/g, '-')}`,
      priority: 4,
    });
  }

  // 6. Time-based Links
  links.push({
    type: 'time',
    icon: Calendar,
    label: 'Events this weekend',
    href: '/events/this-weekend',
    priority: 5,
  });

  links.push({
    type: 'trending',
    icon: TrendingUp,
    label: 'All Jaipur events',
    href: '/events',
    priority: 6,
  });

  // Sort by priority
  links.sort((a, b) => a.priority - b.priority);

  return (
    <Card className="bg-muted/30 border-primary/10">
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Discover More Events
        </h3>
        
        {/* Main navigation links */}
        <div className="space-y-2">
          {links.slice(0, 5).map((link, index) => {
            const Icon = link.icon;
            return (
              <Link 
                key={`${link.type}-${index}`}
                to={link.href}
                className="flex items-center justify-between p-2.5 bg-background/50 hover:bg-background/80 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm">{link.label}</span>
                  {link.count !== undefined && link.count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {link.count}
                    </Badge>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            );
          })}
        </div>

        {/* Series Events Quick Links */}
        {seriesInfo.isSeriesEvent && seriesEvents && seriesEvents.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Repeat className="w-3 h-3" />
              Other Editions
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {seriesEvents.slice(0, 3).map(evt => (
                <Link key={evt.id} to={`/events/${evt.slug}`}>
                  <Badge variant="outline" className="text-xs hover:bg-secondary/80">
                    {new Date(evt.start_date).getFullYear()}
                  </Badge>
                </Link>
              ))}
              {seriesEvents.length > 3 && (
                <Link to={`/events/series/${seriesInfo.seriesName?.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Badge variant="secondary" className="text-xs">
                    +{seriesEvents.length - 3} more
                  </Badge>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Tag links */}
        {event.tags && event.tags.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-xs text-muted-foreground mb-2">Related Topics</h4>
            <div className="flex flex-wrap gap-1.5">
              {event.tags.slice(0, 6).map((tag) => (
                <Link 
                  key={tag} 
                  to={`/events?search=${encodeURIComponent(tag)}`}
                >
                  <Badge 
                    variant="secondary" 
                    className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Breadcrumb links for SEO */}
        <nav aria-label="Breadcrumb" className="mt-4 pt-4 border-t">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-primary">Home</Link>
            </li>
            <li className="mx-1">/</li>
            <li>
              <Link to="/events" className="hover:text-primary">Events</Link>
            </li>
            <li className="mx-1">/</li>
            <li>
              <Link 
                to={`/events/category/${categorySlug}`} 
                className="hover:text-primary capitalize"
              >
                {category}
              </Link>
            </li>
            {locality && (
              <>
                <li className="mx-1">/</li>
                <li>
                  <Link 
                    to={`/events/in/${localitySlug}`}
                    className="hover:text-primary"
                  >
                    {locality}
                  </Link>
                </li>
              </>
            )}
          </ol>
        </nav>
      </CardContent>
    </Card>
  );
};

export default EventInternalLinks;
