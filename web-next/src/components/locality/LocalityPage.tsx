// Server-rendered locality page. No "use client" — ships zero JS. Ported from the
// buildSSRHTML() body in locality-ssr, restyled with Tailwind. FAQ uses native <details>
// so it stays interactive without hydration (mobile-first: no client bundle).

import { BASE_URL, formatDate, truncate } from "@/lib/site";
import type { EventRow, Locality, NearbyRow, VenueRow } from "@/lib/locality";

// Plain <img> is used intentionally for the pilot: image URLs are arbitrary external/Supabase
// hosts, and next/image would need remotePatterns config. Revisit with next/image later.

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-neutral-900">{title}</h3>
      {children}
    </section>
  );
}

function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "yellow" | "green" }) {
  const tones = {
    gray: "bg-neutral-100 text-neutral-700",
    yellow: "bg-amber-100 text-amber-800",
    green: "bg-emerald-100 text-emerald-800",
  } as const;
  return <span className={`inline-block rounded-full px-3 py-1 text-sm ${tones[tone]}`}>{children}</span>;
}

export function LocalityPage({
  locality,
  events,
  venues,
  nearby,
  eventCount,
}: {
  locality: Locality;
  events: EventRow[];
  venues: VenueRow[];
  nearby: NearbyRow[];
  eventCount: number;
}) {
  const emergency: Record<string, any> = locality.emergency_contacts || {};
  const metro: Record<string, any> = locality.nearest_metro || {};
  const railway: Record<string, any> = locality.nearest_railway || {};
  const airport: Record<string, any> = locality.nearest_airport || {};
  const helplines: Record<string, any> = locality.civic_helplines || {};
  const realEstate: Record<string, any> = locality.real_estate || {};
  const pros: string[] = Array.isArray(locality.pros) ? locality.pros : [];
  const cons: string[] = Array.isArray(locality.cons) ? locality.cons : [];
  const knownFor: string[] = Array.isArray(locality.known_for) ? locality.known_for : [];
  const eateries: string[] = Array.isArray(locality.popular_eateries) ? locality.popular_eateries : [];
  const distances = Object.entries(locality.distance_matrix || {});
  const faqs: any[] = Array.isArray(locality.faq_json) ? locality.faq_json : [];
  const majorRoads: string[] = Array.isArray(locality.major_roads) ? locality.major_roads : [];

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16" data-locality={locality.slug} data-events={eventCount}>
      {/* Emergency banner */}
      {Object.keys(emergency).length > 0 && (
        <div className="-mx-4 mb-6 flex flex-wrap gap-3 bg-rose-600 px-4 py-3 text-sm font-medium text-white">
          <a href={`tel:${emergency.police || "100"}`}>🚓 POLICE: {emergency.police || "100"}</a>
          <a href={`tel:${emergency.fire || "101"}`}>🔥 FIRE: {emergency.fire || "101"}</a>
          <a href={`tel:${emergency.ambulance || "102"}`}>🚑 AMBULANCE: {emergency.ambulance || "102"}</a>
          <a href={`tel:${emergency.women_helpline || "1090"}`}>👩 WOMEN: {emergency.women_helpline || "1090"}</a>
          <a href={`tel:${emergency.child_helpline || "1098"}`}>👶 CHILD: {emergency.child_helpline || "1098"}</a>
        </div>
      )}

      {/* Hero */}
      <header className="mb-8 pt-6">
        <div className="mb-3 flex flex-wrap gap-2 text-sm text-neutral-600">
          <span>📍 {locality.name}</span>
          {locality.pin_code && <span>📮 Pin: {locality.pin_code}</span>}
          {eventCount > 0 && <span>🎉 {eventCount} Upcoming Events</span>}
          {venues.length > 0 && <span>🏛️ {venues.length} Venues</span>}
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">{locality.name}, Jaipur</h1>
        <p className="mt-3 text-neutral-600">
          {truncate(
            locality.seo_blurb ||
              locality.description ||
              `Complete guide to ${locality.name} with events, venues, and local experiences.`,
            200,
          )}
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {/* Police station */}
        {locality.police_station_name && (
          <Section title="🚔 Police Station Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 text-sm">
                <p><strong>Station Name:</strong> {locality.police_station_name}</p>
                <p><strong>Address:</strong> {locality.police_station_address || ""}</p>
                <p><strong>Phone:</strong> <a className="text-rose-600" href={`tel:${locality.police_station_phone}`}>{locality.police_station_phone}</a></p>
                <p><strong>Emergency:</strong> {locality.police_station_emergency || "100"}</p>
                {locality.police_station_email && (
                  <p><strong>Email:</strong> <a className="text-rose-600" href={`mailto:${locality.police_station_email}`}>{locality.police_station_email}</a></p>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <p><strong>SHO (In-charge):</strong> {locality.police_station_incharge || "To be verified"}</p>
                <p><strong>SHO Contact:</strong> {locality.police_station_incharge_contact || "Contact station directly"}</p>
                <p><strong>Jurisdiction:</strong> {locality.police_station_jurisdiction || ""}</p>
                {locality.police_station_maps && (
                  <p><strong>Location:</strong> <a className="text-rose-600" href={locality.police_station_maps} target="_blank" rel="noopener">View on Google Maps →</a></p>
                )}
              </div>
            </div>
          </Section>
        )}

        {/* Connectivity */}
        {(metro.name || railway.name || airport.name) && (
          <Section title="🚗 Connectivity & Transport">
            <div className="grid gap-4 sm:grid-cols-3">
              {metro.name && (
                <div className="rounded-lg bg-neutral-50 p-3 text-sm">
                  <div className="text-2xl">🚇</div>
                  <strong>{metro.name}</strong>
                  <p>Distance: {metro.distance || "N/A"}</p>
                  <p>Line: {metro.line || "N/A"}</p>
                  <p>Travel Time: {metro.travel_time || "N/A"}</p>
                </div>
              )}
              {railway.name && (
                <div className="rounded-lg bg-neutral-50 p-3 text-sm">
                  <div className="text-2xl">🚂</div>
                  <strong>{railway.name}</strong>
                  <p>Distance: {railway.distance || "N/A"}</p>
                  <p>Travel Time: {railway.travel_time || "N/A"}</p>
                </div>
              )}
              {airport.name && (
                <div className="rounded-lg bg-neutral-50 p-3 text-sm">
                  <div className="text-2xl">✈️</div>
                  <strong>{airport.name}</strong>
                  <p>Distance: {airport.distance || "N/A"}</p>
                  <p>Travel Time: {airport.travel_time || "N/A"}</p>
                  {airport.cab_fare && <p>Cab Fare: {airport.cab_fare}</p>}
                </div>
              )}
            </div>
            {majorRoads.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <strong>🛣️ Major Roads:</strong>
                {majorRoads.map((r, i) => <Badge key={i}>{r}</Badge>)}
              </div>
            )}
          </Section>
        )}

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {locality.pin_code && <InfoCard icon="📮" label="Pin Code" value={locality.pin_code} />}
          {locality.safety_rating && <InfoCard icon="🛡️" label="Safety Rating" value={`${locality.safety_rating}/5 ⭐`} />}
          {locality.livability_score && <InfoCard icon="🏠" label="Livability Score" value={`${locality.livability_score}/100`} />}
          {locality.best_time_to_visit && <InfoCard icon="📅" label="Best Time to Visit" value={locality.best_time_to_visit} />}
          {locality.ward_name && <InfoCard icon="🗺️" label="Ward" value={`${locality.ward_name} (${locality.ward_number || ""})`} />}
        </div>

        {/* Known for */}
        {knownFor.length > 0 && (
          <Section title="✨ Known For">
            <div className="flex flex-wrap gap-2">{knownFor.map((item, i) => <Badge key={i} tone="yellow">{item}</Badge>)}</div>
          </Section>
        )}

        {/* Events */}
        {events.length > 0 ? (
          <Section title={`🎪 Upcoming Events in ${locality.name}`}>
            <div className="grid gap-3 sm:grid-cols-2">
              {events.slice(0, 6).map((event) => (
                <a key={event.slug} href={`${BASE_URL}/events/${event.slug}`} className="flex gap-3 rounded-lg border border-neutral-200 p-3 hover:border-rose-300">
                  {event.cover_image ? (
                    <img src={event.cover_image} alt={event.title} loading="lazy" className="h-16 w-16 rounded object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded bg-neutral-100 text-2xl">🎉</div>
                  )}
                  <div className="min-w-0 text-sm">
                    <h4 className="truncate font-medium text-neutral-900">{event.title}</h4>
                    <div className="text-neutral-500">📅 {formatDate(event.start_date)} · 📍 {event.venue_name || "TBA"}</div>
                    <div className="mt-1 font-semibold text-emerald-600">
                      {event.is_free ? "FREE" : event.ticket_price ? `₹${event.ticket_price}` : "TBA"}
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <a href={`${BASE_URL}/jaipur/${locality.slug}/events`} className="mt-3 inline-block text-sm font-medium text-rose-600">
              View all {eventCount} →
            </a>
          </Section>
        ) : (
          <Section title={`🎪 Explore ${locality.name}`}>
            <p className="text-sm text-neutral-600">No events listed right now, but there&apos;s plenty to discover in this vibrant locality.</p>
          </Section>
        )}

        {/* Venues */}
        {venues.length > 0 && (
          <Section title={`🏛️ Popular Venues in ${locality.name}`}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {venues.map((venue) => (
                <a key={venue.slug} href={`${BASE_URL}/venues/${venue.slug}`} className="rounded-lg border border-neutral-200 p-3 hover:border-rose-300">
                  {venue.image ? (
                    <img src={venue.image} alt={venue.name} loading="lazy" className="mb-2 h-24 w-full rounded object-cover" />
                  ) : (
                    <div className="mb-2 flex h-24 items-center justify-center rounded bg-neutral-100 text-3xl">🏢</div>
                  )}
                  <h4 className="text-sm font-medium text-neutral-900">{venue.name}</h4>
                  <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                    {venue.rating && <span>⭐ {venue.rating}</span>}
                    {venue.category && <span>{venue.category}</span>}
                  </div>
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* Eateries */}
        {eateries.length > 0 && (
          <Section title="🍽️ Popular Eateries">
            <div className="flex flex-wrap gap-2">{eateries.map((item, i) => <Badge key={i} tone="green">{item}</Badge>)}</div>
          </Section>
        )}

        {/* Pros & Cons */}
        {(pros.length > 0 || cons.length > 0) && (
          <Section title={`✅ Pros & Cons of Living in ${locality.name}`}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 font-medium text-emerald-700">✅ Pros</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-neutral-700">{pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </div>
              <div>
                <h4 className="mb-2 font-medium text-rose-700">❌ Cons</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-neutral-700">{cons.map((c, i) => <li key={i}>{c}</li>)}</ul>
              </div>
            </div>
          </Section>
        )}

        {/* Real estate */}
        {Object.keys(realEstate).length > 0 && (
          <Section title="🏠 Real Estate Snapshot">
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <h4 className="mb-1 font-medium">💰 Rental Prices (Monthly)</h4>
                {realEstate.rent_1bhk && <p><strong>1BHK:</strong> {realEstate.rent_1bhk}</p>}
                {realEstate.rent_2bhk && <p><strong>2BHK:</strong> {realEstate.rent_2bhk}</p>}
                {realEstate.rent_3bhk && <p><strong>3BHK:</strong> {realEstate.rent_3bhk}</p>}
                {realEstate.pg_options && <p><strong>PG Options:</strong> {realEstate.pg_options}</p>}
              </div>
              <div>
                <h4 className="mb-1 font-medium">📈 Sale Prices</h4>
                {realEstate.average_price_per_sqft && <p><strong>Avg Price/sq ft:</strong> {realEstate.average_price_per_sqft}</p>}
                {realEstate.price_trend_yoy && <p><strong>Price Trend:</strong> <span className="text-emerald-600">{realEstate.price_trend_yoy}</span></p>}
                {Array.isArray(realEstate.popular_societies) && realEstate.popular_societies.length > 0 && (
                  <p><strong>Popular Societies:</strong> {realEstate.popular_societies.join(", ")}</p>
                )}
              </div>
            </div>
          </Section>
        )}

        {/* Distance matrix */}
        {distances.length > 0 && (
          <Section title="📍 Distance from Key Landmarks">
            <div className="grid gap-2 sm:grid-cols-2">
              {distances.slice(0, 8).map(([place, distance]) => (
                <div key={place} className="flex justify-between rounded bg-neutral-50 px-3 py-2 text-sm">
                  <span className="font-medium uppercase text-neutral-600">{place.replace(/_/g, " ").replace("from ", "")}</span>
                  <span>{String(distance)}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* FAQ — native <details>, no JS */}
        {faqs.length > 0 && (
          <Section title={`❓ Frequently Asked Questions about ${locality.name}`}>
            <div className="divide-y divide-neutral-200">
              {faqs.map((faq, idx) => (
                <details key={idx} className="group py-2">
                  <summary className="cursor-pointer list-none font-medium text-neutral-900 marker:hidden">
                    {faq.question}
                    <span className="float-right text-neutral-400 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-neutral-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Section>
        )}

        {/* About */}
        <Section title={`ℹ️ About ${locality.name}`}>
          <p className="text-sm text-neutral-700">
            {locality.description || locality.seo_blurb || `Explore ${locality.name}, a vibrant locality in Jaipur.`}
          </p>
          {locality.local_insights?.resident_profile && Array.isArray(locality.local_insights.resident_profile) && (
            <p className="mt-2 text-sm"><strong>Resident Profile:</strong> {locality.local_insights.resident_profile.join(", ")}</p>
          )}
          {locality.local_insights?.vibe && (
            <p className="mt-1 text-sm"><strong>Vibe:</strong> {locality.local_insights.vibe}</p>
          )}
        </Section>

        {/* Nearby */}
        {nearby.length > 0 && (
          <Section title="📍 Nearby Localities">
            <div className="flex flex-wrap gap-2">
              {nearby.map((loc) => (
                <a key={loc.slug} href={`${BASE_URL}/jaipur/${loc.slug}`} className="rounded-full border border-neutral-200 px-3 py-1 text-sm hover:border-rose-300">
                  {loc.name}
                  {loc.distance_km != null && <span className="ml-1 text-neutral-400">{loc.distance_km.toFixed(1)} km</span>}
                </a>
              ))}
            </div>
          </Section>
        )}

        <div className="pt-2 text-center text-xs text-neutral-400">
          <p>📅 Last Updated: {new Date(locality.last_verified_at || Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric", day: "numeric" })}</p>
          <p className="mt-1">⚠️ Data may change. Please verify before making decisions.</p>
        </div>
      </div>
    </main>
  );
}

function InfoCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-3">
      <span className="text-xl">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-neutral-500">{label}</div>
        <div className="truncate text-sm font-medium text-neutral-900">{value}</div>
      </div>
    </div>
  );
}
