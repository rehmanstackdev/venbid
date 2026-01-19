// MapTiler configuration
const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

if (!MAPTILER_API_KEY) {
  console.warn('VITE_MAPTILER_API_KEY is not set in environment variables');
}

export const mapTilerConfig = {
  apiKey: MAPTILER_API_KEY,
  tileUrl: `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`,
  attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  geocodingUrl: 'https://api.maptiler.com/geocoding',
};
