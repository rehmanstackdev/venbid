import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Users, FileCheck, FileText, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const navigation = [
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Vendor Verification", href: "/admin/vendors", icon: FileCheck },
  { name: "Listings", href: "/admin/listings", icon: FileText },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-nav">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/" className="text-2xl font-bold text-primary">
              Venbid Admin
            </Link>
          </div>

          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-xl font-bold text-primary">Admin Panel</span>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:pt-16">
        <div className="flex flex-col flex-1 border-r border-border bg-card">
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
