import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

interface AccountSavedProps {
  user: any;
}

const AccountSaved = ({ user }: AccountSavedProps) => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      // For now, we'll show a placeholder as favorites might need a separate table
      // This can be expanded based on actual favorites implementation
      setFavorites([]);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
        <p className="font-medium mb-1">No saved items</p>
        <p className="text-sm text-muted-foreground mb-4">
          Save your favorite deals, events, and news articles here
        </p>
        <div className="flex gap-2 justify-center">
          <Link to="/deals">
            <Button variant="outline">Browse Deals</Button>
          </Link>
          <Link to="/events">
            <Button variant="outline">Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {favorites.map((item) => (
        <Card key={item.id} className="hover:bg-muted/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{item.title}</p>
                <p className="text-sm text-muted-foreground truncate">{item.description}</p>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 text-red-500">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AccountSaved;
