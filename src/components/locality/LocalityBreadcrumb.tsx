import { Link } from "react-router-dom";
import { Locality } from "@/hooks/useLocality";
import { ChevronRight, Home } from "lucide-react";

interface LocalityBreadcrumbProps {
  locality: Locality;
}

export function LocalityBreadcrumb({ locality }: LocalityBreadcrumbProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className="mb-6 flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto"
    >
      <Link 
        to="/" 
        className="flex items-center gap-1 hover:text-primary transition-colors shrink-0"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>
      
      <ChevronRight className="h-4 w-4 shrink-0" />
      
      <Link 
        to="/jaipur" 
        className="hover:text-primary transition-colors shrink-0"
      >
        Jaipur
      </Link>
      
      {locality.zone && (
        <>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <Link 
            to={`/jaipur?zone=${encodeURIComponent(locality.zone)}`}
            className="hover:text-primary transition-colors shrink-0"
          >
            {locality.zone}
          </Link>
        </>
      )}
      
      <ChevronRight className="h-4 w-4 shrink-0" />
      
      <span 
        className="text-foreground font-medium truncate" 
        aria-current="page"
      >
        {locality.name}
      </span>
    </nav>
  );
}
