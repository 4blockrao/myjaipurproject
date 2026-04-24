import { useEffect, useMemo, useState } from "react";
import { Eye, ShoppingBag, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialProofCounterProps {
  dealId: string;
  /** Real "bought in last 24h" count from deal_purchases (optional) */
  recentPurchases?: number;
  variant?: "stack" | "inline";
  className?: string;
}

/**
 * Deterministic seeded random based on dealId so each deal gets a stable,
 * believable viewer count rather than a number that jumps on every render.
 */
function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SocialProofCounter = ({
  dealId,
  recentPurchases,
  variant = "stack",
  className,
}: SocialProofCounterProps) => {
  const rand = useMemo(() => seededRandom(dealId), [dealId]);
  const baseViewers = useMemo(() => 5 + Math.floor(rand() * 46), [rand]);
  const [viewers, setViewers] = useState(baseViewers);

  // Gentle ±2 fluctuation every 5–9 seconds
  useEffect(() => {
    const tick = () => {
      setViewers((v) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = v + delta;
        return Math.max(5, Math.min(50, next));
      });
    };
    const id = setInterval(tick, 5000 + Math.floor(Math.random() * 4000));
    return () => clearInterval(id);
  }, []);

  const purchases =
    typeof recentPurchases === "number" && recentPurchases > 0
      ? recentPurchases
      : null;

  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-xs", className)}>
        <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium">
          <Eye className="h-3 w-3" />
          {viewers} viewing
        </span>
        {purchases !== null && (
          <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
            <ShoppingBag className="h-3 w-3" />
            {purchases} bought 24h
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 px-3 py-2 text-sm">
        <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <span className="font-medium text-orange-700 dark:text-orange-300">
          🔥 {viewers} people are viewing this right now
        </span>
      </div>
      {purchases !== null && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/30 px-3 py-2 text-sm">
          <ShoppingBag className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="font-medium text-green-700 dark:text-green-300">
            ✅ {purchases} bought in the last 24 hours
          </span>
        </div>
      )}
    </div>
  );
};

export default SocialProofCounter;