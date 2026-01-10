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
import { Eye, EyeOff, Mail, Lock, User, Phone, Shield, ArrowLeft, CheckCircle, MapPin, Sparkles, Star } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useSoftRegistration } from "@/hooks/useSoftRegistration";

// Validation schemas
const emailSchema = z.string().trim().email("Please enter a valid email").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);
const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(100);
const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number starting with 6-9");

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
    // For phone field, only allow numeric input (max 10 digits)
    if (field === "phone") {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [field]: numericValue });
      const error = validateField(field, numericValue);
      setErrors({ ...errors, [field]: error || "" });
      return;
    }
    
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

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
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
    markCompleted(user?.id || 'completed');

    toast.success("Account created! Welcome to JaipurCircle.");
    navigate(redirectPath, { replace: true });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 dark:from-background dark:via-background dark:to-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{activeTab === "signin" ? "Sign In" : "Create Account"} | JaipurCircle</title>
        <meta name="description" content="Sign in or create an account to access exclusive deals, events, and more in Jaipur" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 dark:from-background dark:via-background dark:to-muted/20 flex flex-col relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/40 to-rose-200/40 dark:from-orange-900/20 dark:to-rose-900/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-amber-200/40 to-orange-200/40 dark:from-amber-900/20 dark:to-orange-900/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-rose-100/30 to-orange-100/30 dark:from-rose-900/10 dark:to-orange-900/10 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative z-10 p-4 sm:p-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all hover:gap-3 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            {/* Logo & Branding */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-block group">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-xl group-hover:shadow-orange-500/30 transition-shadow">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
                  JaipurCircle
                </h1>
              </Link>
              <p className="text-muted-foreground mt-3 text-sm sm:text-base max-w-xs mx-auto">
                Discover the Pink City's best deals, events & experiences
              </p>
              
              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-green-600" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Trusted by 10K+</span>
                </div>
              </div>
            </div>

            {/* Auth Card */}
            <Card className="border border-white/50 dark:border-border shadow-2xl shadow-orange-900/10 dark:shadow-black/20 backdrop-blur-sm bg-white/80 dark:bg-card/90">
              <CardHeader className="space-y-1 pb-4 pt-6">
                <CardTitle className="text-xl sm:text-2xl text-center font-bold">
                  {activeTab === "signin" ? "Welcome Back!" : "Join JaipurCircle"}
                </CardTitle>
                <CardDescription className="text-center text-sm">
                  {activeTab === "signin" 
                    ? "Sign in to continue your journey" 
                    : "Create an account to unlock exclusive offers"}
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                    <TabsTrigger value="signin" className="text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      Create Account
                    </TabsTrigger>
                  </TabsList>

                  {/* Sign In Tab */}
                  <TabsContent value="signin" className="space-y-0">
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
                            className="pl-10 h-12 bg-background/50 border-muted-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            autoComplete="email"
                          />
                        </div>
                        {errors.email && <p className="text-xs text-destructive font-medium">{errors.email}</p>}
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
                            className="pl-10 pr-10 h-12 bg-background/50 border-muted-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-xs text-destructive font-medium">{errors.password}</p>}
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                            Signing in...
                          </span>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Sign Up Tab */}
                  <TabsContent value="signup" className="space-y-0">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      {/* Full Name */}
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-sm font-medium">
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Your full name"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange("fullName", e.target.value)}
                            onBlur={(e) => onFieldBlur('fullName', e.target.value)}
                            className="pl-10 h-12 bg-background/50 border-muted-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            autoComplete="name"
                          />
                        </div>
                        {errors.fullName && <p className="text-xs text-destructive font-medium">{errors.fullName}</p>}
                      </div>

                      {/* Phone Number - Numeric Only */}
                      <div className="space-y-2">
                        <Label htmlFor="signup-phone" className="text-sm font-medium">
                          Mobile Number <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm font-medium">+91</span>
                          </div>
                          <Input
                            id="signup-phone"
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={10}
                            placeholder="9876543210"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            onBlur={(e) => onFieldBlur('phone', e.target.value)}
                            className="pl-20 h-12 bg-background/50 border-muted-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono tracking-wider"
                            autoComplete="tel"
                          />
                        </div>
                        {errors.phone && <p className="text-xs text-destructive font-medium">{errors.phone}</p>}
                        {formData.phone.length === 10 && !errors.phone && (
                          <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
                            <CheckCircle className="w-3 h-3" /> Valid mobile number
                          </p>
                        )}
                      </div>

                      {/* Locality Dropdown */}
                      <div className="space-y-2">
                        <Label htmlFor="signup-locality" className="text-sm font-medium">
                          Your Locality
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                          <Select 
                            value={formData.locality} 
                            onValueChange={(value) => {
                              setFormData({ ...formData, locality: value });
                              onFieldBlur('locality', value);
                            }}
                          >
                            <SelectTrigger className="pl-10 h-12 bg-background/50 border-muted-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20">
                              <SelectValue placeholder="Select your locality in Jaipur" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[280px]">
                              {localities?.map((loc) => (
                                <SelectItem key={loc.slug} value={loc.slug} className="py-2.5">
                                  {loc.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Get personalized deals from your area
                        </p>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm font-medium">
                          Email <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            onBlur={(e) => onFieldBlur('email', e.target.value)}
                            className="pl-10 h-12 bg-background/50 border-muted-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            autoComplete="email"
                          />
                        </div>
                        {errors.email && <p className="text-xs text-destructive font-medium">{errors.email}</p>}
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm font-medium">
                          Password <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="At least 8 characters"
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            className="pl-10 pr-10 h-12 bg-background/50 border-muted-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-xs text-destructive font-medium">{errors.password}</p>}
                        {formData.password && formData.password.length >= 8 && (
                          <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
                            <CheckCircle className="w-3 h-3" /> Password meets requirements
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm" className="text-sm font-medium">
                          Confirm Password <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-confirm"
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            className="pl-10 h-12 bg-background/50 border-muted-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            autoComplete="new-password"
                          />
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-destructive font-medium">{errors.confirmPassword}</p>}
                        {formData.confirmPassword && formData.confirmPassword === formData.password && formData.password.length >= 8 && (
                          <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
                            <CheckCircle className="w-3 h-3" /> Passwords match
                          </p>
                        )}
                      </div>

                      {/* Referral Code Banner */}
                      {referralCode && (
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-semibold">Referral Code Applied!</span>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Code: <span className="font-mono font-bold">{referralCode}</span> • Bonus JaiCoins await!
                          </p>
                        </div>
                      )}

                      {/* Terms Checkbox */}
                      <div className="flex items-start space-x-3 pt-2">
                        <Checkbox
                          id="terms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked === true })}
                          className="mt-0.5"
                        />
                        <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                          I agree to the{" "}
                          <Link to="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link>
                          {" "}and{" "}
                          <Link to="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                        </label>
                      </div>

                      {/* Submit Button */}
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                            Creating account...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Create Account
                          </span>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Footer */}
            <p className="text-center text-xs text-muted-foreground mt-6 px-4">
              By continuing, you agree to receive updates about deals and events in Jaipur
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default AuthPage;
