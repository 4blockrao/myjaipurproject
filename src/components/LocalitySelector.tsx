
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LocalitySelectorProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiSelect?: boolean;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

const JAIPUR_LOCALITIES = [
  "C-Scheme",
  "Vaishali Nagar", 
  "Malviya Nagar",
  "Civil Lines",
  "Mansarovar",
  "Jagatpura",
  "Tonk Road",
  "Ajmer Road",
  "Sanganer",
  "Bapu Nagar",
  "Bani Park",
  "Chitrakoot",
  "Shyam Nagar",
  "Nirman Nagar",
  "Pratap Nagar",
  "Jhotwara",
  "Adarsh Nagar",
  "Gopalpura Bypass",
  "Sitapura",
  "Bhankrota"
];

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
  const [filteredLocalities, setFilteredLocalities] = useState(JAIPUR_LOCALITIES);

  useEffect(() => {
    const filtered = JAIPUR_LOCALITIES.filter(locality =>
      locality.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLocalities(filtered);
  }, [searchTerm]);

  const handleSelect = (locality: string) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(locality)) {
        onChange(currentValues.filter(v => v !== locality));
      } else {
        onChange([...currentValues, locality]);
      }
    } else {
      onChange(locality);
      setIsOpen(false);
    }
  };

  const getDisplayValue = () => {
    if (multiSelect && Array.isArray(value)) {
      return value.length > 0 ? `${value.length} localities selected` : placeholder;
    }
    return value || placeholder;
  };

  const isSelected = (locality: string) => {
    if (multiSelect && Array.isArray(value)) {
      return value.includes(locality);
    }
    return value === locality;
  };

  return (
    <div className="relative">
      {label && (
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <div
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent cursor-pointer bg-white flex items-center justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`${value ? 'text-gray-900' : 'text-gray-500'}`}>
            {getDisplayValue()}
          </span>
          <MapPin className="w-4 h-4 text-gray-400" />
        </div>

        {isOpen && (
          <Card className="absolute z-50 w-full mt-1 max-h-64 overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search localities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="max-h-48 overflow-y-auto">
                {filteredLocalities.length > 0 ? (
                  filteredLocalities.map((locality) => (
                    <div
                      key={locality}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                        isSelected(locality) ? 'bg-pink-50 text-pink-700' : 'text-gray-700'
                      }`}
                      onClick={() => handleSelect(locality)}
                    >
                      <span className="font-medium">{locality}</span>
                      {isSelected(locality) && (
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No localities found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {multiSelect && Array.isArray(value) && value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.map((locality) => (
            <span
              key={locality}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700"
            >
              {locality}
              <button
                type="button"
                className="ml-2 text-pink-500 hover:text-pink-700"
                onClick={() => handleSelect(locality)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocalitySelector;
