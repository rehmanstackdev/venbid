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
import { toast } from "sonner";
import { chatApi } from "@/api/chat";

interface MessageButtonProps {
  listingId: string;
  listingTitle: string;
  customerId: string;
}

export function MessageButton({ listingId, listingTitle, customerId }: MessageButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const { user, isVendor, loading: authLoading } = useAuth();
  
  const isLoggedIn = !!user;

  const handleClick = async () => {
    if (authLoading) return;
    
    if (!isLoggedIn) {
      setDialogOpen(true);
      return;
    }
    
    if (!isVendor) {
      toast.error('Only vendors can message about job listings.');
      return;
    }

    if (user?.id === customerId) {
      toast.error('You cannot message your own job posting.');
      return;
    }

    // Send initial message and navigate to full messages page
    setSending(true);
    try {
      const response = await chatApi.sendMessage({
        jobId: listingId,
        recipientId: customerId,
        content: `Hi, I'm interested in your job: ${listingTitle}`,
      });
      
      navigate(`/vendor/messages/${response.conversationId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start conversation");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button 
        size="lg" 
        className="w-full gap-2"
        onClick={handleClick}
        disabled={user?.id === customerId || sending}
      >
        <MessageSquare className="h-5 w-5" />
        {sending ? 'Starting conversation...' : 'Message about this job'}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Sign in to message</DialogTitle>
            <DialogDescription className="text-sm">
              Only registered service providers can message customers about jobs. 
              Sign in or create a vendor account to get started.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-4">
            <Button 
              className="w-full gap-2 text-sm sm:text-base" 
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
              className="w-full gap-2 text-sm sm:text-base"
              onClick={() => {
                setDialogOpen(false);
                navigate("/auth/vendor");
              }}
            >
              <UserPlus className="h-4 w-4" />
              Create Vendor Account
            </Button>

            <p className="text-center text-xs sm:text-sm text-muted-foreground pt-2">
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
