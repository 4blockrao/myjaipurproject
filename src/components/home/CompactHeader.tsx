import { Coins, LogIn, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import JaipurCircleLogo from "@/components/ui/JaipurCircleLogo";

interface CompactHeaderProps {
  userName?: string;
  jaiCoins?: number;
  isAuthenticated?: boolean;
  onSignIn?: () => void;
}

const CompactHeader = ({ 
  userName, 
  jaiCoins = 0, 
  isAuthenticated = false,
  onSignIn
}: CompactHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-background/95 backdrop-blur-lg sticky top-0 z-40 safe-area-pt">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <JaipurCircleLogo size="sm" />
        </Link>
        
        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* JaiCoins badge */}
              <button 
                onClick={() => navigate('/account?tab=wallet')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 border border-amber-200/50 dark:border-amber-700/30"
              >
                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                  {jaiCoins.toLocaleString()}
                </span>
              </button>
              
              {/* Profile button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-foreground hover:bg-muted rounded-full"
                onClick={() => navigate('/account')}
              >
                <User className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <Button 
              onClick={onSignIn}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
      
      {/* Welcome line for authenticated users */}
      {isAuthenticated && userName && (
        <div className="px-4 pb-2">
          <p className="text-sm text-muted-foreground">
            Hey, <span className="font-medium text-foreground">{userName.split(' ')[0]}</span>! 👋
          </p>
        </div>
      )}
    </header>
  );
};

export default CompactHeader;
