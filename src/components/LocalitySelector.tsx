import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, Clock, X, ChevronRight, Navigation } from "lucide-react";
import { useLocalityMemory } from "@/hooks/useLocalityMemory";

interface LocalitySelectorProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiSelect?: boolean;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

interface Locality {
  id: number;
  name: string;
  slug: string;
  micro_localities: string[] | null;
}

const LocalitySelector = ({ 
  value, 
  onChange, 
  multiSelect = false, 
  label = "Select Locality",
  placeholder = "Search localities...",
  required = false 
}: LocalitySelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { recentLocalities } = useLocalityMemory();

  // Fetch localities from DB
  const { data: allLocalities = [], isLoading } = useQuery({
    queryKey: ['localities-selector'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('localities')
        .select('id, name, slug, micro_localities')
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Filter localities based on search
  const filteredLocalities = searchTerm.length >= 1
    ? allLocalities.filter(loc => {
        const nameMatch = loc.name.toLowerCase().includes(searchTerm.toLowerCase());
        // Also match micro-localities
        const microMatch = loc.micro_localities?.some(
          micro => micro.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return nameMatch || microMatch;
      }).slice(0, 8)
    : allLocalities.slice(0, 8);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (localityName: string) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(localityName)) {
        onChange(currentValues.filter(v => v !== localityName));
      } else {
        onChange([...currentValues, localityName]);
      }
    } else {
      onChange(localityName);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const getDisplayValue = () => {
    if (multiSelect && Array.isArray(value)) {
      return value.length > 0 ? `${value.length} localities selected` : placeholder;
    }
    return value || placeholder;
  };

  const isSelected = (localityName: string) => {
    if (multiSelect && Array.isArray(value)) {
      return value.includes(localityName);
    }
    return value === localityName;
  };

  const getMicroMatch = (loc: Locality): string | null => {
    if (!searchTerm) return null;
    const match = loc.micro_localities?.find(
      micro => micro.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return match || null;
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <Label className="block text-sm font-medium text-foreground mb-2">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <div
          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer bg-background flex items-center justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`${value ? 'text-foreground' : 'text-muted-foreground'}`}>
            {getDisplayValue()}
          </span>
          <MapPin className="w-4 h-4 text-muted-foreground" />
        </div>

        {isOpen && (
          <Card className="absolute z-50 w-full mt-1 max-h-80 overflow-hidden shadow-lg">
            <CardContent className="p-0">
              {/* Search Input */}
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search locality or area..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    autoFocus
                  />
                </div>
              </div>

              {/* Recent Localities */}
              {!searchTerm && recentLocalities.length > 0 && (
                <div className="border-b border-border">
                  <div className="px-4 py-2 bg-muted/30">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Recently Visited
                    </span>
                  </div>
                  {recentLocalities.slice(0, 3).map((loc) => (
                    <div
                      key={loc.slug}
                      className={`px-4 py-3 cursor-pointer hover:bg-muted/50 flex items-center justify-between transition-colors ${
                        isSelected(loc.name) ? 'bg-primary/10 text-primary' : 'text-foreground'
                      }`}
                      onClick={() => handleSelect(loc.name)}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{loc.name}</span>
                      </div>
                      {isSelected(loc.name) && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Locality List */}
              <div className="max-h-48 overflow-y-auto">
                {isLoading ? (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    Loading localities...
                  </div>
                ) : filteredLocalities.length > 0 ? (
                  filteredLocalities.map((locality) => {
                    const microMatch = getMicroMatch(locality);
                    return (
                      <div
                        key={locality.id}
                        className={`px-4 py-3 cursor-pointer hover:bg-muted/50 flex items-center justify-between transition-colors ${
                          isSelected(locality.name) ? 'bg-primary/10 text-primary' : 'text-foreground'
                        }`}
                        onClick={() => handleSelect(locality.name)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <span className="font-medium block">{locality.name}</span>
                            {microMatch && (
                              <span className="text-xs text-muted-foreground">
                                {microMatch} is in this locality
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected(locality.name) && (
                          <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    <MapPin className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    No localities found for "{searchTerm}"
                  </div>
                )}
              </div>

              {/* Browse All Link */}
              <div className="p-2 border-t border-border bg-muted/20">
                <button
                  className="w-full px-3 py-2 text-sm text-primary hover:bg-primary/5 rounded-md flex items-center justify-center gap-1 transition-colors"
                  onClick={() => window.open('/jaipur', '_blank')}
                >
                  Browse All Localities
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Multi-select Pills */}
      {multiSelect && Array.isArray(value) && value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.map((localityName) => (
            <span
              key={localityName}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
            >
              {localityName}
              <button
                type="button"
                className="ml-2 text-primary/70 hover:text-primary"
                onClick={() => handleSelect(localityName)}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocalitySelector;
