import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import HomeSEO from "@/components/seo/HomeSEO";
import LocalityHeroSearch from "@/components/home/LocalityHeroSearch";
import TopLocalitiesSection from "@/components/home/TopLocalitiesSection";
import EventsHomeSection from "@/components/home/EventsHomeSection";
import CarsSection from "@/components/home/CarsSection";
import GuidesHomeSection from "@/components/home/GuidesHomeSection";
import { NewsHomeSection } from "@/components/news/NewsHomeSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Newspaper, Search, Sparkles, Ticket } from "lucide-react";

const quickLinks = [
  { label: "IPL 2026", path: "/ipl-2026", icon: Ticket },
  { label: "Events", path: "/events", icon: CalendarDays },
  { label: "News", path: "/news", icon: Newspaper },
  { label: "Jaipur Guide", path: "/jaipur", icon: MapPin },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <AppLayout showHeader={false} showFooter={true} showBottomNav={true}>
      <HomeSEO />

      <section className="bg-gradient-hero px-4 pb-6 pt-5 text-primary-foreground">
        <div className="mx-auto max-w-5xl">
          <Badge className="mb-4 border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> JaipurCircle
          </Badge>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight md:text-5xl">
            Jaipur news, events, deals and local guides in one place
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-primary-foreground/85 md:text-base">
            Discover what is happening around Jaipur, from neighbourhood updates to events, cars, guides and city campaigns.
          </p>
          <div className="mt-5 flex gap-2">
            <Button onClick={() => navigate("/search")} variant="secondary" className="gap-2">
              <Search className="h-4 w-4" /> Search Jaipur
            </Button>
            <Button onClick={() => navigate("/ipl-2026")} variant="outline" className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20">
              IPL 2026 Hub
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-4 pb-24">
        <div className="grid grid-cols-2 gap-3 px-4 pt-4 md:grid-cols-4">
          {quickLinks.map(({ label, path, icon: Icon }) => (
            <Card key={path} className="cursor-pointer border-border bg-card transition-shadow hover:shadow-md" onClick={() => navigate(path)}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-card-foreground">{label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <LocalityHeroSearch />
        <div className="px-4">
          <NewsHomeSection />
          <GuidesHomeSection />
        </div>
        <EventsHomeSection />
        <CarsSection />
        <TopLocalitiesSection />
      </div>
    </AppLayout>
  );
};

export default Index;