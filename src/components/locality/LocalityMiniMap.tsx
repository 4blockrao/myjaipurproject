interface LocalityMiniMapProps {
  locality: {
    name: string;
    geo_lat?: number | null;
    geo_lng?: number | null;
  };
}

export function LocalityMiniMap({ locality }: LocalityMiniMapProps) {
  if (!locality.geo_lat || !locality.geo_lng) return null;

  const mapUrl = `https://maps.google.com/maps?q=${locality.geo_lat},${locality.geo_lng}&z=14&output=embed`;

  return (
    <section id="map" className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4">
        {locality.name} Map
      </h2>

      <div className="rounded-xl border border-border overflow-hidden bg-muted/20">
        <iframe
          loading="lazy"
          src={mapUrl}
          title={`Map of ${locality.name}, Jaipur`}
          className="w-full h-64 md:h-80"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        Map showing approximate location of {locality.name} in Jaipur, Rajasthan.
      </p>
    </section>
  );
}
