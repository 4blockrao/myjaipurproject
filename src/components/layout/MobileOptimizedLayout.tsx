
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileOptimizedLayoutProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  padding?: "none" | "sm" | "md" | "lg";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const MobileOptimizedLayout = ({ 
  children, 
  className,
  containerClassName,
  padding = "md",
  maxWidth = "2xl"
}: MobileOptimizedLayoutProps) => {
  const paddingClasses = {
    none: "",
    sm: "p-2 sm:p-3",
    md: "p-3 sm:p-4",
    lg: "p-4 sm:p-6"
  };

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full"
  };

  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      <div className={cn(
        "mx-auto space-y-4 sm:space-y-6",
        paddingClasses[padding],
        maxWidthClasses[maxWidth],
        containerClassName
      )}>
        {children}
      </div>
    </div>
  );
};

export default MobileOptimizedLayout;
