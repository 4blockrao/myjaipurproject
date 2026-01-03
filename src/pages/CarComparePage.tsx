import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Car, ArrowLeft, Plus, X, Fuel, Settings, Users, Gauge, Zap, Check, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';

const CarComparePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openPicker, setOpenPicker] = useState<number | null>(null);
  
  const carIds = [
    searchParams.get('car1'),
    searchParams.get('car2'),
    searchParams.get('car3'),
  ].filter(Boolean) as string[];

  const { data: allCars } = useQuery({
    queryKey: ['all-cars-for-compare'],
    queryFn: async () => {
      const { data } = await supabase
        .from('car_models')
        .select(`*, brand:car_brands(name, slug)`)
        .order('name');
      return data || [];
    }
  });

  const { data: selectedCars, isLoading } = useQuery({
    queryKey: ['compare-cars', carIds],
    queryFn: async () => {
      if (carIds.length === 0) return [];
      const { data } = await supabase
        .from('car_models')
        .select(`*, brand:car_brands(name, slug, logo_url)`)
        .in('id', carIds);
      return carIds.map(id => data?.find(c => c.id === id)).filter(Boolean);
    },
    enabled: carIds.length > 0
  });

  const formatPrice = (price: number) => {
    if (!price) return 'N/A';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const addCar = (slot: number, carId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(`car${slot}`, carId);
    setSearchParams(params);
    setOpenPicker(null);
  };

  const removeCar = (slot: number) => {
    const params = new URLSearchParams(searchParams);
    params.delete(`car${slot}`);
    setSearchParams(params);
  };

  const compareRows = [
    { label: 'On-Road Price (Jaipur)', key: 'price', format: (c: any) => formatPrice(c.on_road_price_jaipur_min) },
    { label: 'Fuel Type', key: 'fuel_type', icon: Fuel },
    { label: 'Transmission', key: 'transmission', icon: Settings },
    { label: 'Body Type', key: 'body_type' },
    { label: 'Seating Capacity', key: 'seating_capacity', icon: Users, format: (c: any) => `${c.seating_capacity || 5} Seater` },
    { label: 'Engine CC', key: 'engine_cc', format: (c: any) => c.engine_cc ? `${c.engine_cc} cc` : 'N/A' },
    { label: 'Power', key: 'power_bhp', icon: Zap, format: (c: any) => c.power_bhp ? `${c.power_bhp} bhp` : 'N/A' },
    { label: 'Torque', key: 'torque_nm', format: (c: any) => c.torque_nm ? `${c.torque_nm} Nm` : 'N/A' },
    { label: 'Mileage (City)', key: 'mileage_city', icon: Gauge, format: (c: any) => c.mileage_city ? `${c.mileage_city} kmpl` : 'N/A' },
    { label: 'Mileage (Highway)', key: 'mileage_highway', format: (c: any) => c.mileage_highway ? `${c.mileage_highway} kmpl` : 'N/A' },
    { label: 'Waiting Period', key: 'waiting_period_weeks', format: (c: any) => c.waiting_period_weeks ? `${c.waiting_period_weeks} weeks` : 'Check with dealer' },
  ];

  const selectedCarNames = selectedCars?.map(c => `${c.brand?.name} ${c.name}`).join(' vs ') || 'Select Cars';

  return (
    <>
      <Helmet>
        <title>{selectedCars?.length ? `${selectedCarNames} - Price Comparison in Jaipur` : 'Compare Cars in Jaipur 2025'}</title>
        <meta name="description" content={`Compare ${selectedCarNames} on-road prices, specs, mileage, and features in Jaipur. Make an informed buying decision.`} />
        <link rel="canonical" href="https://jaipurcircle.com/cars/compare" />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-6">
          <div className="container px-4">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/cars">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Compare Cars in Jaipur
            </h1>
            <p className="text-muted-foreground mt-2">
              Side-by-side comparison with Jaipur on-road prices
            </p>
          </div>
        </section>

        {/* Car Selection */}
        <div className="container px-4 py-6">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((slot) => {
              const car = selectedCars?.find((c, i) => i === slot - 1);
              return (
                <Card key={slot} className="relative">
                  <CardContent className="p-4 text-center">
                    {car ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => removeCar(slot)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                          {car.cover_image ? (
                            <img src={car.cover_image} alt={car.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Car className="w-12 h-12 text-muted-foreground/30" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{car.brand?.name}</p>
                        <h3 className="font-semibold text-foreground text-sm">{car.name}</h3>
                        <p className="text-primary font-bold mt-1">{formatPrice(car.on_road_price_jaipur_min)}</p>
                      </>
                    ) : (
                      <Popover open={openPicker === slot} onOpenChange={(open) => setOpenPicker(open ? slot : null)}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-32 flex flex-col gap-2">
                            <Plus className="w-8 h-8 text-muted-foreground" />
                            <span className="text-sm">Add Car {slot}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0">
                          <Command>
                            <CommandInput placeholder="Search cars..." />
                            <CommandList>
                              <CommandEmpty>No car found.</CommandEmpty>
                              <CommandGroup>
                                {allCars?.filter(c => !carIds.includes(c.id)).map((car) => (
                                  <CommandItem
                                    key={car.id}
                                    value={`${car.brand?.name} ${car.name}`}
                                    onSelect={() => addCar(slot, car.id)}
                                  >
                                    <Car className="w-4 h-4 mr-2" />
                                    <span>{car.brand?.name} {car.name}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Comparison Table */}
        {selectedCars && selectedCars.length >= 2 && (
          <div className="container px-4">
            <Card>
              <CardHeader>
                <CardTitle>Specifications Comparison</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {compareRows.map((row, i) => (
                        <tr key={row.key} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                          <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap border-r">
                            <div className="flex items-center gap-2">
                              {row.icon && <row.icon className="w-4 h-4 text-primary" />}
                              {row.label}
                            </div>
                          </td>
                          {selectedCars.map((car, j) => (
                            <td key={j} className="px-4 py-3 text-center capitalize">
                              {row.format ? row.format(car) : car[row.key] || 'N/A'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Pros & Cons */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {selectedCars.map((car: any, i: number) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-lg">{car.brand?.name} {car.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {car.pros && car.pros.length > 0 && (
                      <div>
                        <p className="font-medium text-green-600 mb-2 flex items-center gap-2">
                          <Check className="w-4 h-4" /> Pros
                        </p>
                        <ul className="space-y-1">
                          {car.pros.slice(0, 4).map((pro: string, j: number) => (
                            <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {car.cons && car.cons.length > 0 && (
                      <div>
                        <p className="font-medium text-red-600 mb-2 flex items-center gap-2">
                          <Minus className="w-4 h-4" /> Cons
                        </p>
                        <ul className="space-y-1">
                          {car.cons.slice(0, 4).map((con: string, j: number) => (
                            <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-red-500 mt-1">•</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Link to={`/cars/${car.brand?.slug}/${car.slug}`}>
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(!selectedCars || selectedCars.length < 2) && (
          <div className="container px-4">
            <Card className="text-center py-12">
              <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Add at least 2 cars to compare</h3>
              <p className="text-muted-foreground">Select cars from the slots above to see a detailed comparison</p>
            </Card>
          </div>
        )}

        <Footer />
        <NativeBottomNav />
      </div>
    </>
  );
};

export default CarComparePage;
