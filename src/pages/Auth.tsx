import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, Briefcase, Mail, Lock, UserCircle, X, Loader2 } from 'lucide-react';
import { EmailVerification } from '@/components/auth/EmailVerification';
import { ProfileSetup, ProfileData } from '@/components/auth/ProfileSetup';
import { ForgotPassword } from '@/components/auth/ForgotPassword';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

type UserType = 'customer' | 'vendor';
type AuthStep = 'credentials' | 'verification' | 'user-type' | 'profile' | 'forgot-password';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'login';
  const redirectTo = searchParams.get('redirect') || '/';
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [authStep, setAuthStep] = useState<AuthStep>('credentials');
  const [pendingSignupData, setPendingSignupData] = useState<{ email: string; password: string; fullName: string } | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && authStep === 'credentials') {
      navigate(redirectTo);
    }
  }, [user, navigate, authStep, redirectTo]);

  const validateForm = (isSignUp: boolean) => {
    const newErrors: { email?: string; password?: string; name?: string } = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }
    
    if (isSignUp) {
      try {
        nameSchema.parse(fullName);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.name = e.errors[0].message;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;
    
    setIsLoading(true);
    // Mock login - not implemented
    setIsLoading(false);
    toast({
      title: 'Not implemented',
      description: 'Please use /auth/customer or /auth/vendor pages',
      variant: 'destructive',
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    
    setIsLoading(true);
    
    setPendingSignupData({ email, password, fullName });
    setAuthStep('user-type');
    
    toast({
      title: 'Account created!',
      description: 'Please select your account type.',
    });
    
    setIsLoading(false);
    

  };

  const handleEmailVerification = async (code: string): Promise<boolean> => {
    setAuthStep('user-type');
    return true;
    

  };

  const handleResendCode = async () => {
    if (!pendingSignupData?.email) return;

    setIsLoading(true);
    toast({
      title: 'Code sent',
      description: 'A new verification code has been sent to your email.',
    });
    setIsLoading(false);
    

  };

  const handleUserTypeSelect = async (type: UserType) => {
    if (!pendingSignupData) return;
    
    setUserType(type);
    setIsLoading(true);
    
    setIsLoading(false);
    toast({
      title: 'Not implemented',
      description: 'Please use /auth/customer or /auth/vendor pages',
      variant: 'destructive',
    });
  };

  const handleProfileComplete = async (data: ProfileData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please sign in first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    console.log('Mock profile setup:', data);
    
    setIsLoading(false);
    toast({
      title: 'Profile complete!',
      description: `Welcome to Venbid! You're now registered as a ${userType}.`,
    });
    navigate(redirectTo);
    
   
  };

  const handleForgotPasswordSendCode = async (email: string): Promise<boolean> => {
    toast({
      title: 'Email sent',
      description: 'Check your email for the password reset link.',
    });
    return true;
    

  };

  const handleForgotPasswordVerifyCode = async (email: string, code: string): Promise<boolean> => {
  
    return true;
  };

  const handleForgotPasswordReset = async (email: string, password: string): Promise<boolean> => {
    console.log('Mock password reset for:', email);
    return true;
    

  };

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (authStep === 'forgot-password') {
    return (
      <ForgotPassword
        onClose={() => setAuthStep('credentials')}
        onSendCode={handleForgotPasswordSendCode}
        onVerifyCode={handleForgotPasswordVerifyCode}
        onResetPassword={handleForgotPasswordReset}
      />
    );
  }

  if (authStep === 'verification') {
    return (
      <EmailVerification
        email={pendingSignupData?.email || email}
        onVerify={handleEmailVerification}
        onResend={handleResendCode}
        onClose={handleClose}
        isLoading={isLoading}
      />
    );
  }

  if (authStep === 'user-type') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </button>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">Almost There!</CardTitle>
            <CardDescription>How do you want to use Venbid?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => handleUserTypeSelect('customer')}
                disabled={isLoading}
                className="p-6 rounded-lg border-2 transition-all hover:border-primary hover:bg-primary/5 flex items-center gap-4 disabled:opacity-50"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-lg">I'm a Customer</p>
                  <p className="text-sm text-muted-foreground">I want to post jobs and hire service providers</p>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => handleUserTypeSelect('vendor')}
                disabled={isLoading}
                className="p-6 rounded-lg border-2 transition-all hover:border-primary hover:bg-primary/5 flex items-center gap-4 disabled:opacity-50"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="h-7 w-7 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-lg">I'm a Service Provider</p>
                  <p className="text-sm text-muted-foreground">I want to find work and connect with customers</p>
                </div>
              </button>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Creating your account...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authStep === 'profile') {
    return (
      <ProfileSetup
        userType={userType || 'customer'}
        onComplete={handleProfileComplete}
        onClose={handleClose}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Venbid</CardTitle>
          <CardDescription>Connect with local service providers</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 pt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setAuthStep('forgot-password')}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 pt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  We'll send a 5-digit verification code to your email
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
