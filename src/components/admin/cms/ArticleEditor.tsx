import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Loader2, Sparkles, Send, Save, ArrowLeft, Eye, 
  FileText, Settings, Link2, Image as ImageIcon
} from 'lucide-react';
import SEOAnalyzer from './SEOAnalyzer';
import AutoLinkSuggester from './AutoLinkSuggester';

interface ArticleEditorProps {
  articleId?: string;
  onBack: () => void;
}

const categories = [
  { id: 'city', label: 'City News', emoji: '🏛️' },
  { id: 'events', label: 'Events', emoji: '🎉' },
  { id: 'food', label: 'Food & Dining', emoji: '🍽️' },
  { id: 'culture', label: 'Culture & Heritage', emoji: '🎭' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
];

export function ArticleEditor({ articleId, onBack }: ArticleEditorProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('city');
  const [locality, setLocality] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // AI generation state
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch localities for dropdown
  const { data: localities } = useQuery({
    queryKey: ['localities-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('localities')
        .select('name, slug')
        .order('name')
        .limit(100);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  // Fetch existing article if editing
  const { data: existingArticle, isLoading: isLoadingArticle } = useQuery({
    queryKey: ['article-edit', articleId],
    queryFn: async () => {
      if (!articleId) return null;
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', articleId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!articleId,
  });

  // Populate form when editing
  useEffect(() => {
    if (existingArticle) {
      setTitle(existingArticle.title || '');
      setExcerpt(existingArticle.excerpt || '');
      setContent(existingArticle.content || '');
      setCoverImage(existingArticle.cover_image || '');
      setCategory(existingArticle.category || 'city');
      setLocality(existingArticle.locality || '');
      setTags(existingArticle.tags || []);
      setMetaTitle(existingArticle.meta_title || '');
      setMetaDescription(existingArticle.meta_description || '');
      setIsFeatured(existingArticle.is_featured || false);
      setIsAiGenerated(existingArticle.is_ai_generated || false);
      setAiPrompt(existingArticle.ai_prompt || '');
    }
  }, [existingArticle]);

  // AI Article Generation
  const generateArticle = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a topic for AI generation');
      return;
    }

    setIsGenerating(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        toast.error('Please log in to generate articles');
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-news-article', {
        body: { topic: aiPrompt, category, locality },
      });

      if (error) throw error;

      setTitle(data.title || aiPrompt);
      setExcerpt(data.excerpt || '');
      setContent(data.content || '');
      setMetaTitle(data.meta_title || data.title || '');
      setMetaDescription(data.meta_description || data.excerpt || '');
      setTags(data.suggested_tags || data.meta_keywords || []);
      setIsAiGenerated(true);

      toast.success('Article generated! Review and edit as needed.');
    } catch (error: any) {
      console.error('Error generating article:', error);
      toast.error(error.message || 'Failed to generate article');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save/Publish mutation
  const saveMutation = useMutation({
    mutationFn: async (status: 'draft' | 'published') => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('Please log in to save articles');
      }

      // Generate slug from title if new article
      let slug = existingArticle?.slug;
      if (!slug) {
        const baseSlug = title.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50);
        slug = `${baseSlug}-${Date.now()}`;
      }

      const articleData = {
        author_id: session.session.user.id,
        title,
        slug,
        excerpt: excerpt || null,
        content,
        cover_image: coverImage || null,
        category: category as any,
        locality: locality || null,
        tags,
        meta_title: metaTitle || title,
        meta_description: metaDescription || excerpt || content.slice(0, 160),
        meta_keywords: tags,
        status,
        is_featured: isFeatured,
        is_ai_generated: isAiGenerated,
        ai_prompt: aiPrompt || null,
        published_at: status === 'published' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
        structured_data: {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": title,
          "description": excerpt || metaDescription,
          "author": { "@type": "Organization", "name": "JaipurCircle" },
          "publisher": { "@type": "Organization", "name": "JaipurCircle", "url": "https://jaipurcircle.com" },
          "datePublished": new Date().toISOString(),
        }
      };

      if (articleId) {
        // Update existing
        const { data, error } = await supabase
          .from('news_articles')
          .update(articleData)
          .eq('id', articleId)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('news_articles')
          .insert(articleData)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data, status) => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['article-edit', articleId] });
      toast.success(status === 'published' ? 'Article published!' : 'Draft saved!');
      onBack();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save article');
    },
  });

  // Tag management
  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Insert link at cursor position
  const handleInsertLink = (markdown: string) => {
    if (contentRef.current) {
      const start = contentRef.current.selectionStart;
      const end = contentRef.current.selectionEnd;
      const newContent = content.slice(0, start) + markdown + content.slice(end);
      setContent(newContent);
      // Focus and set cursor after inserted text
      setTimeout(() => {
        contentRef.current?.focus();
        contentRef.current?.setSelectionRange(start + markdown.length, start + markdown.length);
      }, 0);
    } else {
      setContent(content + '\n' + markdown);
    }
  };

  if (isLoadingArticle) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">{articleId ? 'Edit Article' : 'Create Article'}</h2>
            <p className="text-sm text-muted-foreground">
              {articleId ? 'Update your article' : 'Write and publish a new article'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(`/news/${category}/${existingArticle?.slug || 'preview'}`, '_blank')}
            disabled={!existingArticle?.slug}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Editor - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Generator Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Article Generator
              </CardTitle>
              <CardDescription>
                Describe your topic and let AI write a draft
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., New metro line opening in Mansarovar..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && generateArticle()}
                />
                <Button onClick={generateArticle} disabled={isGenerating || !aiPrompt.trim()}>
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Card>
            <Tabs defaultValue="content" className="w-full">
              <CardHeader className="pb-0">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="media" className="gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Media
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="gap-2">
                    <Settings className="h-4 w-4" />
                    SEO
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-6">
                <TabsContent value="content" className="space-y-4 mt-0">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Article headline"
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {title.length}/60 characters {title.length > 60 && '(too long)'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category *</Label>
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
                      <Label>Locality</Label>
                      <Select value={locality} onValueChange={setLocality}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select area" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {localities?.map((loc) => (
                            <SelectItem key={loc.slug} value={loc.name}>
                              {loc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Excerpt</Label>
                    <Textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Brief summary for previews and social sharing"
                      rows={2}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label>Content * (Markdown supported)</Label>
                    <Textarea
                      ref={contentRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your article content here... Use ## for headings, **bold**, *italic*, [links](url)"
                      rows={16}
                      className="mt-1.5 font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {content.split(/\s+/).filter(Boolean).length} words
                    </p>
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
                </TabsContent>

                <TabsContent value="media" className="space-y-4 mt-0">
                  <div>
                    <Label>Cover Image URL</Label>
                    <Input
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="mt-1.5"
                    />
                    {coverImage && (
                      <div className="mt-3">
                        <img
                          src={coverImage}
                          alt="Cover preview"
                          className="w-full max-w-md h-48 object-cover rounded-lg border"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <Label>Featured Article</Label>
                      <p className="text-xs text-muted-foreground">Show prominently on homepage</p>
                    </div>
                    <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4 mt-0">
                  <div>
                    <Label>Meta Title</Label>
                    <Input
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="SEO title (defaults to article title)"
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(metaTitle || title).length}/60 characters
                    </p>
                  </div>

                  <div>
                    <Label>Meta Description</Label>
                    <Textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="SEO description (defaults to excerpt)"
                      rows={3}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(metaDescription || excerpt).length}/160 characters
                    </p>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Search Preview</h4>
                    <div className="space-y-1">
                      <p className="text-primary text-sm font-medium truncate">
                        {metaTitle || title || 'Article Title'} | JaipurCircle
                      </p>
                      <p className="text-xs text-green-600">
                        jaipurcircle.com/news/{category}/...
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {metaDescription || excerpt || 'Article description will appear here...'}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 sticky bottom-4 bg-background/95 backdrop-blur p-4 rounded-lg border shadow-lg">
            <Button
              variant="outline"
              onClick={() => saveMutation.mutate('draft')}
              disabled={saveMutation.isPending || !title.trim() || !content.trim()}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={() => saveMutation.mutate('published')}
              disabled={saveMutation.isPending || !title.trim() || !content.trim()}
              className="flex-1"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Publish
            </Button>
          </div>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* SEO Analyzer */}
          <SEOAnalyzer
            title={title}
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            content={content}
            excerpt={excerpt}
            tags={tags}
            locality={locality}
            category={category}
          />

          {/* Auto Link Suggester */}
          <AutoLinkSuggester
            content={content}
            category={category}
            locality={locality}
            onInsertLink={handleInsertLink}
          />
        </div>
      </div>
    </div>
  );
}

export default ArticleEditor;
