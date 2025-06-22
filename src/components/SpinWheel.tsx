
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Gift, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SpinWheel = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [lastSpin, setLastSpin] = useState<Date | null>(null);
  const [timeUntilNextSpin, setTimeUntilNextSpin] = useState('');
  const [totalSpins, setTotalSpins] = useState(0);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();

  const rewards = [5, 10, 15, 20, 25, 50, 100, 'Free Spin'];
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];

  useEffect(() => {
    checkSpinEligibility();
    fetchSpinHistory();
  }, []);

  useEffect(() => {
    if (!canSpin && lastSpin) {
      const timer = setInterval(() => {
        updateTimeUntilNextSpin();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [canSpin, lastSpin]);

  const checkSpinEligibility = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('spin_attempts')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const lastSpinTime = new Date(data[0].created_at);
        const nextSpinTime = new Date(lastSpinTime.getTime() + 24 * 60 * 60 * 1000);
        const now = new Date();
        
        setLastSpin(lastSpinTime);
        setCanSpin(now >= nextSpinTime);
      }
    }
  };

  const fetchSpinHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('spin_attempts')
        .select('*')
        .eq('user_id', user.id);
      setTotalSpins(data?.length || 0);
    }
  };

  const updateTimeUntilNextSpin = () => {
    if (!lastSpin) return;
    
    const nextSpinTime = new Date(lastSpin.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const timeDiff = nextSpinTime.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      setCanSpin(true);
      setTimeUntilNextSpin('');
    } else {
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      setTimeUntilNextSpin(`${hours}h ${minutes}m ${seconds}s`);
    }
  };

  const spinWheel = async () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    const randomRotation = Math.floor(Math.random() * 360) + 1800; // At least 5 full rotations
    setRotation(prev => prev + randomRotation);
    
    setTimeout(async () => {
      const segmentAngle = 360 / rewards.length;
      const finalAngle = (rotation + randomRotation) % 360;
      const rewardIndex = Math.floor((360 - finalAngle) / segmentAngle) % rewards.length;
      const reward = rewards[rewardIndex];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let rewardAmount = 0;
        if (typeof reward === 'number') {
          rewardAmount = reward;
          
          // Record the spin
          await supabase.from('spin_attempts').insert({
            user_id: user.id,
            reward_amount: rewardAmount
          });
          
          // Add JaiCoins
          await supabase.from('jaicoin_transactions').insert({
            user_id: user.id,
            amount: rewardAmount,
            type: 'earned',
            source: 'spin',
            description: `Spin wheel reward: ${rewardAmount} JaiCoins`
          });
        } else {
          // Free spin - just record the attempt
          await supabase.from('spin_attempts').insert({
            user_id: user.id,
            reward_amount: 0
          });
        }
        
        toast({
          title: "🎉 Congratulations!",
          description: typeof reward === 'number' 
            ? `You won ${reward} JaiCoins!` 
            : "You won a free spin!",
        });
        
        if (typeof reward === 'number') {
          setCanSpin(false);
          setLastSpin(new Date());
        }
        
        fetchSpinHistory();
      }
      
      setIsSpinning(false);
    }, 3000);
  };

  return (
    <Card className="border-yellow-200">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-yellow-600 flex items-center justify-center gap-2">
          <Gift className="w-6 h-6" />
          Daily Spin Wheel
        </CardTitle>
        <CardDescription>
          Spin once every 24 hours to win JaiCoins!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div 
              className={`w-64 h-64 rounded-full border-4 border-yellow-400 relative overflow-hidden transition-transform duration-3000 ease-out ${isSpinning ? 'animate-spin' : ''}`}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {rewards.map((reward, index) => {
                const angle = (360 / rewards.length) * index;
                return (
                  <div
                    key={index}
                    className="absolute w-1/2 h-1/2 origin-bottom-right flex items-center justify-center text-white font-bold text-sm"
                    style={{
                      backgroundColor: colors[index],
                      transform: `rotate(${angle}deg)`,
                      clipPath: `polygon(0 0, 100% 0, 87% 87%)`,
                    }}
                  >
                    <span className="transform -rotate-45 mt-8">
                      {typeof reward === 'number' ? `${reward}` : reward}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-500"></div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          {canSpin ? (
            <Button 
              onClick={spinWheel} 
              disabled={isSpinning}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              {isSpinning ? 'Spinning...' : 'Spin Now!'}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button disabled className="px-8 py-3">
                <Clock className="w-5 h-5 mr-2" />
                Next spin in {timeUntilNextSpin}
              </Button>
              <p className="text-sm text-gray-500">Come back tomorrow for your daily spin!</p>
            </div>
          )}
          
          <div className="flex justify-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              Total Spins: {totalSpins}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpinWheel;
