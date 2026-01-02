import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { CategorySidebar } from "@/components/layout/CategorySidebar";
import { useState } from "react";

export default function VendorLayout() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />
      
      <div className="flex">
        <aside className="hidden lg:block w-64 border-r border-border bg-card min-h-[calc(100vh-4rem)] sticky top-16">
          <CategorySidebar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </aside>

        <main className="flex-1">
          <Outlet context={{ selectedCategory }} />
        </main>
      </div>
    </div>
  );
}
