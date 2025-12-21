import { Link } from 'react-router-dom';
import { Locality } from '@/hooks/useLocality';
import { ChevronRight, Home, Map, Building2 } from 'lucide-react';

interface LocalityBreadcrumbProps {
  locality: Locality;
}

export function LocalityBreadcrumb({ locality }: LocalityBreadcrumbProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className="mb-6 text-sm text-muted-foreground"
    >
      <ol className="flex items-center flex-wrap gap-1">
        <li className="flex items-center">
          <Link 
            to="/" 
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Home className="h-3 w-3" />
            Home
          </Link>
        </li>
        <ChevronRight className="h-3 w-3" />
        <li className="flex items-center">
          <Link 
            to="/jaipur" 
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Map className="h-3 w-3" />
            Jaipur
          </Link>
        </li>
        {locality.zone && (
          <>
            <ChevronRight className="h-3 w-3" />
            <li className="flex items-center">
              <Link 
                to={`/zone/${locality.zone.toLowerCase().replace(/\s+/g, '-')}`}
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <Building2 className="h-3 w-3" />
                {locality.zone}
              </Link>
            </li>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <li>
          <span className="text-foreground font-medium">
            {locality.name}
          </span>
        </li>
      </ol>
    </nav>
  );
}
