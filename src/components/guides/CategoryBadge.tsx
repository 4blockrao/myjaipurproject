import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const CATEGORY_META: Record<string, { icon: string; label: string; className: string }> = {
  tickets: { icon: '🎟️', label: 'Tickets', className: 'bg-primary/10 text-primary border-primary/20' },
  stadium: { icon: '🏟️', label: 'Stadium', className: 'bg-jaipur-heritage/10 text-jaipur-heritage border-jaipur-heritage/20' },
  traffic: { icon: '🚗', label: 'Traffic', className: 'bg-jaipur-terracotta/10 text-jaipur-terracotta border-jaipur-terracotta/20' },
  preview: { icon: '👀', label: 'Preview', className: 'bg-accent/20 text-accent-foreground border-accent/30' },
  metro: { icon: '📍', label: 'Metro', className: 'bg-secondary text-secondary-foreground border-secondary' },
  food: { icon: '🍔', label: 'Food', className: 'bg-jaipur-gold/20 text-accent-foreground border-jaipur-gold/30' },
  general: { icon: '🏏', label: 'Guide', className: 'bg-muted text-muted-foreground border-border' },
};

interface CategoryBadgeProps {
  category?: string | null;
  articleType?: string | null;
  className?: string;
}

export default function CategoryBadge({ category, articleType, className }: CategoryBadgeProps) {
  if (articleType === 'pillar') {
    return (
      <Badge className={cn('border-primary bg-primary text-primary-foreground hover:bg-primary', className)}>
        ⭐ Ultimate Guide
      </Badge>
    );
  }

  const key = (category || 'general').toLowerCase();
  const meta = CATEGORY_META[key] || CATEGORY_META.general;

  return (
    <Badge variant="outline" className={cn(meta.className, className)}>
      <span aria-hidden="true">{meta.icon}</span>
      <span>{meta.label}</span>
    </Badge>
  );
}

export function getCategoryIcon(category?: string | null) {
  return CATEGORY_META[(category || 'general').toLowerCase()]?.icon || CATEGORY_META.general.icon;
}
