
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Share2, Instagram, Twitter, Youtube, MessageCircle,
  Check, Clock, Gift, Coins, Zap, Camera, Users,
  Calendar, Target, Star, Award, Trophy, Heart
} from "lucide-react";

interface SocialTask {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'one-time' | 'daily' | 'weekly';
  platform: 'whatsapp' | 'instagram' | 'twitter' | 'youtube' | 'general';
  status: 'available' | 'pending' | 'completed';
  maxDaily?: number;
  icon: any;
}

interface DailyStreak {
  currentStreak: number;
  bestStreak: number;
  lastCheckIn: string;
  totalCheckIns: number;
}

const SocialTasksHub = () => {
  const [socialTasks, setSocialTasks] = useState<SocialTask[]>([]);
  const [dailyStreak, setDailyStreak] = useState<DailyStreak>({
    currentStreak: 0,
    bestStreak: 0,
    lastCheckIn: '',
    totalCheckIns: 0
  });
  const [user, setUser] = useState<any>(null);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('daily');
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    initializeTasks();
    fetchDailyStreak();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  const initializeTasks = () => {
    const tasks: SocialTask[] = [
      // One-time Social Channel Tasks
      {
        id: 'join-whatsapp',
        title: 'Join WhatsApp Channel',
        description: 'Join our official MyJaipur WhatsApp channel for exclusive updates',
        reward: 20,
        type: 'one-time',
        platform: 'whatsapp',
        status: 'available',
        icon: MessageCircle
      },
      {
        id: 'follow-instagram',
        title: 'Follow on Instagram',
        description: 'Follow @MyJaipur on Instagram for daily deals and updates',
        reward: 15,
        type: 'one-time',
        platform: 'instagram',
        status: 'available',
        icon: Instagram
      },
      {
        id: 'follow-twitter',
        title: 'Follow on Twitter/X',
        description: 'Follow @MyJaipur on X for real-time notifications',
        reward: 15,
        type: 'one-time',
        platform: 'twitter',
        status: 'available',
        icon: Twitter
      },
      {
        id: 'subscribe-youtube',
        title: 'Subscribe to YouTube',
        description: 'Subscribe to our YouTube channel for merchant spotlights',
        reward: 15,
        type: 'one-time',
        platform: 'youtube',
        status: 'available',
        icon: Youtube
      },
      
      // Daily Engagement Tasks
      {
        id: 'share-deal-whatsapp',
        title: 'Share Deal on WhatsApp',
        description: 'Share an active deal to your WhatsApp groups',
        reward: 10,
        type: 'daily',
        platform: 'whatsapp',
        status: 'available',
        maxDaily: 3,
        icon: Share2
      },
      {
        id: 'instagram-story',
        title: 'Share Instagram Story',
        description: 'Share a deal on your Instagram story tagging @MyJaipur',
        reward: 15,
        type: 'daily',
        platform: 'instagram',
        status: 'available',
        maxDaily: 2,
        icon: Camera
      },
      {
        id: 'retweet-official',
        title: 'Retweet Our Tweet',
        description: 'Retweet our latest official tweet',
        reward: 10,
        type: 'daily',
        platform: 'twitter',
        status: 'available',
        maxDaily: 3,
        icon: Twitter
      },
      {
        id: 'daily-checkin',
        title: 'Daily Check-in',
        description: 'Check in daily to maintain your Jaipur Journey streak',
        reward: 5,
        type: 'daily',
        platform: 'general',
        status: 'available',
        maxDaily: 1,
        icon: Calendar
      },

      // Weekly Tasks
      {
        id: 'review-post',
        title: 'Share Review Post',
        description: 'Share a review of your experience with MyJaipur',
        reward: 25,
        type: 'weekly',
        platform: 'general',
        status: 'available',
        icon: Star
      },
      {
        id: 'tag-friends',
        title: 'Tag 3 Friends',
        description: 'Tag 3 friends on our latest Instagram post',
        reward: 15,
        type: 'weekly',
        platform: 'instagram',
        status: 'available',
        icon: Users
      }
    ];

    setSocialTasks(tasks);
  };

  const fetchDailyStreak = () => {
    // Mock data - in real implementation, fetch from database
    const mockStreak = {
      currentStreak: 3,
      bestStreak: 7,
      lastCheckIn: new Date().toISOString().split('T')[0],
      totalCheckIns: 15
    };
    setDailyStreak(mockStreak);
    setWeeklyProgress(45); // Mock weekly progress
  };

  const completeTask = async (taskId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to complete tasks",
        variant: "destructive"
      });
      return;
    }

    const task = socialTasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      // Award JAICoins
      const { error } = await supabase
        .from('jaicoin_transactions')
        .insert({
          user_id: user.id,
          amount: task.reward,
          type: 'earned',
          source: 'social_task',
          description: `Completed: ${task.title}`
        });

      if (error) throw error;

      // Update task status
      setSocialTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'completed' } : t
      ));

      toast({
        title: "🎉 Task Completed!",
        description: `You earned ${task.reward} JAICoins for "${task.title}"!`,
      });

      // Special handling for daily check-in
      if (taskId === 'daily-checkin') {
        setDailyStreak(prev => ({
          ...prev,
          currentStreak: prev.currentStreak + 1,
          totalCheckIns: prev.totalCheckIns + 1,
          lastCheckIn: new Date().toISOString().split('T')[0]
        }));
      }

    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStreakReward = (streak: number) => {
    if (streak === 7) return 50;
    if (streak === 30) return 200;
    if (streak === 3) return 10;
    return 5;
  };

  const getStreakMultiplier = (streak: number) => {
    if (streak >= 30) return 3;
    if (streak >= 7) return 2;
    return 1;
  };

  const TaskCard = ({ task }: { task: SocialTask }) => {
    const Icon = task.icon;
    const isCompleted = task.status === 'completed';
    const isPending = task.status === 'pending';

    return (
      <Card className={`${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-500' : 'bg-gray-100'
              }`}>
                {isCompleted ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Icon className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.description}</p>
                {task.maxDaily && (
                  <p className="text-xs text-gray-500">Max {task.maxDaily} times per day</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isCompleted ? "default" : "secondary"}>
                {task.reward} JC
              </Badge>
              {!isCompleted && (
                <Button 
                  size="sm" 
                  onClick={() => completeTask(task.id)}
                  disabled={isPending}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  {isPending ? <Clock className="w-4 h-4" /> : 'Complete'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const oneTimeTasks = socialTasks.filter(t => t.type === 'one-time');
  const dailyTasks = socialTasks.filter(t => t.type === 'daily');
  const weeklyTasks = socialTasks.filter(t => t.type === 'weekly');

  return (
    <div className="space-y-6">
      {/* Daily Streak Card */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-orange-500" />
            <span>Jaipur Journey Streak</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-600">{dailyStreak.currentStreak}</div>
              <p className="text-sm text-gray-600">Current Streak</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{dailyStreak.bestStreak}</div>
              <p className="text-sm text-gray-600">Best Streak</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{getStreakMultiplier(dailyStreak.currentStreak)}x</div>
              <p className="text-sm text-gray-600">Multiplier</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{dailyStreak.totalCheckIns}</div>
              <p className="text-sm text-gray-600">Total Check-ins</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Next milestone: 7 days</span>
              <span className="text-sm text-gray-500">{dailyStreak.currentStreak}/7 days</span>
            </div>
            <Progress value={(dailyStreak.currentStreak / 7) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-6 h-6 text-purple-500" />
            <span>Weekly Challenge Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Complete 5 tasks this week</span>
              <Badge variant="outline">{Math.floor(weeklyProgress / 20)}/5 tasks</Badge>
            </div>
            <Progress value={weeklyProgress} className="h-3" />
            <p className="text-xs text-gray-600">Reward: 100 JAICoins + Special Badge</p>
          </div>
        </CardContent>
      </Card>

      {/* Task Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">📅 Daily Tasks</TabsTrigger>
          <TabsTrigger value="social">📱 Social Tasks</TabsTrigger>
          <TabsTrigger value="weekly">🏆 Weekly Quests</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span>Daily Engagement Tasks</span>
              </CardTitle>
              <CardDescription>
                Complete these tasks daily to earn JAICoins and maintain your streak
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dailyTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-green-500" />
                <span>One-Time Social Tasks</span>
              </CardTitle>
              <CardDescription>
                Connect with us on social media and earn bonus JAICoins
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {oneTimeTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-purple-500" />
                <span>Weekly Quests</span>
              </CardTitle>
              <CardDescription>
                Complete these bigger challenges for higher rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {weeklyTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Festival Quests Teaser */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gift className="w-8 h-8 text-yellow-500" />
              <div>
                <h3 className="font-bold">Festival Quests Coming Soon!</h3>
                <p className="text-sm text-gray-600">Special challenges during Diwali, Teej, and other festivals</p>
              </div>
            </div>
            <Badge className="bg-yellow-500">Double Rewards!</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialTasksHub;
