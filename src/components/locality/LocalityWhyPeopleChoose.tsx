import React from "react";
import { Locality } from "@/hooks/useLocality";

interface Props {
  locality: Locality;
}

export default function LocalityWhyPeopleChoose({ locality }: Props) {
  if (!locality) return null;

  return (
    <section className="max-w-4xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-2 text-foreground">
        Why People Choose to Live in {locality.name}
      </h2>

      <ul className="list-disc ml-6 text-muted-foreground leading-relaxed">
        <li>Established residential neighbourhood environment</li>
        <li>Proximity to nearby locality networks and urban movement corridors</li>
        <li>Access to daily-use markets and social infrastructure</li>
        <li>Connectivity to surrounding employment and activity zones</li>
      </ul>
    </section>
  );
}
