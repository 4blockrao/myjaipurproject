import { useState } from 'react';
import ArticleManager from './ArticleManager';
import ArticleEditor from './ArticleEditor';

type View = 'list' | 'create' | 'edit';

export function ArticleCMS() {
  const [view, setView] = useState<View>('list');
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  const handleCreateNew = () => {
    setEditingArticleId(null);
    setView('create');
  };

  const handleEdit = (articleId: string) => {
    setEditingArticleId(articleId);
    setView('edit');
  };

  const handleBack = () => {
    setView('list');
    setEditingArticleId(null);
  };

  if (view === 'create' || view === 'edit') {
    return (
      <ArticleEditor
        articleId={editingArticleId || undefined}
        onBack={handleBack}
      />
    );
  }

  return (
    <ArticleManager
      onCreateNew={handleCreateNew}
      onEdit={handleEdit}
    />
  );
}

export default ArticleCMS;
