import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EventInternalLinksProps {
  event: {
    category: string;
    locality?: string | null;
    city?: string | null;
    tags?: string[] | null;
    organizer_name?: string | null;
  };
}

/**
 * Internal Linking Component for Events
 * Links to: City event pages, Category pages, Tag/Topic pages
 * Improves SEO crawlability and page authority
 */
export const EventInternalLinks = ({ event }: EventInternalLinksProps) => {
  const links = [
    // Category link
    {
      label: `More ${event.category} Events`,
      href: `/events?category=${encodeURIComponent(event.category)}`,
      type: 'category',
    },
    // Locality link
    ...(event.locality ? [{
      label: `Events in ${event.locality}`,
      href: `/events?locality=${encodeURIComponent(event.locality)}`,
      type: 'locality',
    }] : []),
    // City link
    {
      label: `All Jaipur Events`,
      href: `/events`,
      type: 'city',
    },
  ];

  return (
    <section className="space-y-4" aria-label="Related Events">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        Explore More
      </h3>
      
      {/* Main navigation links */}
      <div className="space-y-2">
        {links.map((link) => (
          <Link 
            key={link.href}
            to={link.href}
            className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors group"
          >
            <span className="font-medium text-sm">{link.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>

      {/* Tag links */}
      {event.tags && event.tags.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs text-muted-foreground mb-2">Related Topics</h4>
          <div className="flex flex-wrap gap-2">
            {event.tags.slice(0, 6).map((tag) => (
              <Link 
                key={tag} 
                to={`/events?search=${encodeURIComponent(tag)}`}
              >
                <Badge 
                  variant="secondary" 
                  className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                >
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Breadcrumb links for SEO */}
      <nav aria-label="Breadcrumb" className="pt-4 border-t border-border/50">
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
              to={`/events?category=${encodeURIComponent(event.category)}`} 
              className="hover:text-primary capitalize"
            >
              {event.category}
            </Link>
          </li>
          {event.locality && (
            <>
              <li className="mx-1">/</li>
              <li>
                <Link 
                  to={`/events?locality=${encodeURIComponent(event.locality)}`}
                  className="hover:text-primary"
                >
                  {event.locality}
                </Link>
              </li>
            </>
          )}
        </ol>
      </nav>
    </section>
  );
};

export default EventInternalLinks;
