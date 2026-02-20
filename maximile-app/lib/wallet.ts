// =============================================================================
// MaxiMile — Wallet Deep-Link Module (SPA-4)
// =============================================================================
// Platform-specific deep-links to Apple Wallet / Google Pay.
// Handles availability checks and graceful fallbacks.
//
// Hard constraint: Neither Apple Pay nor Google Pay allows third-party apps
// to programmatically select which card to use. The app can only open the
// Wallet app — the user must manually switch their default card.
// =============================================================================

import { Platform, Linking, Alert } from 'react-native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WalletOpenResult {
  success: boolean;
  platform: 'ios' | 'android' | 'web';
  error?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Apple Wallet deep-link scheme.
 * 'shoebox://' is the internal URI scheme for Apple Wallet (Passbook).
 * Must be declared in app.json LSApplicationQueriesSchemes.
 */
const APPLE_WALLET_URL = 'shoebox://';

/**
 * Google Pay deep-link URL.
 * Opens the Google Pay app if installed, or Play Store listing.
 */
const GOOGLE_PAY_URL = 'https://pay.google.com';
const GOOGLE_PAY_PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.google.android.apps.walletnfcrel';

// ---------------------------------------------------------------------------
// Availability Check
// ---------------------------------------------------------------------------

/**
 * Check if the native Wallet app is available on this device.
 *
 * - iOS: Checks if shoebox:// scheme is handled
 * - Android: Checks if Google Pay URL can be opened
 * - Web: Always false
 */
export async function isWalletAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    if (Platform.OS === 'ios') {
      return await Linking.canOpenURL(APPLE_WALLET_URL);
    }
    if (Platform.OS === 'android') {
      return await Linking.canOpenURL(GOOGLE_PAY_URL);
    }
    return false;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Open Wallet
// ---------------------------------------------------------------------------

/**
 * Open the native Wallet app.
 *
 * - iOS: Opens Apple Wallet via shoebox:// scheme
 * - Android: Opens Google Pay app, or Play Store if not installed
 * - Web: Shows alert with manual instruction
 *
 * @returns WalletOpenResult indicating success/failure
 */
export async function openWallet(): Promise<WalletOpenResult> {
  const platform = Platform.OS as 'ios' | 'android' | 'web';

  if (platform === 'web') {
    return {
      success: false,
      platform,
      error: 'Wallet is not available on web. Please use the mobile app.',
    };
  }

  try {
    if (platform === 'ios') {
      const canOpen = await Linking.canOpenURL(APPLE_WALLET_URL);
      if (canOpen) {
        await Linking.openURL(APPLE_WALLET_URL);
        return { success: true, platform };
      }
      return {
        success: false,
        platform,
        error: 'Apple Wallet is not available on this device.',
      };
    }

    if (platform === 'android') {
      // Try Google Pay first
      const canOpenGPay = await Linking.canOpenURL(GOOGLE_PAY_URL);
      if (canOpenGPay) {
        await Linking.openURL(GOOGLE_PAY_URL);
        return { success: true, platform };
      }
      // Fallback: open Play Store listing
      await Linking.openURL(GOOGLE_PAY_PLAY_STORE);
      return {
        success: false,
        platform,
        error: 'Google Pay is not installed. Opening Play Store.',
      };
    }

    return { success: false, platform, error: 'Unsupported platform.' };
  } catch {
    return {
      success: false,
      platform,
      error: 'Failed to open wallet app.',
    };
  }
}

/**
 * Show a fallback alert when the wallet cannot be opened.
 * Provides a manual instruction to the user.
 */
export function showWalletFallback(cardName?: string): void {
  const instruction = cardName
    ? `Open your wallet app and tap "${cardName}" to set it as your default payment card.`
    : 'Open your wallet app and set the recommended card as your default payment card.';

  Alert.alert('Open Your Wallet', instruction, [{ text: 'OK' }]);
}
