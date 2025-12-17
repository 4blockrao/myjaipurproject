import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import AuthModal from "@/components/auth/AuthModal";
import { 
  Coins, Trophy, Users, Star, Gift, Target,
  Heart, ShoppingBag, Settings, Share2, Crown,
  Flame, ArrowRight, RotateCcw, Dice6, Award,
  ChevronRight, LogOut, Wallet, Receipt, Ticket
} from "lucide-react";

// Sub-components
import AccountDashboard from "@/components/account/AccountDashboard";
import AccountReferral from "@/components/account/AccountReferral";
import AccountWallet from "@/components/account/AccountWallet";
import AccountOrders from "@/components/account/AccountOrders";
import AccountSaved from "@/components/account/AccountSaved";
import AccountSettings from "@/components/account/AccountSettings";

const AccountPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const activeTab = searchParams.get('tab') || 'dashboard';

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
          fetchBalance(session.user.id)
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
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }
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

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
    toast({ title: "Signed out successfully" });
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  };

  const getRank = (coins: number) => {
    if (coins >= 2000) return { name: 'Diamond', icon: '💎', color: 'text-purple-500' };
    if (coins >= 1000) return { name: 'Gold', icon: '🥇', color: 'text-yellow-500' };
    if (coins >= 500) return { name: 'Silver', icon: '🥈', color: 'text-gray-400' };
    return { name: 'Bronze', icon: '🥉', color: 'text-orange-500' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Guest view - prompt to sign in
  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold">Account</h1>
          </div>
        </header>

        <main className="px-4 py-8">
          <div className="max-w-md mx-auto text-center space-y-6">
            {/* Hero */}
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-6">
                <Coins className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 animate-bounce">
                <span className="text-3xl">🎁</span>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-2">Join JaipurCircle</h2>
              <p className="text-muted-foreground">
                Sign up to earn JAICoins, unlock exclusive deals, and compete on the leaderboard!
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3">
                  <Gift className="w-5 h-5 text-primary mb-2" />
                  <p className="font-semibold text-sm">50 Welcome Coins</p>
                  <p className="text-xs text-muted-foreground">Just for signing up</p>
                </CardContent>
              </Card>
              <Card className="bg-green-500/5 border-green-500/20">
                <CardContent className="p-3">
                  <Users className="w-5 h-5 text-green-500 mb-2" />
                  <p className="font-semibold text-sm">50 Per Referral</p>
                  <p className="text-xs text-muted-foreground">Unlimited earnings</p>
                </CardContent>
              </Card>
              <Card className="bg-purple-500/5 border-purple-500/20">
                <CardContent className="p-3">
                  <Star className="w-5 h-5 text-purple-500 mb-2" />
                  <p className="font-semibold text-sm">Daily Spin</p>
                  <p className="text-xs text-muted-foreground">Win up to 50 coins</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-500/5 border-orange-500/20">
                <CardContent className="p-3">
                  <Trophy className="w-5 h-5 text-orange-500 mb-2" />
                  <p className="font-semibold text-sm">Leaderboard</p>
                  <p className="text-xs text-muted-foreground">Compete & win prizes</p>
                </CardContent>
              </Card>
            </div>

            <Button 
              onClick={() => setShowAuthModal(true)} 
              size="lg" 
              className="w-full rounded-xl h-12 text-base"
            >
              Sign Up & Get 50 JAICoins
            </Button>

            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <button 
                onClick={() => setShowAuthModal(true)}
                className="text-primary font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </main>

        <NativeBottomNav />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  const rank = getRank(balance);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Profile Summary */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="px-4 pt-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold">My Account</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-14 h-14 border-2 border-white/30">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-white/20 text-white font-bold">
                {getInitials(profile?.full_name || 'User')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg truncate">{profile?.full_name || 'User'}</h2>
                {profile?.is_pro && (
                  <Badge className="bg-amber-400 text-amber-900 text-xs">
                    <Crown className="w-3 h-3 mr-0.5" /> PRO
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <span className="text-lg">{rank.icon}</span>
                <span>{rank.name} Member</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{balance}</div>
              <div className="text-xs text-white/70">JAICoins</div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="sticky top-[120px] z-30 bg-background border-b">
          <TabsList className="w-full h-auto p-0 bg-transparent rounded-none grid grid-cols-5">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 text-xs">
              <div className="flex flex-col items-center gap-1">
                <Target className="w-4 h-4" />
                <span>Home</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="referral" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 text-xs">
              <div className="flex flex-col items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Refer</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 text-xs">
              <div className="flex flex-col items-center gap-1">
                <Wallet className="w-4 h-4" />
                <span>Wallet</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 text-xs">
              <div className="flex flex-col items-center gap-1">
                <Receipt className="w-4 h-4" />
                <span>Orders</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 text-xs">
              <div className="flex flex-col items-center gap-1">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="px-4 py-4">
          <TabsContent value="dashboard" className="mt-0">
            <AccountDashboard user={user} profile={profile} balance={balance} onRefreshBalance={() => fetchBalance(user.id)} />
          </TabsContent>
          <TabsContent value="referral" className="mt-0">
            <AccountReferral user={user} profile={profile} />
          </TabsContent>
          <TabsContent value="wallet" className="mt-0">
            <AccountWallet user={user} balance={balance} onRefreshBalance={() => fetchBalance(user.id)} />
          </TabsContent>
          <TabsContent value="orders" className="mt-0">
            <AccountOrders user={user} />
          </TabsContent>
          <TabsContent value="settings" className="mt-0">
            <AccountSettings user={user} profile={profile} />
          </TabsContent>
        </div>
      </Tabs>

      <NativeBottomNav />
    </div>
  );
};

export default AccountPage;
