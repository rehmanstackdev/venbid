import { Heart, Mail, User, Menu, LogOut, Shield, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CategorySidebar } from "./CategorySidebar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { LoginReminderDialog } from "@/components/auth/LoginReminderDialog";
import { useState } from "react";

interface HeaderProps {
  selectedCategory: number | null;
  onSelectCategory: (id: number | null) => void;
}

export function Header({ selectedCategory, onSelectCategory }: HeaderProps) {
  const { user, signOut, roles } = useAuth();
  const { unreadCount } = useUnreadMessages();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-nav">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Sheet modal={false}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden ml-4">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="p-4 border-b border-border">
                <img src="/venbid-high-resolution-logo-transparent.png" alt="Venbid" className="h-8" />
              </div>
              <CategorySidebar 
                selectedCategory={selectedCategory} 
                onSelectCategory={onSelectCategory} 
              />
            </SheetContent>
          </Sheet>

          <Link to="/" className="hidden lg:flex items-center w-64 pl-6 shrink-0">
            <img src="/venbid-high-resolution-logo-transparent.png" alt="Venbid" className="h-10" />
          </Link>

          <Link to="/" className="flex lg:hidden items-center pl-2">
            <img src="/venbid-high-resolution-logo-transparent.png" alt="Venbid" className="h-8" />
          </Link>

          <nav className="hidden sm:flex items-center gap-6 pl-6">
            <Link 
              to="/" 
              className="text-base font-semibold text-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="text-base font-semibold text-foreground hover:text-primary transition-colors"
            >
              About
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 pr-4">
          {/* Show Post a Job button only for customers or non-logged-in users */}
          {(!user || roles.includes('customer')) && (
            <Link to="/post-job">
              <Button variant="default" size="sm" className="hidden md:flex gap-2">
                <Plus className="h-4 w-4" />
                Post a Job
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => {
              if (!user) {
                setShowLoginDialog(true);
                return;
              }
              navigate(roles.includes('customer') ? '/customer/messages' : '/vendor/messages');
            }}
            aria-label={user ? 'Messages' : 'Sign in to view messages'}
          >
            <Mail className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>

          <NotificationDropdown onLoginRequired={() => setShowLoginDialog(true)} />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (!user) {
                setShowLoginDialog(true);
                return;
              }
              navigate(roles.includes('customer') ? '/customer/favorites' : '/vendor/favorites');
            }}
          >
            <Heart className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {user ? (
                <>
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {/* Show Post a Job in mobile menu only for customers */}
                  {roles.includes('customer') && (
                    <DropdownMenuItem asChild className="md:hidden">
                      <Link to="/post-job">
                        <Plus className="h-4 w-4 mr-2" />
                        Post a Job
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {roles.includes('customer') && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/customer/my-posts">My Posts</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/customer/messages">
                          <Mail className="h-4 w-4 mr-2" />
                          Messages
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/customer/favorites">
                          <Heart className="h-4 w-4 mr-2" />
                          Favorites
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/customer/profile">My Profile</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {roles.includes('vendor') && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/vendor/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/vendor/messages">
                          <Mail className="h-4 w-4 mr-2" />
                          Messages
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/vendor/favorites">
                          <Heart className="h-4 w-4 mr-2" />
                          Favorites
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/vendor/profile">My Profile</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {roles.includes('admin') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin/dashboard">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild className="md:hidden">
                    <Link to="/post-job">
                      <Plus className="h-4 w-4 mr-2" />
                      Post a Job
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/auth">Sign In</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <LoginReminderDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </header>
  );
}
