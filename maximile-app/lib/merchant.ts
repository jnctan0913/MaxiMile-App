// =============================================================================
// MaxiMile — Merchant Detection Module (SPA-3)
// =============================================================================
// Identifies nearby merchants using Google Places API (via Supabase Edge
// Function proxy) and maps Google Places types to MaxiMile spend categories.
//
// Security: The Google Places API key is stored server-side in the Supabase
// Edge Function. The client sends only lat/lng/radius to the proxy.
// =============================================================================

import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Confidence = 'high' | 'medium' | 'low';

export interface MerchantResult {
  name: string;
  placeId: string;
  address: string;
  category: string;        // MaxiMile category ID (e.g. 'dining')
  categoryName: string;    // Display name (e.g. 'Dining')
  confidence: Confidence;
  types: string[];         // Raw Google Places types
  distance?: number;       // Meters from user (if available)
}

export interface MerchantError {
  type: 'no_results' | 'api_error' | 'network_error';
  message: string;
}

export interface PlaceResult {
  name: string;
  place_id: string;
  vicinity: string;
  types: string[];
  geometry?: {
    location: { lat: number; lng: number };
  };
}

// ---------------------------------------------------------------------------
// Google Places Type → MaxiMile Category Mapping
// ---------------------------------------------------------------------------

/**
 * Maps Google Places type strings to MaxiMile spend categories.
 * Order matters: first match wins. More specific types come first.
 */
const TYPE_TO_CATEGORY: [string[], string, string][] = [
  // Dining
  [['restaurant', 'food', 'cafe', 'bakery', 'bar', 'meal_delivery', 'meal_takeaway'], 'dining', 'Dining'],
  // Transport
  [['taxi_stand', 'transit_station', 'bus_station', 'train_station', 'subway_station', 'light_rail_station', 'car_rental', 'parking'], 'transport', 'Transport'],
  // Travel
  [['airport', 'travel_agency', 'lodging', 'hotel'], 'travel', 'Travel'],
  // Groceries
  [['supermarket', 'grocery_or_supermarket', 'convenience_store'], 'groceries', 'Groceries'],
  // Petrol
  [['gas_station'], 'petrol', 'Petrol'],
  // Online — not mappable from physical locations
  // Bills
  [['insurance_agency', 'post_office', 'local_government_office'], 'bills', 'Bills'],
  // General (fallback)
  [['store', 'shopping_mall', 'department_store', 'clothing_store', 'electronics_store', 'furniture_store', 'home_goods_store', 'hardware_store', 'jewelry_store', 'shoe_store', 'book_store', 'pet_store', 'pharmacy', 'beauty_salon', 'spa', 'gym', 'hospital', 'doctor', 'dentist', 'veterinary_care', 'bank', 'atm'], 'general', 'General'],
];

/**
 * Map an array of Google Places types to a MaxiMile category.
 * Returns the category ID, display name, and confidence level.
 */
export function mapTypesToCategory(types: string[]): {
  categoryId: string;
  categoryName: string;
  confidence: Confidence;
} {
  if (!types || types.length === 0) {
    return { categoryId: 'general', categoryName: 'General', confidence: 'low' };
  }

  for (const [placeTypes, categoryId, categoryName] of TYPE_TO_CATEGORY) {
    const matchCount = types.filter((t) => placeTypes.includes(t)).length;
    if (matchCount > 0) {
      // Confidence: 2+ type matches = high, 1 match = medium
      const confidence: Confidence = matchCount >= 2 ? 'high' : 'medium';
      return { categoryId, categoryName, confidence };
    }
  }

  return { categoryId: 'general', categoryName: 'General', confidence: 'low' };
}

// ---------------------------------------------------------------------------
// In-memory Cache (geohash-based, 5-min TTL)
// ---------------------------------------------------------------------------

interface CacheEntry {
  results: MerchantResult[];
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

/**
 * Simple geohash for cache key (reduces precision to ~100m grid).
 */
function toGeohash(lat: number, lng: number): string {
  const latKey = Math.round(lat * 1000) / 1000;
  const lngKey = Math.round(lng * 1000) / 1000;
  return `${latKey},${lngKey}`;
}

function getCached(key: string): MerchantResult[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.results;
}

/** Exposed for testing. */
export function clearMerchantCache(): void {
  cache.clear();
}

// ---------------------------------------------------------------------------
// Core: detectMerchant
// ---------------------------------------------------------------------------

/**
 * Detect the nearest merchant to the user's location.
 *
 * Calls a Supabase Edge Function that proxies to Google Places API.
 * The Edge Function keeps the API key server-side.
 *
 * @param latitude  User's latitude
 * @param longitude User's longitude
 * @param radius    Search radius in meters (default: 50)
 * @returns Array of MerchantResult, sorted by relevance
 * @throws MerchantError on failure
 */
export async function detectMerchant(
  latitude: number,
  longitude: number,
  radius: number = 50,
): Promise<MerchantResult[]> {
  // Check cache
  const cacheKey = toGeohash(latitude, longitude);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase.functions.invoke('places-nearby', {
      body: { lat: latitude, lng: longitude, radius },
    });

    if (error) {
      const err: MerchantError = {
        type: 'api_error',
        message: error.message || 'Failed to search for nearby merchants.',
      };
      throw err;
    }

    const places: PlaceResult[] = data?.results ?? [];

    if (places.length === 0) {
      const err: MerchantError = {
        type: 'no_results',
        message: 'No merchants detected nearby. Try choosing a category manually.',
      };
      throw err;
    }

    const results: MerchantResult[] = places.map((place) => {
      const { categoryId, categoryName, confidence } = mapTypesToCategory(place.types);
      return {
        name: place.name,
        placeId: place.place_id,
        address: place.vicinity,
        category: categoryId,
        categoryName,
        confidence,
        types: place.types,
      };
    });

    // Cache results
    cache.set(cacheKey, { results, timestamp: Date.now() });

    return results;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'type' in err) {
      throw err as MerchantError;
    }
    const error: MerchantError = {
      type: 'network_error',
      message: 'Could not connect to merchant detection service.',
    };
    throw error;
  }
}

/**
 * Get the best (first) merchant from detection results.
 * Convenience wrapper around detectMerchant.
 */
export async function detectTopMerchant(
  latitude: number,
  longitude: number,
  radius?: number,
): Promise<MerchantResult> {
  const results = await detectMerchant(latitude, longitude, radius);
  return results[0];
}
