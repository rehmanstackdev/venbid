import { useState, useMemo, useEffect } from "react";
import { categories } from "@/data/categories";
import { useListings, Listing } from "@/hooks/useListings";
import { SearchBar } from "./SearchBar";
import { ListingGrid } from "./ListingGrid";
import { ListingsMap } from "@/components/map/ListingsMap";
import { Loader2 } from "lucide-react";

interface ListingsSectionProps {
  selectedCategory: number | null;
}

export function ListingsSection({ selectedCategory }: ListingsSectionProps) {
  const { listings: allListings, loading } = useListings();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"gallery" | "map">("gallery");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [mapFilteredListings, setMapFilteredListings] = useState<Listing[] | null>(null);

  // Reset map filter when category changes
  useEffect(() => {
    setMapFilteredListings(null);
  }, [selectedCategory]);

  const categoryName = useMemo(() => {
    if (selectedCategory === null) return "All Categories";
    const category = categories.find((c) => c.id === selectedCategory);
    return category?.name || "All Categories";
  }, [selectedCategory]);

  const baseListings = useMemo(() => {
    if (selectedCategory === null) return allListings;
    return allListings.filter(listing => listing.categoryId === selectedCategory);
  }, [selectedCategory, allListings]);

  const filteredListings = useMemo(() => {
    let listings = mapFilteredListings || baseListings;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      listings = listings.filter(
        (l) =>
          l.title.toLowerCase().includes(query) ||
          l.description.toLowerCase().includes(query)
      );
    }

    // Price filter
    if (minPrice) {
      const min = parseInt(minPrice);
      listings = listings.filter((l) => {
        const price = parseInt(l.budget.split("-")[0]);
        return price >= min;
      });
    }
    if (maxPrice) {
      const max = parseInt(maxPrice);
      listings = listings.filter((l) => {
        const price = parseInt(l.budget.split("-")[0]);
        return price <= max;
      });
    }

    // Sort
    const sortedListings = [...listings];
    switch (sortBy) {
      case "newest":
        sortedListings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case "oldest":
        sortedListings.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case "price-low":
        sortedListings.sort((a, b) => {
          const priceA = parseInt(a.budget.split("-")[0]);
          const priceB = parseInt(b.budget.split("-")[0]);
          return priceA - priceB;
        });
        break;
      case "price-high":
        sortedListings.sort((a, b) => {
          const priceA = parseInt(a.budget.split("-")[0]);
          const priceB = parseInt(b.budget.split("-")[0]);
          return priceB - priceA;
        });
        break;
      case "title-az":
        sortedListings.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-za":
        sortedListings.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return sortedListings;
  }, [baseListings, mapFilteredListings, searchQuery, sortBy, minPrice, maxPrice]);

  const handleBoundsChange = (listings: Listing[]) => {
    setMapFilteredListings(listings);
  };

  const handleClearMapFilter = () => {
    setMapFilteredListings(null);
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Section header */}
      <div className="p-4 lg:p-6">
        <h1 className="text-2xl font-bold text-foreground">{categoryName}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {filteredListings.length} {filteredListings.length === 1 ? "listing" : "listings"} available
          {mapFilteredListings && (
            <button
              onClick={handleClearMapFilter}
              className="ml-2 text-primary hover:underline"
            >
              Clear map filter
            </button>
          )}
        </p>
      </div>

      {/* Search and filters */}
      <div className="px-4 lg:px-6">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
        />
      </div>

      {/* Content based on view mode */}
      <div className="px-4 lg:px-6 pb-6">
        {viewMode === "gallery" ? (
          <ListingGrid listings={filteredListings} />
        ) : (
          <div className="h-[calc(100vh-280px)] min-h-[500px]">
            <ListingsMap
              listings={mapFilteredListings || baseListings}
              allListings={baseListings}
              onBoundsChange={handleBoundsChange}
              className="w-full h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
