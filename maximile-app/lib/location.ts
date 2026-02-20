// =============================================================================
// MaxiMile — Location Module (SPA-2)
// =============================================================================
// Handles location permission requests and GPS positioning with:
// - Permission handling (foreground only)
// - 10-second timeout
// - 30-second cache (reuses recent positions)
// - getLastKnownPositionAsync() as instant fallback
// =============================================================================

import * as Location from 'expo-location';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  cached: boolean;
}

export interface LocationError {
  type: 'permission_denied' | 'timeout' | 'unavailable';
  message: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GPS_TIMEOUT_MS = 10_000;
const CACHE_MAX_AGE_MS = 30_000;
const MAX_ACCURACY_METERS = 100;

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

let cachedLocation: LocationResult | null = null;
let cacheTimestamp = 0;

function getCachedLocation(): LocationResult | null {
  if (!cachedLocation) return null;
  if (Date.now() - cacheTimestamp > CACHE_MAX_AGE_MS) {
    cachedLocation = null;
    return null;
  }
  return cachedLocation;
}

function setCachedLocation(loc: LocationResult): void {
  cachedLocation = loc;
  cacheTimestamp = Date.now();
}

/** Exposed for testing — clears the location cache. */
export function clearLocationCache(): void {
  cachedLocation = null;
  cacheTimestamp = 0;
}

// ---------------------------------------------------------------------------
// Permission
// ---------------------------------------------------------------------------

/**
 * Request foreground location permission.
 * Returns true if granted, false otherwise.
 */
export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/**
 * Check if foreground location permission is already granted.
 */
export async function hasLocationPermission(): Promise<boolean> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === 'granted';
}

// ---------------------------------------------------------------------------
// Core: getCurrentLocation
// ---------------------------------------------------------------------------

/**
 * Get the user's current GPS location.
 *
 * Strategy:
 * 1. Check cache (30s TTL) — return immediately if valid
 * 2. Try getLastKnownPositionAsync() as instant fallback
 * 3. Request fresh GPS fix with 10s timeout and Balanced accuracy
 *
 * @returns LocationResult on success
 * @throws LocationError on failure
 */
export async function getCurrentLocation(): Promise<LocationResult> {
  // 1. Check cache
  const cached = getCachedLocation();
  if (cached) {
    return { ...cached, cached: true };
  }

  // 2. Check permission
  const hasPermission = await hasLocationPermission();
  if (!hasPermission) {
    const granted = await requestLocationPermission();
    if (!granted) {
      const error: LocationError = {
        type: 'permission_denied',
        message: 'Location permission was denied. Please enable it in Settings.',
      };
      throw error;
    }
  }

  // 3. Try last known position (instant, may be stale)
  try {
    const lastKnown = await Location.getLastKnownPositionAsync();
    if (lastKnown) {
      const age = Date.now() - lastKnown.timestamp;
      const accuracy = lastKnown.coords.accuracy ?? Infinity;
      // Use if < 5 minutes old and accuracy < 50m
      if (age < 5 * 60 * 1000 && accuracy < 50) {
        const result: LocationResult = {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
          accuracy: lastKnown.coords.accuracy,
          cached: false,
        };
        setCachedLocation(result);
        return result;
      }
    }
  } catch {
    // Silently fall through to fresh GPS
  }

  // 4. Request fresh GPS fix with timeout
  try {
    const location = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject({ type: 'timeout', message: 'Location request timed out after 10 seconds.' }),
          GPS_TIMEOUT_MS,
        ),
      ),
    ]);

    const result: LocationResult = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      cached: false,
    };

    setCachedLocation(result);
    return result;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'type' in err) {
      throw err as LocationError;
    }
    const error: LocationError = {
      type: 'unavailable',
      message: 'Unable to determine your location. Please try again.',
    };
    throw error;
  }
}

/**
 * Check if a location accuracy is good enough for merchant detection.
 * Returns true if accuracy is within MAX_ACCURACY_METERS.
 */
export function isAccuracyAcceptable(accuracy: number | null): boolean {
  if (accuracy === null) return false;
  return accuracy <= MAX_ACCURACY_METERS;
}
