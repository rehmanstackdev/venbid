// Geocoding cache utility to reduce API calls
const CACHE_KEY = 'geocoding_cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface GeocodingCache {
  [key: string]: CacheEntry;
}

export const geocodingCache = {
  get(key: string): any | null {
    try {
      const cache: GeocodingCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      const entry = cache[key];
      
      if (!entry) return null;
      
      // Check if expired
      if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
        delete cache[key];
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        return null;
      }
      
      return entry.data;
    } catch {
      return null;
    }
  },

  set(key: string, data: any): void {
    try {
      const cache: GeocodingCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      cache[key] = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to cache geocoding result:', error);
    }
  },

  clear(): void {
    localStorage.removeItem(CACHE_KEY);
  },
};
