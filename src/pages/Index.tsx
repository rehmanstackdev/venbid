import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { CategorySidebar } from "@/components/layout/CategorySidebar";
import { ListingsSection } from "@/components/listings/ListingsSection";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />
      
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 border-r border-border bg-card min-h-[calc(100vh-4rem)] sticky top-16">
          <CategorySidebar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <ListingsSection selectedCategory={selectedCategory} />
        </main>
      </div>
    </div>
  );
};

export default Index;
