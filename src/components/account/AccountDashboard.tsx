import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Coins, Trophy, Users, Star,
  Share2, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

interface AccountDashboardProps {
  user: any;
  profile: any;
  balance: number;
  onRefreshBalance: () => void;
}

const AccountDashboard = ({ user, profile, balance, onRefreshBalance }: AccountDashboardProps) => {
  const level = Math.floor(balance / 100) + 1;
  const levelProgress = (balance % 100);

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <CardContent className="p-3">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <p className="font-bold text-lg">#{profile?.rank || 1}</p>
            <p className="text-xs text-muted-foreground">City Rank</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <Users className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <p className="font-bold text-lg">{profile?.total_referrals || 0}</p>
            <p className="text-xs text-muted-foreground">Referrals</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <Coins className="w-5 h-5 mx-auto mb-1 text-amber-500" />
            <p className="font-bold text-lg">{balance}</p>
            <p className="text-xs text-muted-foreground">JAICoins</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">Level {level}</span>
            </div>
            <span className="text-sm text-muted-foreground">{levelProgress}/100 to next</span>
          </div>
          <Progress value={levelProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Quick Actions</h3>
        
        <div className="space-y-2">
          <Link to="/referral-program">
            <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Invite Friends</p>
                    <p className="text-sm text-green-100">Earn 50 JAICoins per referral</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/leaderboard">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Leaderboard</p>
                    <p className="text-sm text-muted-foreground">See top earners</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/account?tab=wallet">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Coins className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Daily Rewards</p>
                    <p className="text-sm text-muted-foreground">Spin & scratch for coins</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">FREE</Badge>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountDashboard;
