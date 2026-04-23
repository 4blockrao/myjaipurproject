import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { normalizeImageUrl } from '@/utils/imageUrl';
import { ArrowLeft, Clock, Eye, Heart, Share2, MapPin, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import { cn } from '@/lib/utils';
import { NewsSEO } from '@/components/news/NewsSEO';
import { NewsInShortSummary } from '@/components/news/NewsInShortSummary';
import { NewsStructuredContent } from '@/components/news/NewsStructuredContent';
import { NewsInternalLinks } from '@/components/news/NewsInternalLinks';
import { NewsSchema } from '@/components/seo/SchemaInjector';
import ArticleFooter from '@/components/ArticleFooter';

const categoryColors: Record<string, string> = {
  city: 'bg-blue-500/10 text-blue-600 border-blue-200',
  events: 'bg-purple-500/10 text-purple-600 border-purple-200',
  food: 'bg-orange-500/10 text-orange-600 border-orange-200',
  culture: 'bg-pink-500/10 text-pink-600 border-pink-200',
  business: 'bg-green-500/10 text-green-600 border-green-200',
  sports: 'bg-red-500/10 text-red-600 border-red-200',
  tickets: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  stadium: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
  traffic: 'bg-amber-500/10 text-amber-600 border-amber-200',
  preview: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  general: 'bg-gray-500/10 text-gray-600 border-gray-200',
};

const categoryEmojis: Record<string, string> = {
  city: '🏛️',
  events: '🎉',
  food: '🍽️',
  culture: '🎭',
  business: '💼',
  sports: '⚽',
  tickets: '🎟️',
  stadium: '🏟️',
  traffic: '🚗',
  preview: '👀',
  general: '📰',
};

export default function NewsArticlePage() {
  const { slug, category } = useParams<{ slug: string; category: string }>();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [isFromArticlesTable, setIsFromArticlesTable] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id || null);
    });
  }, []);

  // Query that checks BOTH tables
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['news-article', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');
      
      // First, try the news_articles table
      let { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (data) {
        setIsFromArticlesTable(false);
        return { ...data, source: 'news_articles' };
      }
      
      // If not found, try the articles table (for campaign news_flash)
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      
      if (articlesData) {
        setIsFromArticlesTable(true);
        // Map articles table fields to match news_articles structure
        return {
          ...articlesData,
          source: 'articles',
          cover_image: articlesData.featured_image || null,
          body_html: articlesData.content,
          like_count: articlesData.whatsapp_share_count || 0,
          view_count: articlesData.view_count || 0,
          tags: [],
        };
      }
      
      throw new Error('Article not found');
    },
    enabled: !!slug,
  });

  // Increment view count
  useEffect(() => {
    if (article?.id && !isFromArticlesTable) {
      supabase.rpc('increment_article_views', { article_id: article.id });
    }
  }, [article?.id, isFromArticlesTable]);

  // Check if user has liked (only for news_articles)
  useEffect(() => {
    if (article?.id && userId && !isFromArticlesTable) {
      supabase
        .from('news_likes')
        .select('id')
        .eq('article_id', article.id)
        .eq('user_id', userId)
        .single()
        .then(({ data }) => {
          setHasLiked(!!data);
        });
    }
  }, [article?.id, userId, isFromArticlesTable]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !article?.id || isFromArticlesTable) throw new Error('Please log in to like');
      
      if (hasLiked) {
        await supabase
          .from('news_likes')
          .delete()
          .eq('article_id', article.id)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('news_likes')
          .insert({ article_id: article.id, user_id: userId });
      }
    },
    onSuccess: () => {
      setHasLiked(!hasLiked);
      queryClient.invalidateQueries({ queryKey: ['news-article', slug] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to like article');
    },
  });

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article?.title,
        text: article?.excerpt || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-50 bg-background border-b p-4">
          <Skeleton className="h-8 w-32" />
        </header>
        <div className="p-4 space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">📰</p>
          <h1 className="text-xl font-bold mb-2">Article Not Found</h1>
          <Link to="/news">
            <Button>Back to News</Button>
          </Link>
        </div>
      </div>
    );
  }

  const publishedDate = article.published_at || article.created_at;
  const timeAgo = publishedDate 
    ? formatDistanceToNow(new Date(publishedDate), { addSuffix: true })
    : '';
  const formattedDate = publishedDate
    ? format(new Date(publishedDate), 'MMMM d, yyyy')
    : '';
  const isoDate = publishedDate ? new Date(publishedDate).toISOString() : '';

  const wordCount = article.content?.split(/\s+/).filter(Boolean).length || 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Determine category display
  const displayCategory = article.category || article.news_category || 'general';
  const displayTitle = article.title;
  const displayExcerpt = article.excerpt || article.meta_description;
  const coverImage = normalizeImageUrl(article.cover_image || article.featured_image);

  return (
    <>
      <NewsSEO article={article} source={isFromArticlesTable ? 'articles' : 'news_articles'} />
      <NewsSchema
        title={displayTitle}
        description={displayExcerpt || ''}
        image={coverImage || undefined}
        publishedAt={article.published_at || article.created_at || undefined}
        updatedAt={article.updated_at || undefined}
        url={`https://www.jaipurcircle.com/news/${article.slug}`}
      />

      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between p-4">
            <Link to="/news">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              {!isFromArticlesTable && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => likeMutation.mutate()}
                  className={cn(hasLiked && 'text-red-500')}
                >
                  <Heart className={cn('h-5 w-5', hasLiked && 'fill-current')} />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {coverImage && (
          <figure className="aspect-video bg-muted">
            <img 
              src={coverImage}
              alt={displayTitle}
              className="w-full h-full object-cover"
              loading="eager"
              onError={(e) => {
                e.currentTarget.parentElement?.classList.add('hidden');
              }}
            />
          </figure>
        )}

        {/* Article Content */}
        <article className="p-4" itemScope itemType="https://schema.org/NewsArticle">
          <meta itemProp="datePublished" content={isoDate} />
          <meta itemProp="dateModified" content={article.updated_at || isoDate} />
          <meta itemProp="wordCount" content={String(wordCount)} />
          
          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge 
              variant="outline" 
              className={cn('text-xs', categoryColors[displayCategory])}
              itemProp="articleSection"
            >
              {categoryEmojis[displayCategory]} {displayCategory}
            </Badge>
            {isFromArticlesTable && article.article_type === 'news_flash' && (
              <Badge className="bg-red-500 text-white text-xs">⚡ Breaking News</Badge>
            )}
            {article.locality && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span itemProp="contentLocation">{article.locality}</span>
              </span>
            )}
            {article.is_ai_generated && (
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Generated
              </Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-3 leading-tight" itemProp="headline">
            {displayTitle}
          </h1>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-4 border-b">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <time dateTime={isoDate}>{timeAgo}</time>
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {readingTime} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {article.view_count || 0} views
            </span>
            {!isFromArticlesTable && (
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {article.like_count || 0} likes
              </span>
            )}
          </div>

          {/* Excerpt */}
          {displayExcerpt && (
            <p className="text-lg text-muted-foreground mb-6 font-medium leading-relaxed border-l-4 border-primary pl-4" itemProp="description">
              {displayExcerpt}
            </p>
          )}

          {/* Main Article Body */}
          <div className="mt-6" itemProp="articleBody">
            {(article.body_html || article.content) ? (
              <div 
                className="article-content prose prose-lg max-w-none dark:prose-invert
                  prose-headings:font-bold prose-headings:text-foreground prose-headings:leading-tight
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-5
                  prose-a:text-primary prose-a:font-medium prose-a:underline prose-a:underline-offset-2
                  prose-ul:my-4 prose-ul:ml-6 prose-ul:list-disc
                  prose-li:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: article.body_html || article.content }}
              />
            ) : (
              <NewsStructuredContent content={article.content} />
            )}
          </div>

          {/* Article Footer with Interlinking */}
          <ArticleFooter
            campaignSlug={article.campaign_slug}
            category={displayCategory}
            articleType={article.article_type}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <footer className="mt-8 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" itemProp="keywords">
                    {tag}
                  </Badge>
                ))}
              </div>
            </footer>
          )}

          {/* Published Date */}
          <div className="mt-6 text-sm text-muted-foreground">
            Published on <time dateTime={isoDate}>{formattedDate}</time>
          </div>

          {/* Publisher info for schema */}
          <div itemProp="publisher" itemScope itemType="https://schema.org/Organization" className="hidden">
            <meta itemProp="name" content="JaipurCircle" />
            <meta itemProp="url" content="https://jaipurcircle.com" />
          </div>

          <NewsInternalLinks article={article} />
        </article>

        <NativeBottomNav />
      </div>
    </>
  );
}
