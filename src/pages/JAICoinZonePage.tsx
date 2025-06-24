
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ScratchCard from "@/components/gamification/ScratchCard";
import {
  Star, Gift, Zap, Target, Coins, Trophy, Crown,
  Calendar, Flame, Users, TrendingUp, Award,
  RotateCcw, Dice6, Heart, Share2
} from "lucide-react";

const JAICoinZonePage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [dailySpinUsed, setDailySpinUsed] = useState(false);
  const [scratchCardUsed, setScratchCardUsed] = useState(false);
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [scratchCardTrigger, setScratchCardTrigger] = useState<'welcome' | 'referral' | 'daily' | 'achievement'>('daily');
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyTasks, setDailyTasks] = useState([
    { id: 1, title: "Share a deal", reward: 10, completed: false, icon: Share2 },
    { id: 2, title: "Like 3 deals", reward: 5, completed: true, icon: Heart },
    { id: 3, title: "Refer a friend", reward: 50, completed: false, icon: Users },
    { id: 4, title: "Complete profile", reward: 15, completed: true, icon: Target },
  ]);
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
          fetchBalance(session.user.id),
          checkDailyUsage(session.user.id)
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

  const fetchBalance = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_user_balance', {
        user_uuid: userId
      });

      if (error) throw error;
      setBalance(data || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const checkDailyUsage = async (userId: string) => {
    // Check if user has used daily features today
    const today = new Date().toDateString();
    const lastSpin = localStorage.getItem(`lastSpin_${userId}`);
    const lastScratch = localStorage.getItem(`lastScratch_${userId}`);
    
    setDailySpinUsed(lastSpin === today);
    setScratchCardUsed(lastScratch === today);
  };

  const handleDailySpin = async () => {
    if (dailySpinUsed || !user) return;
    
    setIsSpinning(true);
    
    // Simulate spin delay
    setTimeout(async () => {
      const rewards = [5, 10, 15, 20, 25, 50];
      const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
      
      try {
        // Award coins
        await supabase
          .from('jaicoin_transactions')
          .insert({
            user_id: user.id,
            amount: randomReward,
            type: 'earned',
            source: 'daily_spin',
            description: `Daily spin wheel reward`
          });

        toast({
          title: "🎉 Spin Complete!",
          description: `You won ${randomReward} JAICoins!`,
        });

        // Update local state
        setBalance(prev => prev + randomReward);
        setDailySpinUsed(true);
        localStorage.setItem(`lastSpin_${user.id}`, new Date().toDateString());
        
      } catch (error) {
        console.error('Error awarding spin reward:', error);
        toast({
          title: "Error",
          description: "Failed to award spin reward. Please try again.",
          variant: "destructive"
        });
      }
      
      setIsSpinning(false);
    }, 3000);
  };

  const handleDailyScratch = () => {
    if (scratchCardUsed || !user) return;
    
    setScratchCardTrigger('daily');
    setShowScratchCard(true);
    setScratchCardUsed(true);
    localStorage.setItem(`lastScratch_${user.id}`, new Date().toDateString());
  };

  const handleTaskComplete = async (taskId: number) => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (!task || task.completed || !user) return;

    try {
      // Award coins for task
      await supabase
        .from('jaicoin_transactions')
        .insert({
          user_id: user.id,
          amount: task.reward,
          type: 'earned',
          source: 'daily_task',
          description: `Completed task: ${task.title}`
        });

      toast({
        title: "✅ Task Complete!",
        description: `You earned ${task.reward} JAICoins!`,
      });

      // Update task state
      setDailyTasks(prev => 
        prev.map(t => t.id === taskId ? { ...t, completed: true } : t)
      );
      setBalance(prev => prev + task.reward);

    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const completedTasks = dailyTasks.filter(t => t.completed).length;
  const progressPercentage = (completedTasks / dailyTasks.length) * 100;

  if (isLoading) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="JAICoin Zone" showBackButton>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Loading JAICoin Zone...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="JAICoin Zone" showBackButton>
        <Card className="mx-4 mt-4">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg">Please Sign In</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <Button className="w-full" onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile} pageTitle="JAICoin Zone" showBackButton>
      <div className="space-y-4 p-4 max-w-4xl mx-auto">
        {/* Current Balance */}
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl lg:text-3xl font-bold mb-1">{balance}</div>
                <div className="text-yellow-100">JAICoins Available</div>
              </div>
              <div className="text-4xl lg:text-5xl">💰</div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Spin Wheel */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-purple-600" />
                <span>Daily Spin Wheel</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <div className={`w-full h-full rounded-full bg-gradient-to-r from-pink-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 flex items-center justify-center ${isSpinning ? 'animate-spin' : ''}`}>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <Coins className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleDailySpin}
                disabled={dailySpinUsed || isSpinning}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isSpinning ? 'Spinning...' : dailySpinUsed ? 'Used Today' : 'Spin for Rewards!'}
              </Button>
              
              <p className="text-xs text-gray-600 mt-2">
                Win 5-50 JAICoins • Resets daily at midnight
              </p>
            </CardContent>
          </Card>

          {/* Scratch Card */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Dice6 className="w-5 h-5 text-green-600" />
                <span>Daily Scratch Card</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="w-24 h-16 mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
              
              <Button
                onClick={handleDailyScratch}
                disabled={scratchCardUsed}
                variant="outline"
                className="w-full border-green-300 text-green-700 hover:bg-green-50"
              >
                {scratchCardUsed ? 'Used Today' : 'Reveal Reward!'}
              </Button>
              
              <p className="text-xs text-gray-600 mt-2">
                Mystery rewards up to 100 JAICoins
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>Daily Challenges</span>
              </CardTitle>
              <Badge variant="outline">
                {completedTasks}/{dailyTasks.length}
              </Badge>
            </div>
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-gray-600">
                {completedTasks === dailyTasks.length ? 
                  '🎉 All tasks completed!' : 
                  `Complete ${dailyTasks.length - completedTasks} more tasks`
                }
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dailyTasks.map((task) => {
              const IconComponent = task.icon;
              return (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-green-600">+{task.reward} JAICoins</p>
                    </div>
                  </div>
                  {task.completed ? (
                    <Badge className="bg-green-100 text-green-800">✓ Done</Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => handleTaskComplete(task.id)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Complete
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>Achievement Unlocks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { title: "First Spin", desc: "Complete first daily spin", unlocked: true, reward: 25 },
                { title: "Task Master", desc: "Complete all daily tasks", unlocked: false, reward: 50 },
                { title: "Streak Master", desc: "7-day login streak", unlocked: false, reward: 100 },
                { title: "Social Star", desc: "Share 10 deals", unlocked: false, reward: 75 },
                { title: "Referral King", desc: "Refer 5 friends", unlocked: false, reward: 250 },
                { title: "Lucky Winner", desc: "Win max spin reward", unlocked: false, reward: 100 },
              ].map((achievement, index) => (
                <div key={index} className={`p-3 rounded-lg border-2 ${achievement.unlocked ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'}`}>
                  <div className="text-center">
                    <div className="text-2xl mb-1">{achievement.unlocked ? '🏆' : '🔒'}</div>
                    <p className="font-semibold text-xs">{achievement.title}</p>
                    <p className="text-xs text-gray-600 mb-1">{achievement.desc}</p>
                    <Badge variant={achievement.unlocked ? "default" : "secondary"} className="text-xs">
                      {achievement.reward} JC
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <ScratchCard 
          isOpen={showScratchCard}
          onClose={() => setShowScratchCard(false)}
          trigger={scratchCardTrigger}
        />
      </div>
    </DashboardLayout>
  );
};

export default JAICoinZonePage;
