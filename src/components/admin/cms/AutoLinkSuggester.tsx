import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link2, MapPin, Calendar, Tag, Copy, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface AutoLinkSuggesterProps {
  content: string;
  category: string;
  locality?: string;
  onInsertLink: (markdown: string) => void;
}

interface LinkSuggestion {
  id: string;
  type: 'locality' | 'event' | 'category' | 'article';
  name: string;
  slug: string;
  url: string;
  relevance: number;
  matchedKeyword?: string;
}

export function AutoLinkSuggester({ content, category, locality, onInsertLink }: AutoLinkSuggesterProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch localities
  const { data: localities } = useQuery({
    queryKey: ['localities-for-linking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('localities')
        .select('id, name, slug')
        .order('name')
        .limit(100);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories-for-linking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, pillar_slug')
        .eq('is_active', true)
        .order('name')
        .limit(100);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  // Fetch upcoming events
  const { data: events } = useQuery({
    queryKey: ['events-for-linking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, slug, start_date, locality')
        .gte('start_date', new Date().toISOString())
        .eq('status', 'published')
        .order('start_date')
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch related articles
  const { data: relatedArticles } = useQuery({
    queryKey: ['articles-for-linking', category, locality],
    queryFn: async () => {
      let query = supabase
        .from('news_articles')
        .select('id, title, slug, category, locality')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(20);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Generate suggestions based on content analysis
  const suggestions = useMemo<LinkSuggestion[]>(() => {
    const results: LinkSuggestion[] = [];
    const contentLower = content.toLowerCase();

    // Find locality mentions in content
    localities?.forEach(loc => {
      const nameLower = loc.name.toLowerCase();
      if (contentLower.includes(nameLower)) {
        results.push({
          id: `locality-${loc.id}`,
          type: 'locality',
          name: loc.name,
          slug: loc.slug,
          url: `/locality/${loc.slug}`,
          relevance: contentLower.split(nameLower).length - 1,
          matchedKeyword: loc.name,
        });
      }
    });

    // Find event mentions
    events?.forEach(event => {
      const titleWords = event.title.toLowerCase().split(' ').filter(w => w.length > 4);
      const matches = titleWords.filter(word => contentLower.includes(word));
      if (matches.length >= 2 || (event.locality && event.locality === locality)) {
        results.push({
          id: `event-${event.id}`,
          type: 'event',
          name: event.title,
          slug: event.slug,
          url: `/events/${event.slug}`,
          relevance: matches.length,
          matchedKeyword: matches[0],
        });
      }
    });

    // Find category mentions
    categories?.forEach(cat => {
      const nameLower = cat.name.toLowerCase();
      const keywords = nameLower.split(/\s+/).filter(w => w.length > 3);
      const matches = keywords.filter(k => contentLower.includes(k));
      if (matches.length > 0) {
        results.push({
          id: `category-${cat.id}`,
          type: 'category',
          name: cat.name,
          slug: cat.slug,
          url: `/category/${cat.pillar_slug}/${cat.slug}`,
          relevance: matches.length,
          matchedKeyword: matches[0],
        });
      }
    });

    // Add related articles from same locality or category
    relatedArticles?.forEach(article => {
      if (article.locality === locality || article.category === category) {
        results.push({
          id: `article-${article.id}`,
          type: 'article',
          name: article.title,
          slug: article.slug,
          url: `/news/${article.category}/${article.slug}`,
          relevance: article.locality === locality ? 2 : 1,
        });
      }
    });

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 30);
  }, [content, localities, categories, events, relatedArticles, locality, category]);

  const localitySuggestions = suggestions.filter(s => s.type === 'locality');
  const eventSuggestions = suggestions.filter(s => s.type === 'event');
  const categorySuggestions = suggestions.filter(s => s.type === 'category');
  const articleSuggestions = suggestions.filter(s => s.type === 'article');

  const handleCopyLink = (suggestion: LinkSuggestion) => {
    const markdown = `[${suggestion.name}](${suggestion.url})`;
    navigator.clipboard.writeText(markdown);
    setCopiedId(suggestion.id);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsertLink = (suggestion: LinkSuggestion) => {
    const markdown = `[${suggestion.name}](${suggestion.url})`;
    onInsertLink(markdown);
    toast.success('Link inserted');
  };

  const renderSuggestionList = (items: LinkSuggestion[], emptyMessage: string) => (
    <ScrollArea className="h-[200px]">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div 
              key={item.id} 
              className="flex items-center justify-between p-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground truncate">{item.url}</p>
                {item.matchedKeyword && (
                  <Badge variant="outline" className="text-xs mt-1">
                    matched: "{item.matchedKeyword}"
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  onClick={() => handleCopyLink(item)}
                >
                  {copiedId === item.id ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2"
                  onClick={() => handleInsertLink(item)}
                >
                  <Link2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Auto-Link Suggestions
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Links detected from your content. Click to copy or insert.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="localities" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-8">
            <TabsTrigger value="localities" className="text-xs gap-1">
              <MapPin className="h-3 w-3" />
              <span className="hidden sm:inline">Areas</span>
              <Badge variant="secondary" className="text-xs h-4 px-1">{localitySuggestions.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="events" className="text-xs gap-1">
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">Events</span>
              <Badge variant="secondary" className="text-xs h-4 px-1">{eventSuggestions.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs gap-1">
              <Tag className="h-3 w-3" />
              <span className="hidden sm:inline">Topics</span>
              <Badge variant="secondary" className="text-xs h-4 px-1">{categorySuggestions.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="articles" className="text-xs gap-1">
              <Link2 className="h-3 w-3" />
              <span className="hidden sm:inline">Related</span>
              <Badge variant="secondary" className="text-xs h-4 px-1">{articleSuggestions.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="localities" className="mt-3">
            {renderSuggestionList(localitySuggestions, 'Mention locality names in your content')}
          </TabsContent>
          <TabsContent value="events" className="mt-3">
            {renderSuggestionList(eventSuggestions, 'No matching upcoming events found')}
          </TabsContent>
          <TabsContent value="categories" className="mt-3">
            {renderSuggestionList(categorySuggestions, 'No category keywords detected')}
          </TabsContent>
          <TabsContent value="articles" className="mt-3">
            {renderSuggestionList(articleSuggestions, 'No related articles found')}
          </TabsContent>
        </Tabs>

        {/* Quick locality dropdown */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Or manually add a locality link:</p>
          <ScrollArea className="h-24">
            <div className="flex flex-wrap gap-1">
              {localities?.slice(0, 20).map(loc => (
                <Badge
                  key={loc.id}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleInsertLink({
                    id: `quick-${loc.id}`,
                    type: 'locality',
                    name: loc.name,
                    slug: loc.slug,
                    url: `/locality/${loc.slug}`,
                    relevance: 0,
                  })}
                >
                  {loc.name}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

export default AutoLinkSuggester;
