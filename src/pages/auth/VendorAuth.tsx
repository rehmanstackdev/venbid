import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
import { categories } from "@/data/categories";
import { scheduleTokenRefresh } from "@/api/client";
import { initChatSocket } from "@/lib/chatSocket";

export default function VendorAuth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      
      if (user.role === "vendor") {
        if (user.completeProfile) {
          window.location.href = "/vendor/dashboard";
        } else {
          window.location.href = "/onboarding/vendor";
        }
      } else if (user.role === "customer") {
        if (user.completeProfile) {
          window.location.href = "/customer/my-posts";
        } else {
          window.location.href = "/onboarding/customer";
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
              navigate("/auth/verify-email", { 
                state: { 
                  email, 
                  password, 
                  role: "vendor", 
                  redirect: "/onboarding/vendor" 
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
      await authApi.register({ email, password, name, role: "vendor", serviceCategory });
      toast.success("Account created! Please verify your email.");
      navigate("/auth/verify-email", { state: { email, password, role: "vendor", redirect: "/onboarding/vendor" } });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "";
      
      if (errorMsg.toLowerCase().includes("already exists") && errorMsg.toLowerCase().includes("verified")) {
        toast.error("Account already exists, please sign in.");
      } else if (errorMsg.toLowerCase().includes("already exists")) {
        toast.info("Please verify your email to continue");
        navigate("/auth/verify-email", { 
          state: { 
            email, 
            password, 
            role: "vendor", 
            redirect: "/onboarding/vendor" 
          } 
        });
      } else {
        toast.error(errorMsg || "Could not create account.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate("/auth")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Account</CardTitle>
            <CardDescription>Sign in or create a vendor account</CardDescription>
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
                    <Label htmlFor="signup-category">Service Category</Label>
                    <Select value={serviceCategory} onValueChange={setServiceCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your service" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.slug}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
  );
}
