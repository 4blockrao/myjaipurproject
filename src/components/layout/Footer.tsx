import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram } from 'lucide-react';

/**
 * Global Footer Component
 * Includes NAP (Name, Address, Phone) for Local SEO
 * Internal links for site navigation and SEO
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'News', href: '/news' },
    { label: 'Events', href: '/events' },
    { label: 'Deals', href: '/deals' },
    { label: 'Categories', href: '/categories' },
  ];

  const companyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'For Businesses', href: '/merchant-onboarding' },
    { label: 'Help & Support', href: '/help' },
  ];

  const categoryLinks = [
    { label: 'Food & Dining', href: '/categories?cat=Food%20%26%20Dining' },
    { label: 'Shopping', href: '/categories?cat=Shopping' },
    { label: 'Beauty & Wellness', href: '/categories?cat=Beauty%20%26%20Wellness' },
    { label: 'Services', href: '/categories?cat=Services' },
  ];

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & NAP Block */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <h2 className="text-xl font-bold text-primary">JaipurCircle</h2>
            </Link>
            <p className="text-sm text-muted-foreground">
              Jaipur's local discovery platform for news, events, deals, jobs, and everything happening in the Pink City.
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

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Categories</h3>
            <ul className="space-y-2">
              {categoryLinks.map((link) => (
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
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
