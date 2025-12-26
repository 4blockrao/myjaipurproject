import React from "react";
import { Locality } from "@/hooks/useLocality";

interface Props {
  locality: Locality;
}

export default function LocalityPropertyContext({ locality }: Props) {
  if (!locality) return null;

  const hasMixedUse =
    locality.tags?.some((t: string) =>
      t.toLowerCase().includes("industrial")
    ) || false;

  return (
    <section className="max-w-4xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-2 text-foreground">
        Property & Housing Overview – {locality.name}
      </h2>

      <p className="text-muted-foreground leading-relaxed">
        {locality.name} features a locality-level housing mix that includes
        established residential settlements, plotted neighbourhood pockets and
        small apartment clusters.{" "}
        {hasMixedUse &&
          `Parts of the locality also coexist with nearby industrial or work-linked zones, resulting in a mixed-use development environment.`}
        <br />
        <br />
        This description reflects settlement characteristics and locality-scale
        development context rather than pricing or investment information.
      </p>
    </section>
  );
}
