import { Link } from 'react-router-dom';
import { MapPin, Mail, Building, Home, Grid3X3, Tag, Calendar, Car, ChevronRight, Newspaper, Phone } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FooterSocialSection } from '@/components/ui/SocialLinks';

/**
 * Global Footer Component
 * Enhanced for SEO with:
 * - NAP (Name, Address, Phone) for Local SEO
 * - Comprehensive internal linking structure
 * - Category & locality quick links
 * - About JaipurCircle section for trust and EEAT signals
 * - Social media section for authority
 * - Proper semantic HTML structure
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showFullAbout, setShowFullAbout] = useState(false);

  // Fetch pillar categories from database
  const { data: pillarCategories = [] } = useQuery({
    queryKey: ['footer-pillars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('name, slug, pillar_group')
        .is('parent_slug', null)
        .eq('is_active', true)
        .order('pillar_group')
        .order('name');
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Fetch popular localities for footer links
  const { data: popularLocalities = [] } = useQuery({
    queryKey: ['footer-localities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('localities')
        .select('name, slug')
        .order('name')
        .limit(8);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 30,
  });

  const exploreLinks = [
    { label: 'Deals & Offers', href: '/deals', icon: Tag },
    { label: 'Events & Tickets', href: '/events', icon: Calendar },
    { label: 'Properties', href: '/properties', icon: Home },
    { label: 'Cars & Vehicles', href: '/cars', icon: Car },
    { label: 'Local News', href: '/news', icon: Newspaper },
  ];

  const eventQuickLinks = [
    { label: 'Events Today', href: '/events/today' },
    { label: 'This Weekend', href: '/events/this-weekend' },
    { label: 'Free Events', href: '/events/free' },
    { label: 'Concerts', href: '/events?category=concerts' },
    { label: 'Comedy Shows', href: '/events?category=comedy' },
  ];

  const propertyQuickLinks = [
    { label: 'Apartments for Sale', href: '/properties?type=sale&property_type=apartment' },
    { label: 'Houses for Rent', href: '/properties?type=rent&property_type=house' },
    { label: 'Flats in Malviya Nagar', href: '/properties/in/malviya-nagar' },
    { label: 'Properties in Vaishali', href: '/properties/in/vaishali-nagar' },
    { label: 'Properties in Mansarovar', href: '/properties/in/mansarovar' },
  ];

  const carsQuickLinks = [
    { label: 'New Cars', href: '/cars' },
    { label: 'Electric Vehicles', href: '/ev-cars' },
    { label: 'Car Dealers', href: '/cars/dealers' },
    { label: 'Maruti Cars', href: '/cars/maruti' },
    { label: 'Tata Cars', href: '/cars/tata' },
  ];

  const companyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'For Businesses', href: '/merchant-onboarding' },
    { label: 'Help & Support', href: '/help' },
    { label: 'All Categories', href: '/categories' },
  ];

  const zoneLinks = [
    { label: 'North Jaipur', href: '/jaipur/zones/north' },
    { label: 'South Jaipur', href: '/jaipur/zones/south' },
    { label: 'Central Jaipur', href: '/jaipur/zones/central' },
    { label: 'East Jaipur', href: '/jaipur/zones/east' },
    { label: 'West Jaipur', href: '/jaipur/zones/west' },
  ];

  return (
    <footer className="bg-card border-t mt-auto" role="contentinfo">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* About JaipurCircle Section - Important for EEAT */}
        <div className="mb-10 p-6 bg-muted/30 rounded-xl border">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            About JaipurCircle
          </h2>
          
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              JaipurCircle is Jaipur's hyper-local discovery platform for deals, events, property, automobiles, and local businesses. We help residents find the best offers in their neighborhood, discover upcoming events, explore property listings, and browse cars for sale — all tailored to their locality.
            </p>
            
            {showFullAbout && (
              <>
                <p>
                  The platform focuses on locality-scale discovery themes that people commonly search for when learning about a neighbourhood — such as schools and education access, hospitals and healthcare access, rental & PG presence, housing environments, daily markets and shopping areas, transport connectivity corridors, and nearby employment & activity zones. These sections are presented as informational locality indicators only and are not ratings, rankings, reviews, or business recommendations.
                </p>
                
                <p>
                  Locality information on JaipurCircle is compiled through structured mapping, municipal references, ward-level identifiers, pin code associations, nearby-locality relationships, civic boundary datasets, and neighbourhood-scale research. Areas, sectors, streets, and micro-neighbourhood names may continue to expand as locality records are refined and verified over time.
                </p>
                
                <p>
                  JaipurCircle aims to build a city-wide locality knowledge base for Jaipur — improving accessibility to neighbourhood information for residents, families exploring areas to live in, tenants searching for rental-friendly belts, students and working professionals evaluating nearby localities, and people trying to understand how different parts of the city are connected.
                </p>
              </>
            )}
            
            <button
              onClick={() => setShowFullAbout(!showFullAbout)}
              className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1"
            >
              {showFullAbout ? 'Show Less' : 'Read More About JaipurCircle'}
              <ChevronRight className={`h-4 w-4 transition-transform ${showFullAbout ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>

        {/* Main Footer Grid - SEO-optimized internal linking */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand & NAP Block - Critical for Local SEO */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <h2 className="text-xl font-bold text-primary">JaipurCircle</h2>
            </Link>
            <p className="text-sm text-muted-foreground">
              Jaipur's hyper-local platform for deals, events, property, automobiles, and everything happening in the Pink City.
            </p>
            
            {/* NAP Block for Local SEO - Critical for Google Business */}
            <address className="not-italic text-sm text-muted-foreground space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>Jaipur, Rajasthan, India 302001</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a 
                  href="mailto:hello@jaipurcircle.com" 
                  className="hover:text-primary transition-colors"
                >
                  hello@jaipurcircle.com
                </a>
              </div>
            </address>
          </div>

          {/* Explore Links */}
          <nav aria-label="Explore">
            <h3 className="font-semibold text-foreground mb-4">Explore</h3>
            <ul className="space-y-2">
              {exploreLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <li key={link.href}>
                    <Link 
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Events Quick Links - High SEO Value */}
          <nav aria-label="Events">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Events
            </h3>
            <ul className="space-y-2">
              {eventQuickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Property Quick Links */}
          <nav aria-label="Properties">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-1">
              <Home className="h-4 w-4" />
              Property
            </h3>
            <ul className="space-y-2">
              {propertyQuickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Cars Quick Links */}
          <nav aria-label="Cars">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-1">
              <Car className="h-4 w-4" />
              Cars
            </h3>
            <ul className="space-y-2">
              {carsQuickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Secondary Links Row - Localities & Zones */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8 pt-8 border-t">
          {/* Localities */}
          <nav aria-label="Popular Localities">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Popular Areas
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/jaipur" className="text-sm text-primary font-medium hover:underline">
                  All Localities
                </Link>
              </li>
              {popularLocalities.slice(0, 5).map((loc) => (
                <li key={loc.slug}>
                  <Link 
                    to={`/jaipur/${loc.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {loc.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Jaipur Zones */}
          <nav aria-label="Jaipur Zones">
            <h3 className="font-semibold text-foreground mb-4">Jaipur Zones</h3>
            <ul className="space-y-2">
              {zoneLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Categories */}
          <nav aria-label="Categories">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-1">
              <Grid3X3 className="h-4 w-4" />
              Categories
            </h3>
            <ul className="space-y-2">
              {pillarCategories.slice(0, 5).map((cat) => (
                <li key={cat.slug}>
                  <Link 
                    to={`/categories/${cat.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              {pillarCategories.length > 5 && (
                <li>
                  <Link 
                    to="/categories"
                    className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
                  >
                    View All <ChevronRight className="h-3 w-3" />
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company">
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Social Media Section - Primary SEO Authority Zone */}
        <div className="mt-10 pt-8 border-t">
          <FooterSocialSection />
        </div>

        {/* Bottom Bar - Legal & Technical Links */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} JaipurCircle. All rights reserved. Made with ❤️ in Jaipur
          </p>
          <nav aria-label="Legal" className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="/sitemap" className="hover:text-primary transition-colors">
              Sitemap
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;