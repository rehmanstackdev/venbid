import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LoginReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginReminderDialog({ open, onOpenChange }: LoginReminderDialogProps) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    onOpenChange(false);
    navigate("/auth");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Welcome to Venbid!</DialogTitle>
          <DialogDescription>
            Please sign in or create an account to access this feature
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-4">
          <Button 
            className="w-full gap-2" 
            size="lg"
            onClick={handleNavigate}
          >
            <LogIn className="h-5 w-5" />
            Sign In
          </Button>
          <Button 
            variant="outline" 
            className="w-full gap-2" 
            size="lg"
            onClick={handleNavigate}
          >
            <UserPlus className="h-5 w-5" />
            Create Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
