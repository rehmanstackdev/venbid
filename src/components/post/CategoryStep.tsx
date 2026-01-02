import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface CategoryStepProps {
  selectedCategory: number | null;
  onSelect: (id: number) => void;
}

export function CategoryStep({ selectedCategory, onSelect }: CategoryStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">What service do you need?</h2>
        <p className="text-muted-foreground text-sm">
          Select the category that best describes your job
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all",
                "hover:border-primary/50 hover:bg-accent",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{category.name}</p>
              </div>
              {isSelected && (
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
