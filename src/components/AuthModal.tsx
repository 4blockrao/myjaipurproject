
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, MapPin, Users } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode?: string;
}

const AuthModal = ({ isOpen, onClose, referralCode }: AuthModalProps) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'otp'>('signup');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('Jaipur');
  const [locality, setLocality] = useState('');
  const [referralCodeInput, setReferralCodeInput] = useState(referralCode || '');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localities, setLocalities] = useState<string[]>([]);
  const { toast } = useToast();

  // Set referral code from prop
  useEffect(() => {
    if (referralCode) {
      setReferralCodeInput(referralCode);
      setAuthMode('signup'); // Force signup mode if referral code is present
    }
  }, [referralCode]);

  // Fetch localities for Jaipur
  useEffect(() => {
    fetchLocalities();
  }, []);

  const fetchLocalities = async () => {
    try {
      // Get unique localities from existing profiles
      const { data } = await supabase
        .from('profiles')
        .select('locality')
        .not('locality', 'is', null)
        .order('locality');
      
      const uniqueLocalities = [...new Set(data?.map(p => p.locality).filter(Boolean))];
      
      // Add some default Jaipur localities if none exist
      const defaultLocalities = [
        'Vaishali Nagar', 'Malviya Nagar', 'C-Scheme', 'Civil Lines', 'Bani Park',
        'Raja Park', 'Mansarovar', 'Jagatpura', 'Sanganer', 'Tonk Road',
        'Jhotwara', 'Bagru', 'Chomu', 'Amber', 'Govindgarh'
      ];
      
      const allLocalities = uniqueLocalities.length > 0 
        ? uniqueLocalities 
        : defaultLocalities;
      
      setLocalities(allLocalities);
    } catch (error) {
      console.error('Error fetching localities:', error);
      // Fallback to default localities
      setLocalities([
        'Vaishali Nagar', 'Malviya Nagar', 'C-Scheme', 'Civil Lines', 'Bani Park',
        'Raja Park', 'Mansarovar', 'Jagatpura', 'Sanganer', 'Tonk Road'
      ]);
    }
  };

  // Listen for auth state changes and close modal when user signs in
  useEffect(() => {
    if (!isOpen) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        onClose();
      }
    });

    return () => subscription.unsubscribe();
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validateReferralCode = async (code: string) => {
    if (!code) return null; // Optional field
    
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('referral_code', code.toUpperCase())
      .single();
    
    return data;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Input validation
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (authMode === 'signup') {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        if (!validatePassword(password)) {
          throw new Error('Password must be at least 6 characters long');
        }
        if (!locality) {
          throw new Error('Please select your locality');
        }

        // Validate referral code if provided
        let referrer = null;
        if (referralCodeInput.trim()) {
          referrer = await validateReferralCode(referralCodeInput.trim());
          if (!referrer) {
            throw new Error('Invalid referral code. Please check and try again.');
          }
        }

        console.log('Attempting signup with:', { email, name, city, locality, referralCode: referralCodeInput });

        // Sign up with proper redirect URL
        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: name.trim(),
              city: city,
              locality: locality,
              referral_code_used: referralCodeInput.trim() || null,
              referred_by: referrer?.id || null
            }
          }
        });

        if (error) throw error;

        console.log('Signup successful');
        toast({
          title: "🎉 Welcome to MyJaipur!",
          description: referralCodeInput 
            ? `Account created! You've joined ${referrer?.full_name || 'your friend'}'s team and earned 30 JAICoins!`
            : "Account created successfully! You've earned 30 JAICoins to get started!"
        });
        
        // Reset form and close modal
        setEmail('');
        setPassword('');
        setName('');
        setLocality('');
        setReferralCodeInput('');
        onClose();
      } else {
        // Sign in
        console.log('Attempting signin with:', { email });
        
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        console.log('Signin successful');
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully."
        });
        
        // Reset form - modal will close via auth state change
        setEmail('');
        setPassword('');
        onClose();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication Error",
        description: error.message || 'An error occurred during authentication',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast({
        title: "Authentication Error",
        description: error.message || 'Failed to sign in with Google',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneAuth = () => {
    toast({
      title: "Coming Soon",
      description: "Phone authentication will be available soon!",
      variant: "default"
    });
  };

  const handleOtpVerification = () => {
    toast({
      title: "Coming Soon",
      description: "OTP verification will be available soon!",
      variant: "default"
    });
    setAuthMode('login');
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setLocality('');
    setReferralCodeInput(referralCode || '');
    setPhone('');
    setOtp('');
    setShowPassword(false);
    setAuthMode(referralCode ? 'signup' : 'login');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full"></div>
            <span className="text-2xl font-bold text-pink-600">MyJaipur</span>
          </div>
          <CardTitle className="text-2xl">
            {authMode === 'login' ? 'Welcome Back!' : 
             authMode === 'signup' ? 'Join MyJaipur' : 'Verify OTP'}
          </CardTitle>
          <CardDescription>
            {authMode === 'login' ? 'Sign in to discover amazing deals' :
             authMode === 'signup' ? (referralCode ? 'Complete your registration to join the team!' : 'Start earning JAICoins today') :
             `Enter the OTP sent to ${phone}`}
          </CardDescription>
          {referralCode && authMode === 'signup' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
              <div className="flex items-center space-x-2 text-green-700">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">You're joining with a referral code!</span>
              </div>
              <p className="text-xs text-green-600 mt-1">You'll earn bonus JAICoins upon registration</p>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {authMode === 'otp' ? (
            <>
              <div className="flex justify-center">
                <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button 
                onClick={handleOtpVerification} 
                className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600"
                disabled={otp.length !== 6 || isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Verify OTP
              </Button>
              <Button variant="ghost" onClick={() => setAuthMode('login')} className="w-full">
                Back to Login
              </Button>
            </>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {authMode === 'signup' && (
                <>
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Select value={city} onValueChange={setCity} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Jaipur">Jaipur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="locality">Locality *</Label>
                    <Select value={locality} onValueChange={setLocality} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your locality" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {localities.map((loc) => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                    <Input
                      id="referralCode"
                      type="text"
                      value={referralCodeInput}
                      onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                      placeholder="Enter referral code if you have one"
                      disabled={isLoading || !!referralCode}
                      className={referralCode ? "bg-green-50 border-green-300" : ""}
                    />
                    {referralCode && (
                      <p className="text-xs text-green-600 mt-1">
                        <Users className="w-3 h-3 inline mr-1" />
                        Pre-filled from referral link
                      </p>
                    )}
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password">
                  Password * {authMode === 'signup' && '(minimum 6 characters)'}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={authMode === 'signup' ? "Create a secure password" : "Enter your password"}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600"
                disabled={isLoading || !email || !password || (authMode === 'signup' && (!name || !locality))}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button 
                type="button"
                onClick={handleGoogleAuth} 
                variant="outline" 
                className="w-full border-pink-200 hover:bg-pink-50"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </Button>

              <div className="text-center text-sm">
                {authMode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => setAuthMode('signup')} 
                      className="text-pink-600 hover:underline font-medium"
                      disabled={isLoading}
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => setAuthMode('login')} 
                      className="text-pink-600 hover:underline font-medium"
                      disabled={isLoading}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </form>
          )}

          <Button 
            variant="ghost" 
            onClick={handleClose} 
            className="w-full mt-4"
            disabled={isLoading}
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthModal;
