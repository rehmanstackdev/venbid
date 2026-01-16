import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { Listing } from "@/hooks/useListings";

interface MarkerClusterGroupProps {
  listings: Listing[];
  onListingClick?: (listing: Listing) => void;
}

export function MarkerClusterGroup({ listings, onListingClick }: MarkerClusterGroupProps) {
  const map = useMap();

  useEffect(() => {
    const markerClusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = "small";
        if (count > 10) size = "medium";
        if (count > 25) size = "large";

        return L.divIcon({
          html: `<div class="cluster-icon cluster-${size}">${count}</div>`,
          className: "custom-cluster-icon",
          iconSize: L.point(40, 40),
        });
      },
    });


    const createCustomIcon = () => {
      return L.divIcon({
        html: `<div class="marker-icon"></div>`,
        className: "custom-marker",
        iconSize: L.point(32, 32),
        iconAnchor: L.point(16, 32),
      });
    };

    listings.forEach((listing) => {
      const marker = L.marker([listing.lat, listing.lng], {
        icon: createCustomIcon(),
      });

 
      const popupContent = `
        <div class="listing-popup">
          <img src="${listing.images[0] || '/placeholder.svg'}" alt="${listing.title}" class="popup-image" />
          <div class="popup-content">
            <h4 class="popup-title">${listing.title}</h4>
            <p class="popup-budget">$${listing.budget}</p>
            <p class="popup-category">${listing.categoryName}</p>
            <p class="popup-location">${listing.city} – ${listing.zip}</p>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 280,
        className: "custom-popup",
      });

      if (onListingClick) {
        marker.on("click", () => onListingClick(listing));
      }

      markerClusterGroup.addLayer(marker);
    });

    map.addLayer(markerClusterGroup);

    return () => {
      map.removeLayer(markerClusterGroup);
    };
  }, [map, listings, onListingClick]);

  return null;
}
