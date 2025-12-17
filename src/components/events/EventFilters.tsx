import { useState } from "react";
import { Search, Calendar, MapPin, IndianRupee, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";

const CATEGORIES = [
  { value: "all", label: "All Events" },
  { value: "music", label: "Music" },
  { value: "comedy", label: "Comedy" },
  { value: "arts", label: "Arts & Culture" },
  { value: "food", label: "Food & Drinks" },
  { value: "sports", label: "Sports" },
  { value: "business", label: "Business" },
  { value: "community", label: "Community" },
  { value: "education", label: "Education" },
  { value: "festivals", label: "Festivals" },
];

const LOCALITIES = [
  "All Localities",
  "C-Scheme",
  "Malviya Nagar",
  "Vaishali Nagar",
  "Raja Park",
  "Mansarovar",
  "Jagatpura",
  "Tonk Road",
  "MI Road",
  "Bani Park",
  "Jhotwara",
  "Sanganer",
  "Sodala",
  "Sitapura",
];

export interface EventFiltersState {
  search: string;
  category: string;
  locality: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  priceRange: [number, number];
  freeOnly: boolean;
}

interface EventFiltersProps {
  filters: EventFiltersState;
  onFiltersChange: (filters: EventFiltersState) => void;
}

const EventFilters = ({ filters, onFiltersChange }: EventFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = <K extends keyof EventFiltersState>(
    key: K,
    value: EventFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      category: "all",
      locality: "All Localities",
      dateFrom: undefined,
      dateTo: undefined,
      priceRange: [0, 5000],
      freeOnly: false,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.category !== "all" ||
    filters.locality !== "All Localities" ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.freeOnly ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 5000;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search events, artists, venues..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10 pr-10"
        />
        {filters.search && (
          <button
            onClick={() => updateFilter("search", "")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={filters.category === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("category", cat.value)}
            className="whitespace-nowrap rounded-full"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          {showAdvanced ? "Hide Filters" : "More Filters"}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid gap-4 p-4 bg-muted/50 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 justify-start">
                      {filters.dateFrom ? format(filters.dateFrom, "MMM d") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => updateFilter("dateFrom", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 justify-start">
                      {filters.dateTo ? format(filters.dateTo, "MMM d") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => updateFilter("dateTo", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Locality */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Locality
              </label>
              <Select
                value={filters.locality}
                onValueChange={(value) => updateFilter("locality", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCALITIES.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Price Range
              </label>
              <div className="px-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilter("priceRange", value as [number, number])}
                  max={5000}
                  step={100}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹{filters.priceRange[0]}</span>
                  <span>₹{filters.priceRange[1]}+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={filters.freeOnly ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => updateFilter("freeOnly", !filters.freeOnly)}
            >
              Free Events Only
            </Badge>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.category !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {CATEGORIES.find((c) => c.value === filters.category)?.label}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => updateFilter("category", "all")}
              />
            </Badge>
          )}
          {filters.locality !== "All Localities" && (
            <Badge variant="secondary" className="gap-1">
              {filters.locality}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => updateFilter("locality", "All Localities")}
              />
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="secondary" className="gap-1">
              From {format(filters.dateFrom, "MMM d")}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => updateFilter("dateFrom", undefined)}
              />
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary" className="gap-1">
              To {format(filters.dateTo, "MMM d")}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => updateFilter("dateTo", undefined)}
              />
            </Badge>
          )}
          {filters.freeOnly && (
            <Badge variant="secondary" className="gap-1">
              Free Only
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => updateFilter("freeOnly", false)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default EventFilters;
