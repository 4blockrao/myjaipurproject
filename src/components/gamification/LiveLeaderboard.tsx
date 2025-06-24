
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Trophy, Medal, Award, TrendingUp, Users, Star, Crown,
  Flame, Zap, MapPin, Calendar, Gift
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

interface FlashEvent {
  id: string;
  title: string;
  description: string;
  endTime: Date;
  reward: string;
  participants: number;
}

const LiveLeaderboard = () => {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [localityLeaderboard, setLocalityLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<LeaderboardEntry | null>(null);
  const [flashEvents, setFlashEvents] = useState<FlashEvent[]>([]);
  const [activeTab, setActiveTab] = useState('global');
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchLeaderboards();
    setupRealTimeUpdates();
    fetchFlashEvents();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  const fetchLeaderboards = async () => {
    try {
      // Fetch global leaderboard
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
              streak: Math.floor(Math.random() * 30) + 1, // Mock data
              weeklyGains: Math.floor(Math.random() * 200) + 50 // Mock data
            };
          })
        );

        // Sort by balance
        leaderboardData.sort((a, b) => b.balance - a.balance);
        leaderboardData.forEach((item, index) => {
          item.position = index + 1;
        });

        setGlobalLeaderboard(leaderboardData.slice(0, 20));

        // Find user position
        if (user) {
          const userEntry = leaderboardData.find(entry => entry.id === user.id);
          setUserPosition(userEntry || null);
        }

        // Create locality leaderboard (mock filter by user's locality)
        const localityData = leaderboardData.filter(entry => 
          entry.locality === 'Malviya Nagar' // Mock user locality
        ).slice(0, 10);
        setLocalityLeaderboard(localityData);
      }
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    }
  };

  const fetchFlashEvents = () => {
    // Mock flash events data
    const events: FlashEvent[] = [
      {
        id: '1',
        title: 'Weekend Referral Blitz',
        description: 'Double rewards for all referrals this weekend!',
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        reward: '2x JAICoins',
        participants: 342
      },
      {
        id: '2',
        title: 'Karva Chauth Special',
        description: 'Complete 5 tasks to win festival rewards',
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        reward: '500 JC + Badge',
        participants: 128
      }
    ];
    setFlashEvents(events);
  };

  const setupRealTimeUpdates = () => {
    // Set up real-time updates for leaderboard changes
    const channel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'jaicoin_transactions'
        },
        () => {
          // Refresh leaderboard when new transactions occur
          fetchLeaderboards();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

    if (user.id === userId) {
      toast({
        title: "Can't cheer yourself",
        description: "You can't cheer for your own performance!",
        variant: "destructive"
      });
      return;
    }

    try {
      // Deduct 5 JC from user
      const { error: deductError } = await supabase
        .from('jaicoin_transactions')
        .insert({
          user_id: user.id,
          amount: 5,
          type: 'spent',
          source: 'cheer',
          description: `Cheered for ${userName}`
        });

      if (deductError) throw deductError;

      // Add 5 JC to cheered user
      const { error: addError } = await supabase
        .from('jaicoin_transactions')
        .insert({
          user_id: userId,
          amount: 5,
          type: 'earned',
          source: 'cheer_received',
          description: `Received cheer from ${user.user_metadata?.full_name || 'Someone'}`
        });

      if (addError) throw addError;

      toast({
        title: "🎉 Cheer Sent!",
        description: `You cheered for ${userName} with 5 JAICoins!`,
      });

      // Refresh leaderboard
      fetchLeaderboards();

    } catch (error) {
      console.error('Error sending cheer:', error);
      toast({
        title: "Error",
        description: "Failed to send cheer. Please try again.",
        variant: "destructive"
      });
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
                Cheer (5 JC)
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
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

      {/* Flash Events */}
      {flashEvents.length > 0 && (
        <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-red-600 animate-pulse" />
              <span>⚡ Flash Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {flashEvents.map(event => (
              <div key={event.id} className="p-3 bg-white rounded-lg border">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{event.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Ends {event.endTime.toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{event.participants} joined</span>
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-red-500 text-white">{event.reward}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="global">🌍 City Leaderboard</TabsTrigger>
          <TabsTrigger value="locality">📍 My Locality</TabsTrigger>
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
                <span>Malviya Nagar Champions</span>
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
  );
};

export default LiveLeaderboard;
