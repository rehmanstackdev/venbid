import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginReminder() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Venbid!</CardTitle>
          <CardDescription>
            Please sign in or create an account to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            className="w-full gap-2" 
            size="lg"
            onClick={() => navigate("/auth")}
          >
            <LogIn className="h-5 w-5" />
            Sign In
          </Button>
          <Button 
            variant="outline" 
            className="w-full gap-2" 
            size="lg"
            onClick={() => navigate("/auth")}
          >
            <UserPlus className="h-5 w-5" />
            Create Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
