import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Sparkles, Send, Eye, Save } from 'lucide-react';

const categories = [
  { id: 'city', label: 'City News', emoji: '🏛️' },
  { id: 'events', label: 'Events', emoji: '🎉' },
  { id: 'food', label: 'Food & Dining', emoji: '🍽️' },
  { id: 'culture', label: 'Culture & Heritage', emoji: '🎭' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
];

const localities = [
  'Malviya Nagar', 'Vaishali Nagar', 'C-Scheme', 'Raja Park', 'Mansarovar',
  'Jagatpura', 'Tonk Road', 'Sodala', 'Sanganer', 'Sitapura',
  'MI Road', 'Bani Park', 'Jhotwara', 'Vidhyadhar Nagar', 'Pratap Nagar',
];

export function CreateNewsArticle() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('city');
  const [locality, setLocality] = useState('');
  
  // Article form state
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const generateArticle = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        toast.error('Please log in to create articles');
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-news-article', {
        body: { topic, category, locality },
      });

      if (error) throw error;

      // Populate form with generated content
      setTitle(data.title || topic);
      setExcerpt(data.excerpt || '');
      setContent(data.content || '');
      setMetaTitle(data.meta_title || data.title || '');
      setMetaDescription(data.meta_description || data.excerpt || '');
      setTags(data.suggested_tags || data.meta_keywords || []);
      setShowForm(true);
      
      toast.success('Article generated! Review and publish.');
    } catch (error: any) {
      console.error('Error generating article:', error);
      toast.error(error.message || 'Failed to generate article');
    } finally {
      setIsGenerating(false);
    }
  };

  const publishMutation = useMutation({
    mutationFn: async (status: 'draft' | 'published') => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('Please log in to publish articles');
      }

      // Generate slug from title
      const baseSlug = title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      const slug = `${baseSlug}-${Date.now()}`;

      const articleData = {
        author_id: session.session.user.id,
        title,
        slug,
        excerpt,
        content,
        cover_image: coverImage || null,
        category: category as any,
        locality: locality || null,
        tags,
        meta_title: metaTitle || title,
        meta_description: metaDescription || excerpt,
        meta_keywords: tags,
        status,
        is_ai_generated: true,
        ai_prompt: topic,
        published_at: status === 'published' ? new Date().toISOString() : null,
        structured_data: {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": title,
          "description": excerpt,
          "author": {
            "@type": "Person",
            "name": "JaipurCircle Contributor"
          },
          "publisher": {
            "@type": "Organization",
            "name": "JaipurCircle",
            "url": "https://jaipurcircle.com"
          },
          "datePublished": new Date().toISOString(),
          "mainEntityOfPage": {
            "@type": "WebPage"
          }
        }
      };

      const { data, error } = await supabase
        .from('news_articles')
        .insert(articleData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, status) => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      queryClient.invalidateQueries({ queryKey: ['home-news-articles'] });
      toast.success(status === 'published' ? 'Article published!' : 'Draft saved!');
      navigate(`/news/${data.slug}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to publish article');
    },
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24 space-y-6">
      {/* AI Generation Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Article Generator
          </CardTitle>
          <CardDescription>
            Describe your news topic and let AI write a professional article for Jaipur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>What's the news about?</Label>
            <Textarea
              placeholder="e.g., New metro line opening in Mansarovar, Famous street food vendor in Johari Bazaar, Upcoming Teej festival celebrations..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              className="mt-1.5"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Locality (Optional)</Label>
              <Select value={locality} onValueChange={setLocality}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {localities.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateArticle} 
            disabled={isGenerating || !topic.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Article...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Article with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Article Editor */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Edit & Publish</CardTitle>
            <CardDescription>Review the generated content and make any edits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article headline"
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">{title.length}/60 characters</p>
            </div>

            <div>
              <Label>Excerpt</Label>
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary for previews"
                rows={2}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Content</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Full article content (supports markdown)"
                rows={12}
                className="mt-1.5 font-mono text-sm"
              />
            </div>

            <div>
              <Label>Cover Image URL (Optional)</Label>
              <Input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>Add</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* SEO Fields */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">SEO Settings</h4>
              <div className="space-y-3">
                <div>
                  <Label>Meta Title</Label>
                  <Input
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="SEO title"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{metaTitle.length}/60 characters</p>
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="SEO description"
                    rows={2}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{metaDescription.length}/160 characters</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => publishMutation.mutate('draft')}
                disabled={publishMutation.isPending || !title.trim() || !content.trim()}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={() => publishMutation.mutate('published')}
                disabled={publishMutation.isPending || !title.trim() || !content.trim()}
                className="flex-1"
              >
                {publishMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Publish
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
