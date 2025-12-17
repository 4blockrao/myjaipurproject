import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

interface NativeMobileHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showLogo?: boolean;
  backPath?: string;
  rightAction?: ReactNode;
  menuItems?: { label: string; onClick: () => void; icon?: ReactNode }[];
  transparent?: boolean;
  className?: string;
}

const NativeMobileHeader = ({
  title,
  subtitle,
  showBackButton = true,
  showLogo = false,
  backPath,
  rightAction,
  menuItems,
  transparent = false,
  className,
}: NativeMobileHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 safe-area-pt",
        transparent
          ? "bg-transparent"
          : "bg-background/95 backdrop-blur-md border-b border-border/50",
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left Section */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full shrink-0 -ml-2"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {showLogo && (
            <Link to="/" className="shrink-0">
              <img src={logo} alt="JaipurCircle" className="h-8 w-auto" />
            </Link>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-foreground truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 shrink-0">
          {rightAction}
          {menuItems && menuItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {menuItems.map((item, index) => (
                  <DropdownMenuItem key={index} onClick={item.onClick}>
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default NativeMobileHeader;
