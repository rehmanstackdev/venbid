import { useState } from "react";
import { MessageSquare, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStartConversation } from "@/hooks/useMessages";
import { useToast } from "@/hooks/use-toast";

interface MessageButtonProps {
  listingId: string;
  listingTitle: string;
  customerId: string;
}

export function MessageButton({ listingId, listingTitle, customerId }: MessageButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isVendor, loading: authLoading } = useAuth();
  const { startConversation } = useStartConversation();
  const { toast } = useToast();
  
  const isLoggedIn = !!user;

  const handleClick = async () => {
    if (authLoading) return;
    
    if (!isLoggedIn) {
      setDialogOpen(true);
      return;
    }
    
    if (!isVendor) {
      toast({
        title: 'Vendor account required',
        description: 'Only vendors can message about job listings. Customers receive messages from vendors.',
        variant: 'destructive',
      });
      return;
    }

    if (user?.id === customerId) {
      toast({
        title: 'Cannot message own listing',
        description: 'You cannot message your own job posting.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const conversationId = await startConversation(listingId, customerId);
    setLoading(false);

    if (conversationId) {
      navigate(`/vendor/messages?conversation=${conversationId}`);
    }
  };

  return (
    <>
      <Button 
        size="lg" 
        className="w-full gap-2"
        onClick={handleClick}
        disabled={loading || user?.id === customerId}
      >
        <MessageSquare className="h-5 w-5" />
        {loading ? "Starting chat..." : "Message about this job"}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to message</DialogTitle>
            <DialogDescription>
              Only registered service providers can message customers about jobs. 
              Sign in or create a vendor account to get started.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-4">
            <Button 
              className="w-full gap-2" 
              onClick={() => {
                setDialogOpen(false);
                navigate("/auth/vendor");
              }}
            >
              <LogIn className="h-4 w-4" />
              Sign In as Vendor
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => {
                setDialogOpen(false);
                navigate("/auth/vendor");
              }}
            >
              <UserPlus className="h-4 w-4" />
              Create Vendor Account
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-2">
              Are you a customer?{" "}
              <button 
                className="text-primary hover:underline"
                onClick={() => {
                  setDialogOpen(false);
                  navigate("/auth/customer");
                }}
              >
                Sign up here
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
