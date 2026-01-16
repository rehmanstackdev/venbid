import { useState, useCallback, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Circle, useMapEvents, useMap } from "react-leaflet";
import { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Search, ZoomIn, ZoomOut, Locate } from "lucide-react";
import { Listing, getListingsInBounds } from "@/hooks/useListings";
import { MarkerClusterGroup } from "./MarkerClusterGroup";
import { cn } from "@/lib/utils";

interface ListingsMapProps {
  listings: Listing[];
  allListings?: Listing[];
  onBoundsChange?: (listings: Listing[]) => void;
  className?: string;
  userCoordinates?: { lat: number; long: number };
}


const ILLINOIS_CENTER: [number, number] = [41.8781, -87.7298];
const DEFAULT_ZOOM = 10;


function calculateViewportRadius(map: LeafletMap): number {
  const bounds = map.getBounds();
  const center = map.getCenter();
  

  const northEast = bounds.getNorthEast();
  const southWest = bounds.getSouthWest();
  

  const latDistance = map.distance(
    [bounds.getSouth(), center.lng],
    [bounds.getNorth(), center.lng]
  );
  const lngDistance = map.distance(
    [center.lat, bounds.getWest()],
    [center.lat, bounds.getEast()]
  );
  

  const smallerDimension = Math.min(latDistance, lngDistance);
  return smallerDimension * 0.4;
}

function MapEventHandler({
  onMoveEnd,
  onMapReady,
}: {
  onMoveEnd: (bounds: { north: number; south: number; east: number; west: number }, center: [number, number], radius: number) => void;
  onMapReady: (map: LeafletMap) => void;
}) {
  const map = useMap();
  
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const bounds = map.getBounds();
      const center = map.getCenter();
      
      const radius = calculateViewportRadius(map);
      
      onMoveEnd(
        {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        },
        [center.lat, center.lng],
        radius
      );
    },
  });
  return null;
}

export function ListingsMap({ listings, allListings, onBoundsChange, className, userCoordinates }: ListingsMapProps) {
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [currentBounds, setCurrentBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);
  const [searchCircle, setSearchCircle] = useState<{
    center: [number, number];
    radius: number;
  } | null>(null);
  const [pendingCircle, setPendingCircle] = useState<{
    center: [number, number];
    radius: number;
  } | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  
  
  const mapCenter: [number, number] = userCoordinates?.lat && userCoordinates?.long 
    ? [userCoordinates.lat, userCoordinates.long] 
    : ILLINOIS_CENTER;
  

  const listingsToFilter = allListings || listings;

  const handleMoveEnd = useCallback(
    (bounds: { north: number; south: number; east: number; west: number }, center: [number, number], radius: number) => {
      setCurrentBounds(bounds);
      setPendingCircle({ center, radius });
      setShowSearchButton(true);
    },
    []
  );

  const handleMapReady = useCallback((map: LeafletMap) => {
    mapRef.current = map;
  }, []);

  const handleSearchThisArea = useCallback(() => {
    if (currentBounds && onBoundsChange && pendingCircle) {
      const filteredListings = getListingsInBounds(listingsToFilter, currentBounds);
      onBoundsChange(filteredListings);
      setSearchCircle(pendingCircle);
      setShowSearchButton(false);
    }
  }, [currentBounds, listingsToFilter, onBoundsChange, pendingCircle]);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  const handleLocate = useCallback(() => {
    mapRef.current?.setView(mapCenter, DEFAULT_ZOOM);
  }, [mapCenter]);

  return (
    <div className={cn("relative rounded-lg overflow-hidden border border-border", className)}>
      <MapContainer
        center={mapCenter}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup listings={listings} />
        <MapEventHandler onMoveEnd={handleMoveEnd} onMapReady={handleMapReady} />
        

        {searchCircle && (
          <Circle
            center={searchCircle.center}
            radius={searchCircle.radius}
            pathOptions={{
              color: "#6366f1",
              fillColor: "#6366f1",
              fillOpacity: 0.15,
              weight: 2,
              dashArray: "5, 5",
            }}
          />
        )}
      </MapContainer>


      {showSearchButton && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] animate-fade-in">
          <Button
            onClick={handleSearchThisArea}
            className="shadow-lg gap-2"
            size="sm"
          >
            <Search className="h-4 w-4" />
            Search this area
          </Button>
        </div>
      )}


      <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="shadow-md bg-card"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="shadow-md bg-card"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="shadow-md bg-card"
          onClick={handleLocate}
        >
          <Locate className="h-4 w-4" />
        </Button>
      </div>


      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-card/95 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-md text-sm font-medium">
          {listings.length} {listings.length === 1 ? "listing" : "listings"}
        </div>
      </div>
    </div>
  );
}
