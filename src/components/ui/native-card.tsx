import * as React from "react";
import { cn } from "@/lib/utils";

interface NativeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "filled";
  padding?: "none" | "sm" | "md" | "lg";
  pressable?: boolean;
}

const NativeCard = React.forwardRef<HTMLDivElement, NativeCardProps>(
  ({ className, variant = "default", padding = "md", pressable = false, children, ...props }, ref) => {
    const variants = {
      default: "bg-card border border-border/50 shadow-sm",
      elevated: "bg-card shadow-lg shadow-black/5",
      outlined: "bg-transparent border-2 border-border",
      filled: "bg-muted/50",
    };

    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-5",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-200",
          variants[variant],
          paddings[padding],
          pressable && "active:scale-[0.98] cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
NativeCard.displayName = "NativeCard";

interface NativeCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const NativeCardHeader = React.forwardRef<HTMLDivElement, NativeCardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 pb-3", className)}
      {...props}
    />
  )
);
NativeCardHeader.displayName = "NativeCardHeader";

interface NativeCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const NativeCardTitle = React.forwardRef<HTMLParagraphElement, NativeCardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-base font-semibold leading-tight tracking-tight", className)}
      {...props}
    />
  )
);
NativeCardTitle.displayName = "NativeCardTitle";

interface NativeCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const NativeCardDescription = React.forwardRef<HTMLParagraphElement, NativeCardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
NativeCardDescription.displayName = "NativeCardDescription";

interface NativeCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const NativeCardContent = React.forwardRef<HTMLDivElement, NativeCardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
NativeCardContent.displayName = "NativeCardContent";

export {
  NativeCard,
  NativeCardHeader,
  NativeCardTitle,
  NativeCardDescription,
  NativeCardContent,
};
