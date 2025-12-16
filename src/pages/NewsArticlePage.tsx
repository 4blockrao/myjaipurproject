import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Clock, Eye, Heart, Share2, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import { cn } from '@/lib/utils';

const categoryColors: Record<string, string> = {
  city: 'bg-blue-500/10 text-blue-600 border-blue-200',
  events: 'bg-purple-500/10 text-purple-600 border-purple-200',
  food: 'bg-orange-500/10 text-orange-600 border-orange-200',
  culture: 'bg-pink-500/10 text-pink-600 border-pink-200',
  business: 'bg-green-500/10 text-green-600 border-green-200',
  sports: 'bg-red-500/10 text-red-600 border-red-200',
};

const categoryEmojis: Record<string, string> = {
  city: '🏛️',
  events: '🎉',
  food: '🍽️',
  culture: '🎭',
  business: '💼',
  sports: '⚽',
};

export default function NewsArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id || null);
    });
  }, []);

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['news-article', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');
      
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Increment view count
  useEffect(() => {
    if (article?.id) {
      supabase.rpc('increment_article_views', { article_id: article.id });
    }
  }, [article?.id]);

  // Check if user has liked
  useEffect(() => {
    if (article?.id && userId) {
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
  }, [article?.id, userId]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !article?.id) throw new Error('Please log in to like');
      
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

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.excerpt || article.meta_description,
    "image": article.cover_image || article.og_image,
    "datePublished": article.published_at,
    "dateModified": article.updated_at,
    "author": {
      "@type": "Organization",
      "name": "JaipurCircle"
    },
    "publisher": {
      "@type": "Organization",
      "name": "JaipurCircle",
      "url": "https://jaipurcircle.com"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://jaipurcircle.com/news/${article.slug}`
    }
  };

  return (
    <>
      <Helmet>
        <title>{article.meta_title || article.title} | JaipurCircle News</title>
        <meta name="description" content={article.meta_description || article.excerpt || ''} />
        {article.meta_keywords && (
          <meta name="keywords" content={article.meta_keywords.join(', ')} />
        )}
        <link rel="canonical" href={article.canonical_url || `https://jaipurcircle.com/news/${article.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={article.meta_title || article.title} />
        <meta property="og:description" content={article.meta_description || article.excerpt || ''} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://jaipurcircle.com/news/${article.slug}`} />
        {(article.og_image || article.cover_image) && (
          <meta property="og:image" content={article.og_image || article.cover_image || ''} />
        )}
        <meta property="article:published_time" content={article.published_at || ''} />
        <meta property="article:modified_time" content={article.updated_at || ''} />
        <meta property="article:section" content={article.category} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.meta_title || article.title} />
        <meta name="twitter:description" content={article.meta_description || article.excerpt || ''} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

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
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => likeMutation.mutate()}
                className={cn(hasLiked && 'text-red-500')}
              >
                <Heart className={cn('h-5 w-5', hasLiked && 'fill-current')} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {article.cover_image && (
          <div className="aspect-video bg-muted">
            <img 
              src={article.cover_image} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <article className="p-4">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge 
              variant="outline" 
              className={cn('text-xs', categoryColors[article.category])}
            >
              {categoryEmojis[article.category]} {article.category}
            </Badge>
            {article.locality && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {article.locality}
              </span>
            )}
            {article.is_ai_generated && (
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Generated
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-3 leading-tight">
            {article.title}
          </h1>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-4 border-b">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {timeAgo}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {article.view_count} views
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {article.like_count} likes
            </span>
          </div>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-lg text-muted-foreground mb-6 font-medium leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {article.content.split('\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{paragraph.replace('## ', '')}</h2>;
              }
              if (paragraph.startsWith('### ')) {
                return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{paragraph.replace('### ', '')}</h3>;
              }
              if (paragraph.startsWith('- ')) {
                return <li key={index} className="ml-4">{paragraph.replace('- ', '')}</li>;
              }
              if (paragraph.startsWith('> ')) {
                return (
                  <blockquote key={index} className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                    {paragraph.replace('> ', '')}
                  </blockquote>
                );
              }
              if (paragraph.trim()) {
                return <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>;
              }
              return null;
            })}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Published Date */}
          <div className="mt-6 text-sm text-muted-foreground">
            Published on {formattedDate}
          </div>
        </article>

        <NativeBottomNav />
      </div>
    </>
  );
}
