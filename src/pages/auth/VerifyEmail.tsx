import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/api/auth";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, password, role, redirect } = location.state || {};
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Email not found. Please sign up again.");
      navigate("/auth");
      return;
    }

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyEmail({ email, otp });
      
      if (password) {
        const loginResponse = await authApi.login({ email, password });
        const { accessToken, refreshToken, user } = loginResponse.data;
        
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        localStorage.setItem("user_data", JSON.stringify(user));
        localStorage.setItem("user_roles", JSON.stringify([user.role]));
        
        toast.success("Email verified successfully!");
        
        if (redirect) {
          window.location.href = redirect;
        } else if (role === "customer") {
          window.location.href = "/customer/my-posts";
        } else if (role === "vendor") {
          window.location.href = "/vendor/dashboard";
        } else {
          window.location.href = "/";
        }
      } else {
        toast.success("Email verified successfully! Please login.");
        
        if (role === "customer") {
          navigate("/auth/customer");
        } else if (role === "vendor") {
          navigate("/auth/vendor");
        } else {
          navigate("/auth");
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit code to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
