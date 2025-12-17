import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface NewsInShortSummaryProps {
  article: {
    title: string;
    excerpt?: string | null;
    content: string;
    category: string;
    locality?: string | null;
    published_at?: string | null;
  };
}

/**
 * "In Short" AI-Friendly Summary Section
 * Bullet points optimized for AI assistants and Google Discover
 * Contains: What happened, Why it matters, Who is affected, What next
 */
export const NewsInShortSummary = ({ article }: NewsInShortSummaryProps) => {
  // Extract key points from content for structured summary
  const extractKeyPoints = () => {
    const content = article.content;
    const points: string[] = [];
    
    // Add excerpt as first point if available
    if (article.excerpt) {
      points.push(article.excerpt);
    }
    
    // Extract first meaningful paragraph as "What happened"
    const paragraphs = content.split('\n').filter(p => 
      p.trim() && 
      !p.startsWith('#') && 
      !p.startsWith('>') && 
      p.length > 50
    );
    
    if (paragraphs.length > 0 && !article.excerpt) {
      points.push(paragraphs[0].slice(0, 200).trim());
    }
    
    // Add location context
    if (article.locality) {
      points.push(`This development affects residents in ${article.locality}, Jaipur.`);
    }
    
    // Add category-specific context
    const categoryContext: Record<string, string> = {
      city: 'Stay updated on local civic developments.',
      events: 'Don\'t miss upcoming events in Jaipur.',
      food: 'Discover food trends in the Pink City.',
      culture: 'Explore the cultural heritage of Jaipur.',
      business: 'Track business developments in Rajasthan.',
      sports: 'Follow sports news from Jaipur.',
    };
    
    if (categoryContext[article.category]) {
      points.push(categoryContext[article.category]);
    }
    
    return points.slice(0, 4);
  };

  const keyPoints = extractKeyPoints();

  if (keyPoints.length === 0) return null;

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          In Short
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {keyPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span className="text-muted-foreground leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default NewsInShortSummary;
