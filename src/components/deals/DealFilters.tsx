import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface DealFilterCategory {
  id: string;
  label: string;
  emoji?: string;
}

interface DealFiltersProps {
  categories: DealFilterCategory[];
  selected: string;
  onSelect: (id: string) => void;
  sortOptions?: { id: string; label: string }[];
  selectedSort?: string;
  onSortChange?: (id: string) => void;
  className?: string;
}

export const DealFilters = ({
  categories,
  selected,
  onSelect,
  sortOptions,
  selectedSort,
  onSortChange,
  className,
}: DealFiltersProps) => {
  return (
    <div className={cn("space-y-2 border-b bg-background/95 backdrop-blur", className)}>
      <ScrollArea className="w-full">
        <div className="flex gap-2 px-4 py-3">
          {categories.map((c) => (
            <Button
              key={c.id}
              size="sm"
              variant={selected === c.id ? "default" : "outline"}
              onClick={() => onSelect(c.id)}
              className={cn(
                "shrink-0 gap-1.5 rounded-full",
                selected === c.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-background"
              )}
            >
              {c.emoji && <span>{c.emoji}</span>}
              <span>{c.label}</span>
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
      {sortOptions && sortOptions.length > 0 && onSortChange && (
        <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
          <span className="text-xs font-medium text-muted-foreground">Sort:</span>
          {sortOptions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSortChange(s.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                selectedSort === s.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DealFilters;