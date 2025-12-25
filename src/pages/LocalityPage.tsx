import { useParams } from "react-router-dom";
import { useLocality } from "@/hooks/useLocality";
import AppLayout from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// SEO & Schema (V3 — EEAT + Entity Signals)
import { LocalitySEO } from "@/components/locality/LocalitySEO";

// Core Locality Sections
import { LocalityBreadcrumb } from "@/components/locality/LocalityBreadcrumb";
import { LocalityAISummary } from "@/components/locality/LocalityAISummary";
import { LocalitySnapshot } from "@/components/locality/LocalitySnapshot";
import { LocalityAbout } from "@/components/locality/LocalityAbout";
import LocalityLivingProfile from "@/components/locality/LocalityLivingProfile";
import LocalityPropertyContext from "@/components/locality/LocalityPropertyContext";
import { LocalityRentalContext } from "@/components/locality/LocalityRentalContext";
import { LocalityConnectivity } from "@/components/locality/LocalityConnectivity";
import { LocalityEducationAccess, LocalityHealthcareAccess } from "@/components/locality/LocalityAccessibilityBlocks";
import { LocalityCommercialMarkets } from "@/components/locality/LocalityCommercialMarkets";
import { LocalityLocalEconomy } from "@/components/locality/LocalityLocalEconomy";
import { LocalityMicroLocalities } from "@/components/locality/LocalityMicroLocalities";
import { LocalityNearby } from "@/components/locality/LocalityNearby";
import { LocalityLandmarks } from "@/components/locality/LocalityLandmarks";
import LocalityWhyPeopleChoose from "@/components/locality/LocalityWhyPeopleChoose";

// Dynamic Content
import { LocalityNews } from "@/components/locality/LocalityNews";
import { LocalityEvents } from "@/components/locality/LocalityEvents";
import { LocalityDeals } from "@/components/locality/LocalityDeals";
import { LocalityMerchants } from "@/components/locality/LocalityMerchants";

// Structured Depth Sections
import { LocalityExtendedFAQ } from "@/components/locality/LocalityExtendedFAQ";
import { LocalityLongTailFooter } from "@/components/locality/LocalityLongTailFooter";
import { LocalityInternalLinks } from "@/components/locality/LocalityInternalLinks";

// NEW — V3 Semantic Intent Footer (High-Coverage Local Search Index)
import { LocalityIntentFooter } from "@/components/locality/LocalityIntentFooter";

export default function LocalityPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: locality, isLoading, error } = useLocality(slug || "");

  // ----------- Loading State -----------
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-10 w-72 mb-2" />
          <Skeleton className="h-5 w-96 mb-8" />
          <Skeleton className="h-32 w-full mb-8 rounded-xl" />
          <Skeleton className="h-48 w-full mb-8" />
          <Skeleton className="h-24 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  // ----------- Error / Missing Locality -----------
  if (error || !locality) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 max-w-5xl text-center">
          <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Locality Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The locality "{slug}" could not be found. It may not be added yet.
          </p>
          <Button asChild>
            <Link to="/jaipur">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse All Localities
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  // ----------- Main Locality Page -----------
  return (
    <AppLayout>
      {/* SEO + Meta + JSON-LD */}
      <LocalitySEO locality={locality} />

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Breadcrumb — also reinforces entity structure */}
        <LocalityBreadcrumb locality={locality} />

        {/* Page Header — includes core civic identity */}
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{locality.name}, Jaipur</h1>

          <p className="text-muted-foreground mt-2">
            {locality.zone && `${locality.zone} Zone`}
            {locality.zone && locality.municipality && " • "}
            {locality.municipality}
            {(locality.zone || locality.municipality) && locality.pin_codes?.length ? " • " : ""}
            {locality.pin_codes?.length ? `PIN: ${locality.pin_codes[0]}` : ""}
          </p>
        </header>

        {/* 1. AI Overview */}
        <LocalityAISummary locality={locality} />

        {/* 2. Snapshot (Civic + Geo Identity) */}
        <LocalitySnapshot locality={locality} />

        {/* 3. About the Locality */}
        <LocalityAbout locality={locality} />

        {/* 4. Living Profile */}
        <LocalityLivingProfile locality={locality} />

        {/* 5. Housing Context */}
        <LocalityPropertyContext locality={locality} />

        {/* 6. Rentals & PG */}
        <LocalityRentalContext locality={locality} />

        {/* 7. Connectivity */}
        <LocalityConnectivity locality={locality} />

        {/* 8–9: Access to Education & Healthcare */}
        <LocalityEducationAccess locality={locality} />
        <LocalityHealthcareAccess locality={locality} />

        {/* 10–11: Economy + Markets */}
        <LocalityCommercialMarkets locality={locality} />
        <LocalityLocalEconomy locality={locality} />

        {/* 12. Micro Localities */}
        <LocalityMicroLocalities locality={locality} />

        {/* 13. Nearby Localities */}
        <LocalityNearby locality={locality} />

        {/* 14. Major Landmarks */}
        <LocalityLandmarks locality={locality} />

        {/* 15. Why People Choose */}
        <LocalityWhyPeopleChoose locality={locality} />

        {/* 16–19: Dynamic Content Streams */}
        <LocalityNews localityName={locality.name} />
        <LocalityEvents localityName={locality.name} />
        <LocalityDeals localityName={locality.name} />
        <LocalityMerchants localityName={locality.name} />

        {/* 20. Extended FAQ (V3 — EEAT) */}
        <LocalityExtendedFAQ locality={locality} />

        {/* 21. Long-Tail SEO Footer */}
        <LocalityLongTailFooter locality={locality} />

        {/* 22. Internal Link Graph */}
        <LocalityInternalLinks locality={locality} />

        {/* 23. NEW — Semantic Intent Footer (High-Coverage Category Index) */}
        <LocalityIntentFooter locality={locality} />
      </main>
    </AppLayout>
  );
}
