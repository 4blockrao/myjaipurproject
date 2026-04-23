import { useMemo } from 'react';
import { List } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
}

function extractHeadings(content: string): TocItem[] {
  if (!content) return [];
  const matches = [...content.matchAll(/<h2[^>]*id=["']([^"']+)["'][^>]*>(.*?)<\/h2>/gi)];
  const withIds = matches.map((match) => ({ id: match[1], text: match[2].replace(/<[^>]+>/g, '').trim() })).filter((item) => item.id && item.text);
  if (withIds.length) return withIds;

  return [...content.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)]
    .map((match) => {
      const text = match[1].replace(/<[^>]+>/g, '').trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return { id, text };
    })
    .filter((item) => item.id && item.text);
}

export default function TableOfContents({ content }: { content: string }) {
  const items = useMemo(() => extractHeadings(content), [content]);

  if (items.length < 2) return null;

  return (
    <aside className="rounded-2xl border border-border bg-card p-4 shadow-card lg:sticky lg:top-24">
      <div className="mb-3 flex items-center gap-2 font-bold text-foreground">
        <List className="h-4 w-4 text-primary" />
        Table of contents
      </div>
      <nav className="space-y-2">
        {items.map((item) => (
          <a key={item.id} href={`#${item.id}`} className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-primary">
            {item.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}
