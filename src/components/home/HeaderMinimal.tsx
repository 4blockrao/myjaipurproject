import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import JaipurCircleLogo from "@/components/ui/JaipurCircleLogo";

interface HeaderMinimalProps {
  isAuthenticated?: boolean;
  onSignIn?: () => void;
  localityBadge?: React.ReactNode;
}

const HeaderMinimal = ({ 
  isAuthenticated = false,
  onSignIn,
  localityBadge
}: HeaderMinimalProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-background sticky top-0 z-40 safe-area-pt border-b border-border/30">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo and Locality */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <JaipurCircleLogo size="md" />
          </Link>
          {localityBadge}
        </div>
        
        {/* Profile / Sign In */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-foreground hover:bg-muted rounded-full w-10 h-10 border border-border/50"
          onClick={() => isAuthenticated ? navigate('/account') : onSignIn?.()}
          aria-label={isAuthenticated ? "Go to account" : "Sign in"}
        >
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};

export default HeaderMinimal;
