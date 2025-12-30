import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { 
  Plus, Search, MoreHorizontal, Eye, Edit, Trash2, 
  FileText, Clock, CheckCircle, AlertCircle, Star, ExternalLink 
} from 'lucide-react';

interface ArticleManagerProps {
  onCreateNew: () => void;
  onEdit: (articleId: string) => void;
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: FileText },
  published: { label: 'Published', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  scheduled: { label: 'Scheduled', color: 'bg-blue-500/10 text-blue-600', icon: Clock },
  archived: { label: 'Archived', color: 'bg-orange-500/10 text-orange-600', icon: AlertCircle },
};

const categoryConfig: Record<string, { label: string; emoji: string }> = {
  city: { label: 'City News', emoji: '🏛️' },
  events: { label: 'Events', emoji: '🎉' },
  food: { label: 'Food & Dining', emoji: '🍽️' },
  culture: { label: 'Culture & Heritage', emoji: '🎭' },
  business: { label: 'Business', emoji: '💼' },
  sports: { label: 'Sports', emoji: '⚽' },
};

export function ArticleManager({ onCreateNew, onEdit }: ArticleManagerProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteArticleId, setDeleteArticleId] = useState<string | null>(null);

  const { data: articles, isLoading } = useQuery({
    queryKey: ['admin-articles', searchQuery, statusFilter, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as 'draft' | 'published' | 'archived');
      }
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter as 'city' | 'events' | 'food' | 'culture' | 'business' | 'sports');
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success('Article deleted successfully');
      setDeleteArticleId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete article');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: any = { status };
      if (status === 'published') {
        updateData.published_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from('news_articles')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success('Article status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      const { error } = await supabase
        .from('news_articles')
        .update({ is_featured: isFeatured })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success('Featured status updated');
    },
  });

  const stats = {
    total: articles?.length || 0,
    published: articles?.filter(a => a.status === 'published').length || 0,
    drafts: articles?.filter(a => a.status === 'draft').length || 0,
    featured: articles?.filter(a => a.is_featured).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.drafts}</div>
            <p className="text-sm text-muted-foreground">Drafts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.featured}</div>
            <p className="text-sm text-muted-foreground">Featured</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Articles</CardTitle>
              <CardDescription>Manage all news articles and content</CardDescription>
            </div>
            <Button onClick={onCreateNew} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Create Article
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.emoji} {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Articles Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : articles?.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-4">Create your first article to get started</p>
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Article
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[300px]">Article</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles?.map((article) => {
                    const status = statusConfig[article.status as keyof typeof statusConfig] || statusConfig.draft;
                    const category = categoryConfig[article.category] || { label: article.category, emoji: '📰' };
                    
                    return (
                      <TableRow key={article.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            {article.cover_image ? (
                              <img 
                                src={article.cover_image} 
                                alt="" 
                                className="w-16 h-12 object-cover rounded-md shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-12 bg-muted rounded-md flex items-center justify-center shrink-0">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm line-clamp-1">{article.title}</span>
                                {article.is_featured && (
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {article.excerpt || article.content.slice(0, 80)}...
                              </p>
                              {article.locality && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {article.locality}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {category.emoji} {category.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${status.color}`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {article.view_count || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(article.updated_at || article.created_at), { addSuffix: true })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEdit(article.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => window.open(`/news/${article.category}/${article.slug}`, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Live
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => toggleFeaturedMutation.mutate({ id: article.id, isFeatured: !article.is_featured })}
                              >
                                <Star className="h-4 w-4 mr-2" />
                                {article.is_featured ? 'Unfeature' : 'Feature'}
                              </DropdownMenuItem>
                              {article.status === 'draft' && (
                                <DropdownMenuItem 
                                  onClick={() => updateStatusMutation.mutate({ id: article.id, status: 'published' })}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Publish
                                </DropdownMenuItem>
                              )}
                              {article.status === 'published' && (
                                <DropdownMenuItem 
                                  onClick={() => updateStatusMutation.mutate({ id: article.id, status: 'draft' })}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Unpublish
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => setDeleteArticleId(article.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteArticleId} onOpenChange={() => setDeleteArticleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the article and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteArticleId && deleteMutation.mutate(deleteArticleId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ArticleManager;
