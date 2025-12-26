import React, { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import NativeMobileHeader from "@/components/layout/NativeMobileHeader";
import Footer from "@/components/layout/Footer";
import { GlobalSEO } from "@/components/seo/GlobalSEO";
import { socialMediaLinks } from "@/components/ui/SocialLinks";

const SITE_URL = 'https://jaipurcircle.com';

// Global organization schema for all pages with proper social links
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "JaipurCircle",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: "Jaipur's locality-first discovery platform for neighbourhoods, news, events, deals, and everything happening in the Pink City.",
  foundingDate: "2024",
  areaServed: {
    "@type": "City",
    name: "Jaipur",
    containedInPlace: {
      "@type": "State",
      name: "Rajasthan",
      containedInPlace: {
        "@type": "Country",
        name: "India"
      }
    }
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Jaipur",
    addressRegion: "Rajasthan",
    addressCountry: "IN",
    postalCode: "302001"
  },
  // Official social media profiles for entity strengthening
  sameAs: socialMediaLinks.map(s => s.url),
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "hello@jaipurcircle.com",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi"]
  }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "JaipurCircle",
  url: SITE_URL,
  description: "Discover Jaipur's neighbourhoods, local news, events, deals, and community updates on JaipurCircle.",
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

interface AppLayoutProps {
  children: ReactNode;
  // Header props
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showBackButton?: boolean;
  backPath?: string;
  showLogo?: boolean;
  headerRightAction?: ReactNode;
  // Navigation props
  showBottomNav?: boolean;
  showFooter?: boolean;
  hideNavigation?: boolean;
  // SEO props
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  noIndex?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  // Header defaults
  title = "JaipurCircle",
  subtitle,
  showHeader = true,
  showBackButton = true,
  backPath = "/",
  showLogo = false,
  headerRightAction,
  // Navigation defaults
  showBottomNav = true,
  showFooter = true,
  hideNavigation = false,
  // SEO props
  seoTitle,
  seoDescription,
  canonical,
  noIndex = false,
}) => {
return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Global Organization & Website Schema */}
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      </Helmet>
      
      {/* Global SEO fallback - pages can override with their own Helmet */}
      {(seoTitle || seoDescription) && (
        <GlobalSEO
          title={seoTitle}
          description={seoDescription}
          canonical={canonical}
          noIndex={noIndex}
        />
      )}
      
      <Toaster />
      <Sonner />
      
      {/* Consistent Header */}
      {showHeader && !hideNavigation && (
        <NativeMobileHeader
          title={title}
          subtitle={subtitle}
          showBackButton={showBackButton}
          showLogo={showLogo}
          backPath={backPath}
          rightAction={headerRightAction}
        />
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer for SEO and navigation */}
      {showFooter && !hideNavigation && (
        <Footer />
      )}
      
      {/* Bottom Navigation */}
      {showBottomNav && !hideNavigation && (
        <>
          <div className="h-20" />
          <NativeBottomNav />
        </>
      )}
    </div>
  );
};

export default AppLayout;