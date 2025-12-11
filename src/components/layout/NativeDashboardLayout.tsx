import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import StickyBottomNav from "@/components/home/StickyBottomNav";
import NativeMobileHeader from "./NativeMobileHeader";

interface NativeDashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backPath?: string;
  rightAction?: ReactNode;
  menuItems?: { label: string; onClick: () => void; icon?: ReactNode }[];
  showBottomNav?: boolean;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

const NativeDashboardLayout = ({
  children,
  title,
  subtitle,
  showBackButton = true,
  backPath,
  rightAction,
  menuItems,
  showBottomNav = true,
  className,
  contentClassName,
  noPadding = false,
}: NativeDashboardLayoutProps) => {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <NativeMobileHeader
        title={title}
        subtitle={subtitle}
        showBackButton={showBackButton}
        backPath={backPath}
        rightAction={rightAction}
        menuItems={menuItems}
      />
      
      <main
        className={cn(
          "pb-20", // Space for bottom nav
          !noPadding && "px-4 py-4",
          contentClassName
        )}
      >
        {children}
      </main>

      {showBottomNav && <StickyBottomNav />}
    </div>
  );
};

export default NativeDashboardLayout;
