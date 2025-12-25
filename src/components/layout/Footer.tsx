import { Link } from 'react-router-dom';
import { MapPin, Mail, Facebook, Twitter, Instagram, Building, Home, Grid3X3 } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Global Footer Component
 * Includes NAP (Name, Address, Phone) for Local SEO
 * Internal links for site navigation and SEO
 * About JaipurCircle section for trust and EEAT signals
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

  const quickLinks = [
    { label: 'News', href: '/news' },
    { label: 'Events', href: '/events' },
    { label: 'Deals', href: '/deals' },
    { label: 'All Categories', href: '/categories' },
  ];

  const companyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'For Businesses', href: '/merchant-onboarding' },
    { label: 'Help & Support', href: '/help' },
  ];

  const localityLinks = [
    { label: 'All Localities', href: '/jaipur' },
    { label: 'Jaipur Zones', href: '/jaipur/zones' },
    { label: 'North Zone', href: '/jaipur/zones/north' },
    { label: 'South Zone', href: '/jaipur/zones/south' },
    { label: 'Central Zone', href: '/jaipur/zones/central' },
  ];

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* About JaipurCircle Section */}
        <div className="mb-10 p-6 bg-muted/30 rounded-xl border">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            About JaipurCircle
          </h2>
          
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              JaipurCircle is a locality-first urban information platform for Jaipur that helps users discover, understand, and explore neighbourhoods, zones, sectors, colonies, and micro-localities across the city. Each locality page on JaipurCircle is designed as a structured locality guide that provides neighbourhood-level civic information such as ward and zone references, nearby areas, locality boundaries, demographic context, housing characteristics, urban connectivity, micro-pockets, and surrounding residential and commercial belts.
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
              className="text-primary hover:underline text-sm font-medium"
            >
              {showFullAbout ? 'Show Less' : 'Read More About JaipurCircle'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & NAP Block */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <h2 className="text-xl font-bold text-primary">JaipurCircle</h2>
            </Link>
            <p className="text-sm text-muted-foreground">
              Jaipur's locality-first discovery platform for neighbourhoods, news, events, deals, and everything happening in the Pink City.
            </p>
            
            {/* NAP Block for Local SEO */}
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

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <a 
                href="https://facebook.com/jaipurcircle" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-muted rounded-full hover:bg-primary/10 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4 text-muted-foreground" />
              </a>
              <a 
                href="https://twitter.com/jaipurcircle" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-muted rounded-full hover:bg-primary/10 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 text-muted-foreground" />
              </a>
              <a 
                href="https://instagram.com/jaipurcircle" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-muted rounded-full hover:bg-primary/10 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
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
          </div>

          {/* Localities */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-1">
              <Home className="h-4 w-4" />
              Localities
            </h3>
            <ul className="space-y-2">
              {localityLinks.map((link) => (
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
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-1">
              <Grid3X3 className="h-4 w-4" />
              Categories
            </h3>
            <ul className="space-y-2">
              {pillarCategories.slice(0, 10).map((cat) => (
                <li key={cat.slug}>
                  <Link 
                    to={`/categories/${cat.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              {pillarCategories.length > 10 && (
                <li>
                  <Link 
                    to="/categories"
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    View All Categories →
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
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
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} JaipurCircle. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="/sitemap" className="hover:text-primary transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
