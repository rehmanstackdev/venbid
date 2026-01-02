import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { X, Mail, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

type Step = 'email' | 'code' | 'password' | 'success';

interface ForgotPasswordProps {
  onClose: () => void;
  onSendCode: (email: string) => Promise<boolean>;
  onVerifyCode: (email: string, code: string) => Promise<boolean>;
  onResetPassword: (email: string, password: string) => Promise<boolean>;
}

export function ForgotPassword({ onClose, onSendCode, onVerifyCode, onResetPassword }: ForgotPasswordProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.errors[0].message);
        return;
      }
    }

    setIsLoading(true);
    const success = await onSendCode(email);
    setIsLoading(false);

    if (success) {
      setStep('code');
      setResendCooldown(60);
    } else {
      setError('Failed to send verification code. Please try again.');
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');
    
    const success = await onVerifyCode(email, code);
    setIsLoading(false);
    
    if (success) {
      setStep('password');
    } else {
      setError('Invalid verification code. Please try again.');
      setCode('');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.errors[0].message);
        return;
      }
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const success = await onResetPassword(email, password);
    setIsLoading(false);

    if (success) {
      setStep('success');
    } else {
      setError('Failed to reset password. Please try again.');
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    await onSendCode(email);
    setIsLoading(false);
    setResendCooldown(60);
  };

  // Cooldown timer
  if (resendCooldown > 0) {
    setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>

        {step === 'email' && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
              <CardDescription>
                Enter your email and we'll send you a verification code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </form>
            </CardContent>
          </>
        )}

        {step === 'code' && (
          <>
            <CardHeader className="text-center">
              <button
                onClick={() => setStep('email')}
                className="absolute top-4 left-4 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Enter Code</CardTitle>
              <CardDescription>
                We've sent a 6-digit code to<br />
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                  disabled={isLoading}
                >
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

              {error && <p className="text-sm text-destructive text-center">{error}</p>}

              <Button 
                onClick={handleVerifyCode}
                className="w-full"
                disabled={code.length !== 6 || isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?{' '}
                  {resendCooldown > 0 ? (
                    <span>Resend in {resendCooldown}s</span>
                  ) : (
                    <button
                      onClick={handleResend}
                      className="text-primary hover:underline font-medium"
                      disabled={isLoading}
                    >
                      Resend code
                    </button>
                  )}
                </p>
              </div>
            </CardContent>
          </>
        )}

        {step === 'password' && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
              <CardDescription>
                Create a new password for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            </CardContent>
          </>
        )}

        {step === 'success' && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-verified/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-verified" />
              </div>
              <CardTitle className="text-2xl font-bold">Password Reset!</CardTitle>
              <CardDescription>
                Your password has been successfully reset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={onClose} className="w-full">
                Back to Login
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
