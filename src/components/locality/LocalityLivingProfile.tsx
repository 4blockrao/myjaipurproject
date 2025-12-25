import React from "react";

interface Props {
  locality: any;
}

export default function LocalityLivingProfile({ locality }: Props) {
  if (!locality) return null;

  const characteristics =
    locality?.tags?.length ? locality.tags.join(", ") : "residential locality";

  const nearby =
    locality?.nearby_localities?.length
      ? locality.nearby_localities.slice(0, 4).join(", ")
      : null;

  return (
    <section className="max-w-4xl mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-2 text-foreground">
        Living in {locality.name}
      </h2>

      <p className="text-muted-foreground leading-relaxed">
        {locality.name} is a well-established urban locality located in{" "}
        {locality.zone || "the"} zone of Jaipur, Rajasthan. It falls under{" "}
        {locality.municipality || "municipal jurisdiction"}
        {locality.ward_number && (
          <>
            {" "}
            and is administered under Ward {locality.ward_number}
            {locality.ward_name && ` (${locality.ward_name})`}
          </>
        )}
        .
        <br />
        <br />
        The locality is generally characterised as {characteristics}.{" "}
        {nearby &&
          `It shares urban connectivity with nearby areas such as ${nearby}.`}
      </p>
    </section>
  );
}
