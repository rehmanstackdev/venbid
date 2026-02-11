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
