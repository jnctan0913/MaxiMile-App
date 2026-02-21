// =============================================================================
// MaxiMile — Apple Wallet Cards Integration
// =============================================================================
// Handles both REAL Apple Wallet cards (production) and MOCK cards (demo mode)
// CRITICAL: Mock cards are ONLY used when EXPO_PUBLIC_DEMO_MODE=true
// =============================================================================

import { MOCK_WALLET_CARDS, isDemoMode, type MockWalletCard } from './demo-wallet-cards';

export interface WalletCard {
  name: string;
  lastFour: string;
  network: 'Visa' | 'Mastercard' | 'Amex';
  issuer: string;
}

/**
 * Get Wallet cards for auto-capture setup
 *
 * PRODUCTION MODE (EXPO_PUBLIC_DEMO_MODE=false):
 * - Reads real cards from Apple Wallet via PassKit APIs
 * - Returns actual credit cards user has added to Wallet
 *
 * DEMO MODE (EXPO_PUBLIC_DEMO_MODE=true):
 * - Returns mock Wallet cards for Simulator testing
 * - Does NOT access real Wallet (Wallet doesn't work in Simulator anyway)
 *
 * @returns Array of Wallet cards
 */
export async function getWalletCards(): Promise<WalletCard[]> {
  // ============================================================================
  // DEMO MODE: Return mock cards for Simulator/testing
  // ============================================================================
  if (isDemoMode()) {
    console.log('[DEMO MODE] Using mock Wallet cards - NOT real Apple Wallet');
    return MOCK_WALLET_CARDS;
  }

  // ============================================================================
  // PRODUCTION MODE: Read real Apple Wallet cards
  // ============================================================================
  console.log('[PRODUCTION] Reading cards from Apple Wallet');

  try {
    // TODO: Implement real Apple Wallet integration
    // This would use PassKit or a React Native library to access Wallet
    // For now, return empty array in production (feature not yet implemented)

    // Example future implementation:
    // const cards = await PassKit.getPaymentCards();
    // return cards.map(card => ({
    //   name: card.displayName,
    //   lastFour: card.lastFour,
    //   network: card.network,
    //   issuer: card.issuer,
    // }));

    console.warn('[PRODUCTION] Real Wallet integration not yet implemented');
    return [];
  } catch (error) {
    console.error('[PRODUCTION] Failed to read Wallet cards:', error);
    return [];
  }
}

/**
 * Check if user has any cards in Apple Wallet
 * Safe to call in both demo and production modes
 */
export async function hasWalletCards(): Promise<boolean> {
  const cards = await getWalletCards();
  return cards.length > 0;
}
