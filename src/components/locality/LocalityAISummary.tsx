import { Locality } from '@/hooks/useLocality';
import { Sparkles } from 'lucide-react';

interface LocalityAISummaryProps {
  locality: Locality;
}

export function LocalityAISummary({ locality }: LocalityAISummaryProps) {
  const characteristics = locality.tags?.slice(0, 3).join(', ') || 'residential area';
  const nearbyAreas = locality.nearby_localities?.slice(0, 3).join(', ') || 'central Jaipur';
  
  const summary = `${locality.name} is a ${characteristics} locality in ${locality.zone || 'Jaipur'}, Rajasthan. ` +
    `It falls under Ward ${locality.ward_number || 'N/A'} and is governed by ${locality.municipality || 'Jaipur Municipal Corporation'}. ` +
    `The area is known for its ${locality.major_landmarks?.length ? 'notable landmarks and ' : ''}convenient connectivity. ` +
    `Nearby areas include ${nearbyAreas}.`;

  return (
    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold text-primary uppercase tracking-wide">AI Overview</span>
      </div>
      <p className="text-foreground/90 leading-relaxed text-base">
        {summary}
      </p>
    </div>
  );
}
