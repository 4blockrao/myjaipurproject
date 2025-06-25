import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Camera, Bell, Shield, MapPin, CreditCard,
  Smartphone, Mail, Phone, Calendar, Globe, Lock,
  Eye, EyeOff, Trash2, Download, Upload, Save
} from "lucide-react";

const SettingsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    city: '',
    locality: '',
    bio: ''
  });
  const [notifications, setNotifications] = useState({
    email_deals: true,
    push_deals: true,
    email_referrals: true,
    push_referrals: true,
    email_weekly: false,
    sms_urgent: true
  });
  const [privacy, setPrivacy] = useState({
    profile_visible: true,
    leaderboard_visible: true,
    referrals_visible: false,
    activity_visible: true
  });
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
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
      
      console.log('Profile data:', data);
      setProfile(data);
      
      setFormData({
        full_name: data?.full_name || '',
        email: data?.email || '',
        phone: data?.phone || '',
        city: data?.city || '',
        locality: data?.locality || '',
        bio: data?.bio || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const updateData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        locality: formData.locality,
        bio: formData.bio
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      await fetchUserProfile(user.id);
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl } as any)
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });

      await fetchUserProfile(user.id);
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  };

  if (isLoading) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="Settings" showBackButton>
        <div className="flex items-center justify-center min-h-[50vh] p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="Settings" showBackButton>
        <div className="p-4">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>Please sign in to access settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/'} className="w-full">
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile} pageTitle="Settings" showBackButton>
      <div className="p-3 sm:p-4 max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your account preferences and privacy settings</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="profile" className="text-xs sm:text-sm py-2 sm:py-3">Profile</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm py-2 sm:py-3">Notifications</TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs sm:text-sm py-2 sm:py-3">Privacy</TabsTrigger>
            <TabsTrigger value="security" className="text-xs sm:text-sm py-2 sm:py-3">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 sm:space-y-6 mt-4">
            {/* Mobile-Optimized Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Profile Picture</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Avatar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto sm:mx-0">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                    <AvatarFallback className="bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold text-lg">
                      {getInitials(profile?.full_name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 text-center sm:text-left">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mobile-Optimized Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name" className="text-sm">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-sm">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="locality" className="text-sm">Locality</Label>
                    <Input
                      id="locality"
                      value={formData.locality}
                      onChange={(e) => setFormData({...formData, locality: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="bio" className="text-sm">Bio</Label>
                    <Input
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full touch-target">
                  {isSaving ? "Saving..." : "Save Changes"}
                  <Save className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Mobile-Optimized Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">User ID</span>
                  <Badge variant="outline" className="text-xs">
                    {profile?.user_id_code || profile?.referral_code || 'Not Set'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Referral Code</span>
                  <Badge variant="outline" className="text-xs">{profile?.referral_code || 'Not Set'}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Member Since</span>
                  <span className="text-sm text-gray-600">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Account Status</span>
                  <Badge variant={profile?.is_pro ? "default" : "secondary"} className="text-xs">
                    {profile?.is_pro ? "Pro Member" : "Basic Member"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 sm:space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription className="text-sm">Choose how you want to receive updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'email_deals', label: 'Email - New Deals & Offers', icon: Mail },
                  { key: 'push_deals', label: 'Push - Deal Notifications', icon: Smartphone },
                  { key: 'email_referrals', label: 'Email - Referral Updates', icon: Mail },
                  { key: 'push_referrals', label: 'Push - Referral Bonuses', icon: Smartphone },
                  { key: 'email_weekly', label: 'Email - Weekly Summary', icon: Mail },
                  { key: 'sms_urgent', label: 'SMS - Urgent Updates', icon: Phone }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="flex items-center justify-between py-2 touch-target">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{item.label}</span>
                      </div>
                      <Switch
                        checked={notifications[item.key as keyof typeof notifications]}
                        onCheckedChange={(checked) => 
                          setNotifications({...notifications, [item.key]: checked})
                        }
                        className="flex-shrink-0"
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4 sm:space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Privacy Settings</span>
                </CardTitle>
                <CardDescription className="text-sm">Control what others can see about you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'profile_visible', label: 'Profile Visibility', desc: 'Allow others to find your profile' },
                  { key: 'leaderboard_visible', label: 'Leaderboard Participation', desc: 'Show my rank on leaderboards' },
                  { key: 'referrals_visible', label: 'Referral Activity', desc: 'Display referral achievements' },
                  { key: 'activity_visible', label: 'Activity Status', desc: 'Show when I\'m active' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2 touch-target">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={privacy[item.key as keyof typeof privacy]}
                      onCheckedChange={(checked) => 
                        setPrivacy({...privacy, [item.key]: checked})
                      }
                      className="flex-shrink-0 ml-3"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 sm:space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Security Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start touch-target">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start touch-target">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Enable Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start touch-target">
                  <Download className="w-4 h-4 mr-2" />
                  Download My Data
                </Button>
                <Separator />
                <Button variant="destructive" className="w-full justify-start touch-target">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
