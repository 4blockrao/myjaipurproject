import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface NativeListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const NativeList = React.forwardRef<HTMLDivElement, NativeListProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-2xl bg-card border border-border/50 overflow-hidden divide-y divide-border/50", className)}
      {...props}
    >
      {children}
    </div>
  )
);
NativeList.displayName = "NativeList";

interface NativeListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  iconBg?: string;
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  showChevron?: boolean;
  pressable?: boolean;
}

const NativeListItem = React.forwardRef<HTMLDivElement, NativeListItemProps>(
  (
    {
      className,
      icon,
      iconBg = "bg-primary/10",
      title,
      subtitle,
      rightContent,
      showChevron = false,
      pressable = true,
      onClick,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 bg-card",
        pressable && "active:bg-muted/50 cursor-pointer transition-colors",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {icon && (
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>
        )}
      </div>
      {rightContent && <div className="shrink-0">{rightContent}</div>}
      {showChevron && (
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      )}
    </div>
  )
);
NativeListItem.displayName = "NativeListItem";

interface NativeListSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
}

const NativeListSection = React.forwardRef<HTMLDivElement, NativeListSectionProps>(
  ({ className, title, children, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props}>
      {title && (
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-2 mb-1">
          {title}
        </p>
      )}
      <NativeList>{children}</NativeList>
    </div>
  )
);
NativeListSection.displayName = "NativeListSection";

export { NativeList, NativeListItem, NativeListSection };
