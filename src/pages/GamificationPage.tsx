
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, Star, Target, Gift, Users, Calendar,
  Coins, Award, TrendingUp, Clock, CheckCircle,
  Zap, Crown, Medal, Flame
} from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  reward: number;
  progress: number;
  target: number;
  completed: boolean;
  expires_at: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned_at?: string;
  progress?: number;
  target?: number;
}

interface LeaderboardEntry {
  rank: number;
  user_name: string;
  total_points: number;
  level: string;
  is_current_user?: boolean;
}

const GamificationPage = () => {
  const [user, setUser] = useState<any>(null);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    level: 'Bronze',
    rank: 0,
    nextLevelPoints: 1000,
    currentLevelPoints: 0
  });
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchChallenges();
      fetchAchievements();
      fetchLeaderboard();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    } else {
      window.location.href = '/';
    }
    setIsLoading(false);
  };

  const fetchUserStats = async () => {
    // Mock data - in real implementation, fetch from user_stats table
    setUserStats({
      totalPoints: 2450,
      level: 'Silver',
      rank: 42,
      nextLevelPoints: 5000,
      currentLevelPoints: 2450
    });
  };

  const fetchChallenges = async () => {
    // Mock data - in real implementation, fetch from challenges table
    const mockChallenges: Challenge[] = [
      {
        id: "1",
        title: "First Purchase",
        description: "Make your first deal purchase",
        type: "daily",
        reward: 100,
        progress: 0,
        target: 1,
        completed: false,
        expires_at: "2024-06-25T23:59:59Z"
      },
      {
        id: "2",
        title: "Social Butterfly",
        description: "Share 3 deals with friends",
        type: "weekly",
        reward: 250,
        progress: 1,
        target: 3,
        completed: false,
        expires_at: "2024-06-30T23:59:59Z"
      },
      {
        id: "3",
        title: "Explorer",
        description: "Visit 5 different merchants",
        type: "monthly",
        reward: 500,
        progress: 2,
        target: 5,
        completed: false,
        expires_at: "2024-07-31T23:59:59Z"
      },
      {
        id: "4",
        title: "Review Master",
        description: "Write 10 merchant reviews",
        type: "special",
        reward: 1000,
        progress: 7,
        target: 10,
        completed: false,
        expires_at: "2024-12-31T23:59:59Z"
      }
    ];
    setChallenges(mockChallenges);
  };

  const fetchAchievements = async () => {
    // Mock data - in real implementation, fetch from user_achievements table
    const mockAchievements: Achievement[] = [
      {
        id: "1",
        title: "Welcome to Jaipur",
        description: "Completed profile setup",
        icon: "🎯",
        earned_at: "2024-06-01T10:00:00Z"
      },
      {
        id: "2",
        title: "Deal Hunter",
        description: "Purchased your first deal",
        icon: "🏹",
        earned_at: "2024-06-02T15:30:00Z"
      },
      {
        id: "3",
        title: "Social Sharer",
        description: "Shared your first deal",
        icon: "📤",
        earned_at: "2024-06-03T12:15:00Z"
      },
      {
        id: "4",
        title: "Top Spender",
        description: "Spend ₹10,000 in deals",
        icon: "💰",
        progress: 6500,
        target: 10000
      },
      {
        id: "5",
        title: "Loyalty Champion",
        description: "Visit the same merchant 5 times",
        icon: "🏆",
        progress: 3,
        target: 5
      }
    ];
    setAchievements(mockAchievements);
  };

  const fetchLeaderboard = async () => {
    // Mock data - in real implementation, fetch from leaderboard
    const mockLeaderboard: LeaderboardEntry[] = [
      { rank: 1, user_name: "RajasthaniFoodie", total_points: 15420, level: "Diamond" },
      { rank: 2, user_name: "JaipurExplorer", total_points: 12890, level: "Gold" },
      { rank: 3, user_name: "PinkCityFan", total_points: 11250, level: "Gold" },
      { rank: 41, user_name: "LocalDealer", total_points: 2680, level: "Silver" },
      { rank: 42, user_name: "You", total_points: 2450, level: "Silver", is_current_user: true },
      { rank: 43, user_name: "DealSeeker", total_points: 2340, level: "Silver" }
    ];
    setLeaderboard(mockLeaderboard);
  };

  const getLevelProgress = () => {
    const currentProgress = userStats.currentLevelPoints;
    const nextLevel = userStats.nextLevelPoints;
    return (currentProgress / nextLevel) * 100;
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Calendar className="w-4 h-4" />;
      case 'weekly': return <Clock className="w-4 h-4" />;
      case 'monthly': return <Target className="w-4 h-4" />;
      case 'special': return <Star className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-100 text-blue-700';
      case 'weekly': return 'bg-green-100 text-green-700';
      case 'monthly': return 'bg-purple-100 text-purple-700';
      case 'special': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Bronze': return <Medal className="w-5 h-5 text-amber-600" />;
      case 'Silver': return <Award className="w-5 h-5 text-gray-500" />;
      case 'Gold': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'Diamond': return <Crown className="w-5 h-5 text-blue-500" />;
      default: return <Medal className="w-5 h-5 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your gamification progress</p>
          <Button onClick={() => window.location.href = '/'}>
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-orange-400 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gamification Hub</h1>
              <p className="opacity-90">Earn points, complete challenges, and climb the leaderboard!</p>
            </div>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline"
              className="bg-white text-pink-600 border-white hover:bg-gray-100"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* User Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <Coins className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-blue-800">{userStats.totalPoints}</h3>
              <p className="text-blue-600">Total Points</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getLevelIcon(userStats.level)}
                <span className="text-2xl font-bold text-purple-800">{userStats.level}</span>
              </div>
              <p className="text-purple-600">Current Level</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-green-800">#{userStats.rank}</h3>
              <p className="text-green-600">Leaderboard Rank</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="text-center mb-3">
                <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-orange-600 font-medium">Next Level Progress</p>
              </div>
              <Progress value={getLevelProgress()} className="mb-2" />
              <p className="text-sm text-orange-700 text-center">
                {userStats.nextLevelPoints - userStats.currentLevelPoints} points to Gold
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="challenges" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className={`${challenge.completed ? 'bg-green-50 border-green-200' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getChallengeTypeIcon(challenge.type)}
                        <Badge className={getChallengeTypeColor(challenge.type)}>
                          {challenge.type}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-yellow-500" />
                          <span className="font-bold text-yellow-600">{challenge.reward}</span>
                        </div>
                      </div>
                    </div>
                    <CardTitle className="flex items-center gap-2">
                      {challenge.completed && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {challenge.title}
                    </CardTitle>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{challenge.progress}/{challenge.target}</span>
                        </div>
                        <Progress value={(challenge.progress / challenge.target) * 100} />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>Expires {new Date(challenge.expires_at).toLocaleDateString()}</span>
                      </div>
                      {challenge.completed ? (
                        <Badge className="bg-green-100 text-green-700 w-full justify-center">
                          Completed! Reward Claimed
                        </Badge>
                      ) : (
                        <Button 
                          className="w-full" 
                          variant="outline"
                          disabled={challenge.progress < challenge.target}
                        >
                          {challenge.progress >= challenge.target ? 'Claim Reward' : 'In Progress'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={`${achievement.earned_at ? 'bg-yellow-50 border-yellow-200' : 'opacity-60'}`}>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h3 className="font-semibold text-lg mb-2">{achievement.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{achievement.description}</p>
                    
                    {achievement.earned_at ? (
                      <div className="space-y-2">
                        <Badge className="bg-yellow-100 text-yellow-700">
                          <Trophy className="w-3 h-3 mr-1" />
                          Earned
                        </Badge>
                        <p className="text-xs text-gray-500">
                          {new Date(achievement.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    ) : achievement.progress !== undefined ? (
                      <div className="space-y-2">
                        <Progress value={(achievement.progress / (achievement.target || 1)) * 100} />
                        <p className="text-xs text-gray-500">
                          {achievement.progress}/{achievement.target}
                        </p>
                      </div>
                    ) : (
                      <Badge variant="outline">Locked</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Monthly Leaderboard
                </CardTitle>
                <CardDescription>Top performers this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((entry) => (
                    <div 
                      key={entry.rank} 
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        entry.is_current_user ? 'bg-pink-50 border border-pink-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          entry.rank === 1 ? 'bg-yellow-500' :
                          entry.rank === 2 ? 'bg-gray-400' :
                          entry.rank === 3 ? 'bg-amber-600' : 'bg-gray-600'
                        }`}>
                          {entry.rank <= 3 && entry.rank === 1 && <Crown className="w-5 h-5" />}
                          {entry.rank <= 3 && entry.rank === 2 && <Medal className="w-5 h-5" />}
                          {entry.rank <= 3 && entry.rank === 3 && <Award className="w-5 h-5" />}
                          {entry.rank > 3 && entry.rank}
                        </div>
                        <div>
                          <p className="font-semibold flex items-center gap-2">
                            {entry.user_name}
                            {entry.is_current_user && <Badge variant="outline">You</Badge>}
                          </p>
                          <div className="flex items-center gap-2">
                            {getLevelIcon(entry.level)}
                            <span className="text-sm text-gray-600">{entry.level}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{entry.total_points}</p>
                        <p className="text-sm text-gray-500">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GamificationPage;
