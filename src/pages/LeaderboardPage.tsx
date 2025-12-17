import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FloatingHeader from "@/components/layout/FloatingHeader";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import {
  Trophy, Medal, Award, TrendingUp, Users, Star, Crown,
  Flame, Zap, MapPin, Gift
} from "lucide-react";

interface LeaderboardEntry {
  id: string;
  full_name: string;
  rank: string;
  balance: number;
  position: number;
  locality?: string;
  streak?: number;
  weeklyGains?: number;
}

const LeaderboardPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [localityLeaderboard, setLocalityLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<LeaderboardEntry | null>(null);
  const [activeTab, setActiveTab] = useState('global');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await Promise.all([
          fetchUserProfile(session.user.id),
          fetchLeaderboards(session.user.id)
        ]);
      } else {
        await fetchLeaderboards(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchLeaderboards = async (userId: string | null) => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, rank, locality')
        .limit(50);

      if (profiles) {
        const leaderboardData = await Promise.all(
          profiles.map(async (profile, index) => {
            const { data: balance } = await supabase.rpc('get_user_balance', {
              user_uuid: profile.id
            });
            return {
              ...profile,
              balance: balance || 0,
              position: index + 1,
              streak: Math.floor(Math.random() * 30) + 1,
              weeklyGains: Math.floor(Math.random() * 200) + 50
            };
          })
        );

        leaderboardData.sort((a, b) => b.balance - a.balance);
        leaderboardData.forEach((item, index) => {
          item.position = index + 1;
        });

        setGlobalLeaderboard(leaderboardData.slice(0, 50));

        if (userId) {
          const userEntry = leaderboardData.find(entry => entry.id === userId);
          setUserPosition(userEntry || null);

          const userLocality = userEntry?.locality || 'Malviya Nagar';
          const localityData = leaderboardData.filter(entry => 
            entry.locality === userLocality
          ).slice(0, 20);
          setLocalityLeaderboard(localityData);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1: return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300';
      case 2: return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300';
      case 3: return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300';
      default: return 'bg-card border-border/50';
    }
  };

  const LeaderboardItem = ({ entry }: { entry: LeaderboardEntry }) => (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${getPositionStyle(entry.position)}`}>
      <div className="w-8 flex justify-center">
        {getRankIcon(entry.position)}
      </div>
      
      <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
        <AvatarFallback className="bg-primary/10 text-primary font-bold">
          {entry.full_name?.[0] || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold truncate">{entry.full_name || 'Anonymous'}</span>
          {entry.streak && entry.streak > 7 && (
            <Flame className="w-4 h-4 text-orange-500 shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          {entry.locality && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {entry.locality}
            </span>
          )}
          {entry.weeklyGains && (
            <span className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-3 h-3" />
              +{entry.weeklyGains}
            </span>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <div className="flex items-center gap-1 font-bold text-primary">
          <Zap className="w-4 h-4" />
          {entry.balance}
        </div>
        <p className="text-xs text-muted-foreground">JAICoins</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <FloatingHeader title="Leaderboard" showBackButton backPath="/" />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground text-sm">Loading leaderboard...</p>
          </div>
        </div>
        <NativeBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <FloatingHeader title="Leaderboard" showBackButton backPath="/" />
      
      <main className="pt-16 px-4 max-w-lg mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 py-4">
          <Card className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white border-0">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-90" />
              <p className="text-3xl font-bold">#{userPosition?.position || '--'}</p>
              <p className="text-xs opacity-80">Your Rank</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-90" />
              <p className="text-3xl font-bold">{userPosition?.balance || 0}</p>
              <p className="text-xs opacity-80">JAICoins</p>
            </CardContent>
          </Card>
        </div>

        {/* Prizes Banner */}
        <Card className="mb-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Gift className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Monthly Prizes</p>
                <p className="text-sm text-muted-foreground">Top 10 win exclusive rewards!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger 
              value="global" 
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              🌍 City Champions
            </TabsTrigger>
            <TabsTrigger 
              value="locality" 
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              📍 My Area
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-3 mt-0">
            {globalLeaderboard.length > 0 ? (
              globalLeaderboard.map(entry => (
                <LeaderboardItem key={entry.id} entry={entry} />
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No rankings yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="locality" className="space-y-3 mt-0">
            {localityLeaderboard.length > 0 ? (
              localityLeaderboard.map(entry => (
                <LeaderboardItem key={entry.id} entry={entry} />
              ))
            ) : (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No local champions yet</p>
                <p className="text-sm text-muted-foreground mt-1">Be the first in your area!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <NativeBottomNav />
    </div>
  );
};

export default LeaderboardPage;
