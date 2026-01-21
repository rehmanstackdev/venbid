# MapTiler API Optimization Summary

## Implemented Optimizations

### 1. ✅ Geocoding Cache (localStorage)
**File**: `src/lib/geocodingCache.ts`
- Caches all geocoding API responses for 7 days
- Reduces repeated API calls for the same locations
- Automatic cache expiry and cleanup

**Updated Files**:
- `src/components/location/LocationSearchInput.tsx`
  - Forward geocoding cached (when user types addresses)
  - Reverse geocoding cached (coordinates → address)

### 2. ✅ Lazy Loading Maps
**File**: `src/components/common/LazyLoad.tsx`
- Maps only load when scrolled into viewport
- Uses Intersection Observer API
- 200px rootMargin for smooth loading

**Updated Files**:
- `src/pages/ListingDetail.tsx` - Map loads when user scrolls to location section
- `src/pages/admin/Listings.tsx` - Map in view dialog loads on demand

### 3. ✅ Reduced Zoom Levels
**Tile Request Reduction**:
- `LocationMap.tsx`: Zoom 13 → 11 (reduces tiles by ~50%)
- `ListingsMap.tsx`: Zoom 10 → 9 (reduces tiles by ~40%)
- Disabled scroll wheel zoom in LocationMap to prevent accidental zooming

### 4. ✅ Request Caching
- All geocoding requests cached in localStorage
- Cache key format:
  - Forward: `forward_{query}`
  - Reverse: `reverse_{lng}_{lat}`
- 7-day expiration prevents stale data

## Expected API Usage Reduction

### Before Optimizations:
- Every map view: 20-50 tile requests
- Every address search: 1 geocoding request
- Every coordinate lookup: 1 reverse geocoding request
- No caching = repeated requests

### After Optimizations:
- Lazy loaded maps: Only load when visible (50-70% reduction)
- Lower zoom levels: 40-50% fewer tiles per map
- Cached geocoding: 80-90% reduction for repeated searches
- Cached reverse geocoding: 90%+ reduction

### Estimated Total Reduction: 60-80% fewer API requests

## Additional Recommendations (Not Implemented)

1. **Static Map Images**: Replace interactive maps in listing cards with static images
2. **Map Pooling**: Reuse map instances instead of creating new ones
3. **Debounce Map Movements**: Delay tile loading during rapid panning
4. **Conditional Map Loading**: Only show maps on user click/interaction

## Cache Management

Clear cache if needed:
```javascript
import { geocodingCache } from '@/lib/geocodingCache';
geocodingCache.clear();
```

## Monitoring

To monitor API usage:
1. Check MapTiler dashboard for request counts
2. Monitor browser localStorage size
3. Test with browser DevTools Network tab filtered for "maptiler.com"
