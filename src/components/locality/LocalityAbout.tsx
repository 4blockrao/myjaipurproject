import { Locality } from '@/hooks/useLocality';

interface LocalityAboutProps {
  locality: Locality;
}

export function LocalityAbout({ locality }: LocalityAboutProps) {
  const zone = locality.zone || "central Jaipur";
  const municipality = locality.municipality || "Jaipur Municipal Corporation";
  const characteristics = locality.tags?.slice(0, 3).join(", ") || "urban residential";
  
  const nearbyAreas = locality.nearby_localities
    ?.slice(0, 4)
    .map(l => l.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()))
    .join(", ") || "adjacent neighbourhoods";

  const isHeritage = locality.tags?.some(t => 
    t.toLowerCase().includes('heritage') || 
    t.toLowerCase().includes('historical')
  );

  // Clean, non-repetitive content structure
  const paragraphs = [
    `${locality.name} is a major residential and commercial locality located in the ${zone} zone of Jaipur, Rajasthan. It falls under the administrative jurisdiction of ${municipality}${locality.ward_number ? ` and Ward ${locality.ward_number}` : ''}${locality.ward_name ? ` (${locality.ward_name})` : ''}.`,
    
    `The locality is generally characterised as ${characteristics}. It shares connectivity with nearby areas such as ${nearbyAreas}.`,
    
    isHeritage 
      ? `${locality.name} holds historical significance in Jaipur's urban landscape and preserves elements of the city's rich heritage.` 
      : null,
    
    locality.police_station 
      ? `For administrative and security purposes, the area is covered by ${locality.police_station} Police Station.` 
      : null,
  ].filter(Boolean);

  return (
    <section id="about" className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4">About {locality.name}</h2>
      <div className="prose prose-sm max-w-none text-muted-foreground">
        {paragraphs.map((para, i) => (
          <p key={i} className="mb-3 leading-relaxed">{para}</p>
        ))}
      </div>
    </section>
  );
}
