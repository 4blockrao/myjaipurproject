
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle, Instagram, Twitter, Youtube, MessageCircle,
  Share2, Heart, Repeat, Camera, Edit3, Users, Gift
} from "lucide-react";

interface SocialTask {
  id: string;
  title: string;
  description: string;
  reward: number;
  icon: any;
  type: 'one-time' | 'daily' | 'weekly';
  maxLimit?: number;
  completed: boolean;
  todayCount?: number;
}

const SocialTasksHub = () => {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<SocialTask[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState({ current: 0, target: 500 });
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    initializeTasks();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  const initializeTasks = () => {
    const socialTasks: SocialTask[] = [
      // One-time tasks
      {
        id: 'join-whatsapp',
        title: 'Join WhatsApp Channel',
        description: 'Get exclusive deals and updates',
        reward: 20,
        icon: MessageCircle,
        type: 'one-time',
        completed: false
      },
      {
        id: 'follow-instagram',
        title: 'Follow Instagram',
        description: 'Follow @MyJaipur for daily inspiration',
        reward: 15,
        icon: Instagram,
        type: 'one-time',
        completed: false
      },
      {
        id: 'follow-twitter',
        title: 'Follow Twitter/X',
        description: 'Stay updated with latest news',
        reward: 15,
        icon: Twitter,
        type: 'one-time',
        completed: false
      },
      {
        id: 'subscribe-youtube',
        title: 'Subscribe YouTube',
        description: 'Never miss our video content',
        reward: 15,
        icon: Youtube,
        type: 'one-time',
        completed: false
      },
      
      // Daily tasks
      {
        id: 'share-deal-whatsapp',
        title: 'Share Deal to WhatsApp',
        description: 'Share an active deal to your group',
        reward: 10,
        icon: Share2,
        type: 'daily',
        maxLimit: 3,
        completed: false,
        todayCount: 0
      },
      {
        id: 'instagram-story',
        title: 'Instagram Story',
        description: 'Tag @MyJaipur in your story',
        reward: 15,
        icon: Camera,
        type: 'daily',
        maxLimit: 2,
        completed: false,
        todayCount: 0
      },
      {
        id: 'retweet-official',
        title: 'Retweet Official Tweet',
        description: 'Help spread the word',
        reward: 10,
        icon: Repeat,
        type: 'daily',
        maxLimit: 3,
        completed: false,
        todayCount: 0
      },

      // Weekly tasks
      {
        id: 'write-review',
        title: 'Write Review Post',
        description: 'Share your experience publicly',
        reward: 25,
        icon: Edit3,
        type: 'weekly',
        maxLimit: 5,
        completed: false
      },
      {
        id: 'tag-friends',
        title: 'Tag 3 Friends',
        description: 'Tag friends on our Instagram post',
        reward: 15,
        icon: Users,
        type: 'weekly',
        maxLimit: 1,
        completed: false
      }
    ];

    setTasks(socialTasks);
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

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Check if task can be completed
    if (task.type === 'daily' && task.todayCount && task.maxLimit && task.todayCount >= task.maxLimit) {
      toast({
        title: "Daily limit reached",
        description: `You've completed this task ${task.maxLimit} times today`,
        variant: "destructive"
      });
      return;
    }

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
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          if (t.type === 'one-time') {
            return { ...t, completed: true };
          } else if (t.type === 'daily') {
            return { ...t, todayCount: (t.todayCount || 0) + 1 };
          }
        }
        return t;
      }));

      // Update weekly progress
      setWeeklyProgress(prev => ({
        ...prev,
        current: Math.min(prev.current + task.reward, prev.target)
      }));

      toast({
        title: "🎉 Task Completed!",
        description: `You earned ${task.reward} JAICoins!`,
      });

    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openSocialLink = (platform: string, taskId: string) => {
    const links = {
      'join-whatsapp': 'https://whatsapp.com/channel/myjaipur',
      'follow-instagram': 'https://instagram.com/myjaipur',
      'follow-twitter': 'https://twitter.com/myjaipur',
      'subscribe-youtube': 'https://youtube.com/@myjaipur'
    };

    const url = links[taskId as keyof typeof links];
    if (url) {
      window.open(url, '_blank');
      
      // Auto-complete after a delay to allow user to complete the action
      setTimeout(() => {
        completeTask(taskId);
      }, 3000);
    }
  };

  const getTasksByType = (type: string) => {
    return tasks.filter(task => task.type === type);
  };

  const canCompleteTask = (task: SocialTask) => {
    if (task.type === 'one-time') return !task.completed;
    if (task.type === 'daily') return (task.todayCount || 0) < (task.maxLimit || 1);
    if (task.type === 'weekly') return !task.completed;
    return true;
  };

  const TaskCard = ({ task }: { task: SocialTask }) => {
    const Icon = task.icon;
    const canComplete = canCompleteTask(task);

    return (
      <Card className={`${task.completed ? 'bg-green-50 border-green-200' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                task.completed ? 'bg-green-500' : 'bg-pink-100'
              }`}>
                {task.completed ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <Icon className="w-5 h-5 text-pink-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{task.title}</h3>
                <p className="text-xs text-gray-600">{task.description}</p>
                {task.type === 'daily' && task.todayCount !== undefined && (
                  <p className="text-xs text-blue-600">
                    Today: {task.todayCount}/{task.maxLimit || 1}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-green-600">+{task.reward}</span>
                <Gift className="w-4 h-4 text-green-600" />
              </div>
              {canComplete ? (
                <Button 
                  size="sm" 
                  className="mt-2 bg-pink-500 hover:bg-pink-600"
                  onClick={() => {
                    if (['join-whatsapp', 'follow-instagram', 'follow-twitter', 'subscribe-youtube'].includes(task.id)) {
                      openSocialLink(task.id.split('-')[1], task.id);
                    } else {
                      completeTask(task.id);
                    }
                  }}
                >
                  {task.type === 'one-time' ? 'Complete' : 'Do It'}
                </Button>
              ) : (
                <Badge variant="outline" className="mt-2">
                  {task.completed ? 'Done' : 'Limit Reached'}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Weekly Progress */}
      <Card className="bg-gradient-to-r from-pink-50 to-orange-50 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-pink-600" />
            <span>Weekly Progress</span>
          </CardTitle>
          <CardDescription>
            Earn {weeklyProgress.target} JAICoins this week to unlock bonus rewards!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{weeklyProgress.current}/{weeklyProgress.target} JC</span>
            </div>
            <Progress value={(weeklyProgress.current / weeklyProgress.target) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* One-time Social Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>🔗 Connect with MyJaipur</CardTitle>
          <CardDescription>Complete these once to boost your JAICoin wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {getTasksByType('one-time').map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </CardContent>
      </Card>

      {/* Daily Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>📅 Daily Engagement</CardTitle>
          <CardDescription>Complete these daily for consistent rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {getTasksByType('daily').map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </CardContent>
      </Card>

      {/* Weekly Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Weekly Challenges</CardTitle>
          <CardDescription>Higher rewards for weekly commitments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {getTasksByType('weekly').map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialTasksHub;
