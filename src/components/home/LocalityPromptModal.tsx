import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { MapPin, Search, Sparkles } from "lucide-react";

interface LocalityPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (locality: { name: string; slug: string }) => void;
}

const popularLocalities = [
  { name: "Malviya Nagar", slug: "malviya-nagar" },
  { name: "Vaishali Nagar", slug: "vaishali-nagar" },
  { name: "C-Scheme", slug: "c-scheme" },
  { name: "Raja Park", slug: "raja-park" },
  { name: "Mansarovar", slug: "mansarovar" },
  { name: "Jagatpura", slug: "jagatpura" },
];

export function LocalityPromptModal({
  open,
  onOpenChange,
  onSelect,
}: LocalityPromptModalProps) {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all localities
  const { data: allLocalities = [], isLoading } = useQuery({
    queryKey: ["localities-prompt"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("localities")
        .select("id, name, slug")
        .order("name", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Filter by search
  const filteredLocalities =
    searchTerm.length >= 2
      ? allLocalities.filter((loc) =>
          loc.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  // Handle selection
  const handleSelect = (locality: { name: string; slug: string }) => {
    onSelect(locality);
    onOpenChange(false);
    setSearchTerm("");
  };

  // Reset search when closed
  useEffect(() => {
    if (!open) setSearchTerm("");
  }, [open]);

  const SelectorContent = () => (
    <div className="flex flex-col h-full max-h-[70vh]">
      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search your locality..."
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

          {/* Popular Localities */}
          {!searchTerm && (
            <section>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Popular Localities
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularLocalities.map((loc) => (
                  <Badge
                    key={loc.slug}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground px-4 py-2 text-sm transition-colors"
                    onClick={() => handleSelect(loc)}
                  >
                    <MapPin className="w-3 h-3 mr-1.5" />
                    {loc.name}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* All Localities */}
          {!searchTerm && (
            <section>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                All Localities
              </h3>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {allLocalities.slice(0, 20).map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelect(loc)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left text-sm"
                    >
                      <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-foreground truncate">
                        {loc.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Select Your Locality
            </DrawerTitle>
            <DrawerDescription>
              We'll show you deals and events near you
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
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Select Your Locality
          </DialogTitle>
          <DialogDescription>
            We'll show you deals and events near you
          </DialogDescription>
        </DialogHeader>
        <SelectorContent />
      </DialogContent>
    </Dialog>
  );
}
