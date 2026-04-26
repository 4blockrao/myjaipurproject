import { Link } from 'react-router-dom';
import { useLocalityNews } from '@/hooks/useLocality';
import { Newspaper, ArrowRight, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface LocalityNewsProps {
  localityName: string;
}

export function LocalityNews({ localityName }: LocalityNewsProps) {
  const { data: news, isLoading } = useLocalityNews(localityName);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-primary" />
          Local News
        </h2>
        <Link 
          to={`/news?locality=${localityName}`}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : news?.length ? (
        <div className="space-y-3">
          {news.map((article) => (
            <Link 
              key={article.id} 
              to={getNewsCardUrl(article)}
              className="block group"
            >
              <Card className="transition-all hover:shadow-md hover:border-primary/50">
                <CardContent className="p-4 flex gap-4">
                  {article.cover_image && (
                    <img 
                      src={article.cover_image} 
                      alt={article.title}
                      className="w-20 h-20 object-cover rounded-lg shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {article.excerpt}
                    </p>
                    {article.published_at && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(article.published_at), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No recent news for {localityName}. Check back later!
          </CardContent>
        </Card>
      )}
    </section>
  );
}
