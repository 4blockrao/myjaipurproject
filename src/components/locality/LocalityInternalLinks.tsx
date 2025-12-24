import { Link } from "react-router-dom";

interface LocalityInternalLinksProps {
  locality: any;
}

export function LocalityInternalLinks({ locality }: LocalityInternalLinksProps) {
  const links = [
    { href: "/jaipur", label: "All Jaipur Localities" },
    { href: "/news", label: "Jaipur News" },
    { href: "/events", label: "Events in Jaipur" },
    { href: "/deals", label: "Deals in Jaipur" },
    { href: "/merchants", label: "Merchants in Jaipur" },
  ];

  return (
    <section className="mt-16 border-t border-border pt-8">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Explore More on JaipurCircle
      </h2>
      <div className="flex flex-wrap gap-4 text-sm">
        {links.map((link, index) => (
          <span key={link.href} className="flex items-center gap-4">
            <Link
              to={link.href}
              className="text-primary hover:underline transition-colors"
            >
              {link.label}
            </Link>
            {index < links.length - 1 && (
              <span className="text-muted-foreground">•</span>
            )}
          </span>
        ))}
      </div>
      {locality?.zone && (
        <p className="mt-4 text-sm text-muted-foreground">
          This page is part of JaipurCircle's locality guide for the{" "}
          <strong className="text-foreground">{locality.zone}</strong> zone of Jaipur, Rajasthan.
        </p>
      )}
    </section>
  );
}
