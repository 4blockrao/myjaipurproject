import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readOnly?: boolean;
  className?: string;
}

/** Display or interactive 1–5 star rating. Pass onChange for input mode. */
export function StarRating({ value, onChange, size = 20, readOnly = false, className }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role={readOnly ? "img" : "radiogroup"}
      aria-label={readOnly ? `Rated ${value} out of 5` : "Select a rating"}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={readOnly}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          className={cn(
            "rounded transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
          )}
          onMouseEnter={() => !readOnly && setHover(i)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange?.(i)}
        >
          <Star
            style={{ width: size, height: size }}
            className={cn(
              i <= active ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground/40"
            )}
          />
        </button>
      ))}
    </div>
  );
}
