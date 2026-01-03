import { Locality } from "@/hooks/useLocality";

interface LocalityAboutProps {
  locality: Locality;
}

export function LocalityAbout({ locality }: LocalityAboutProps) {
  const zone = locality.zone || "central Jaipur";
  const municipality = locality.municipality || "Jaipur Municipal Corporation";
  const characteristics = locality.tags?.slice(0, 3).join(", ") || "urban residential";

  const nearbyAreas =
    locality.nearby_localities
      ?.slice(0, 4)
      .map((l) => l.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
      .join(", ") || "adjacent neighbourhoods";

  const isHeritage = locality.tags?.some(
    (t) => t.toLowerCase().includes("heritage") || t.toLowerCase().includes("historical"),
  );

  const isVaishaliNagar = locality.slug === "vaishali-nagar" || locality.name?.toLowerCase() === "vaishali nagar";

  // 🟣 Authority content — ONLY for Vaishali Nagar
  const vaishaliAuthorityContent = isVaishaliNagar
    ? [
        `Vaishali Nagar is one of Jaipur’s most prominent and well-developed residential and lifestyle neighbourhoods, located in the western part of the city. The locality is known for its planned residential colonies, wide roads, markets, schools, healthcare facilities and strong civic amenities, making it a preferred area for families, professionals and long-term residents.`,

        `The locality is strategically positioned between Sirsi Road, Queens Road, Ajmer Road and the western urban corridor, providing excellent connectivity to major parts of Jaipur. Vaishali Nagar has evolved into a largely self-sustained urban cluster with retail marketplaces, neighbourhood shopping streets, cafes, fitness centres and community infrastructure.`,

        `Over the years, Vaishali Nagar has emerged as a key growth pocket in western Jaipur, supported by nearby localities such as ${nearbyAreas}. The locality offers a diverse mix of independent houses, builder floors, apartments and gated residential communities, along with expanding commercial activity along major approach roads.`,

        locality.police_station
          ? `For civic and administrative purposes, Vaishali Nagar falls under the jurisdiction of ${municipality}${locality.ward_number ? `, Ward ${locality.ward_number}` : ""}${locality.ward_name ? ` (${locality.ward_name})` : ""}, and is covered by ${locality.police_station} Police Station.`
          : `For civic and administrative purposes, the locality falls under the jurisdiction of ${municipality}${locality.ward_number ? `, Ward ${locality.ward_number}` : ""}${locality.ward_name ? ` (${locality.ward_name})` : ""}.`,
      ]
    : [];

  // 🟢 Existing generic auto-generated content
  const genericParagraphs = [
    `${locality.name} is a major residential and commercial locality located in the ${zone} zone of Jaipur, Rajasthan. It falls under the administrative jurisdiction of ${municipality}${locality.ward_number ? ` and Ward ${locality.ward_number}` : ""}${locality.ward_name ? ` (${locality.ward_name})` : ""}.`,

    `The locality is generally characterised as ${characteristics}. It shares connectivity with nearby areas such as ${nearbyAreas}.`,

    isHeritage
      ? `${locality.name} holds historical significance in Jaipur's urban landscape and preserves elements of the city's cultural heritage.`
      : null,

    locality.police_station
      ? `For administrative and security purposes, the area is covered by ${locality.police_station} Police Station.`
      : null,
  ].filter(Boolean);

  // 🟣 Combine authority + generic content (only Vaishali Nagar gets extra text)
  const paragraphs = [...vaishaliAuthorityContent, ...genericParagraphs];

  return (
    <section id="about" className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4">About {locality.name}</h2>

      <div className="prose prose-sm max-w-none text-muted-foreground">
        {paragraphs.map((para, i) => (
          <p key={i} className="mb-3 leading-relaxed">
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}
