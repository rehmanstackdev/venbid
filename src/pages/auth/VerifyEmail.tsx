import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
import { loadDraft } from "@/lib/jobDraft";

const maskEmail = (email: string) => {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  
  const maskedLocal = localPart.length > 2 
    ? localPart[0] + localPart[1] + '*'.repeat(Math.min(localPart.length - 2, 7))
    : localPart[0] + '*';
  
  const [domainName, tld] = domain.split('.');
  const maskedDomain = domainName.length > 1
    ? domainName[0] + '*'.repeat(Math.min(domainName.length - 1, 2))
    : domainName;
  
  return `${maskedLocal}@${maskedDomain}.${tld}`;
};

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, password, role, redirect } = location.state || {};
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

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
        
        // Check if there's a job draft
        const draft = loadDraft();
        if (draft && role === "customer") {
          // Redirect to post-job page to complete publishing
          window.location.href = "/post-job?step=4&autoPublish=true";
          return;
        }
        
        if (redirect) {
          window.location.href = redirect;
        } else if (role === "customer") {
          if (!user.completeProfile) {
            window.location.href = "/onboarding/customer";
          } else {
            window.location.href = "/customer/my-posts";
          }
        } else if (role === "vendor") {
          if (!user.completeProfile) {
            window.location.href = "/onboarding/vendor";
          } else {
            window.location.href = "/vendor/dashboard";
          }
        } else {
          window.location.href = "/";
        }
      } else {
        toast.success("Email verified successfully! Please login.");
        navigate("/auth");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email not found");
      return;
    }

    setResending(true);
    try {
      await authApi.resendVerificationOtp({ email });
      toast.success("OTP sent successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
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
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit code to {maskEmail(email || '')}
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Code expires in 10 minutes</span>
            </div>
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
            <Button
              type="button"
              variant="outline"
              className="w-full text-sm bg-red-50 hover:bg-red-100 border-red-200 text-red-600 hover:text-red-700"
              onClick={handleResendOtp}
              disabled={resending}
            >
              {resending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend OTP"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
