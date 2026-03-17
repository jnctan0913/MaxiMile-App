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
// Web Platform Detection
// ---------------------------------------------------------------------------

/**
 * When running in a web browser, detect whether the browser is on iOS,
 * Android, or a desktop OS. Mobile web browsers can open native deep links
 * (shoebox:// on iOS Safari, https://pay.google.com on Android Chrome).
 */
function getWebPlatform(): 'ios' | 'android' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

// ---------------------------------------------------------------------------
// Availability Check
// ---------------------------------------------------------------------------

/**
 * Check if the native Wallet app is available on this device.
 *
 * - iOS native: Checks if shoebox:// scheme is handled
 * - Android native: Checks if Google Pay URL can be opened
 * - iOS web (Safari): Always true — Safari can open shoebox:// deep links
 * - Android web (Chrome): Always true — Chrome can navigate to Google Pay
 * - Desktop web: Always false — no wallet app available
 */
export async function isWalletAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') {
    const webPlatform = getWebPlatform();
    return webPlatform === 'ios' || webPlatform === 'android';
  }

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
    const webPlatform = getWebPlatform();

    if (webPlatform === 'ios') {
      try {
        await Linking.openURL(APPLE_WALLET_URL);
        return { success: true, platform };
      } catch {
        return {
          success: false,
          platform,
          error: 'Could not open Apple Wallet.',
        };
      }
    }

    if (webPlatform === 'android') {
      try {
        await Linking.openURL(GOOGLE_PAY_URL);
        return { success: true, platform };
      } catch {
        return {
          success: false,
          platform,
          error: 'Could not open Google Pay.',
        };
      }
    }

    // Desktop browser — no wallet app available
    return {
      success: false,
      platform,
      error: 'Open MaxiMile on your phone to use Flash Pay.',
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
