import { mapTilerConfig } from '@/config/maptiler';

const geocodeCache = new Map<string, { lat: number; lng: number }>();

export async function geocodeZipCode(zip: string): Promise<{ lat: number; lng: number } | null> {
  if (geocodeCache.has(zip)) {
    return geocodeCache.get(zip)!;
  }

  try {
    // Check if input is a 5-digit ZIP code (US format)
    const isUSZip = /^\d{5}$/.test(zip.trim());
    
    // Always restrict to United States for all geocoding requests
    const countryParam = '&country=us';
    
    const response = await fetch(
      `${mapTilerConfig.geocodingUrl}/${encodeURIComponent(zip)}.json?key=${mapTilerConfig.apiKey}${countryParam}`
    );
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data?.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      const coords = { lat, lng };
      geocodeCache.set(zip, coords);
      return coords;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  
  return null;
}
