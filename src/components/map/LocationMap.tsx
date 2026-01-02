import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

interface LocationMapProps {
  lat: number;
  lng: number;
  showExactAddress?: boolean;
  className?: string;
}

// Custom marker icon
const customIcon = L.divIcon({
  html: `<div class="marker-icon"></div>`,
  className: "custom-marker",
  iconSize: L.point(32, 32),
  iconAnchor: L.point(16, 32),
});

// Component to handle map fly-to animation when coordinates change
function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo([lat, lng], 13, {
      duration: 1.5,
      easeLinearity: 0.25,
    });
  }, [lat, lng, map]);
  
  return null;
}

export function LocationMap({ lat, lng, showExactAddress = false, className }: LocationMapProps) {
  // Convert 5 miles to meters (5 * 1609.34)
  const fiveMilesInMeters = 8046.72;
  
  // Use key to force re-render when coordinates change significantly
  const mapKey = `${lat.toFixed(2)}-${lng.toFixed(2)}`;
  
  return (
    <div className={className}>
      <MapContainer
        key={mapKey}
        center={[lat, lng]}
        zoom={13}
        className="h-full w-full rounded-lg"
        zoomControl={true}
        dragging={true}
        touchZoom={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater lat={lat} lng={lng} />
        {showExactAddress ? (
          <Marker position={[lat, lng]} icon={customIcon} />
        ) : (
          <>
            <Circle
              center={[lat, lng]}
              radius={fiveMilesInMeters}
              pathOptions={{
                color: "hsl(1, 83%, 55%)",
                fillColor: "hsl(1, 83%, 55%)",
                fillOpacity: 0.15,
                weight: 2,
              }}
            />
            <Marker position={[lat, lng]} icon={customIcon} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
