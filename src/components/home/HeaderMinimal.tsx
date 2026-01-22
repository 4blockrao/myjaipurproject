import { User, Search, Bell, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import JaipurCircleLogo from "@/components/ui/JaipurCircleLogo";
import { Badge } from "@/components/ui/badge";

interface HeaderMinimalProps {
  isAuthenticated?: boolean;
  onSignIn?: () => void;
  localityBadge?: React.ReactNode;
  userName?: string;
  jaiCoins?: number;
}

const HeaderMinimal = ({ 
  isAuthenticated = false,
  onSignIn,
  localityBadge,
  userName,
  jaiCoins = 0
}: HeaderMinimalProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-background/80 backdrop-blur-xl sticky top-0 z-40 safe-area-pt border-b border-border/20">
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <JaipurCircleLogo size="md" />
        </Link>
        
        {/* Locality Badge - centered */}
        <div className="flex-1 flex justify-center min-w-0 px-2">
          {localityBadge}
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* JaiCoins Badge (if authenticated) */}
          {isAuthenticated && jaiCoins > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-700 dark:text-amber-400 rounded-full px-3 h-9"
              onClick={() => navigate('/account/wallet')}
            >
              <Coins className="w-4 h-4" />
              <span className="font-semibold">{jaiCoins.toLocaleString()}</span>
            </Button>
          )}

          {/* Search Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full w-10 h-10"
            onClick={() => navigate('/deals')}
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Notifications (if authenticated) */}
          {isAuthenticated && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full w-10 h-10 relative"
              onClick={() => navigate('/account')}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
            </Button>
          )}
          
          {/* Profile / Sign In */}
          <Button 
            variant={isAuthenticated ? "ghost" : "default"}
            size={isAuthenticated ? "icon" : "sm"}
            className={isAuthenticated 
              ? "text-foreground hover:bg-muted/50 rounded-full w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20" 
              : "rounded-full px-4 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            }
            onClick={() => isAuthenticated ? navigate('/account') : onSignIn?.()}
            aria-label={isAuthenticated ? "Go to account" : "Sign in"}
          >
            {isAuthenticated ? (
              <User className="w-5 h-5" />
            ) : (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default HeaderMinimal;
