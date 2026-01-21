import { Outlet, Link, useLocation } from "react-router-dom";
import { MessageSquare, Heart, User, MapPin } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navigation = [
  { name: "Messages", href: "/vendor/messages", icon: MessageSquare },
  { name: "Favorites", href: "/vendor/favorites", icon: Heart },
  { name: "My Profile", href: "/vendor/profile", icon: User },
  { name: "Jobs", href: "/vendor/dashboard", icon: MapPin },
];

export default function VendorLayoutWithSidebar() {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />
      
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 border-r border-border bg-card fixed left-0 top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <nav className="p-4 space-y-2">
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
        </aside>

       
        <main className="flex-1 lg:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
