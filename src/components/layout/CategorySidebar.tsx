import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";
import { LayoutGrid } from "lucide-react";

interface CategorySidebarProps {
  selectedCategory: number | null;
  onSelectCategory: (id: number | null) => void;
}

export function CategorySidebar({ selectedCategory, onSelectCategory }: CategorySidebarProps) {
  return (
    <aside className="w-full h-full overflow-y-auto">
      <nav className="py-2">
        {/* All Categories option */}
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors",
            "hover:bg-accent",
            selectedCategory === null 
              ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
              : "text-foreground"
          )}
        >
          <LayoutGrid className="h-5 w-5 flex-shrink-0" />
          <span>All Categories</span>
        </button>

        {/* Category list */}
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors",
                "hover:bg-accent",
                isSelected 
                  ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
                  : "text-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="line-clamp-1">{category.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
