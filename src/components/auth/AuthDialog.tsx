import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  requireRole?: 'customer' | 'vendor';
  returnUrl?: string;
}

export function AuthDialog({
  open,
  onOpenChange,
  title = 'Sign in required',
  description = 'Please sign in to continue',
  requireRole,
  returnUrl,
}: AuthDialogProps) {
  const navigate = useNavigate();

  const handleSignIn = () => {
    onOpenChange(false);
    if (requireRole === 'vendor') {
      navigate('/auth/vendor');
    } else if (requireRole === 'customer') {
      navigate('/auth/customer');
    } else {
      navigate('/auth');
    }
  };

  const handleSignUp = (type?: 'customer' | 'vendor') => {
    onOpenChange(false);
    if (type === 'vendor') {
      navigate('/auth/vendor');
    } else if (type === 'customer') {
      navigate('/auth/customer');
    } else {
      navigate('/auth');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <Button 
            className="w-full gap-2" 
            onClick={handleSignIn}
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
          
          {requireRole === 'vendor' ? (
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => handleSignUp('vendor')}
            >
              <UserPlus className="h-4 w-4" />
              Create Vendor Account
            </Button>
          ) : requireRole === 'customer' ? (
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => handleSignUp('customer')}
            >
              <UserPlus className="h-4 w-4" />
              Create Customer Account
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => handleSignUp('customer')}
              >
                <UserPlus className="h-4 w-4" />
                Sign Up as Customer
              </Button>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => handleSignUp('vendor')}
              >
                <UserPlus className="h-4 w-4" />
                Sign Up as Vendor
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
