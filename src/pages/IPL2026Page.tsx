import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, Clock, MessageCircle, Share2, Siren } from 'lucide-react';
import { toast } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';
import GlobalSEO from '@/components/seo/GlobalSEO';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CategoryBadge from '@/components/guides/CategoryBadge';
import { supabase } from '@/integrations/supabase/client';

const SITE_URL = 'https://jaipurcircle.com';
const FIRST_MATCH_AT = new Date('2026-04-25T19:30:00+05:30').getTime();
const WHATSAPP_URL = 'https://wa.me/919XXXXXXXXX?text=Hi%20I%20want%20IPL%202026%20Jaipur%20updates%20from%20JaipurCircle';

interface CampaignArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  article_type: 'pillar' | 'cluster' | 'news_flash' | string | null;
  published_at: string | null;
}

function getCountdown() {
  const diff = Math.max(0, FIRST_MATCH_AT - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export default function IPL2026Page() {
  const [articles, setArticles] = useState<CampaignArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(getCountdown());

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchCampaignArticles() {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('id, slug, title, excerpt, category, article_type, published_at')
          .eq('status', 'published')
          .eq('campaign_slug', 'ipl-2026')
          .in('article_type', ['pillar', 'cluster', 'news_flash'])
          .order('published_at', { ascending: false });

        if (!error && data) setArticles(data as CampaignArticle[]);
      } finally {
        setLoading(false);
      }
    }

    fetchCampaignArticles();
  }, []);

  const newsFlashes = useMemo(() => articles.filter((article) => article.article_type === 'news_flash'), [articles]);
  const guides = useMemo(() => articles.filter((article) => article.article_type === 'pillar' || article.article_type === 'cluster'), [articles]);
  const pillarGuide = useMemo(() => guides.find((guide) => guide.article_type === 'pillar'), [guides]);
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/ipl-2026#webpage`,
    url: `${SITE_URL}/ipl-2026`,
    name: 'IPL 2026 in Jaipur – Complete Guide, Tickets & Schedule',
    description: 'Complete IPL 2026 Jaipur campaign hub with SMS Stadium guides, Rajasthan Royals tickets, urgent updates, schedule, parking and match-day tips.',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: [{ '@type': 'SportsEvent', name: 'IPL 2026 Jaipur matches' }, { '@type': 'Place', name: 'Sawai Mansingh Stadium, Jaipur' }],
    hasPart: articles.map((article) => ({
      '@type': article.article_type === 'news_flash' ? 'NewsArticle' : 'Article',
      headline: article.title,
      url: `${SITE_URL}${article.article_type === 'news_flash' ? `/news/ipl-2026/${article.slug}` : `/guide/${article.slug}`}`,
    })),
  };

  const handleShare = async () => {
    const shareData = {
      title: 'IPL 2026 in Jaipur – Complete Guide, Tickets & Schedule',
      text: 'Follow JaipurCircle’s IPL 2026 Jaipur campaign hub for tickets, SMS Stadium guides and urgent updates.',
      url: `${SITE_URL}/ipl-2026`,
    };

    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(shareData.url);
      toast.success('Campaign link copied');
    }
  };

  return (
    <>
      <GlobalSEO
        title="IPL 2026 in Jaipur – Complete Guide, Tickets & Schedule"
        description="IPL 2026 Jaipur hub: SMS Stadium tickets, RR match schedule, parking, metro, food, urgent updates and local match-day guides."
        canonical="/ipl-2026"
        keywords={['IPL 2026 Jaipur', 'Rajasthan Royals tickets', 'SMS Stadium Jaipur', 'IPL schedule Jaipur', 'Sawai Mansingh Stadium guide']}
      >
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
      </GlobalSEO>
      <Helmet>
        <title>IPL 2026 in Jaipur – Complete Guide, Tickets &amp; Schedule</title>
      </Helmet>
      <AppLayout title="IPL 2026" showBackButton={false}>
        <main className="bg-background pb-8">
          <section className="bg-campaign-ipl text-campaign-ipl-foreground">
            <div className="container mx-auto px-4 py-8 md:py-12">
              <div className="max-w-4xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-campaign-ipl-foreground/15 px-3 py-1 text-sm font-bold">
                  🏏 Jaipur IPL 2026 Campaign
                </div>
                <h1 className="text-3xl font-extrabold tracking-normal md:text-5xl">IPL 2026 in Jaipur</h1>
                <p className="mt-3 max-w-2xl text-base text-campaign-ipl-foreground/90 md:text-xl">
                  Complete guide, tickets, SMS Stadium tips, urgent updates and match-day planning for Rajasthan Royals home games in Jaipur.
                </p>
                <div className="mt-6 grid grid-cols-4 gap-2 max-w-md" aria-label="Countdown to first IPL match in Jaipur">
                  {Object.entries(countdown).map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-campaign-ipl-foreground/15 px-2 py-3 text-center">
                      <div className="text-2xl font-extrabold tabular-nums">{String(value).padStart(2, '0')}</div>
                      <div className="text-[11px] font-semibold uppercase text-campaign-ipl-foreground/80">{label}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-campaign-ipl-foreground/90">
                  <CalendarDays className="h-4 w-4" /> First match: April 25, 2026, 7:30 PM IST
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90">
                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-4 w-4" /> Get WhatsApp alerts</a>
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" /> Share this campaign
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-6 md:py-8">
            <div className="mb-4 flex items-center gap-2">
              <Siren className="h-5 w-5 text-destructive" />
              <h2 className="text-2xl font-extrabold text-foreground">Urgent news</h2>
            </div>
            {loading ? <Skeleton className="h-32 rounded-lg" /> : newsFlashes.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {newsFlashes.map((article) => (
                  <Link key={article.id} to={`/news/ipl-2026/${article.slug}`} className="rounded-lg border border-destructive/25 bg-card p-4 shadow-card transition-all hover:-translate-y-1 hover:shadow-heritage">
                    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-1 text-xs font-bold text-destructive">Breaking update</span>
                    <h3 className="mt-3 line-clamp-2 text-lg font-extrabold text-card-foreground">{article.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.excerpt || 'Latest IPL 2026 Jaipur update from JaipurCircle.'}</p>
                    <span className="mt-3 inline-flex items-center text-sm font-bold text-primary">Read update <ChevronRight className="h-4 w-4" /></span>
                  </Link>
                ))}
              </div>
            ) : <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">No urgent updates right now.</p>}
          </section>

          <section className="container mx-auto px-4 pb-8">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold text-foreground">IPL guides</h2>
                <p className="text-sm text-muted-foreground">Tickets, seating, metro, food, parking and match previews.</p>
              </div>
              <Link to="/guides" className="hidden text-sm font-bold text-primary sm:inline-flex">All guides</Link>
            </div>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <Skeleton key={item} className="h-44 rounded-lg" />)}</div>
            ) : guides.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {guides.map((guide) => (
                  <article key={guide.id} className="rounded-lg border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-1 hover:shadow-heritage md:p-5">
                    <Link to={`/guide/${guide.slug}`} className="block">
                      <CategoryBadge category={guide.category} articleType={guide.article_type} />
                      <h3 className="mt-3 line-clamp-2 text-lg font-extrabold text-card-foreground">{guide.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{guide.excerpt || 'A practical JaipurCircle IPL 2026 guide for match day in Jaipur.'}</p>
                      <span className="mt-4 inline-flex items-center text-sm font-bold text-primary">{guide.id === pillarGuide?.id ? 'Open campaign guide' : 'Read guide'} <ChevronRight className="h-4 w-4" /></span>
                    </Link>
                  </article>
                ))}
              </div>
            ) : <p className="rounded-lg border border-border bg-card p-6 text-center font-semibold text-muted-foreground">No IPL guides available yet.</p>}
          </section>

          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="fixed bottom-24 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lg shadow-whatsapp/30 md:hidden" aria-label="Get IPL 2026 WhatsApp alerts">
            <MessageCircle className="h-6 w-6" />
          </a>
        </main>
      </AppLayout>
    </>
  );
}