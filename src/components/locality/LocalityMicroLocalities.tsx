import { Locality } from '@/hooks/useLocality';
import { MapPinned } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LocalityMicroLocalitiesProps {
  locality: Locality;
}

export function LocalityMicroLocalities({ locality }: LocalityMicroLocalitiesProps) {
  if (!locality.micro_localities?.length) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <MapPinned className="h-6 w-6 text-primary" />
        Micro Localities in {locality.name}
      </h2>
      <p className="text-muted-foreground mb-4">
        {locality.name} comprises several micro-localities and sub-areas:
      </p>
      <div className="flex flex-wrap gap-2">
        {locality.micro_localities.map((micro, i) => (
          <Badge 
            key={i} 
            variant="secondary" 
            className="px-3 py-1.5 text-sm"
          >
            {micro}
          </Badge>
        ))}
      </div>
    </section>
  );
}
