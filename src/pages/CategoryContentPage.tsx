import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

// Fresh, minimal component for /categories/:slug - deliberately not reusing
// CategoryPage.tsx. That component's data hooks are fine, but the display
// components it renders (CategoryListings, CategoryInternalLinks) generate
// outbound links to /jaipur/:locality/:category, the same broken
// cluster-proxy pattern removed from LocalityCategoryBrowse.tsx - reusing
// them here, even just as a hydration fallback, would reintroduce that bug
// in new code. This component only queries category_pages and renders what
// it contains - no cross-links to build broken.
//
// Purely a hydration target: category-ssr (via api/category-proxy.ts) is
// what actually serves first loads and crawlers, same division of labor as
// LocalityPage.tsx / locality-ssr.

interface ComparisonData {
  headers: string[];
  rows: string[][];
}

interface FaqEntry {
  question: string;
  answer: string;
}

interface CategoryPageData {
  id: string;
  slug: string;
  title: string;
  intro: string;
  comparison_data: ComparisonData | null;
  faq_json: FaqEntry[] | null;
  updated_at: string;
  authors: { name: string; bio: string | null } | null;
}

function useCategoryPage(slug: string | undefined) {
  return useQuery({
    queryKey: ['category-page', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('category_pages')
        .select('id, slug, title, intro, comparison_data, faq_json, updated_at, authors(name, bio)')
        .eq('slug', slug)
        .eq('status', 'published')
        .eq('is_indexable', true)
        .maybeSingle();

      if (error) throw error;
      return data as CategoryPageData | null;
    },
    enabled: !!slug,
  });
}

function ComparisonTable({ data }: { data: ComparisonData }) {
  // Same shape contract as category-ssr's renderComparisonTable(), also
  // recorded as a durable COMMENT ON COLUMN (migration 20260917020000).
  if (!Array.isArray(data?.headers) || !Array.isArray(data?.rows)) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {data.headers.map((h, i) => (
              <th key={i} className="border-b p-2 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border-b p-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CategoryContentPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = useCategoryPage(slug);

  if (isLoading) {
    return (
      <AppLayout title="Loading..." backPath="/categories">
        <div className="container mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (error || !page) {
    return (
      <AppLayout title="Not Found" backPath="/categories">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                We couldn't find that category page. <Link to="/categories" className="underline">Browse categories</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={page.title} backPath="/categories">
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">{page.title}</h1>
        <p className="text-muted-foreground">{page.intro}</p>

        {page.comparison_data && <ComparisonTable data={page.comparison_data} />}

        {page.faq_json && page.faq_json.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
            {page.faq_json.map((faq, i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <p className="font-medium">{faq.question}</p>
                  <p className="text-muted-foreground mt-1">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {page.authors && (
          <div className="text-sm text-muted-foreground border-t pt-4">
            <p>By <strong>{page.authors.name}</strong></p>
            {page.authors.bio && <p className="mt-1">{page.authors.bio}</p>}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
