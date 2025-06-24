
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Mail, MapPin, Calendar, Coins, Shield, Smartphone, 
  Globe, LogOut, Edit, Save, X, Eye, Settings, Bell, 
  Monitor, Clock, AlertTriangle, Download, Trash2,
  Lock, Key, Activity, ExternalLink, Loader2
} from "lucide-react";

interface UserSession {
  id: string;
  user_agent: string;
  ip: string;
  created_at: string;
  updated_at: string;
  factor_id?: string;
  aal?: string;
}

interface LoginHistory {
  timestamp: string;
  ip: string;
  user_agent: string;
  location?: string;
  status: 'success' | 'failed';
}

const UserPortal = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    locality: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [securitySettings, setSecuritySettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    loginAlerts: true,
    marketingEmails: false,
    twoFactorEnabled: false,
    sessionTimeout: '30'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
    fetchSessions();
    fetchLoginHistory();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setProfile(profile);
          setFormData({
            full_name: profile.full_name || '',
            email: user.email || '',
            phone: profile.phone || '',
            locality: profile.locality || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      // Note: In a real implementation, you'd fetch this from your backend
      // Supabase doesn't expose session management directly to clients
      const mockSessions: UserSession[] = [
        {
          id: '1',
          user_agent: 'Chrome 91.0 on macOS',
          ip: '192.168.1.1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          aal: 'aal1'
        }
      ];
      setSessions(mockSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchLoginHistory = async () => {
    try {
      // Note: In a real implementation, you'd track this in your backend
      const mockHistory: LoginHistory[] = [
        {
          timestamp: new Date().toISOString(),
          ip: '192.168.1.1',
          user_agent: 'Chrome 91.0 on macOS',
          location: 'Jaipur, India',
          status: 'success'
        }
      ];
      setLoginHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching login history:', error);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          locality: formData.locality
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully."
      });
      
      setIsEditing(false);
      fetchUserData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully."
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully."
      });
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSignOutAllDevices = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      toast({
        title: "Signed Out From All Devices",
        description: "You have been signed out from all devices."
      });
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleExportData = async () => {
    try {
      // In a real implementation, this would trigger a backend job
      // to compile and email the user's data
      toast({
        title: "Data Export Requested",
        description: "We'll email you a copy of your data within 24 hours."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone. All your data, including JaiCoins, will be permanently deleted."
    );
    
    if (!confirmed) return;

    try {
      // In a real implementation, this would be handled by your backend
      // with proper cleanup of all user data
      toast({
        title: "Account Deletion Requested",
        description: "Your account deletion request has been submitted. You'll receive a confirmation email within 24 hours.",
        variant: "destructive"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Portal</h1>
              <p className="text-gray-600">Manage your account, security, and preferences</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Coins className="w-4 h-4 mr-1" />
                0 JaiCoins
              </Badge>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-xl">{profile?.full_name || 'User'}</CardTitle>
                <CardDescription className="break-all">{user?.email}</CardDescription>
                <Badge variant="outline" className="mx-auto">
                  {profile?.rank || 'Bronze'} Member
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(user?.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{profile?.locality || 'Location not set'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-green-700">Account Verified</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Button 
                    onClick={handleSignOut}
                    variant="outline" 
                    className="w-full text-gray-600 border-gray-200 hover:bg-gray-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                  
                  <Button 
                    onClick={handleSignOutAllDevices}
                    variant="outline" 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Sign Out All Devices
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger value="sessions" className="flex items-center space-x-2">
                  <Monitor className="w-4 h-4" />
                  <span className="hidden sm:inline">Sessions</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Data</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your profile details and preferences</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(!isEditing)}
                        disabled={isSaving}
                      >
                        {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                        {isEditing ? 'Cancel' : 'Edit'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          value={formData.email}
                          disabled
                          className="mt-1 bg-gray-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          disabled={!isEditing}
                          className="mt-1"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                      <div>
                        <Label htmlFor="locality">Locality in Jaipur</Label>
                        <Input
                          id="locality"
                          value={formData.locality}
                          onChange={(e) => setFormData({...formData, locality: e.target.value})}
                          disabled={!isEditing}
                          className="mt-1"
                          placeholder="e.g., C-Scheme, Malviya Nagar"
                        />
                      </div>
                    </div>
                    
                    {isEditing && (
                      <div className="flex space-x-4">
                        <Button 
                          onClick={handleUpdateProfile}
                          disabled={isSaving}
                          className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500"
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                {/* Password Change */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Key className="w-5 h-5" />
                      <span>Change Password</span>
                    </CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleChangePassword}
                      disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || isSaving}
                      className="bg-gradient-to-r from-pink-500 to-orange-400"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                      {isSaving ? 'Updating...' : 'Update Password'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Security Settings</span>
                    </CardTitle>
                    <CardDescription>Configure additional security features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={securitySettings.twoFactorEnabled ? "default" : "secondary"}>
                            {securitySettings.twoFactorEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            {securitySettings.twoFactorEnabled ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium">Login Alerts</h4>
                          <p className="text-sm text-gray-600">Get notified of new sign-ins from unrecognized devices</p>
                        </div>
                        <Switch
                          checked={securitySettings.loginAlerts}
                          onCheckedChange={(checked) => setSecuritySettings({...securitySettings, loginAlerts: checked})}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium">Session Timeout</h4>
                          <p className="text-sm text-gray-600">Automatically sign out after inactivity</p>
                        </div>
                        <select 
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                          className="border rounded px-3 py-1 text-sm"
                        >
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="240">4 hours</option>
                          <option value="0">Never</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sessions Tab */}
              <TabsContent value="sessions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Monitor className="w-5 h-5" />
                      <span>Active Sessions</span>
                    </CardTitle>
                    <CardDescription>Manage your active sessions across different devices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Monitor className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{session.user_agent}</span>
                              <Badge variant="outline" className="bg-green-50 text-green-700">Current</Badge>
                            </div>
                            <p className="text-sm text-gray-600">IP: {session.ip}</p>
                            <p className="text-sm text-gray-600">Last active: {new Date(session.updated_at).toLocaleString()}</p>
                          </div>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                            <LogOut className="w-4 h-4 mr-1" />
                            Sign Out
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Login History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>Login History</span>
                    </CardTitle>
                    <CardDescription>View your recent login activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {loginHistory.map((login, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${login.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                              <span className="font-medium">{login.status === 'success' ? 'Successful login' : 'Failed login'}</span>
                            </div>
                            <p className="text-sm text-gray-600">{login.user_agent}</p>
                            <p className="text-sm text-gray-600">IP: {login.ip} • {login.location}</p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(login.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="w-5 h-5" />
                      <span>Notification Preferences</span>
                    </CardTitle>
                    <CardDescription>Choose what notifications you want to receive</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-gray-600">Receive deal alerts and important updates via email</p>
                        </div>
                        <Switch
                          checked={securitySettings.emailNotifications}
                          onCheckedChange={(checked) => setSecuritySettings({...securitySettings, emailNotifications: checked})}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Push Notifications</h4>
                          <p className="text-sm text-gray-600">Get notified about new deals on your device</p>
                        </div>
                        <Switch
                          checked={securitySettings.pushNotifications}
                          onCheckedChange={(checked) => setSecuritySettings({...securitySettings, pushNotifications: checked})}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Marketing Emails</h4>
                          <p className="text-sm text-gray-600">Receive promotional offers and newsletters</p>
                        </div>
                        <Switch
                          checked={securitySettings.marketingEmails}
                          onCheckedChange={(checked) => setSecuritySettings({...securitySettings, marketingEmails: checked})}
                        />
                      </div>
                    </div>

                    <Button className="bg-gradient-to-r from-pink-500 to-orange-400">
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Data Tab */}
              <TabsContent value="data" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Download className="w-5 h-5" />
                      <span>Data Management</span>
                    </CardTitle>
                    <CardDescription>Download your data or delete your account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Export Your Data</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Download a copy of all your data, including profile information, transaction history, and activity logs.
                        </p>
                        <Button onClick={handleExportData} variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Request Data Export
                        </Button>
                      </div>

                      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <h4 className="font-medium mb-2 text-red-800">Delete Your Account</h4>
                        <p className="text-sm text-red-700 mb-4">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <Button onClick={handleDeleteAccount} variant="destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 space-y-2 border-t pt-4">
                      <h5 className="font-medium">Data Protection</h5>
                      <p>We comply with GDPR and other privacy regulations. Your data is encrypted and stored securely.</p>
                      <div className="flex space-x-4">
                        <a href="/privacy" className="text-pink-600 hover:underline flex items-center space-x-1">
                          <ExternalLink className="w-3 h-3" />
                          <span>Privacy Policy</span>
                        </a>
                        <a href="/terms" className="text-pink-600 hover:underline flex items-center space-x-1">
                          <ExternalLink className="w-3 h-3" />
                          <span>Terms of Service</span>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPortal;
