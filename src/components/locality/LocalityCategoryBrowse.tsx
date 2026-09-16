import { Grid3X3 } from 'lucide-react';

interface LocalityCategoryBrowseProps {
  localityName: string;
  localitySlug: string;
}

// STOPGAP (2026-09-15): both sections previously here generated links to
// `/jaipur/:localitySlug/:categorySlug` - one from a hardcoded 6-category
// array, one from a live query against every row in `categories`. That URL
// pattern is routed by vercel.json (`^/jaipur/([^/]+)/([^/]+)/?$`) to
// `api/cluster-proxy`, which returns `Cluster type "<slug>" not found`
// (plain text, no page, not even the SPA shell) for every category value
// tried - restaurants, healthcare, education, real-estate, all of them.
// This component was linking out to broken pages from every one of the
// ~103 live locality pages that render it (src/pages/LocalityPage.tsx:138).
//
// Removed rather than repointed: there's no working destination to send
// these links to today. `localitySlug` is kept in the props interface so
// the caller doesn't need a companion change, even though it's unused here
// now. Restore the real sections once /jaipur/:slug/:category actually
// renders content.
export function LocalityCategoryBrowse({ localityName }: LocalityCategoryBrowseProps) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <Grid3X3 className="w-5 h-5 text-primary" />
        Explore in {localityName}
      </h2>
      <p className="text-sm text-muted-foreground">
        More categories coming soon.
      </p>
    </section>
  );
}
