import { cn } from "@/lib/utils";

interface ProgressBarProps {
  sold: number;
  total: number;
  /** Hide the helper label below the bar */
  hideLabel?: boolean;
  className?: string;
}

export const ProgressBar = ({ sold, total, hideLabel, className }: ProgressBarProps) => {
  if (!total || total <= 0) return null;
  const pct = Math.min(100, Math.max(0, Math.round((sold / total) * 100)));
  const remaining = Math.max(0, total - sold);
  const isHot = pct >= 70;
  const isAlmostGone = pct >= 90;

  return (
    <div className={cn("w-full", className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isAlmostGone
              ? "bg-destructive"
              : isHot
              ? "bg-orange-500"
              : "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!hideLabel && (
        <div className="mt-1 flex items-center justify-between text-[11px]">
          <span
            className={cn(
              "font-medium",
              isAlmostGone
                ? "text-destructive"
                : isHot
                ? "text-orange-600"
                : "text-muted-foreground"
            )}
          >
            {sold} sold
          </span>
          <span
            className={cn(
              "font-semibold",
              remaining < 20 ? "text-destructive" : "text-muted-foreground"
            )}
          >
            Only {remaining} left
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;