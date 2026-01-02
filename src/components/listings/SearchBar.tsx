import { Search, SlidersHorizontal, Grid3X3, Map } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  viewMode: "gallery" | "map";
  onViewModeChange: (mode: "gallery" | "map") => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search listings..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {/* Filters popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="flex-shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Filters</h4>
              
              <div className="space-y-2">
                <Label>Price Range</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={minPrice}
                    onChange={(e) => onMinPriceChange(e.target.value)}
                    className="flex-1"
                  />
                  <span className="flex items-center text-muted-foreground">–</span>
                  <Input
                    placeholder="Max"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => onMaxPriceChange(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort dropdown */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="title-az">Title: A-Z</SelectItem>
            <SelectItem value="title-za">Title: Z-A</SelectItem>
          </SelectContent>
        </Select>

        {/* View mode toggle */}
        <div className="flex border border-input rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-r-none",
              viewMode === "gallery" && "bg-accent"
            )}
            onClick={() => onViewModeChange("gallery")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-l-none border-l border-input",
              viewMode === "map" && "bg-accent"
            )}
            onClick={() => onViewModeChange("map")}
          >
            <Map className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
