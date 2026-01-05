import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Car, Building2, Zap, Search, Plus, Edit, Trash2, Eye, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CarsDataSeeder from "./CarsDataSeeder";

interface CarBrand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  country: string | null;
  is_popular: boolean | null;
  display_order: number | null;
}

interface CarModel {
  id: string;
  name: string;
  slug: string;
  brand_id: string | null;
  body_type: string | null;
  fuel_type: string | null;
  transmission: string | null;
  ex_showroom_price_min: number | null;
  on_road_price_jaipur_min: number | null;
  is_trending: boolean | null;
  is_new_launch: boolean | null;
  is_ev: boolean | null;
  cover_image: string | null;
  car_brands?: { name: string };
}

interface CarDealer {
  id: string;
  name: string;
  slug: string;
  locality: string | null;
  address: string | null;
  phone: string | null;
  is_verified: boolean | null;
  rating: number | null;
  car_brands?: { name: string };
}

const CarsManagement = () => {
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [dealers, setDealers] = useState<CarDealer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingModel, setEditingModel] = useState<CarModel | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [brandsRes, modelsRes, dealersRes] = await Promise.all([
        supabase.from('car_brands').select('*').order('display_order', { ascending: true }),
        supabase.from('car_models').select('*, car_brands(name)').order('name'),
        supabase.from('car_dealers').select('*, car_brands(name)').order('name')
      ]);

      if (brandsRes.data) setBrands(brandsRes.data);
      if (modelsRes.data) setModels(modelsRes.data);
      if (dealersRes.data) setDealers(dealersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBrandPopular = async (id: string, current: boolean | null) => {
    const { error } = await supabase
      .from('car_brands')
      .update({ is_popular: !current })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to update brand", variant: "destructive" });
    } else {
      setBrands(brands.map(b => b.id === id ? { ...b, is_popular: !current } : b));
      toast({ title: "Updated", description: "Brand popularity updated" });
    }
  };

  const toggleModelTrending = async (id: string, current: boolean | null) => {
    const { error } = await supabase
      .from('car_models')
      .update({ is_trending: !current })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to update model", variant: "destructive" });
    } else {
      setModels(models.map(m => m.id === id ? { ...m, is_trending: !current } : m));
      toast({ title: "Updated", description: "Model trending status updated" });
    }
  };

  const toggleDealerVerified = async (id: string, current: boolean | null) => {
    const { error } = await supabase
      .from('car_dealers')
      .update({ is_verified: !current })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to update dealer", variant: "destructive" });
    } else {
      setDealers(dealers.map(d => d.id === id ? { ...d, is_verified: !current } : d));
      toast({ title: "Updated", description: "Dealer verification updated" });
    }
  };

  const updateModelPricing = async (id: string, minPrice: number, maxPrice: number) => {
    const { error } = await supabase
      .from('car_models')
      .update({ 
        on_road_price_jaipur_min: minPrice,
        on_road_price_jaipur_max: maxPrice 
      })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to update pricing", variant: "destructive" });
    } else {
      setModels(models.map(m => m.id === id ? { ...m, on_road_price_jaipur_min: minPrice } : m));
      setEditingModel(null);
      toast({ title: "Updated", description: "Model pricing updated" });
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    return `₹${(price / 100000).toFixed(2)} L`;
  };

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredModels = models.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.car_brands?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDealers = dealers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.locality?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="seeder" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="seeder" className="gap-1">
            <Car className="w-4 h-4" />
            <span className="hidden sm:inline">Data Seeder</span>
          </TabsTrigger>
          <TabsTrigger value="brands" className="gap-1">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Brands ({brands.length})</span>
          </TabsTrigger>
          <TabsTrigger value="models" className="gap-1">
            <Car className="w-4 h-4" />
            <span className="hidden sm:inline">Models ({models.length})</span>
          </TabsTrigger>
          <TabsTrigger value="dealers" className="gap-1">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Dealers ({dealers.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Data Seeder Tab */}
        <TabsContent value="seeder">
          <CarsDataSeeder />
        </TabsContent>

        {/* Brands Tab */}
        <TabsContent value="brands">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Car Brands</CardTitle>
                  <CardDescription>Manage car brands and their visibility</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search brands..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Popular</TableHead>
                    <TableHead>Order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBrands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell>
                        {brand.logo_url ? (
                          <img src={brand.logo_url} alt={brand.name} className="w-10 h-10 object-contain" />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <Car className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell>{brand.country || 'N/A'}</TableCell>
                      <TableCell>
                        <Switch
                          checked={brand.is_popular || false}
                          onCheckedChange={() => toggleBrandPopular(brand.id, brand.is_popular)}
                        />
                      </TableCell>
                      <TableCell>{brand.display_order || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Car Models</CardTitle>
                  <CardDescription>Manage car models and Jaipur pricing</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search models..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Jaipur Price</TableHead>
                    <TableHead>Trending</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModels.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {model.cover_image && (
                            <img src={model.cover_image} alt={model.name} className="w-12 h-8 object-cover rounded" />
                          )}
                          <div>
                            <div className="font-medium">{model.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {model.fuel_type} • {model.transmission}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{model.car_brands?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{model.body_type || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1">
                              {formatPrice(model.on_road_price_jaipur_min)}
                              <Edit className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Jaipur Pricing</DialogTitle>
                              <DialogDescription>
                                Update on-road price for {model.name} in Jaipur
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Minimum Price (₹)</Label>
                                <Input
                                  type="number"
                                  defaultValue={model.on_road_price_jaipur_min || 0}
                                  id={`min-price-${model.id}`}
                                />
                              </div>
                              <Button onClick={() => {
                                const minInput = document.getElementById(`min-price-${model.id}`) as HTMLInputElement;
                                updateModelPricing(model.id, parseInt(minInput.value), parseInt(minInput.value) + 200000);
                              }}>
                                Save Pricing
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={model.is_trending || false}
                          onCheckedChange={() => toggleModelTrending(model.id, model.is_trending)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {model.is_new_launch && <Badge className="bg-green-500">New</Badge>}
                          {model.is_ev && <Badge className="bg-blue-500"><Zap className="w-3 h-3" /></Badge>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dealers Tab */}
        <TabsContent value="dealers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Car Dealers</CardTitle>
                  <CardDescription>Manage car dealers in Jaipur</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search dealers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dealer</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Locality</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDealers.map((dealer) => (
                    <TableRow key={dealer.id}>
                      <TableCell className="font-medium">{dealer.name}</TableCell>
                      <TableCell>{dealer.car_brands?.name || 'N/A'}</TableCell>
                      <TableCell>{dealer.locality || 'N/A'}</TableCell>
                      <TableCell>{dealer.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Switch
                          checked={dealer.is_verified || false}
                          onCheckedChange={() => toggleDealerVerified(dealer.id, dealer.is_verified)}
                        />
                      </TableCell>
                      <TableCell>
                        {dealer.rating ? (
                          <Badge variant="secondary">{dealer.rating} ★</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredDealers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No dealers found. Run the seeder to add dealers.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CarsManagement;
