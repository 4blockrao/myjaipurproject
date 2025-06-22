
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp, Users, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Leaderboard = () => {
  const [topEarners, setTopEarners] = useState([]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [activeTab, setActiveTab] = useState('earners');
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    fetchTopEarners();
    fetchTopReferrers();
    fetchUserRank();
  }, []);

  const fetchTopEarners = async () => {
    // Get users with highest JaiCoin balances
    const { data } = await supabase.rpc('get_top_earners', {}, { count: 10 });
    setTopEarners(data || []);
  };

  const fetchTopReferrers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, total_referrals, rank')
      .order('total_referrals', { ascending: false })
      .limit(10);
    setTopReferrers(data || []);
  };

  const fetchUserRank = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('rank, total_referrals')
        .eq('id', user.id)
        .single();
      setUserRank(data);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{position}</span>;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Diamond':
        return 'bg-purple-500';
      case 'Gold':
        return 'bg-yellow-500';
      case 'Silver':
        return 'bg-gray-400';
      case 'Bronze':
        return 'bg-amber-600';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-600 flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6" />
            Leaderboard
          </CardTitle>
          <CardDescription>
            See how you rank against other HiJaipur users!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('earners')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                activeTab === 'earners'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Top Earners
            </button>
            <button
              onClick={() => setActiveTab('referrers')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                activeTab === 'referrers'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Top Referrers
            </button>
          </div>

          {userRank && (
            <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className={`w-10 h-10 ${getRankColor(userRank.rank)}`}>
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        YOU
                      </div>
                    </Avatar>
                    <div>
                      <div className="font-medium">Your Stats</div>
                      <div className="text-sm text-gray-600">
                        {activeTab === 'referrers' 
                          ? `${userRank.total_referrals} referrals` 
                          : 'JaiCoin balance'}
                      </div>
                    </div>
                  </div>
                  <Badge className={getRankColor(userRank.rank)} variant="secondary">
                    {userRank.rank}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {activeTab === 'earners' && topEarners.map((user, index) => (
              <Card key={user.id} className={`${index < 3 ? 'border-yellow-200 bg-yellow-50' : ''}`}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getRankIcon(index + 1)}
                      <Avatar className={`w-10 h-10 ${getRankColor(user.rank)}`}>
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">
                          {user.full_name?.[0] || 'U'}
                        </div>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.full_name || 'Anonymous User'}</div>
                        <div className="text-sm text-gray-600">
                          {user.balance || 0} JaiCoins
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{user.rank || 'Bronze'}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {activeTab === 'referrers' && topReferrers.map((user, index) => (
              <Card key={user.id} className={`${index < 3 ? 'border-yellow-200 bg-yellow-50' : ''}`}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getRankIcon(index + 1)}
                      <Avatar className={`w-10 h-10 ${getRankColor(user.rank)}`}>
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">
                          {user.full_name?.[0] || 'U'}
                        </div>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.full_name || 'Anonymous User'}</div>
                        <div className="text-sm text-gray-600">
                          {user.total_referrals || 0} referrals
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{user.rank}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {((activeTab === 'earners' && topEarners.length === 0) || 
            (activeTab === 'referrers' && topReferrers.length === 0)) && (
            <div className="text-center py-8 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No rankings yet. Be the first to climb the leaderboard!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
