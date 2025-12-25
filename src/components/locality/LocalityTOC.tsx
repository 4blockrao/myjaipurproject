interface LocalityTOCProps {
  localityName?: string;
}

export function LocalityTOC({ localityName }: LocalityTOCProps) {
  const sections = [
    { id: "about", label: "About the Locality" },
    { id: "living", label: "Living Here" },
    { id: "property", label: "Property & Housing" },
    { id: "rental", label: "Rental & PG" },
    { id: "connectivity", label: "Connectivity" },
    { id: "education", label: "Education" },
    { id: "healthcare", label: "Healthcare" },
    { id: "markets", label: "Markets" },
    { id: "economy", label: "Local Economy" },
    { id: "micro-areas", label: "Micro Localities" },
    { id: "nearby", label: "Nearby Areas" },
    { id: "landmarks", label: "Landmarks" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <nav className="mb-8 p-4 rounded-xl border border-border bg-muted/30" aria-label="Table of contents">
      <p className="font-semibold text-foreground mb-3">On this page</p>

      <div className="flex flex-wrap gap-2 text-sm">
        {sections.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className="px-3 py-1.5 rounded-full border border-border bg-background text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors"
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
