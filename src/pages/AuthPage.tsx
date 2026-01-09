import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, Phone, Shield, ArrowLeft, CheckCircle, MapPin, Sparkles } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useSoftRegistration } from "@/hooks/useSoftRegistration";

// Validation schemas
const emailSchema = z.string().trim().email("Please enter a valid email").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);
const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(100);
const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, isLoading: authLoading } = useAuth();
  const { onFieldBlur, markCompleted } = useSoftRegistration();
  
  const redirectPath = searchParams.get("redirect") || "/";
  const defaultTab = searchParams.get("tab") || "signin";
  const referralCode = searchParams.get("ref") || "";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    locality: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch localities
  const { data: localities } = useQuery({
    queryKey: ['localities-dropdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('localities')
        .select('slug, name')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, authLoading, navigate, redirectPath]);

  const validateField = (field: string, value: string): string | null => {
    try {
      switch (field) {
        case "email":
          emailSchema.parse(value);
          break;
        case "password":
          passwordSchema.parse(value);
          break;
        case "fullName":
          nameSchema.parse(value);
          break;
        case "phone":
          if (value) phoneSchema.parse(value);
          break;
        case "confirmPassword":
          if (value !== formData.password) return "Passwords do not match";
          break;
      }
      return null;
    } catch (e) {
      if (e instanceof z.ZodError) {
        return e.errors[0]?.message || "Invalid input";
      }
      return "Invalid input";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    const error = validateField(field, value);
    setErrors({ ...errors, [field]: error || "" });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateField("email", formData.email);
    if (emailError || !formData.password) {
      setErrors({ ...errors, email: emailError || "", password: !formData.password ? "Password is required" : "" });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(formData.email, formData.password);
    setIsLoading(false);

    if (error) {
      let message = "Sign in failed. Please try again.";
      if (error.message.includes("Invalid login")) {
        message = "Invalid email or password";
      }
      toast.error(message);
      return;
    }

    toast.success("Welcome back!");
    navigate(redirectPath, { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    newErrors.email = validateField("email", formData.email) || "";
    newErrors.password = validateField("password", formData.password) || "";
    newErrors.confirmPassword = validateField("confirmPassword", formData.confirmPassword) || "";
    newErrors.fullName = validateField("fullName", formData.fullName) || "";
    newErrors.phone = validateField("phone", formData.phone) || "";

    if (!formData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (Object.values(newErrors).some(e => e)) {
      setErrors(newErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);
    const result = await signUp(formData.email, formData.password, {
      full_name: formData.fullName.trim(),
      phone: formData.phone.trim(),
      locality: formData.locality || null,
      referral_code_used: referralCode || null,
    });
    setIsLoading(false);

    if (result.error) {
      let message = "Sign up failed. Please try again.";
      if (result.error.message.includes("already registered")) {
        message = "An account with this email already exists. Please sign in.";
      }
      toast.error(message);
      return;
    }

    // Mark soft registration as completed
    if (result.data?.user?.id) {
      markCompleted(result.data.user.id);
    }

    toast.success("Account created! Welcome to JaipurCircle.");
    navigate(redirectPath, { replace: true });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sign In | JaipurCircle</title>
        <meta name="description" content="Sign in or create an account to access deals, events, and more in Jaipur" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col">
        {/* Header */}
        <header className="p-4 sm:p-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            {/* Logo & Branding */}
            <div className="text-center mb-6 sm:mb-8">
              <Link to="/" className="inline-block">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  JaipurCircle
                </h1>
              </Link>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Your gateway to Jaipur's best experiences
              </p>
            </div>

            {/* Auth Card */}
            <Card className="border-0 shadow-xl shadow-primary/5">
              <CardHeader className="space-y-1 pb-4">
                <div className="flex items-center gap-2 justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                  <CardTitle className="text-xl sm:text-2xl text-center">
                    {activeTab === "signin" ? "Welcome Back" : "Join JaipurCircle"}
                  </CardTitle>
                </div>
                <CardDescription className="text-center text-sm">
                  {activeTab === "signin" 
                    ? "Sign in to continue exploring" 
                    : "Create an account to unlock exclusive deals"}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
                    <TabsTrigger value="signup" className="text-sm">Create Account</TabsTrigger>
                  </TabsList>

                  {/* Sign In Tab */}
                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="pl-10 h-11"
                            autoComplete="email"
                          />
                        </div>
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            className="pl-10 pr-10 h-11"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                      </div>

                      <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></span>
                            Signing in...
                          </span>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Sign Up Tab */}
                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-sm font-medium">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Your full name"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange("fullName", e.target.value)}
                            onBlur={(e) => onFieldBlur('fullName', e.target.value)}
                            className="pl-10 h-11"
                            autoComplete="name"
                          />
                        </div>
                        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-phone" className="text-sm font-medium">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-phone"
                            type="tel"
                            placeholder="10-digit mobile number"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            onBlur={(e) => onFieldBlur('phone', e.target.value)}
                            className="pl-10 h-11"
                            autoComplete="tel"
                          />
                        </div>
                        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-locality" className="text-sm font-medium">Your Locality</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                          <Select 
                            value={formData.locality} 
                            onValueChange={(value) => {
                              setFormData({ ...formData, locality: value });
                              onFieldBlur('locality', value);
                            }}
                          >
                            <SelectTrigger className="pl-10 h-11">
                              <SelectValue placeholder="Select your locality" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {localities?.map((loc) => (
                                <SelectItem key={loc.slug} value={loc.slug}>
                                  {loc.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs text-muted-foreground">Get deals & events from your area</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm font-medium">Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            onBlur={(e) => onFieldBlur('email', e.target.value)}
                            className="pl-10 h-11"
                            autoComplete="email"
                          />
                        </div>
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm font-medium">Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="At least 8 characters"
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            className="pl-10 pr-10 h-11"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                        {formData.password && formData.password.length >= 8 && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Password meets requirements
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm" className="text-sm font-medium">Confirm Password *</Label>
                        <Input
                          id="signup-confirm"
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          className="h-11"
                          autoComplete="new-password"
                        />
                        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                        {formData.confirmPassword && formData.confirmPassword === formData.password && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Passwords match
                          </p>
                        )}
                      </div>

                      {referralCode && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Referral Code: {referralCode}</span>
                          </div>
                          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                            You'll get bonus JaiCoins when you sign up!
                          </p>
                        </div>
                      )}

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked === true })}
                          className="mt-1"
                        />
                        <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                          I agree to the{" "}
                          <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                          {" "}and{" "}
                          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                        </label>
                      </div>

                      <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></span>
                            Creating account...
                          </span>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Footer */}
            <p className="text-center text-xs text-muted-foreground mt-6">
              By continuing, you agree to receive updates about deals and events in Jaipur
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default AuthPage;
