import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Car, Wallet, Fuel, Settings2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const budgetRanges = [
  { label: 'Under ₹5 Lakh', value: '0-5', slug: 'under-5-lakh' },
  { label: '₹5-10 Lakh', value: '5-10', slug: '5-10-lakh' },
  { label: '₹10-15 Lakh', value: '10-15', slug: '10-15-lakh' },
  { label: '₹15-20 Lakh', value: '15-20', slug: '15-20-lakh' },
  { label: '₹20-30 Lakh', value: '20-30', slug: '20-30-lakh' },
  { label: 'Above ₹30 Lakh', value: '30-999', slug: 'above-30-lakh' },
];

const bodyTypes = [
  { label: 'SUV', value: 'suv', icon: '🚙' },
  { label: 'Hatchback', value: 'hatchback', icon: '🚗' },
  { label: 'Sedan', value: 'sedan', icon: '🚘' },
  { label: 'MUV', value: 'muv', icon: '🚐' },
  { label: 'Luxury', value: 'luxury', icon: '✨' },
];

const fuelTypes = [
  { label: 'Petrol', value: 'petrol' },
  { label: 'Diesel', value: 'diesel' },
  { label: 'Electric', value: 'electric' },
  { label: 'CNG', value: 'cng' },
  { label: 'Hybrid', value: 'hybrid' },
];

interface CarSearchHeroProps {
  onSearch?: (query: string) => void;
}

const CarSearchHero = ({ onSearch }: CarSearchHeroProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [carType, setCarType] = useState<'new' | 'used'>('new');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cars/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
      <div className="absolute inset-0 bg-[url('/images/tata-sierra-jaipur.png')] bg-cover bg-center opacity-[0.07]" />
      
      <div className="container relative z-10 px-4 py-10 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header Badge */}
          <div className="flex justify-center mb-6">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              <Car className="w-4 h-4 mr-2" /> Jaipur's Complete Car Buying Guide
            </Badge>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-foreground text-center mb-3">
            Find Your Perfect Car
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-8 max-w-xl mx-auto">
            Compare on-road prices, explore dealers by locality, and get expert buying advice for Jaipur
          </p>

          {/* Search Card */}
          <div className="bg-card rounded-2xl shadow-xl border p-4 md:p-6">
            {/* New/Used Toggle */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-4">
              <button
                onClick={() => setCarType('new')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  carType === 'new' 
                    ? 'bg-primary text-primary-foreground shadow' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                New Cars
              </button>
              <button
                onClick={() => setCarType('used')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  carType === 'used' 
                    ? 'bg-primary text-primary-foreground shadow' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Used Cars
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by brand, model (e.g., Tata Punch, Hyundai Creta)"
                className="pl-12 pr-24 h-14 text-base rounded-xl border-2 focus:border-primary"
              />
              <Button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg"
              >
                Search
              </Button>
            </form>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Budget Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full gap-2">
                    <Wallet className="w-4 h-4" />
                    Budget
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {budgetRanges.map((range) => (
                    <DropdownMenuItem key={range.value} asChild>
                      <Link to={`/cars/budget/${range.slug}`}>{range.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Body Type Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full gap-2">
                    <Car className="w-4 h-4" />
                    Body Type
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {bodyTypes.map((type) => (
                    <DropdownMenuItem key={type.value} asChild>
                      <Link to={`/cars/body-type/${type.value}`}>
                        <span className="mr-2">{type.icon}</span> {type.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Fuel Type Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full gap-2">
                    <Fuel className="w-4 h-4" />
                    Fuel Type
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  {fuelTypes.map((type) => (
                    <DropdownMenuItem key={type.value} asChild>
                      <Link to={`/cars/fuel/${type.value}`}>{type.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* All Filters */}
              <Link to="/cars/all">
                <Button variant="outline" className="rounded-full gap-2">
                  <Settings2 className="w-4 h-4" />
                  All Filters
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {carType === 'new' ? (
              <>
                <Link to="/cars/ev">
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5">
                    ⚡ Electric Cars
                  </Badge>
                </Link>
                <Link to="/cars/budget/under-10-lakh">
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5">
                    Under ₹10 Lakh
                  </Badge>
                </Link>
                <Link to="/cars/body-type/suv">
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5">
                    Best SUVs
                  </Badge>
                </Link>
                <Link to="/cars/upcoming">
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5">
                    Upcoming Cars
                  </Badge>
                </Link>
              </>
            ) : (
              <>
                <Link to="/cars/used/under-5-lakh">
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5">
                    Under ₹5 Lakh
                  </Badge>
                </Link>
                <Link to="/cars/used/certified">
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5">
                    Certified Cars
                  </Badge>
                </Link>
                <Link to="/cars/used/dealers">
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5">
                    Trusted Dealers
                  </Badge>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarSearchHero;
