import React, { ReactNode } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  threshold?: number;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  className,
  threshold = 80
}) => {
  const { t } = useLanguage();
  const { isPulling, isRefreshing, pullDistance, pullProgress, handlers } = usePullToRefresh({
    onRefresh,
    threshold
  });

  const shouldTrigger = pullProgress >= 1;

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      {...handlers}
    >
      {/* Pull indicator */}
      <div 
        className={cn(
          "absolute left-0 right-0 flex flex-col items-center justify-center transition-opacity duration-200 z-50",
          (isPulling || isRefreshing) ? "opacity-100" : "opacity-0"
        )}
        style={{ 
          top: -60 + pullDistance,
          height: 60
        }}
      >
        <div className={cn(
          "flex flex-col items-center gap-1 p-2 rounded-full bg-background/95 shadow-lg border border-border/50 backdrop-blur-sm",
          "transition-all duration-200"
        )}>
          {isRefreshing ? (
            <>
              <RefreshCw className="w-5 h-5 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">
                {t('common.refreshing')}
              </span>
            </>
          ) : (
            <>
              <div 
                className="transition-transform duration-200"
                style={{ 
                  transform: `rotate(${shouldTrigger ? 180 : 0}deg)` 
                }}
              >
                <ChevronDown className={cn(
                  "w-5 h-5",
                  shouldTrigger ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <span className="text-xs text-muted-foreground">
                {shouldTrigger 
                  ? t('common.releaseToRefresh') 
                  : t('common.pullToRefresh')
                }
              </span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div 
        style={{ 
          transform: `translateY(${isRefreshing ? 60 : pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export { PullToRefresh };
export default PullToRefresh;
