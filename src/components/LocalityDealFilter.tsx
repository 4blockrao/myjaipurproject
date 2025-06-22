
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LocalityDealFilterProps {
  selectedLocality: string;
  onLocalityChange: (locality: string) => void;
  dealCounts?: Record<string, number>;
}

const POPULAR_LOCALITIES = [
  "C-Scheme",
  "Vaishali Nagar", 
  "Malviya Nagar",
  "Civil Lines",
  "Mansarovar",
  "Jagatpura",
  "Tonk Road",
  "Ajmer Road"
];

const LocalityDealFilter = ({ 
  selectedLocality, 
  onLocalityChange,
  dealCounts = {} 
}: LocalityDealFilterProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <MapPin className="w-5 h-5 mr-2 text-pink-500" />
          Browse by Locality
        </CardTitle>
        <CardDescription>
          Find deals near you in Jaipur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant={selectedLocality === "all" ? "default" : "outline"}
          className={`w-full justify-between ${
            selectedLocality === "all" 
              ? "bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500" 
              : ""
          }`}
          onClick={() => onLocalityChange("all")}
        >
          <span>All Localities</span>
          <Badge variant="secondary" className="ml-2">
            {Object.values(dealCounts).reduce((sum, count) => sum + count, 0)}
          </Badge>
        </Button>

        <div className="space-y-2">
          {POPULAR_LOCALITIES.map((locality) => {
            const count = dealCounts[locality] || 0;
            const isSelected = selectedLocality === locality;
            
            return (
              <Button
                key={locality}
                variant={isSelected ? "default" : "outline"}
                className={`w-full justify-between ${
                  isSelected 
                    ? "bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500" 
                    : "hover:bg-pink-50 hover:border-pink-200"
                }`}
                onClick={() => onLocalityChange(locality)}
              >
                <div className="flex items-center">
                  <span className="font-medium">{locality}</span>
                  {count > 5 && (
                    <TrendingUp className="w-3 h-3 ml-2 text-green-500" />
                  )}
                </div>
                <Badge 
                  variant={isSelected ? "secondary" : "outline"} 
                  className="ml-2"
                >
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500 text-center">
            📍 Top deals near {selectedLocality === "all" ? "Jaipur" : selectedLocality}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocalityDealFilter;
