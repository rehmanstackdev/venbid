import { mapTilerConfig } from '@/config/maptiler';

const geocodeCache = new Map<string, { lat: number; lng: number }>();

export async function geocodeZipCode(zip: string): Promise<{ lat: number; lng: number } | null> {
  if (geocodeCache.has(zip)) {
    return geocodeCache.get(zip)!;
  }

  try {
    const response = await fetch(
      `${mapTilerConfig.geocodingUrl}/${encodeURIComponent(zip)}.json?key=${mapTilerConfig.apiKey}`
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
