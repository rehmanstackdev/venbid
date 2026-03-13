export interface GeocodingContextEntry {
  id?: string;
  short_code?: string;
  text?: string;
}

export interface GeocodingProperties {
  country_code?: string;
  country?: string;
  short_code?: string;
}

export interface GeocodingFeature {
  id?: string | number;
  place_name?: string;
  center?: [number, number];
  properties?: GeocodingProperties;
  context?: GeocodingContextEntry[];
}

export function isUsGeocodingFeature(feature: GeocodingFeature | null | undefined): boolean {
  if (!feature) return false;

  const countryCode = feature.properties?.country_code || feature.properties?.short_code;
  if (typeof countryCode === 'string' && countryCode.toLowerCase() === 'us') {
    return true;
  }

  const countryName = feature.properties?.country;
  if (typeof countryName === 'string') {
    const normalized = countryName.toLowerCase();
    if (normalized.includes('united states') || normalized === 'usa' || normalized === 'us') {
      return true;
    }
  }

  if (Array.isArray(feature.context)) {
    const countryContext = feature.context.find(
      (entry) => typeof entry?.id === 'string' && entry.id.startsWith('country.')
    );
    if (countryContext) {
      const shortCode = countryContext.short_code;
      if (typeof shortCode === 'string' && shortCode.toLowerCase() === 'us') {
        return true;
      }
      const text = countryContext.text;
      if (typeof text === 'string' && text.toLowerCase().includes('united states')) {
        return true;
      }
    }
  }

  if (typeof feature.place_name === 'string') {
    const place = feature.place_name.toLowerCase();
    if (place.includes('united states') || place.includes(', usa') || place.endsWith(' usa') || place.endsWith(' us')) {
      return true;
    }
  }

  return false;
}

export function filterUsGeocodingFeatures(
  features: GeocodingFeature[] | null | undefined
): GeocodingFeature[] {
  if (!Array.isArray(features)) return [];
  return features.filter(isUsGeocodingFeature);
}

/**
 * Extract the US state name from a geocoding feature's context array.
 * MapTiler returns region info with id starting with "region.".
 */
export function extractStateFromFeature(feature: GeocodingFeature | null | undefined): string {
  if (!feature) return '';

  if (Array.isArray(feature.context)) {
    const regionContext = feature.context.find(
      (entry) => typeof entry?.id === 'string' && entry.id.startsWith('region.')
    );
    if (regionContext?.text) {
      return regionContext.text;
    }
  }

  // Fallback: try to extract state from place_name (e.g., "88901, Nevada, United States")
  if (typeof feature.place_name === 'string') {
    const parts = feature.place_name.split(',').map(p => p.trim());
    // Typically: [zip/city, state, country] or [city, state, zip, country]
    if (parts.length >= 3) {
      // The state is usually the second-to-last part (before "United States")
      const candidate = parts[parts.length - 2];
      if (candidate && !candidate.match(/^\d+$/) && candidate.toLowerCase() !== 'united states') {
        return candidate;
      }
    }
  }

  return '';
}
