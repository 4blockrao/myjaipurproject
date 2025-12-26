import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocalityMemory } from "@/hooks/useLocalityMemory";
import { useNearbyForCategory } from "@/hooks/useNearbyLocalities";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Search, Clock, Navigation, ChevronRight } from "lucide-react";

interface LocalitySelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (locality: { name: string; slug: string }) => void;
  currentLocalitySlug?: string;
}

interface Locality {
  id: number;
  name: string;
  slug: string;
  micro_localities: string[] | null;
}

export function LocalitySelectorModal({
  open,
  onOpenChange,
  onSelect,
  currentLocalitySlug,
}: LocalitySelectorModalProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { recentLocalities } = useLocalityMemory();

  // Fetch all localities
  const { data: allLocalities = [], isLoading } = useQuery({
    queryKey: ["localities-modal"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("localities")
        .select("id, name, slug, micro_localities")
        .order("name", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Nearby localities based on current locality
  const { data: nearbyLocalities = [] } = useNearbyForCategory(
    currentLocalitySlug,
    5
  );

  // Filter by search
  const filteredLocalities =
    searchTerm.length >= 2
      ? allLocalities.filter((loc) => {
          const nameMatch = loc.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const microMatch = loc.micro_localities?.some((micro) =>
            micro.toLowerCase().includes(searchTerm.toLowerCase())
          );
          return nameMatch || microMatch;
        })
      : [];

  // Handle selection
  const handleSelect = (locality: { name: string; slug: string }) => {
    if (onSelect) {
      onSelect(locality);
    } else {
      navigate(`/jaipur/${locality.slug}`);
    }
    onOpenChange(false);
    setSearchTerm("");
  };

  // Reset search when closed
  useEffect(() => {
    if (!open) setSearchTerm("");
  }, [open]);

  // Content shared between modal and drawer
  const SelectorContent = () => (
    <div className="flex flex-col h-full max-h-[70vh]">
      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search locality, micro-area or landmark..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            autoFocus={!isMobile}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Search Results */}
          {searchTerm.length >= 2 && (
            <section>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Search Results
              </h3>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : filteredLocalities.length > 0 ? (
                <div className="space-y-1">
                  {filteredLocalities.slice(0, 8).map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelect(loc)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    >
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-medium text-foreground">
                        {loc.name}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No localities found for "{searchTerm}"
                </p>
              )}
            </section>
          )}

          {/* Recent Localities */}
          {!searchTerm && recentLocalities.length > 0 && (
            <section>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Recent Localities
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentLocalities.map((loc) => (
                  <Badge
                    key={loc.slug}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 px-3 py-1.5"
                    onClick={() => handleSelect(loc)}
                  >
                    {loc.name}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Nearby Areas */}
          {!searchTerm && nearbyLocalities.length > 0 && (
            <section>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                Nearby Areas
              </h3>
              <div className="flex flex-wrap gap-2">
                {nearbyLocalities.map((loc) => (
                  <Badge
                    key={loc.slug}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/5 px-3 py-1.5"
                    onClick={() => handleSelect(loc)}
                  >
                    {loc.name}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Browse All Localities */}
          {!searchTerm && (
            <section>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Browse All Localities
              </h3>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {allLocalities.slice(0, 12).map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelect(loc)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                    >
                      <span className="font-medium text-foreground">
                        {loc.name}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      navigate("/jaipur");
                      onOpenChange(false);
                    }}
                    className="w-full px-3 py-2.5 text-sm text-primary hover:underline text-center"
                  >
                    View all 100+ localities →
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/20">
        <p className="text-xs text-muted-foreground text-center">
          Can't find your area?{" "}
          <button className="text-primary hover:underline">
            Suggest a locality
          </button>
        </p>
      </div>
    </div>
  );

  // Render as Drawer on mobile, Dialog on desktop
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>Select Locality</DrawerTitle>
            <DrawerDescription>
              Choose your neighborhood or nearby area
            </DrawerDescription>
          </DrawerHeader>
          <SelectorContent />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Select Locality</DialogTitle>
          <DialogDescription>
            Choose your neighborhood or nearby area
          </DialogDescription>
        </DialogHeader>
        <SelectorContent />
      </DialogContent>
    </Dialog>
  );
}
