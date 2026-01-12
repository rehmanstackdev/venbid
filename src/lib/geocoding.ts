// Geocoding utility using OpenStreetMap Nominatim API
// Cache to store geocoded results
const geocodeCache = new Map<string, { lat: number; lng: number }>();

export async function geocodeZipCode(zip: string): Promise<{ lat: number; lng: number } | null> {
  // Check cache first
  if (geocodeCache.has(zip)) {
    return geocodeCache.get(zip)!;
  }

  try {
    // Use structured query for better accuracy
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `format=json&postalcode=${encodeURIComponent(zip)}&` +
      `addressdetails=1&limit=5`
    );
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      // Find the most relevant result
      // Prioritize results with higher importance and better match
      const bestResult = data.reduce((best: any, current: any) => {
        if (!best) return current;
        
        // Prefer results with higher importance score
        const currentImportance = parseFloat(current.importance || 0);
        const bestImportance = parseFloat(best.importance || 0);
        
        return currentImportance > bestImportance ? current : best;
      }, null);
      
      if (bestResult) {
        const coords = {
          lat: parseFloat(bestResult.lat),
          lng: parseFloat(bestResult.lon)
        };
        
        // Cache the result
        geocodeCache.set(zip, coords);
        return coords;
      }
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  
  return null;
}
