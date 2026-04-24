import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  endDate: string | Date | null | undefined;
  variant?: "compact" | "hero" | "inline";
  className?: string;
  /** Show only when less than this many hours remain */
  urgentOnly?: boolean;
  urgentThresholdHours?: number;
}

function getParts(endDate: Date) {
  const diff = endDate.getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true, totalMs: 0 };
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, expired: false, totalMs: diff };
}

const pad = (n: number) => n.toString().padStart(2, "0");

export const CountdownTimer = ({
  endDate,
  variant = "compact",
  className,
  urgentOnly = false,
  urgentThresholdHours = 48,
}: CountdownTimerProps) => {
  const end = endDate ? new Date(endDate) : null;
  const [parts, setParts] = useState(end ? getParts(end) : null);

  useEffect(() => {
    if (!end) return;
    setParts(getParts(end));
    const t = setInterval(() => setParts(getParts(end)), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate]);

  if (!end || !parts) return null;
  if (parts.expired) {
    return (
      <span className={cn("text-xs font-medium text-muted-foreground", className)}>
        Expired
      </span>
    );
  }

  const hoursLeft = parts.totalMs / 3600000;
  if (urgentOnly && hoursLeft > urgentThresholdHours) return null;

  if (variant === "hero") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl bg-destructive px-4 py-3 text-destructive-foreground shadow-lg",
          className
        )}
      >
        <Clock className="h-5 w-5 animate-pulse" />
        <span className="text-sm font-medium uppercase tracking-wide">Ends in</span>
        <div className="ml-auto flex items-center gap-1.5 font-mono">
          {parts.d > 0 && (
            <>
              <TimeBlock value={parts.d} label="d" />
              <span className="opacity-70">:</span>
            </>
          )}
          <TimeBlock value={parts.h} label="h" />
          <span className="opacity-70">:</span>
          <TimeBlock value={parts.m} label="m" />
          <span className="opacity-70">:</span>
          <TimeBlock value={parts.s} label="s" />
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    const text =
      parts.d > 0
        ? `${parts.d}d ${pad(parts.h)}h left`
        : parts.h > 0
        ? `${parts.h}h ${pad(parts.m)}m left`
        : `${parts.m}m ${pad(parts.s)}s left`;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium",
          hoursLeft <= urgentThresholdHours ? "text-destructive" : "text-muted-foreground",
          className
        )}
      >
        <Clock className="h-3 w-3" />
        {text}
      </span>
    );
  }

  // compact
  const isUrgent = hoursLeft <= urgentThresholdHours;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold",
        isUrgent
          ? "bg-destructive text-destructive-foreground animate-pulse"
          : "bg-muted text-foreground",
        className
      )}
    >
      <Clock className="h-3 w-3" />
      {parts.d > 0
        ? `${parts.d}d ${pad(parts.h)}h`
        : `${pad(parts.h)}:${pad(parts.m)}:${pad(parts.s)}`}
    </div>
  );
};

const TimeBlock = ({ value, label }: { value: number; label: string }) => (
  <span className="flex items-baseline gap-0.5">
    <span className="text-base font-bold tabular-nums">{pad(value)}</span>
    <span className="text-[10px] opacity-80">{label}</span>
  </span>
);

export default CountdownTimer;