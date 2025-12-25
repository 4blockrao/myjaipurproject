import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Grid3X3, Home } from 'lucide-react';
import { Category } from '@/hooks/useCategories';

interface CategoryInternalLinksProps {
  category: Category;
  breadcrumbs: Category[];
  siblingCategories: Category[];
  relatedCategories: Category[];
  localitySlug?: string;
  localityName?: string;
}

export const CategoryInternalLinks: React.FC<CategoryInternalLinksProps> = ({
  category,
  breadcrumbs,
  siblingCategories,
  relatedCategories,
  localitySlug,
  localityName,
}) => {
  // Common localities for cross-linking
  const nearbyLocalities = [
    { name: 'Malviya Nagar', slug: 'malviya-nagar' },
    { name: 'Vaishali Nagar', slug: 'vaishali-nagar' },
    { name: 'C-Scheme', slug: 'c-scheme' },
    { name: 'Mansarovar', slug: 'mansarovar' },
    { name: 'Tonk Road', slug: 'tonk-road' },
    { name: 'Raja Park', slug: 'raja-park' },
    { name: 'Jagatpura', slug: 'jagatpura' },
    { name: 'Sodala', slug: 'sodala' },
  ].filter(loc => loc.slug !== localitySlug);
  
  // Get pillar root from breadcrumbs
  const pillarRoot = breadcrumbs.length > 0 ? breadcrumbs[0] : category;
  
  return (
    <footer className="mt-12 border-t border-border pt-8 space-y-8">
      {/* Breadcrumb Trail Links */}
      <section>
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Navigation
        </h4>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link to="/" className="text-primary hover:underline flex items-center gap-1">
            <Home className="h-3 w-3" />
            Home
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link to="/categories" className="text-primary hover:underline">
            Categories
          </Link>
          {breadcrumbs.map((cat, index) => (
            <React.Fragment key={cat.id}>
              <span className="text-muted-foreground">/</span>
              <Link 
                to={`/categories/${cat.slug}`} 
                className={`${cat.slug === category.slug ? 'text-foreground' : 'text-primary hover:underline'}`}
              >
                {cat.name}
              </Link>
            </React.Fragment>
          ))}
          {localityName && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground">{localityName}</span>
            </>
          )}
        </div>
      </section>
      
      {/* Pillar Link */}
      {pillarRoot.slug !== category.slug && (
        <section>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Main Category
          </h4>
          <Link 
            to={`/categories/${pillarRoot.slug}`}
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <Grid3X3 className="h-4 w-4" />
            View all {pillarRoot.name}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}
      
      {/* Sibling Categories */}
      {siblingCategories.length > 0 && (
        <section>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Related in {pillarRoot.name}
          </h4>
          <div className="flex flex-wrap gap-2">
            {siblingCategories.slice(0, 4).map((cat) => (
              <Link key={cat.id} to={`/categories/${cat.slug}`}>
                <Button variant="outline" size="sm" className="text-xs">
                  {cat.name}
                </Button>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* Related Pillar Pages */}
      {relatedCategories.length > 0 && (
        <section>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Explore More Categories
          </h4>
          <div className="flex flex-wrap gap-2">
            {relatedCategories.slice(0, 4).map((cat) => (
              <Link key={cat.id} to={`/categories/${cat.slug}`}>
                <Button variant="secondary" size="sm" className="text-xs">
                  {cat.name}
                </Button>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* Locality Cross-Links */}
      {localitySlug ? (
        <section>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {category.name} in Other Areas
          </h4>
          <div className="flex flex-wrap gap-2">
            {nearbyLocalities.slice(0, 6).map((locality) => (
              <Link 
                key={locality.slug} 
                to={`/jaipur/${locality.slug}/${category.slug}`}
              >
                <Button variant="ghost" size="sm" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {locality.name}
                </Button>
              </Link>
            ))}
          </div>
          <Link 
            to={`/categories/${category.slug}`}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3"
          >
            View all {category.name} in Jaipur
            <ArrowRight className="h-3 w-3" />
          </Link>
        </section>
      ) : (
        <section>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {category.name} by Locality
          </h4>
          <div className="flex flex-wrap gap-2">
            {nearbyLocalities.slice(0, 8).map((locality) => (
              <Link 
                key={locality.slug} 
                to={`/jaipur/${locality.slug}/${category.slug}`}
              >
                <Button variant="ghost" size="sm" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {locality.name}
                </Button>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* Back to Locality */}
      {localitySlug && localityName && (
        <section>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Explore {localityName}
          </h4>
          <div className="flex flex-wrap gap-2">
            <Link to={`/jaipur/${localitySlug}`}>
              <Button variant="outline" size="sm" className="text-xs">
                All about {localityName}
              </Button>
            </Link>
            <Link to="/jaipur/all">
              <Button variant="outline" size="sm" className="text-xs">
                All Jaipur Localities
              </Button>
            </Link>
          </div>
        </section>
      )}
      
      {/* Core Site Links */}
      <section className="pt-4 border-t border-border/50">
        <div className="flex flex-wrap gap-4 text-sm">
          <Link to="/deals" className="text-muted-foreground hover:text-primary">
            Deals
          </Link>
          <Link to="/events" className="text-muted-foreground hover:text-primary">
            Events
          </Link>
          <Link to="/news" className="text-muted-foreground hover:text-primary">
            News
          </Link>
          <Link to="/merchants" className="text-muted-foreground hover:text-primary">
            Businesses
          </Link>
          <Link to="/jaipur" className="text-muted-foreground hover:text-primary">
            Explore Jaipur
          </Link>
          <Link to="/categories" className="text-muted-foreground hover:text-primary">
            All Categories
          </Link>
        </div>
      </section>
      
      {/* Context Note */}
      <p className="text-xs text-muted-foreground">
        {category.name} is part of the {pillarRoot.name} category on JaipurCircle. 
        We connect you with verified local businesses, exclusive deals, and community insights 
        across all of Jaipur's neighborhoods.
      </p>
    </footer>
  );
};
