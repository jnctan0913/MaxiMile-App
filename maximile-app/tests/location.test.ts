/**
 * MaxiMile Unit Tests: Location Module (SPA-2)
 *
 * Tests for the location detection module:
 *   - Permission handling (granted, denied)
 *   - GPS timeout behavior
 *   - Cache behavior (30s TTL)
 *   - Accuracy check
 *   - Last known position fallback
 */

import {
  getCurrentLocation,
  requestLocationPermission,
  hasLocationPermission,
  isAccuracyAcceptable,
  clearLocationCache,
} from '../lib/location';
import type { LocationResult, LocationError } from '../lib/location';

// ---------------------------------------------------------------------------
// Mock expo-location
// ---------------------------------------------------------------------------

const mockRequestForegroundPermissionsAsync = jest.fn();
const mockGetForegroundPermissionsAsync = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();
const mockGetLastKnownPositionAsync = jest.fn();

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: (...args: unknown[]) => mockRequestForegroundPermissionsAsync(...args),
  getForegroundPermissionsAsync: (...args: unknown[]) => mockGetForegroundPermissionsAsync(...args),
  getCurrentPositionAsync: (...args: unknown[]) => mockGetCurrentPositionAsync(...args),
  getLastKnownPositionAsync: (...args: unknown[]) => mockGetLastKnownPositionAsync(...args),
  Accuracy: {
    Balanced: 3,
    High: 4,
    Highest: 5,
    Low: 1,
    Lowest: 0,
    BestForNavigation: 6,
  },
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Location Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearLocationCache();
  });

  // =========================================================================
  // 1. Permission granted -> returns location
  // =========================================================================
  describe('Permission handling', () => {
    it('should return location when permission is granted', async () => {
      mockGetForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      mockGetLastKnownPositionAsync.mockResolvedValue(null);
      mockGetCurrentPositionAsync.mockResolvedValue({
        coords: { latitude: 1.3521, longitude: 103.8198, accuracy: 15 },
        timestamp: Date.now(),
      });

      const result = await getCurrentLocation();

      expect(result.latitude).toBe(1.3521);
      expect(result.longitude).toBe(103.8198);
      expect(result.accuracy).toBe(15);
      expect(result.cached).toBe(false);
    });

    it('should request permission if not already granted', async () => {
      mockGetForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      mockGetLastKnownPositionAsync.mockResolvedValue(null);
      mockGetCurrentPositionAsync.mockResolvedValue({
        coords: { latitude: 1.3521, longitude: 103.8198, accuracy: 20 },
        timestamp: Date.now(),
      });

      const result = await getCurrentLocation();

      expect(mockRequestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(result.latitude).toBe(1.3521);
    });
  });

  // =========================================================================
  // 2. Permission denied -> throws error
  // =========================================================================
  describe('Permission denied', () => {
    it('should throw permission_denied error when permission is denied', async () => {
      mockGetForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

      try {
        await getCurrentLocation();
        fail('Should have thrown');
      } catch (err) {
        const error = err as LocationError;
        expect(error.type).toBe('permission_denied');
        expect(error.message).toContain('permission');
      }
    });
  });

  // =========================================================================
  // 3. GPS timeout -> throws error
  // =========================================================================
  describe('GPS timeout', () => {
    it('should throw timeout error when GPS takes too long', async () => {
      mockGetForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      mockGetLastKnownPositionAsync.mockResolvedValue(null);
      // Simulate a GPS request that never resolves
      mockGetCurrentPositionAsync.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 15_000)),
      );

      try {
        await getCurrentLocation();
        fail('Should have thrown');
      } catch (err) {
        const error = err as LocationError;
        expect(error.type).toBe('timeout');
        expect(error.message).toContain('timed out');
      }
    }, 15_000);
  });

  // =========================================================================
  // 4. Cache returns same result within 30s
  // =========================================================================
  describe('Location cache', () => {
    it('should return cached location on second call within 30s', async () => {
      mockGetForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      mockGetLastKnownPositionAsync.mockResolvedValue(null);
      mockGetCurrentPositionAsync.mockResolvedValue({
        coords: { latitude: 1.3521, longitude: 103.8198, accuracy: 10 },
        timestamp: Date.now(),
      });

      const first = await getCurrentLocation();
      expect(first.cached).toBe(false);

      const second = await getCurrentLocation();
      expect(second.cached).toBe(true);
      expect(second.latitude).toBe(first.latitude);
      // GPS should only be called once
      expect(mockGetCurrentPositionAsync).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // 5. Accuracy check
  // =========================================================================
  describe('Accuracy validation', () => {
    it('should accept accuracy within 100m', () => {
      expect(isAccuracyAcceptable(15)).toBe(true);
      expect(isAccuracyAcceptable(50)).toBe(true);
      expect(isAccuracyAcceptable(100)).toBe(true);
    });

    it('should reject accuracy over 100m', () => {
      expect(isAccuracyAcceptable(101)).toBe(false);
      expect(isAccuracyAcceptable(500)).toBe(false);
    });

    it('should reject null accuracy', () => {
      expect(isAccuracyAcceptable(null)).toBe(false);
    });
  });
});
