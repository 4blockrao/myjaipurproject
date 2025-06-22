
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Target, Clock, Gift, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  reward_amount: number;
  reward_type: string;
  end_date: string;
  max_participants: number;
  current_participants: number;
  is_active: boolean;
}

interface Participation {
  id: string;
  challenge_id: string;
  current_progress: number;
  is_completed: boolean;
  completed_at?: string;
  reward_claimed: boolean;
}

const GroupChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userParticipations, setUserParticipations] = useState<Participation[]>([]);
  const [activeTab, setActiveTab] = useState('active');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChallenges();
    fetchUserParticipations();
  }, []);

  const fetchChallenges = async () => {
    try {
      const { data } = await supabase
        .from('group_challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const fetchUserParticipations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('user_id', user.id);
      
      setUserParticipations(data || []);
    } catch (error) {
      console.error('Error fetching participations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('challenge_participants')
      .insert({
        challenge_id: challengeId,
        user_id: user.id
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to join challenge",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success!",
        description: "Successfully joined the challenge!"
      });
      
      // Update current participants count
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge) {
        await supabase
          .from('group_challenges')
          .update({ current_participants: challenge.current_participants + 1 })
          .eq('id', challengeId);
      }
      
      fetchChallenges();
      fetchUserParticipations();
    }
  };

  const claimReward = async (challengeId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const participation = userParticipations.find(p => p.challenge_id === challengeId);
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (!participation || !challenge || !participation.is_completed) return;

    // Mark reward as claimed
    const { error } = await supabase
      .from('challenge_participants')
      .update({ reward_claimed: true })
      .eq('id', participation.id);

    if (!error && challenge.reward_type === 'jaicoin') {
      // Award JaiCoins
      await supabase
        .from('jaicoin_transactions')
        .insert({
          user_id: user.id,
          amount: challenge.reward_amount,
          type: 'earned',
          source: 'challenge',
          description: `Reward for completing: ${challenge.title}`
        });
    }

    toast({
      title: "Reward Claimed!",
      description: `You earned ${challenge.reward_amount} ${challenge.reward_type}!`
    });
    
    fetchUserParticipations();
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'referral': return <Users className="w-5 h-5" />;
      case 'spending': return <Target className="w-5 h-5" />;
      case 'review': return <Trophy className="w-5 h-5" />;
      case 'social': return <Zap className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const isUserParticipating = (challengeId: string) => {
    return userParticipations.some(p => p.challenge_id === challengeId);
  };

  const getUserProgress = (challengeId: string) => {
    const participation = userParticipations.find(p => p.challenge_id === challengeId);
    return participation || null;
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  if (isLoading) {
    return <div>Loading challenges...</div>;
  }

  const activeChallenges = challenges.filter(c => new Date(c.end_date) > new Date());
  const userChallenges = challenges.filter(c => isUserParticipating(c.id));

  return (
    <div className="space-y-6">
      <Card className="border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-600 flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6" />
            Group Challenges
          </CardTitle>
          <CardDescription>
            Join community challenges and compete for amazing rewards!
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Challenges</TabsTrigger>
          <TabsTrigger value="joined">My Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {activeChallenges.map((challenge) => {
              const userProgress = getUserProgress(challenge.id);
              const isParticipating = isUserParticipating(challenge.id);
              const progressPercentage = userProgress ? (userProgress.current_progress / challenge.target_value) * 100 : 0;

              return (
                <Card key={challenge.id} className="border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        {getChallengeTypeIcon(challenge.challenge_type)}
                        <div>
                          <h3 className="font-semibold text-lg">{challenge.title}</h3>
                          <p className="text-gray-600 text-sm">{challenge.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="mb-2">
                          {challenge.reward_amount} {challenge.reward_type}
                        </Badge>
                        <div className="text-sm text-gray-500">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {getTimeRemaining(challenge.end_date)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Target: {challenge.target_value} {challenge.challenge_type}s</span>
                        <span>{challenge.current_participants}/{challenge.max_participants || '∞'} participants</span>
                      </div>

                      {isParticipating && userProgress && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Your Progress: {userProgress.current_progress}/{challenge.target_value}</span>
                            <span>{Math.round(progressPercentage)}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                          
                          {userProgress.is_completed && !userProgress.reward_claimed && (
                            <Button 
                              onClick={() => claimReward(challenge.id)}
                              className="w-full bg-green-500 hover:bg-green-600"
                            >
                              <Gift className="w-4 h-4 mr-2" />
                              Claim Reward
                            </Button>
                          )}
                          
                          {userProgress.reward_claimed && (
                            <Badge variant="secondary" className="w-full justify-center">
                              Reward Claimed!
                            </Badge>
                          )}
                        </div>
                      )}

                      {!isParticipating && (
                        <Button 
                          onClick={() => joinChallenge(challenge.id)}
                          className="w-full"
                          disabled={challenge.max_participants && challenge.current_participants >= challenge.max_participants}
                        >
                          Join Challenge
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {activeChallenges.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active challenges at the moment. Check back soon!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="joined" className="space-y-4">
          <div className="grid gap-4">
            {userChallenges.map((challenge) => {
              const userProgress = getUserProgress(challenge.id);
              const progressPercentage = userProgress ? (userProgress.current_progress / challenge.target_value) * 100 : 0;

              return (
                <Card key={challenge.id} className="border-green-200">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        {getChallengeTypeIcon(challenge.challenge_type)}
                        <div>
                          <h3 className="font-semibold text-lg">{challenge.title}</h3>
                          <p className="text-gray-600 text-sm">{challenge.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {userProgress?.is_completed ? (
                          <Badge className="bg-green-500 mb-2">Completed!</Badge>
                        ) : (
                          <Badge variant="outline" className="mb-2">In Progress</Badge>
                        )}
                        <div className="text-sm text-gray-500">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {getTimeRemaining(challenge.end_date)}
                        </div>
                      </div>
                    </div>

                    {userProgress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress: {userProgress.current_progress}/{challenge.target_value}</span>
                          <span>{Math.round(progressPercentage)}% Complete</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                        
                        {userProgress.is_completed && !userProgress.reward_claimed && (
                          <Button 
                            onClick={() => claimReward(challenge.id)}
                            className="w-full bg-green-500 hover:bg-green-600 mt-3"
                          >
                            <Gift className="w-4 h-4 mr-2" />
                            Claim Your Reward
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {userChallenges.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>You haven't joined any challenges yet. Check out the active challenges!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupChallenges;
