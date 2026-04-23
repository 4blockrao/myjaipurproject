import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import GlobalSEO from '@/components/seo/GlobalSEO';
import CategoryBadge from '@/components/guides/CategoryBadge';
import TableOfContents from '@/components/guides/TableOfContents';
import RelatedArticles from '@/components/guides/RelatedArticles';
import ShareButtons from '@/components/common/ShareButtons';
import ReadingTime from '@/components/common/ReadingTime';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { stripHtml } from '@/utils/markdownToHtml';

interface Article {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  category: string | null;
  article_type: string | null;
  author: string | null;
  published_at: string | null;
  updated_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
}

function addHeadingIds(content: string) {
  return content.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (match, attrs, inner) => {
    if (/id=["']/.test(attrs)) return match;
    const text = inner.replace(/<[^>]+>/g, '').trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `<h2${attrs} id="${id}">${inner}</h2>`;
  });
}

function buildDescription(article: Article) {
  const fallback = stripHtml(article.content || '').slice(0, 155).trim();
  return article.meta_description || article.excerpt || fallback || `Read ${article.title} on JaipurCircle.`;
}

export default function GuideDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (error || !data) setError(true);
        else setArticle(data as Article);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [slug]);

  const articleHtml = useMemo(() => addHeadingIds(article?.content || ''), [article?.content]);
  const description = article ? buildDescription(article) : '';
  const isNewsFlash = article?.article_type === 'news_flash';
  const articlePath = article ? (isNewsFlash ? `/news/ipl-2026/${article.slug}` : `/guide/${article.slug}`) : '/guides';
  const canonical = article ? articlePath : '/guides';

  if (loading) {
    return (
      <AppLayout title="Guide" backPath="/guides">
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <div className="animate-pulse space-y-5">
            <div className="h-5 w-36 rounded bg-muted" />
            <div className="h-10 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="space-y-3">
              <div className="h-4 rounded bg-muted" />
              <div className="h-4 w-5/6 rounded bg-muted" />
              <div className="h-4 w-4/6 rounded bg-muted" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !article) {
    return (
      <AppLayout title="Guide" backPath="/guides">
        <div className="container mx-auto max-w-4xl px-4 py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Guide Not Found</h1>
          <p className="mb-6 text-muted-foreground">The guide you're looking for doesn't exist or hasn't been published yet.</p>
          <Button asChild>
            <Link to="/guides">Back to Guides</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description,
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: { '@type': 'Person', name: article.author || 'JaipurCircle Team' },
    publisher: { '@type': 'Organization', name: 'JaipurCircle', url: 'https://jaipurcircle.com' },
    mainEntityOfPage: `https://jaipurcircle.com${articlePath}`,
  };

  return (
    <>
      <GlobalSEO
        title={article.meta_title || article.title}
        description={description}
        canonical={canonical}
        type="article"
        publishedTime={article.published_at || undefined}
        modifiedTime={article.updated_at || undefined}
        author={article.author || 'JaipurCircle Team'}
        keywords={['IPL 2026 Jaipur', article.category || 'Jaipur guide', 'JaipurCircle']}
      >
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </GlobalSEO>
      <AppLayout title={isNewsFlash ? 'IPL Update' : 'Guide'} backPath={isNewsFlash ? '/ipl-2026' : '/guides'}>
        <article className="bg-background pb-8">
          <header className="border-b border-border bg-card">
            <div className="container mx-auto max-w-6xl px-4 py-6 md:py-10">
              <nav className="mb-5 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
                <Link to="/" className="hover:text-primary">Home</Link>
                <span>/</span>
                <Link to={isNewsFlash ? '/ipl-2026' : '/guides'} className="hover:text-primary">{isNewsFlash ? 'IPL 2026' : 'Guides'}</Link>
                <span>/</span>
                <span className="line-clamp-1 text-foreground">{article.title}</span>
              </nav>

              <Link to={isNewsFlash ? '/ipl-2026' : '/guides'} className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                <ArrowLeft className="h-4 w-4" />
                {isNewsFlash ? 'Back to IPL 2026' : 'Back to Guides'}
              </Link>

              <div className="mb-4">
                <CategoryBadge category={article.category} articleType={article.article_type} />
              </div>

              <h1 className="max-w-4xl text-3xl font-extrabold tracking-normal text-foreground md:text-5xl">
                {article.title}
              </h1>

              {article.excerpt && <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{article.excerpt}</p>}

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {article.published_at
                    ? new Date(article.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Recently updated'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {article.author || 'JaipurCircle Team'}
                </span>
                <ReadingTime content={article.content} />
              </div>
            </div>
          </header>

          <div className="container mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">
              {article.article_type === 'pillar' && (
                <div className="mb-6 lg:hidden">
                  <TableOfContents content={articleHtml} />
                </div>
              )}

              <div className="guide-prose prose prose-lg max-w-none rounded-2xl border border-border bg-card p-5 shadow-card md:p-8" dangerouslySetInnerHTML={{ __html: articleHtml || '<p>Content coming soon...</p>' }} />

              <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card">
                <ShareButtons title={article.title} url={`https://jaipurcircle.com${articlePath}`} />
              </div>

              <RelatedArticles category={article.category} currentSlug={article.slug} />

              <div className="mt-10 rounded-2xl bg-secondary p-6 text-center">
                <h2 className="text-2xl font-extrabold text-secondary-foreground">📱 Get instant IPL updates on WhatsApp</h2>
                <p className="mt-2 text-muted-foreground">Join JaipurCircle alerts for tickets, traffic and match-day updates.</p>
                <Button asChild className="mt-4 bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90">
                  <a href="https://wa.me/919XXXXXXXXX?text=Hi%20I%20want%20to%20join%20JaipurCircle%20IPL%20alerts" target="_blank" rel="noopener noreferrer">
                    Join WhatsApp Alerts
                  </a>
                </Button>
              </div>
            </div>

            {article.article_type === 'pillar' && (
              <div className="hidden lg:block">
                <TableOfContents content={articleHtml} />
              </div>
            )}
          </div>
        </article>
      </AppLayout>
    </>
  );
}
