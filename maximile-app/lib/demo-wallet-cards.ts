// =============================================================================
// MaxiMile — Mock Apple Wallet Cards for Demo Mode
// =============================================================================
// Provides realistic mock Wallet card data for iOS Simulator demos
// Only used when EXPO_PUBLIC_DEMO_MODE=true
// =============================================================================

export interface MockWalletCard {
  name: string;           // Card name as it appears in Apple Wallet
  lastFour: string;       // Last 4 digits
  network: 'Visa' | 'Mastercard' | 'Amex';
  issuer: string;         // Bank name
}

/**
 * Mock Wallet cards based on user's actual MaxiMile portfolio
 * These cards will appear in the auto-capture setup wizard Step 3 (card mapping)
 */
export const MOCK_WALLET_CARDS: MockWalletCard[] = [
  {
    name: 'Citi PremierMiles Visa Signature',
    lastFour: '4892',
    network: 'Visa',
    issuer: 'Citi',
  },
  {
    name: 'American Express KrisFlyer Ascend',
    lastFour: '1007',
    network: 'Amex',
    issuer: 'American Express',
  },
  {
    name: 'HSBC Revolution Credit Card',
    lastFour: '3345',
    network: 'Visa',
    issuer: 'HSBC',
  },
  {
    name: 'Standard Chartered Smart Credit Card',
    lastFour: '6721',
    network: 'Visa',
    issuer: 'Standard Chartered',
  },
  {
    name: "UOB Lady's Card",
    lastFour: '2158',
    network: 'Visa',
    issuer: 'UOB',
  },
];

/**
 * Get mock Wallet cards for demo mode
 * In production, this would call Apple Wallet APIs
 * In demo mode, returns the mock cards above
 */
export function getMockWalletCards(): MockWalletCard[] {
  const isDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

  if (!isDemoMode) {
    throw new Error('getMockWalletCards() should only be called in demo mode');
  }

  return MOCK_WALLET_CARDS;
}

/**
 * Check if demo mode is enabled
 */
export function isDemoMode(): boolean {
  return process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
}
