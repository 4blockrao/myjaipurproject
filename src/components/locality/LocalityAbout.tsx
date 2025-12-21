import { Locality } from '@/hooks/useLocality';

interface LocalityAboutProps {
  locality: Locality;
}

export function LocalityAbout({ locality }: LocalityAboutProps) {
  const isHeritage = locality.tags?.some(t => 
    t.toLowerCase().includes('heritage') || 
    t.toLowerCase().includes('historical')
  );
  
  const characteristics = locality.tags?.join(', ') || 'residential';
  
  const content = `${locality.name} is a well-established locality situated in ${
    locality.zone || 'central'
  } Jaipur, Rajasthan. The area falls under ${
    locality.municipality || 'Jaipur Municipal Corporation'
  } jurisdiction and is governed by Ward ${locality.ward_number || 'N/A'}${
    locality.ward_name ? ` (${locality.ward_name})` : ''
  }.

The locality is characterized as ${characteristics}. ${
    locality.nearby_localities?.length 
      ? `It shares boundaries with ${locality.nearby_localities.slice(0, 4).join(', ')}, making it well-connected to surrounding areas.` 
      : ''
  }${
    isHeritage 
      ? ` ${locality.name} holds historical significance in Jaipur's urban landscape and preserves elements of the city's rich heritage.` 
      : ''
  }

${
    locality.police_station 
      ? `For administrative and security purposes, the area is covered by ${locality.police_station} Police Station.` 
      : ''
  }`;

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4">About {locality.name}</h2>
      <div className="prose prose-sm max-w-none text-muted-foreground">
        {content.split('\n\n').map((para, i) => (
          <p key={i} className="mb-3 leading-relaxed">{para.trim()}</p>
        ))}
      </div>
    </section>
  );
}
