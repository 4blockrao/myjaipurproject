import { MapPin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocalityBadgeProps {
  localityName: string;
  onClick: () => void;
  variant?: "header" | "inline";
  className?: string;
}

export const LocalityBadge = ({
  localityName,
  onClick,
  variant = "inline",
  className,
}: LocalityBadgeProps) => {
  if (variant === "header") {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-medium text-primary",
          className
        )}
      >
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        <span className="max-w-[90px] truncate">{localityName}</span>
        <ChevronDown className="w-3.5 h-3.5 shrink-0" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors text-xs font-medium text-muted-foreground",
        className
      )}
    >
      <MapPin className="w-3 h-3" />
      <span>{localityName}</span>
      <ChevronDown className="w-3 h-3" />
    </button>
  );
};
