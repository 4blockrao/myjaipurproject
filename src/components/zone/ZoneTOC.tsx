interface ZoneTOCProps {
  zoneName?: string;
}

export function ZoneTOC({ zoneName }: ZoneTOCProps) {
  const sections = [
    { id: "overview", label: "Zone Overview" },
    { id: "governance", label: "Governance" },
    { id: "residential", label: "Residential Areas" },
    { id: "commercial", label: "Commercial Hubs" },
    { id: "connectivity", label: "Connectivity" },
    { id: "localities", label: "All Localities" },
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
