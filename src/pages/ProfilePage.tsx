import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, Settings, CreditCard, Bell, Shield, 
  HelpCircle, LogOut, ChevronRight, Crown, 
  Mail, Phone, MapPin, Calendar, Edit2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import NativeDashboardLayout from "@/components/layout/NativeDashboardLayout";
import { NativeCard } from "@/components/ui/native-card";
import { NativeList, NativeListItem, NativeListSection } from "@/components/ui/native-list";
import { useUserBalance } from "@/hooks/useUserBalance";
import { cn } from "@/lib/utils";

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { data: balance } = useUserBalance();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await fetchUserProfile(session.user.id);
    }
    setIsLoading(false);
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  };

  if (isLoading) {
    return (
      <NativeDashboardLayout title="Profile" showBackButton={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      </NativeDashboardLayout>
    );
  }

  if (!user) {
    return (
      <NativeDashboardLayout title="Profile" showBackButton={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">Please sign in to view your profile</p>
          <Button onClick={() => navigate('/')} className="rounded-xl">
            Go to Home
          </Button>
        </div>
      </NativeDashboardLayout>
    );
  }

  return (
    <NativeDashboardLayout 
      title="Profile" 
      showBackButton={false}
      rightAction={
        <Link to="/settings">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
      }
    >
      <div className="space-y-4">
        {/* Profile Header Card */}
        <NativeCard variant="elevated" padding="lg">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-4 border-primary/20">
              <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-xl font-bold">
                {getInitials(profile?.full_name || 'User')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold truncate">{profile?.full_name || 'User'}</h2>
                {profile?.is_pro && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full px-2 py-0.5">
                    <Crown className="w-3 h-3 mr-1" />
                    PRO
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">ID: {profile?.user_id_code || 'N/A'}</p>
              <p className="text-xs text-muted-foreground mt-1">{profile?.rank || 'New Member'}</p>
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full shrink-0">
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </NativeCard>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <NativeCard variant="default" padding="md" className="text-center">
            <p className="text-2xl font-bold text-primary">{balance || 0}</p>
            <p className="text-xs text-muted-foreground">JaiCoins</p>
          </NativeCard>
          <NativeCard variant="default" padding="md" className="text-center">
            <p className="text-2xl font-bold">{profile?.total_referrals || 0}</p>
            <p className="text-xs text-muted-foreground">Referrals</p>
          </NativeCard>
          <NativeCard variant="default" padding="md" className="text-center">
            <p className="text-2xl font-bold">{profile?.is_pro ? 'Pro' : 'Free'}</p>
            <p className="text-xs text-muted-foreground">Plan</p>
          </NativeCard>
        </div>

        {/* Contact Info */}
        <NativeListSection title="Contact Information">
          <NativeListItem
            icon={<Mail className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-100"
            title="Email"
            subtitle={profile?.email || user?.email || 'Not set'}
            pressable={false}
          />
          <NativeListItem
            icon={<Phone className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-100"
            title="Phone"
            subtitle={profile?.phone || 'Not set'}
            showChevron
            onClick={() => navigate('/settings')}
          />
          <NativeListItem
            icon={<MapPin className="w-5 h-5 text-red-600" />}
            iconBg="bg-red-100"
            title="Location"
            subtitle={profile?.locality ? `${profile.locality}, ${profile.city || 'Jaipur'}` : 'Not set'}
            showChevron
            onClick={() => navigate('/settings')}
          />
        </NativeListSection>

        {/* Account Settings */}
        <NativeListSection title="Account">
          <NativeListItem
            icon={<CreditCard className="w-5 h-5 text-purple-600" />}
            iconBg="bg-purple-100"
            title="Payment Methods"
            subtitle="Manage your payment options"
            showChevron
            onClick={() => navigate('/settings')}
          />
          <NativeListItem
            icon={<Bell className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-100"
            title="Notifications"
            subtitle="Manage notification preferences"
            showChevron
            onClick={() => navigate('/settings')}
          />
          <NativeListItem
            icon={<Shield className="w-5 h-5 text-cyan-600" />}
            iconBg="bg-cyan-100"
            title="Privacy & Security"
            subtitle="Manage your account security"
            showChevron
            onClick={() => navigate('/settings')}
          />
        </NativeListSection>

        {/* Support */}
        <NativeListSection title="Support">
          <NativeListItem
            icon={<HelpCircle className="w-5 h-5 text-indigo-600" />}
            iconBg="bg-indigo-100"
            title="Help & Support"
            subtitle="Get help with your account"
            showChevron
            onClick={() => navigate('/help')}
          />
        </NativeListSection>

        {/* Sign Out */}
        <NativeCard variant="default" padding="none">
          <NativeListItem
            icon={<LogOut className="w-5 h-5 text-red-600" />}
            iconBg="bg-red-100"
            title="Sign Out"
            subtitle="Sign out of your account"
            onClick={handleSignOut}
          />
        </NativeCard>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground py-4">
          JaipurCircle v1.0.0
        </p>
      </div>
    </NativeDashboardLayout>
  );
};

export default ProfilePage;
