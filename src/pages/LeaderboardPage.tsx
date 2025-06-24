
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Trophy, Medal, Award, TrendingUp, Users, Star, Crown,
  Flame, Zap, MapPin, Calendar, Gift, Target
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

  const fetchLeaderboards = async (userId: string) => {
    try {
      // Fetch profiles with their balances
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, rank, locality')
        .limit(100);

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

        // Sort by balance
        leaderboardData.sort((a, b) => b.balance - a.balance);
        leaderboardData.forEach((item, index) => {
          item.position = index + 1;
        });

        setGlobalLeaderboard(leaderboardData.slice(0, 50));

        // Find user position
        const userEntry = leaderboardData.find(entry => entry.id === userId);
        setUserPosition(userEntry || null);

        // Create locality leaderboard
        const userLocality = userEntry?.locality || 'Malviya Nagar';
        const localityData = leaderboardData.filter(entry => 
          entry.locality === userLocality
        ).slice(0, 20);
        setLocalityLeaderboard(localityData);
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
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold">#{position}</span>;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Jaipur Maharaja': return 'bg-purple-500';
      case 'Jaipur Legend': return 'bg-yellow-500';
      case 'Jaipur Star': return 'bg-blue-500';
      case 'Jaipur Explorer': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const cheerUser = async (userId: string, userName: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to cheer others",
        variant: "destructive"
      });
      return;
    }

    try {
      // Add cheer transaction
      await supabase
        .from('jaicoin_transactions')
        .insert({
          user_id: userId,
          amount: 5,
          type: 'earned',
          source: 'cheer_received',
          description: `Received cheer from ${profile?.full_name || 'Someone'}`
        });

      toast({
        title: "🎉 Cheer Sent!",
        description: `You cheered for ${userName}!`,
      });

      fetchLeaderboards(user.id);
    } catch (error) {
      console.error('Error sending cheer:', error);
    }
  };

  const LeaderboardCard = ({ entry, showCheer = true }: { entry: LeaderboardEntry; showCheer?: boolean }) => (
    <Card className={`${entry.position <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getRankIcon(entry.position)}
            <Avatar className={`w-12 h-12 ${getRankColor(entry.rank || 'Bronze')}`}>
              <AvatarFallback className="text-white font-bold">
                {entry.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold">{entry.full_name || 'Anonymous'}</span>
                {entry.streak && entry.streak > 7 && (
                  <Flame className="w-4 h-4 text-orange-500" />
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{entry.balance} JC</span>
                {entry.locality && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{entry.locality}</span>
                  </span>
                )}
                {entry.weeklyGains && (
                  <span className="flex items-center space-x-1 text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{entry.weeklyGains} this week</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={getRankColor(entry.rank || 'Bronze')}>
              {entry.rank || 'Bronze'}
            </Badge>
            {showCheer && user && user.id !== entry.id && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => cheerUser(entry.id, entry.full_name)}
                className="text-pink-600 border-pink-300 hover:bg-pink-50"
              >
                <Star className="w-4 h-4 mr-1" />
                Cheer
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="Leaderboard" showBackButton>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Loading leaderboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile} pageTitle="Leaderboard" showBackButton>
      <div className="space-y-4 p-4 max-w-4xl mx-auto">
        {/* User Position Card */}
        {userPosition && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-blue-600" />
                <span>Your Position</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardCard entry={userPosition} showCheer={false} />
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global">🌍 City Champions</TabsTrigger>
            <TabsTrigger value="locality">📍 My Area</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span>Jaipur City Champions</span>
                </CardTitle>
                <CardDescription>
                  Top performers across all of Jaipur - updated in real-time!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {globalLeaderboard.map(entry => (
                  <LeaderboardCard key={entry.id} entry={entry} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locality">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-500" />
                  <span>Local Champions</span>
                </CardTitle>
                <CardDescription>
                  Your neighborhood heroes and local leaders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {localityLeaderboard.length > 0 ? (
                  localityLeaderboard.map(entry => (
                    <LeaderboardCard key={entry.id} entry={entry} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No local champions yet in your area!</p>
                    <p className="text-sm mt-1">Be the first to climb the local leaderboard!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default LeaderboardPage;
