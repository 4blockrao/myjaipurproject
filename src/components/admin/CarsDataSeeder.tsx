import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Car, RefreshCw, Database, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SeederStats {
  brands: number;
  models: number;
  dealers: number;
  chargingStations: number;
}

const CarsDataSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [stats, setStats] = useState<SeederStats>({ brands: 0, models: 0, dealers: 0, chargingStations: 0 });
  const [lastSeedTime, setLastSeedTime] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
    // Check localStorage for last seed time
    const storedTime = localStorage.getItem('cars_last_seed_time');
    if (storedTime) setLastSeedTime(storedTime);
  }, []);

  const fetchStats = async () => {
    try {
      const [brandsRes, modelsRes, dealersRes, stationsRes] = await Promise.all([
        supabase.from('car_brands').select('id', { count: 'exact', head: true }),
        supabase.from('car_models').select('id', { count: 'exact', head: true }),
        supabase.from('car_dealers').select('id', { count: 'exact', head: true }),
        supabase.from('ev_charging_stations').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        brands: brandsRes.count || 0,
        models: modelsRes.count || 0,
        dealers: dealersRes.count || 0,
        chargingStations: stationsRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const runSeeder = async () => {
    setIsSeeding(true);
    setProgress(0);
    setCurrentStep("Initializing...");

    try {
      // Call the edge function
      setCurrentStep("Calling seed-cars-data function...");
      setProgress(20);

      const { data, error } = await supabase.functions.invoke('seed-cars-data', {
        body: { action: 'seed' }
      });

      if (error) throw error;

      setProgress(80);
      setCurrentStep("Processing response...");

      if (data?.success) {
        setProgress(100);
        setCurrentStep("Completed!");
        
        const now = new Date().toISOString();
        localStorage.setItem('cars_last_seed_time', now);
        setLastSeedTime(now);

        toast({
          title: "Seeding Complete",
          description: `Successfully seeded ${data.stats?.brands || 0} brands and ${data.stats?.models || 0} models`,
        });

        await fetchStats();
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Seeding error:', error);
      setCurrentStep("Error occurred");
      toast({
        title: "Seeding Failed",
        description: error.message || "Failed to seed cars data",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
      setTimeout(() => {
        setProgress(0);
        setCurrentStep("");
      }, 3000);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Cars Data Seeder
          </CardTitle>
          <CardDescription>
            Seed or update car brands, models, dealers, and EV charging stations from CarWale data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.brands}</div>
              <div className="text-sm text-muted-foreground">Brands</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.models}</div>
              <div className="text-sm text-muted-foreground">Models</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.dealers}</div>
              <div className="text-sm text-muted-foreground">Dealers</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.chargingStations}</div>
              <div className="text-sm text-muted-foreground">EV Stations</div>
            </div>
          </div>

          {/* Last Seed Info */}
          {lastSeedTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Last seeded: {new Date(lastSeedTime).toLocaleString()}
            </div>
          )}

          {/* Progress */}
          {isSeeding && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{currentStep}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={runSeeder} 
              disabled={isSeeding}
              className="gap-2"
            >
              {isSeeding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isSeeding ? 'Seeding...' : stats.brands > 0 ? 'Update Data' : 'Seed Data'}
            </Button>
          </div>

          {/* Info */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">Seeder Information</p>
                <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-300">
                  <li>Uses UPSERT - safe to run multiple times</li>
                  <li>Updates existing records based on slug</li>
                  <li>Adds new brands/models if not present</li>
                  <li>Prices are Jaipur-specific (on-road prices)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarsDataSeeder;
