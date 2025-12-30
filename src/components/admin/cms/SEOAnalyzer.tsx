import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, AlertTriangle } from 'lucide-react';

interface SEOAnalyzerProps {
  title: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  excerpt: string;
  tags: string[];
  locality?: string;
  category: string;
}

interface SEOCheck {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export function SEOAnalyzer({
  title,
  metaTitle,
  metaDescription,
  content,
  excerpt,
  tags,
  locality,
  category,
}: SEOAnalyzerProps) {
  const checks = useMemo<SEOCheck[]>(() => {
    const results: SEOCheck[] = [];

    // Title checks
    if (title.length === 0) {
      results.push({ id: 'title-missing', label: 'Title', status: 'fail', message: 'Title is required', priority: 'high' });
    } else if (title.length < 30) {
      results.push({ id: 'title-short', label: 'Title Length', status: 'warn', message: `Title is short (${title.length}/30+ chars)`, priority: 'medium' });
    } else if (title.length > 60) {
      results.push({ id: 'title-long', label: 'Title Length', status: 'warn', message: `Title is long (${title.length}/60 chars max)`, priority: 'medium' });
    } else {
      results.push({ id: 'title-ok', label: 'Title Length', status: 'pass', message: `Good length (${title.length} chars)`, priority: 'low' });
    }

    // Meta title checks
    if (!metaTitle) {
      results.push({ id: 'meta-title-missing', label: 'Meta Title', status: 'warn', message: 'Add a custom meta title for SEO', priority: 'medium' });
    } else if (metaTitle.length > 60) {
      results.push({ id: 'meta-title-long', label: 'Meta Title', status: 'warn', message: `Meta title is long (${metaTitle.length}/60 chars)`, priority: 'medium' });
    } else {
      results.push({ id: 'meta-title-ok', label: 'Meta Title', status: 'pass', message: 'Meta title is set', priority: 'low' });
    }

    // Meta description checks
    if (!metaDescription) {
      results.push({ id: 'meta-desc-missing', label: 'Meta Description', status: 'fail', message: 'Meta description is critical for CTR', priority: 'high' });
    } else if (metaDescription.length < 120) {
      results.push({ id: 'meta-desc-short', label: 'Meta Description', status: 'warn', message: `Too short (${metaDescription.length}/120+ chars)`, priority: 'medium' });
    } else if (metaDescription.length > 160) {
      results.push({ id: 'meta-desc-long', label: 'Meta Description', status: 'warn', message: `Too long (${metaDescription.length}/160 chars)`, priority: 'low' });
    } else {
      results.push({ id: 'meta-desc-ok', label: 'Meta Description', status: 'pass', message: `Good length (${metaDescription.length} chars)`, priority: 'low' });
    }

    // Content checks
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    if (wordCount < 100) {
      results.push({ id: 'content-short', label: 'Content Length', status: 'fail', message: `Only ${wordCount} words. Aim for 500+`, priority: 'high' });
    } else if (wordCount < 300) {
      results.push({ id: 'content-medium', label: 'Content Length', status: 'warn', message: `${wordCount} words. Aim for 500+`, priority: 'medium' });
    } else if (wordCount < 500) {
      results.push({ id: 'content-ok', label: 'Content Length', status: 'warn', message: `${wordCount} words. Good, but 500+ is ideal`, priority: 'low' });
    } else {
      results.push({ id: 'content-great', label: 'Content Length', status: 'pass', message: `${wordCount} words. Great depth!`, priority: 'low' });
    }

    // Heading structure (check for markdown headings)
    const hasH2 = /^##\s/m.test(content);
    if (!hasH2) {
      results.push({ id: 'headings-missing', label: 'Content Structure', status: 'warn', message: 'Add ## headings to structure content', priority: 'medium' });
    } else {
      results.push({ id: 'headings-ok', label: 'Content Structure', status: 'pass', message: 'Content has proper headings', priority: 'low' });
    }

    // Excerpt check
    if (!excerpt) {
      results.push({ id: 'excerpt-missing', label: 'Excerpt', status: 'warn', message: 'Add an excerpt for better previews', priority: 'medium' });
    } else {
      results.push({ id: 'excerpt-ok', label: 'Excerpt', status: 'pass', message: 'Excerpt is set', priority: 'low' });
    }

    // Tags check
    if (tags.length === 0) {
      results.push({ id: 'tags-missing', label: 'Tags', status: 'warn', message: 'Add tags for discoverability', priority: 'medium' });
    } else if (tags.length < 3) {
      results.push({ id: 'tags-few', label: 'Tags', status: 'warn', message: `Only ${tags.length} tags. Add 3-5 for best results`, priority: 'low' });
    } else {
      results.push({ id: 'tags-ok', label: 'Tags', status: 'pass', message: `${tags.length} tags added`, priority: 'low' });
    }

    // Locality check (good for local SEO)
    if (!locality) {
      results.push({ id: 'locality-missing', label: 'Locality', status: 'warn', message: 'Add locality for local SEO boost', priority: 'medium' });
    } else {
      results.push({ id: 'locality-ok', label: 'Locality', status: 'pass', message: `Targeting ${locality}`, priority: 'low' });
    }

    // Internal linking check
    const hasInternalLinks = content.includes('/news/') || content.includes('/events/') || content.includes('/locality/');
    if (!hasInternalLinks) {
      results.push({ id: 'links-missing', label: 'Internal Links', status: 'warn', message: 'Add internal links to boost SEO', priority: 'medium' });
    } else {
      results.push({ id: 'links-ok', label: 'Internal Links', status: 'pass', message: 'Has internal links', priority: 'low' });
    }

    // Category-keyword in title
    const categoryKeywords: Record<string, string[]> = {
      city: ['jaipur', 'city', 'news', 'update'],
      events: ['event', 'show', 'concert', 'festival'],
      food: ['food', 'restaurant', 'cafe', 'dining'],
      culture: ['culture', 'heritage', 'art', 'tradition'],
      business: ['business', 'startup', 'company', 'market'],
      sports: ['sports', 'cricket', 'match', 'tournament'],
    };
    const keywords = categoryKeywords[category] || [];
    const titleLower = title.toLowerCase();
    const hasKeyword = keywords.some(k => titleLower.includes(k)) || titleLower.includes('jaipur');
    if (!hasKeyword) {
      results.push({ id: 'keyword-missing', label: 'Target Keyword', status: 'warn', message: 'Consider adding Jaipur or category keyword', priority: 'medium' });
    } else {
      results.push({ id: 'keyword-ok', label: 'Target Keyword', status: 'pass', message: 'Title includes target keyword', priority: 'low' });
    }

    return results;
  }, [title, metaTitle, metaDescription, content, excerpt, tags, locality, category]);

  const score = useMemo(() => {
    const passed = checks.filter(c => c.status === 'pass').length;
    const total = checks.length;
    return Math.round((passed / total) * 100);
  }, [checks]);

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: SEOCheck['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const failChecks = checks.filter(c => c.status === 'fail');
  const warnChecks = checks.filter(c => c.status === 'warn');
  const passChecks = checks.filter(c => c.status === 'pass');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">SEO Analysis</CardTitle>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getScoreColor()}`}>{score}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        </div>
        <Progress value={score} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Critical Issues */}
        {failChecks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Critical Issues ({failChecks.length})
            </h4>
            <div className="space-y-2">
              {failChecks.map(check => (
                <div key={check.id} className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950/20 p-2 rounded">
                  {getStatusIcon(check.status)}
                  <div>
                    <span className="font-medium">{check.label}:</span>
                    <span className="text-muted-foreground ml-1">{check.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {warnChecks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-yellow-600 mb-2 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Improvements ({warnChecks.length})
            </h4>
            <div className="space-y-2">
              {warnChecks.map(check => (
                <div key={check.id} className="flex items-start gap-2 text-sm bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                  {getStatusIcon(check.status)}
                  <div>
                    <span className="font-medium">{check.label}:</span>
                    <span className="text-muted-foreground ml-1">{check.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Passed Checks */}
        {passChecks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Passed ({passChecks.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {passChecks.map(check => (
                <Badge key={check.id} variant="outline" className="text-xs text-green-600">
                  {check.label} ✓
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SEOAnalyzer;
