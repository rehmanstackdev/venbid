import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useState } from "react";

export default function VendorLayoutNoSidebar() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />
      
      <main className="flex-1 overflow-y-auto">
        <Outlet context={{ selectedCategory }} />
      </main>
    </div>
  );
}
