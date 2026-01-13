import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
import { scheduleTokenRefresh } from "@/api/client";
import { initChatSocket } from "@/lib/chatSocket";
import { useAuth } from "@/hooks/useAuth";

export default function CustomerAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "customer") {
        navigate("/customer/my-posts", { replace: true });
      } else if (user.role === "vendor") {
        navigate("/vendor/dashboard", { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin/users", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      const { accessToken, refreshToken, user } = response.data;
      
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("user_data", JSON.stringify(user));
      localStorage.setItem("user_roles", JSON.stringify([user.role]));
      localStorage.setItem("token_timestamp", Date.now().toString());
      
      scheduleTokenRefresh();
      initChatSocket(accessToken);
      
      toast.success("Welcome back!");
      
      // Handle return URL from state
      const returnTo = (location.state as any)?.returnTo;
      
      if (returnTo) {
        window.location.href = returnTo;
        return;
      }
      
      // Use window.location.href to force page reload and ensure auth state is loaded
      if (user.role === "customer") {
        if (user.completeProfile) {
          window.location.href = "/customer/my-posts";
        } else {
          window.location.href = "/onboarding/customer";
        }
      } else if (user.role === "vendor") {
        if (user.completeProfile) {
          window.location.href = "/vendor/dashboard";
        } else {
          window.location.href = "/onboarding/vendor";
        }
      } else if (user.role === "admin") {
        window.location.href = "/admin/users";
      } else {
        window.location.href = "/";
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "";
      
      if (errorMsg.toLowerCase().includes("email not verified") || errorMsg.toLowerCase().includes("not verified")) {
        toast.error("Email not verified", {
          description: "Please verify your email to continue",
          action: {
            label: "Verify Now",
            onClick: () => {
              const returnTo = (location.state as any)?.returnTo;
              navigate("/auth/verify-email", { 
                state: { 
                  email, 
                  password, 
                  role: "customer", 
                  redirect: returnTo || "/customer/my-posts" 
                } 
              });
            }
          }
        });
      } else {
        toast.error(errorMsg || "Invalid email or password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authApi.register({ email, password, name, role: "customer" });
      toast.success("Account created! Please verify your email.");
      
      const returnTo = (location.state as any)?.returnTo;
      navigate("/auth/verify-email", { 
        state: { 
          email, 
          password, 
          role: "customer", 
          redirect: returnTo || "/customer/my-posts"
        } 
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "";
      const errorData = error.response?.data;
      
      // Handle specific error cases
      if (errorMsg.toLowerCase().includes("email already exists") || 
          errorMsg.toLowerCase().includes("user already exists") ||
          errorMsg.toLowerCase().includes("already registered")) {
        toast.error("Email already exists", {
          description: "This email is already registered. Please sign in instead."
        });
      } else if (errorMsg.toLowerCase().includes("already exists") && errorMsg.toLowerCase().includes("verified")) {
        toast.error("Account already exists", {
          description: "Please sign in to continue."
        });
      } else if (errorMsg.toLowerCase().includes("already exists")) {
        toast.info("Please verify your email to continue");
        const returnTo = (location.state as any)?.returnTo;
        navigate("/auth/verify-email", { 
          state: { 
            email, 
            password, 
            role: "customer", 
            redirect: returnTo || "/customer/my-posts" 
          } 
        });
      } else if (errorMsg.toLowerCase().includes("password")) {
        toast.error("Invalid password", {
          description: errorMsg || "Password must be at least 6 characters"
        });
      } else if (errorMsg.toLowerCase().includes("email") && errorMsg.toLowerCase().includes("invalid")) {
        toast.error("Invalid email address", {
          description: "Please enter a valid email address"
        });
      } else {
        toast.error("Could not create account", {
          description: errorMsg || "Please try again later"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="hover:bg-transparent"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-500"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
        </Button>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
          <CardHeader>
            <CardTitle>Customer Account</CardTitle>
            <CardDescription>Sign in or create a customer account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname">Full Name</Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
