/**
 * MaxiMile Unit Tests: Wallet Deep-Link Module (SPA-4)
 *
 * Tests for the wallet deep-link module:
 *   - Wallet availability check per platform
 *   - Opening Apple Wallet on iOS
 *   - Opening Google Pay on Android
 *   - Web platform returns false/failure
 *   - Graceful fallback when wallet not installed
 */

import { isWalletAvailable, openWallet, showWalletFallback } from '../lib/wallet';
import type { WalletOpenResult } from '../lib/wallet';

// ---------------------------------------------------------------------------
// Mock react-native
// ---------------------------------------------------------------------------

const mockCanOpenURL = jest.fn();
const mockOpenURL = jest.fn();
const mockAlert = jest.fn();

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Linking: {
    canOpenURL: (...args: unknown[]) => mockCanOpenURL(...args),
    openURL: (...args: unknown[]) => mockOpenURL(...args),
  },
  Alert: {
    alert: (...args: unknown[]) => mockAlert(...args),
  },
}));

// Helper to change platform for tests
function setPlatform(os: string) {
  const RN = require('react-native');
  RN.Platform.OS = os;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Wallet Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setPlatform('ios');
  });

  // =========================================================================
  // 1. isWalletAvailable — iOS with Wallet installed
  // =========================================================================
  describe('Wallet availability — iOS', () => {
    it('should return true when Apple Wallet is available on iOS', async () => {
      setPlatform('ios');
      mockCanOpenURL.mockResolvedValue(true);

      const available = await isWalletAvailable();

      expect(available).toBe(true);
      expect(mockCanOpenURL).toHaveBeenCalledWith('shoebox://');
    });

    it('should return false when Apple Wallet is not available', async () => {
      setPlatform('ios');
      mockCanOpenURL.mockResolvedValue(false);

      const available = await isWalletAvailable();

      expect(available).toBe(false);
    });
  });

  // =========================================================================
  // 2. isWalletAvailable — Android
  // =========================================================================
  describe('Wallet availability — Android', () => {
    it('should check Google Pay URL on Android', async () => {
      setPlatform('android');
      mockCanOpenURL.mockResolvedValue(true);

      const available = await isWalletAvailable();

      expect(available).toBe(true);
      expect(mockCanOpenURL).toHaveBeenCalledWith('https://pay.google.com');
    });
  });

  // =========================================================================
  // 3. isWalletAvailable — Web
  // =========================================================================
  describe('Wallet availability — Web', () => {
    it('should return false on web platform', async () => {
      setPlatform('web');

      const available = await isWalletAvailable();

      expect(available).toBe(false);
      expect(mockCanOpenURL).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 4. openWallet — iOS success
  // =========================================================================
  describe('Open Wallet — iOS', () => {
    it('should open Apple Wallet successfully on iOS', async () => {
      setPlatform('ios');
      mockCanOpenURL.mockResolvedValue(true);
      mockOpenURL.mockResolvedValue(undefined);

      const result = await openWallet();

      expect(result.success).toBe(true);
      expect(result.platform).toBe('ios');
      expect(mockOpenURL).toHaveBeenCalledWith('shoebox://');
    });

    it('should return error when Apple Wallet is not available', async () => {
      setPlatform('ios');
      mockCanOpenURL.mockResolvedValue(false);

      const result = await openWallet();

      expect(result.success).toBe(false);
      expect(result.error).toContain('not available');
    });
  });

  // =========================================================================
  // 5. showWalletFallback — shows alert with card name
  // =========================================================================
  describe('Wallet fallback', () => {
    it('should show alert with card name in instruction', () => {
      showWalletFallback('DBS Altitude Visa');

      expect(mockAlert).toHaveBeenCalledTimes(1);
      const alertArgs = mockAlert.mock.calls[0];
      expect(alertArgs[0]).toBe('Open Your Wallet');
      expect(alertArgs[1]).toContain('DBS Altitude Visa');
    });

    it('should show generic instruction when no card name', () => {
      showWalletFallback();

      const alertArgs = mockAlert.mock.calls[0];
      expect(alertArgs[1]).toContain('recommended card');
    });
  });
});
