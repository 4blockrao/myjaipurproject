import { Link } from 'react-router-dom';
import { Clock, Eye, Heart, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  article: {
    id: string;
    title: string;
    excerpt: string | null;
    slug: string;
    cover_image: string | null;
    category: string;
    locality: string | null;
    view_count: number;
    like_count: number;
    published_at: string | null;
    created_at: string | null;
    is_ai_generated?: boolean;
  };
  variant?: 'default' | 'featured' | 'compact';
}

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

export function NewsCard({ article, variant = 'default' }: NewsCardProps) {
  const timeAgo = article.published_at || article.created_at 
    ? formatDistanceToNow(new Date(article.published_at || article.created_at!), { addSuffix: true })
    : '';

  if (variant === 'compact') {
    return (
      <Link 
        to={`/news/${article.slug}`}
        className="flex gap-3 p-3 rounded-xl bg-card hover:bg-accent/50 transition-colors"
      >
        {article.cover_image && (
          <img 
            src={article.cover_image} 
            alt={article.title}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <Badge 
            variant="outline" 
            className={cn('text-xs mb-1', categoryColors[article.category])}
          >
            {categoryEmojis[article.category]} {article.category}
          </Badge>
          <h4 className="font-medium text-sm line-clamp-2 text-foreground">{article.title}</h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link 
        to={`/news/${article.slug}`}
        className="relative block overflow-hidden rounded-2xl group"
      >
        <div className="aspect-[16/9] bg-muted">
          {article.cover_image ? (
            <img 
              src={article.cover_image} 
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <span className="text-6xl">{categoryEmojis[article.category]}</span>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Badge 
            variant="outline" 
            className="bg-white/20 backdrop-blur-sm text-white border-white/30 mb-2"
          >
            {categoryEmojis[article.category]} {article.category}
          </Badge>
          <h3 className="font-bold text-lg text-white line-clamp-2 mb-2">{article.title}</h3>
          <div className="flex items-center gap-4 text-xs text-white/80">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.view_count}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {article.like_count}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/news/${article.slug}`}
      className="block bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border"
    >
      <div className="aspect-[16/10] bg-muted">
        {article.cover_image ? (
          <img 
            src={article.cover_image} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-4xl">{categoryEmojis[article.category]}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
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
        </div>
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{article.title}</h3>
        {article.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {article.view_count}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {article.like_count}
          </span>
        </div>
      </div>
    </Link>
  );
}
