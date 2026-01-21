import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { CategorySidebar } from "@/components/layout/CategorySidebar";
import { useState } from "react";

export default function VendorLayout() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />
      
      <div className="flex flex-1">
        <aside className="hidden lg:block w-64 border-r border-border bg-card fixed left-0 top-14 h-[calc(100vh-3.5rem)] overflow-y-auto z-10">
          <CategorySidebar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </aside>

        <main className="flex-1 lg:ml-64 overflow-y-auto">
          <Outlet context={{ selectedCategory }} />
        </main>
      </div>
    </div>
  );
}
