import React, { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import NativeMobileHeader from "@/components/layout/NativeMobileHeader";
import Footer from "@/components/layout/Footer";
import { GlobalSEO } from "@/components/seo/GlobalSEO";

const SITE_URL = 'https://jaipurcircle.com';

// Global organization schema for all pages
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "JaipurCircle",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
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