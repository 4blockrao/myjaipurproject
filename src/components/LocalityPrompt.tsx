
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LocalitySelector from "./LocalitySelector";

interface LocalityPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onLocalitySelected: (locality: string) => void;
}

const LocalityPrompt = ({ isOpen, onClose, onLocalitySelected }: LocalityPromptProps) => {
  const [selectedLocality, setSelectedLocality] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveLocality = async () => {
    if (!selectedLocality) {
      toast({
        title: "Please select a locality",
        description: "Choose your locality to see personalized deals",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            locality: selectedLocality,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;
      } else {
        // Store in localStorage for non-authenticated users
        localStorage.setItem('userLocality', selectedLocality);
      }

      onLocalitySelected(selectedLocality);
      onClose();
      
      toast({
        title: "Location saved!",
        description: `You'll now see deals near ${selectedLocality}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <MapPin className="w-6 h-6 mr-2 text-pink-500" />
            Choose Your Locality
          </DialogTitle>
          <DialogDescription className="text-base">
            Select your area in Jaipur to discover the best deals near you
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <LocalitySelector
            value={selectedLocality}
            onChange={(value) => setSelectedLocality(value as string)}
            label="Your Locality"
            placeholder="Search for your area..."
            required
          />
          
          <div className="flex gap-3">
            <Button 
              onClick={handleSaveLocality}
              disabled={isLoading || !selectedLocality}
              className="flex-1 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500"
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="px-6"
            >
              Skip
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            You can change this anytime in your profile settings
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocalityPrompt;
