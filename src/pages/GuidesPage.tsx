import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarDays, ChevronRight, Share2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import GlobalSEO from '@/components/seo/GlobalSEO';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CategoryBadge, { getCategoryIcon } from '@/components/guides/CategoryBadge';
import ShareButtons from '@/components/common/ShareButtons';
import { supabase } from '@/integrations/supabase/client';

interface Guide {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  article_type: string | null;
  published_at: string | null;
}

function getDaysToFirstMatch() {
  const matchDate = new Date('2026-04-25T19:30:00+05:30').getTime();
  const diff = matchDate - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGuides() {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('id, slug, title, excerpt, category, article_type, published_at')
          .eq('status', 'published')
          .eq('type', 'guide')
          .eq('is_evergreen', true)
          .order('is_evergreen', { ascending: false })
          .order('published_at', { ascending: false });

        if (!error && data) setGuides(data);
      } finally {
        setLoading(false);
      }
    }

    fetchGuides();
  }, []);

  const pillarGuide = useMemo(() => guides.find((guide) => guide.article_type === 'pillar') || guides[0], [guides]);
  const clusterGuides = useMemo(() => guides.filter((guide) => guide.id !== pillarGuide?.id), [guides, pillarGuide?.id]);
  const daysToMatch = getDaysToFirstMatch();

  return (
    <>
      <GlobalSEO
        title="IPL 2026 Jaipur Guides & Resources"
        description="Essential IPL 2026 Jaipur guides for tickets, Sawai Mansingh Stadium seating, traffic, parking, food, metro and match previews."
        canonical="/guides"
        keywords={['IPL 2026 Jaipur', 'Sawai Mansingh Stadium', 'Rajasthan Royals tickets', 'Jaipur IPL guides']}
      />
      <AppLayout title="Guides" showBackButton={false}>
        <main className="bg-background pb-8">
          <section className="bg-gradient-warm text-primary-foreground">
            <div className="container mx-auto px-4 py-8 md:py-12">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-sm font-semibold">
                  🏏 IPL 2026 Jaipur Campaign
                </div>
                <h1 className="text-3xl font-extrabold tracking-normal md:text-5xl">Guides & Resources</h1>
                <p className="mt-3 text-base text-primary-foreground/90 md:text-xl">
                  Everything you need to know about IPL in Jaipur — tickets, stadium seating, traffic, parking and match-day planning.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary-foreground/15 px-4 py-3 font-bold">
                  <CalendarDays className="h-5 w-5" />
                  {daysToMatch > 0 ? `${daysToMatch} days to the first Jaipur match` : 'IPL match week is live in Jaipur'}
                </div>
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-6 md:py-8">
            {loading ? (
              <div className="space-y-5">
                <Skeleton className="h-48 rounded-2xl" />
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((item) => <Skeleton key={item} className="h-44 rounded-2xl" />)}
                </div>
              </div>
            ) : guides.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card py-12 text-center shadow-card">
                <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-semibold text-muted-foreground">No guides available yet. Check back soon.</p>
              </div>
            ) : (
              <>
                {pillarGuide && (
                  <Link to={`/guide/${pillarGuide.slug}`} className="group mb-8 block overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-heritage">
                    <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
                      <div className="p-5 md:p-8">
                        <CategoryBadge articleType="pillar" />
                        <h2 className="mt-4 text-2xl font-extrabold text-card-foreground md:text-4xl">{pillarGuide.title}</h2>
                        <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">
                          {pillarGuide.excerpt || 'Read the complete IPL 2026 Jaipur guide with match schedule, tickets, stadium advice and local tips.'}
                        </p>
                        <span className="mt-5 inline-flex items-center font-bold text-primary">
                          Read the complete guide <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                      <div className="flex min-h-48 items-center justify-center bg-heritage-pattern bg-secondary p-8 text-7xl md:text-8xl" aria-hidden="true">
                        🏏
                      </div>
                    </div>
                  </Link>
                )}

                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-extrabold text-foreground">In-depth guides</h2>
                    <p className="text-sm text-muted-foreground">Plan every part of your Sawai Mansingh Stadium match day.</p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {clusterGuides.map((guide) => (
                    <article key={guide.id} className="group rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-heritage">
                      <Link to={`/guide/${guide.slug}`} className="block">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <CategoryBadge category={guide.category} articleType={guide.article_type} />
                          <span className="text-3xl" aria-hidden="true">{getCategoryIcon(guide.category)}</span>
                        </div>
                        <h3 className="line-clamp-2 text-xl font-bold text-card-foreground group-hover:text-primary">{guide.title}</h3>
                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                          {guide.excerpt || 'A practical JaipurCircle guide for IPL 2026 in Jaipur.'}
                        </p>
                      </Link>
                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4">
                        <Link to={`/guide/${guide.slug}`} className="inline-flex items-center text-sm font-bold text-primary">
                          Read guide <ChevronRight className="h-4 w-4" />
                        </Link>
                        <ShareButtons title={guide.title} url={`https://jaipurcircle.com/guide/${guide.slug}`} compact />
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>

          <a href="https://wa.me/919XXXXXXXXX?text=Hi%20I%20want%20to%20join%20JaipurCircle%20IPL%20alerts" target="_blank" rel="noopener noreferrer" className="fixed bottom-24 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-2xl text-whatsapp-foreground shadow-lg shadow-whatsapp/30 md:h-auto md:w-auto md:px-5 md:py-3 md:text-base md:font-bold">
            <span className="md:hidden">💬</span>
            <span className="hidden md:inline">Join WhatsApp Alerts</span>
          </a>
        </main>
      </AppLayout>
    </>
  );
}
