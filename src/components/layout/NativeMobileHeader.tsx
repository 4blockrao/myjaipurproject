import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Menu, Home, Tag, Calendar, BookOpen, Newspaper, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

  const navLinks = [
    { label: "Home", path: "/", icon: <Home className="h-4 w-4" /> },
    { label: "Deals", path: "/deals", icon: <Tag className="h-4 w-4" /> },
    { label: "Events", path: "/events", icon: <Calendar className="h-4 w-4" /> },
    { label: "Guides", path: "/guides", icon: <BookOpen className="h-4 w-4" /> },
    { label: "News", path: "/news", icon: <Newspaper className="h-4 w-4" /> },
    { label: "Localities", path: "/localities", icon: <MapPin className="h-4 w-4" /> },
  ];

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
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {/* Always-visible logo so users can return Home from any page */}
          <Link to="/" className="shrink-0 flex items-center gap-2" aria-label="JaipurCircle home">
            <img src={logo} alt="JaipurCircle" className="h-8 w-auto" />
          </Link>
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
          {/* Desktop inline nav */}
          <nav className="hidden md:flex items-center gap-1 mr-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-md hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {rightAction}
          {/* Universal nav menu (always visible on mobile, fallback on desktop) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navLinks.map((link) => (
                <DropdownMenuItem
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="cursor-pointer"
                >
                  <span className="mr-2 text-muted-foreground">{link.icon}</span>
                  {link.label}
                </DropdownMenuItem>
              ))}
              {menuItems && menuItems.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  {menuItems.map((item, index) => (
                    <DropdownMenuItem key={`extra-${index}`} onClick={item.onClick}>
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {menuItems && menuItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hidden md:inline-flex">
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
