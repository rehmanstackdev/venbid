import { useNavigate } from "react-router-dom";
import { Users, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RoleSelection() {
  const navigate = useNavigate();

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
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to Venbid</h1>
            <p className="text-muted-foreground">Choose how you want to use Venbid</p>
          </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/auth/customer")}>
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>I'm a Customer</CardTitle>
              <CardDescription>Post jobs and hire service providers</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li>• Post job listings</li>
                <li>• Receive bids from vendors</li>
                <li>• Manage your projects</li>
                <li>• Chat with service providers</li>
              </ul>
              <Button className="w-full">Continue as Customer</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/auth/vendor")}>
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>I'm a Vendor</CardTitle>
              <CardDescription>Find jobs and grow your business</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li>• Browse job opportunities</li>
                <li>• Submit bids to customers</li>
                <li>• Build your reputation</li>
                <li>• Get verified</li>
              </ul>
              <Button className="w-full">Continue as Vendor</Button>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
