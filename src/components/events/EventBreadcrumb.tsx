import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface EventBreadcrumbProps {
  event: {
    title: string;
    slug: string;
    category: string;
    locality?: string | null;
    city?: string | null;
  };
}

/**
 * Visual Breadcrumb Navigation for Events
 * Improves crawl depth, semantic hierarchy, and discoverability
 * Includes BreadcrumbList schema
 */
export const EventBreadcrumb = ({ event }: EventBreadcrumbProps) => {
  const locality = event.locality;
  const categorySlug = event.category.toLowerCase().replace(/\s+/g, '-');

  const breadcrumbs = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Events', href: '/events' },
    { name: event.category, href: `/events/category/${categorySlug}` },
    ...(locality ? [{ name: locality, href: `/events/in/${locality.toLowerCase().replace(/\s+/g, '-')}` }] : []),
    { name: event.title, href: `/events/${event.slug}`, isCurrent: true },
  ];

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `https://www.jaipurcircle.com${crumb.href}`,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-3.5 h-3.5 mx-1 text-muted-foreground" aria-hidden="true" />
            )}
            {crumb.isCurrent ? (
              <span className="text-foreground font-medium line-clamp-1 max-w-[200px]" aria-current="page">
                {crumb.name}
              </span>
            ) : (
              <Link 
                to={crumb.href}
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                {crumb.icon && <crumb.icon className="w-3.5 h-3.5" aria-hidden="true" />}
                {!crumb.icon && crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>

      {/* Inject Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </nav>
  );
};

export default EventBreadcrumb;
