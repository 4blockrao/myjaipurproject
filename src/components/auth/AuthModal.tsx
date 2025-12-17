import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  validateLoginForm, 
  validateSignupForm, 
  sanitizeInput,
  type LoginFormData,
  type SignupFormData 
} from "@/utils/authValidation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode?: string;
  redirectPath?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  fullName?: string;
  referralCode?: string;
}

const AuthModal = ({ isOpen, onClose, referralCode = '', redirectPath }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    city: 'Jaipur',
    locality: '',
    referralCodeUsed: referralCode
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (referralCode) {
      setFormData(prev => ({ ...prev, referralCodeUsed: referralCode.toUpperCase() }));
    }
  }, [referralCode]);

  // Clear errors when input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAuthSuccess = (isNewUser: boolean = false) => {
    onClose();
    
    if (isNewUser) {
      // Redirect to referral success for new signups
      navigate('/referral-success');
    } else if (redirectPath) {
      navigate(redirectPath);
    } else {
      navigate('/account');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const validationResult = validateSignupForm({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      referralCode: formData.referralCodeUsed || undefined,
    });

    if (!validationResult.success) {
      const fieldErrors: FormErrors = {};
      validationResult.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Sanitize inputs
      const sanitizedName = sanitizeInput(formData.fullName.trim());
      const sanitizedEmail = formData.email.trim().toLowerCase();
      const sanitizedCity = sanitizeInput(formData.city.trim());
      const sanitizedLocality = sanitizeInput(formData.locality.trim());
      const sanitizedReferralCode = formData.referralCodeUsed?.trim().toUpperCase() || null;

      const redirectUrl = `${window.location.origin}/referral-success`;
      
      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: sanitizedName,
            city: sanitizedCity,
            locality: sanitizedLocality,
            referral_code_used: sanitizedReferralCode,
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setErrors({ email: 'An account with this email already exists' });
          toast({
            title: "Account exists",
            description: "Please sign in instead.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "🎉 Welcome to JaipurCircle!",
          description: "Account created! You've earned 50 JAICoins.",
        });
        handleAuthSuccess(true);
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const validationResult = validateLoginForm({
      email: formData.email,
      password: formData.password,
    });

    if (!validationResult.success) {
      const fieldErrors: FormErrors = {};
      validationResult.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const sanitizedEmail = formData.email.trim().toLowerCase();

      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ password: 'Invalid email or password' });
          toast({
            title: "Invalid credentials",
            description: "Please check your email and password.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        handleAuthSuccess(false);
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      city: 'Jaipur',
      locality: '',
      referralCodeUsed: referralCode
    });
    setErrors({});
  };

  const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
        <AlertCircle className="w-3 h-3" />
        {message}
      </p>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95%] mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-xl font-bold">
            Welcome to JaipurCircle
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Join 10,000+ Jaipur residents earning rewards daily
          </p>
        </DialogHeader>

        {/* Benefits highlight */}
        <div className="flex justify-center gap-4 py-3 border-y border-border bg-muted/30 -mx-6 px-6">
          <div className="text-center">
            <span className="text-lg font-bold text-primary">50</span>
            <p className="text-xs text-muted-foreground">Welcome Coins</p>
          </div>
          <div className="text-center">
            <span className="text-lg font-bold text-green-600">50</span>
            <p className="text-xs text-muted-foreground">Per Referral</p>
          </div>
          <div className="text-center">
            <span className="text-lg font-bold text-purple-600">Daily</span>
            <p className="text-xs text-muted-foreground">Spin & Win</p>
          </div>
        </div>

        <Tabs defaultValue="signup" className="w-full" onValueChange={resetForm}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                  autoComplete="email"
                  required
                />
                <ErrorMessage message={errors.email} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={errors.password ? 'border-destructive' : ''}
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <ErrorMessage message={errors.password} />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={errors.fullName ? 'border-destructive' : ''}
                  autoComplete="name"
                  required
                />
                <ErrorMessage message={errors.fullName} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                  autoComplete="email"
                  required
                />
                <ErrorMessage message={errors.email} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={errors.password ? 'border-destructive' : ''}
                    autoComplete="new-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <ErrorMessage message={errors.password} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-city">City</Label>
                  <Input
                    id="signup-city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    autoComplete="address-level2"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-locality">Locality</Label>
                  <Input
                    id="signup-locality"
                    type="text"
                    placeholder="Area/Locality"
                    value={formData.locality}
                    onChange={(e) => handleInputChange('locality', e.target.value)}
                    autoComplete="address-level3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral-code">Referral Code (Optional)</Label>
                <Input
                  id="referral-code"
                  type="text"
                  value={formData.referralCodeUsed}
                  onChange={(e) => handleInputChange('referralCodeUsed', e.target.value.toUpperCase())}
                  placeholder="Enter referral code"
                  className={`${errors.referralCode ? 'border-destructive' : ''} ${formData.referralCodeUsed ? 'bg-green-50 border-green-200' : ''}`}
                  maxLength={8}
                />
                {formData.referralCodeUsed && !errors.referralCode && (
                  <p className="text-sm text-green-600">🎉 You'll get extra JAICoins!</p>
                )}
                <ErrorMessage message={errors.referralCode} />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
