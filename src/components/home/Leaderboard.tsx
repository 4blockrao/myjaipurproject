import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Coins, Users, Zap } from "lucide-react";

const Leaderboard = () => {
  const topUsers = [
    { rank: 1, name: "Raj Sharma", coins: 1250, avatar: "🤴", streak: 7 },
    { rank: 2, name: "Priya Singh", coins: 1100, avatar: "👸", streak: 5 },
    { rank: 3, name: "Amit Kumar", coins: 950, avatar: "🧑‍💼", streak: 3 },
    { rank: 4, name: "Sneha Patel", coins: 820, avatar: "👩‍🎓", streak: 4 },
    { rank: 5, name: "Rohit Gupta", coins: 750, avatar: "🧑‍💻", streak: 2 },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "from-yellow-400 to-orange-500";
      case 2: return "from-gray-300 to-gray-500";
      case 3: return "from-orange-400 to-orange-600";
      default: return "from-blue-400 to-blue-600";
    }
  };

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-yellow-600" />
          <h2 className="text-3xl font-bold text-gray-900">JAICoin Leaderboard</h2>
        </div>
        <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-300 hover:bg-yellow-50">
          View Full Rankings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 3 Podium */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 text-center">🏆 Top JAICoin Earners This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-center space-x-4 mb-6">
              {/* 2nd Place */}
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getRankColor(2)} flex items-center justify-center mb-2`}>
                  <span className="text-2xl">{topUsers[1].avatar}</span>
                </div>
                <div className="bg-gray-300 w-20 h-16 rounded-t-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <p className="font-semibold text-sm mt-2">{topUsers[1].name}</p>
                <p className="text-xs text-gray-600">{topUsers[1].coins} coins</p>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${getRankColor(1)} flex items-center justify-center mb-2 animate-pulse`}>
                  <span className="text-3xl">{topUsers[0].avatar}</span>
                </div>
                <div className="bg-yellow-400 w-24 h-20 rounded-t-lg flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <p className="font-bold text-base mt-2">{topUsers[0].name}</p>
                <p className="text-sm text-gray-600">{topUsers[0].coins} coins</p>
                <Badge className="mt-1 bg-yellow-100 text-yellow-800 text-xs">
                  🔥 {topUsers[0].streak} day streak
                </Badge>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getRankColor(3)} flex items-center justify-center mb-2`}>
                  <span className="text-2xl">{topUsers[2].avatar}</span>
                </div>
                <div className="bg-orange-500 w-20 h-12 rounded-t-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-white">3</span>
                </div>
                <p className="font-semibold text-sm mt-2">{topUsers[2].name}</p>
                <p className="text-xs text-gray-600">{topUsers[2].coins} coins</p>
              </div>
            </div>

            {/* Other Rankings */}
            <div className="space-y-2">
              {topUsers.slice(3).map((user) => (
                <div key={user.rank} className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{user.rank}</span>
                    </div>
                    <span className="text-2xl">{user.avatar}</span>
                    <div>
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.streak} day streak</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-sm">{user.coins}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Your Status */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Your Status</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👤</span>
            </div>
            
            <div className="text-4xl font-bold text-purple-600 mb-2">#12</div>
            <p className="text-gray-600 mb-4">Current Rank</p>
            
            <div className="flex items-center justify-center space-x-1 mb-4">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold">280</span>
              <span className="text-gray-600">JAICoins</span>
            </div>

            <Badge className="mb-4 bg-green-100 text-green-800">
              🎯 Just 10 coins to Top 10!
            </Badge>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">This week:</span>
                <span className="font-semibold">+45 coins</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Streak:</span>
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-orange-500" />
                  <span className="font-semibold">3 days</span>
                </div>
              </div>
            </div>

            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 mb-2">
              <Users className="w-4 h-4 mr-2" />
              Challenge a Friend
            </Button>
            
            <Button variant="outline" className="w-full text-purple-600 border-purple-300 hover:bg-purple-50">
              View Full Stats
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Leaderboard;
