import React from "react";
import { Locality } from "@/hooks/useLocality";

interface Props {
  locality: Locality;
}

export function LocalityEducationAccess({ locality }: Props) {
  if (!locality) return null;

  return (
    <section className="max-w-4xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-2 text-foreground">
        Education & Learning Access
      </h2>

      <p className="text-muted-foreground leading-relaxed">
        Residents of {locality.name} typically access schools and learning
        facilities located within the locality and nearby urban belts such as
        Vidyadhar Nagar, Murlipura and adjoining neighbourhoods. Additional
        verified listings will be added as structured locality datasets expand
        on JaipurCircle.
      </p>
    </section>
  );
}

export function LocalityHealthcareAccess({ locality }: Props) {
  if (!locality) return null;

  return (
    <section className="max-w-4xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-2 text-foreground">
        Healthcare & Emergency Access
      </h2>

      <p className="text-muted-foreground leading-relaxed">
        Residents generally rely on healthcare, clinics and hospital facilities
        located within the wider {locality.zone || "Jaipur"} zone and nearby
        localities. Access routes depend on proximity to main roads and
        connecting corridors in and around the locality.
      </p>
    </section>
  );
}
