
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ui/validated-input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft, Shield, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode?: string;
  redirectPath?: string | null;
}

const EnhancedAuthModal = ({ isOpen, onClose, referralCode = "", redirectPath }: EnhancedAuthModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    agreeToTerms: false
  });
  const [validationState, setValidationState] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    fullName: false,
    phone: false
  });

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        phone: "",
        agreeToTerms: false
      });
      setValidationState({
        email: false,
        password: false,
        confirmPassword: false,
        fullName: false,
        phone: false
      });
    }
  }, [isOpen]);

  const handleValidationChange = (field: string, isValid: boolean) => {
    setValidationState(prev => ({
      ...prev,
      [field]: isValid
    }));
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword && password.length > 0;
  };

  const isFormValid = () => {
    if (isLogin) {
      return validationState.email && formData.password.length > 0;
    } else {
      return (
        validationState.email &&
        validatePassword(formData.password) &&
        validateConfirmPassword(formData.password, formData.confirmPassword) &&
        validationState.fullName &&
        validationState.phone &&
        formData.agreeToTerms
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: "Invalid Form",
        description: "Please fill in all required fields correctly",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: formData.fullName,
              phone: formData.phone,
              referral_code_used: referralCode,
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Account Created!",
          description: "Welcome to MyJaipur! You can now start exploring deals.",
        });
      }

      onClose();
      
      // Handle redirect
      if (redirectPath && redirectPath !== '/') {
        navigate(redirectPath, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      let errorMessage = "An error occurred. Please try again.";
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.message.includes("User already registered")) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.message.includes("Password should be at least")) {
        errorMessage = "Password must be at least 8 characters long.";
      }
      
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-pink-500" />
            {isLogin ? "Welcome Back" : "Join MyJaipur"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <ValidatedInput
                label="Full Name"
                validationType="name"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                onValidationChange={(isValid) => handleValidationChange('fullName', isValid)}
                placeholder="Enter your full name"
              />
              
              <ValidatedInput
                label="Phone Number"
                validationType="phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                onValidationChange={(isValid) => handleValidationChange('phone', isValid)}
                placeholder="10-digit mobile number"
              />
            </>
          )}

          <ValidatedInput
            label="Email Address"
            validationType="email"
            required
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            onValidationChange={(isValid) => handleValidationChange('email', isValid)}
            placeholder="Enter your email address"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Password {!isLogin && <span className="text-destructive">*</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder={isLogin ? "Enter your password" : "At least 8 characters"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {!isLogin && formData.password && (
              <p className={`text-xs ${validatePassword(formData.password) ? 'text-green-600' : 'text-red-600'}`}>
                {validatePassword(formData.password) ? '✓ Password meets requirements' : '× Password must be at least 8 characters'}
              </p>
            )}
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Confirm Password <span className="text-destructive">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="Confirm your password"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
              {formData.confirmPassword && (
                <p className={`text-xs ${validateConfirmPassword(formData.password, formData.confirmPassword) ? 'text-green-600' : 'text-red-600'}`}>
                  {validateConfirmPassword(formData.password, formData.confirmPassword) ? '✓ Passwords match' : '× Passwords do not match'}
                </p>
              )}
            </div>
          )}

          {!isLogin && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => setFormData({...formData, agreeToTerms: checked === true})}
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the <a href="/terms" className="text-pink-600 hover:underline">Terms of Service</a> and{' '}
                <a href="/privacy" className="text-pink-600 hover:underline">Privacy Policy</a>
              </label>
            </div>
          )}

          {referralCode && !isLogin && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Referral Code: {referralCode}
                </span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                You'll get extra JaiCoins when you sign up!
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isLogin ? "Signing In..." : "Creating Account..."}
              </div>
            ) : (
              isLogin ? "Sign In" : "Create Account"
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-pink-600 hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAuthModal;
