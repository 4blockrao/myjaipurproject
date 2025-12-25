interface ZoneMiniMapProps {
  zone: {
    name: string;
    localities: Array<{
      geo_lat?: number | null;
      geo_lng?: number | null;
    }>;
  };
}

export function ZoneMiniMap({ zone }: ZoneMiniMapProps) {
  // Find center coordinates from localities with geo data
  const geoLocalities = zone.localities.filter(l => l.geo_lat && l.geo_lng);
  
  if (geoLocalities.length === 0) return null;

  // Calculate center point
  const avgLat = geoLocalities.reduce((sum, l) => sum + (l.geo_lat || 0), 0) / geoLocalities.length;
  const avgLng = geoLocalities.reduce((sum, l) => sum + (l.geo_lng || 0), 0) / geoLocalities.length;

  const mapUrl = `https://maps.google.com/maps?q=${avgLat},${avgLng}&z=12&output=embed`;

  return (
    <section id="map" className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4">
        {zone.name} Zone Map
      </h2>

      <div className="rounded-xl border border-border overflow-hidden bg-muted/20">
        <iframe
          loading="lazy"
          src={mapUrl}
          title={`Map of ${zone.name} Zone, Jaipur`}
          className="w-full h-64 md:h-80"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        Map showing approximate coverage of {zone.name} Zone in Jaipur, Rajasthan.
      </p>
    </section>
  );
}
