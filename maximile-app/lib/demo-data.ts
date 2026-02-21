// =============================================================================
// MaxiMile — Demo Mode Mock Data Generator
// =============================================================================
// Generates realistic mock transaction data for demo builds.
// Used when EXPO_PUBLIC_DEMO_MODE=true to simulate auto-capture flow.
// =============================================================================

export interface MockTransaction {
  amount: number;
  merchant: string;
  card: string | null;
  timestamp: Date;
  source: 'demo';
}

interface MerchantData {
  name: string;
  category: string;
  minAmount: number;
  maxAmount: number;
}

/**
 * Merchant database with realistic names and pricing ranges
 */
const MERCHANTS: MerchantData[] = [
  // Coffee Shops
  { name: 'Starbucks', category: 'Coffee', minAmount: 4.50, maxAmount: 12.00 },
  { name: "Peet's Coffee", category: 'Coffee', minAmount: 4.00, maxAmount: 10.50 },
  { name: 'Dunkin\'', category: 'Coffee', minAmount: 3.50, maxAmount: 9.00 },
  { name: 'Blue Bottle Coffee', category: 'Coffee', minAmount: 5.00, maxAmount: 14.00 },
  { name: 'Philz Coffee', category: 'Coffee', minAmount: 4.75, maxAmount: 11.50 },
  { name: 'Dutch Bros', category: 'Coffee', minAmount: 3.75, maxAmount: 8.50 },
  { name: 'The Coffee Bean', category: 'Coffee', minAmount: 4.25, maxAmount: 10.00 },
  { name: 'Caribou Coffee', category: 'Coffee', minAmount: 4.00, maxAmount: 9.50 },

  // Gas Stations
  { name: 'Shell', category: 'Gas', minAmount: 35.00, maxAmount: 85.00 },
  { name: 'Chevron', category: 'Gas', minAmount: 38.00, maxAmount: 90.00 },
  { name: 'Exxon', category: 'Gas', minAmount: 36.00, maxAmount: 88.00 },
  { name: 'BP', category: 'Gas', minAmount: 34.00, maxAmount: 82.00 },
  { name: '76', category: 'Gas', minAmount: 33.00, maxAmount: 80.00 },
  { name: 'Arco', category: 'Gas', minAmount: 32.00, maxAmount: 78.00 },

  // Grocery Stores
  { name: 'Whole Foods', category: 'Grocery', minAmount: 25.00, maxAmount: 150.00 },
  { name: 'Safeway', category: 'Grocery', minAmount: 30.00, maxAmount: 120.00 },
  { name: "Trader Joe's", category: 'Grocery', minAmount: 20.00, maxAmount: 100.00 },
  { name: 'Sprouts', category: 'Grocery', minAmount: 22.00, maxAmount: 95.00 },
  { name: 'Costco', category: 'Grocery', minAmount: 80.00, maxAmount: 250.00 },
  { name: 'Target', category: 'Grocery', minAmount: 25.00, maxAmount: 140.00 },

  // Restaurants
  { name: 'Chipotle', category: 'Restaurant', minAmount: 10.00, maxAmount: 25.00 },
  { name: 'Panera Bread', category: 'Restaurant', minAmount: 12.00, maxAmount: 30.00 },
  { name: 'Subway', category: 'Restaurant', minAmount: 8.00, maxAmount: 18.00 },
  { name: 'Chick-fil-A', category: 'Restaurant', minAmount: 9.00, maxAmount: 22.00 },
  { name: 'In-N-Out Burger', category: 'Restaurant', minAmount: 8.50, maxAmount: 20.00 },
  { name: 'Shake Shack', category: 'Restaurant', minAmount: 11.00, maxAmount: 28.00 },
  { name: 'Five Guys', category: 'Restaurant', minAmount: 12.00, maxAmount: 30.00 },
  { name: 'Olive Garden', category: 'Restaurant', minAmount: 18.00, maxAmount: 60.00 },
  { name: 'The Cheesecake Factory', category: 'Restaurant', minAmount: 22.00, maxAmount: 75.00 },
  { name: 'P.F. Chang\'s', category: 'Restaurant', minAmount: 20.00, maxAmount: 65.00 },

  // Retail
  { name: 'CVS Pharmacy', category: 'Retail', minAmount: 8.00, maxAmount: 50.00 },
  { name: 'Walgreens', category: 'Retail', minAmount: 9.00, maxAmount: 55.00 },
  { name: 'Best Buy', category: 'Retail', minAmount: 30.00, maxAmount: 200.00 },
  { name: 'Apple Store', category: 'Retail', minAmount: 50.00, maxAmount: 300.00 },
  { name: 'Target', category: 'Retail', minAmount: 15.00, maxAmount: 120.00 },
  { name: 'Walmart', category: 'Retail', minAmount: 20.00, maxAmount: 100.00 },
  { name: 'Home Depot', category: 'Retail', minAmount: 25.00, maxAmount: 180.00 },
  { name: "Lowe's", category: 'Retail', minAmount: 28.00, maxAmount: 175.00 },
];

/**
 * Common card names for fallback (when user has no cards)
 */
const FALLBACK_CARDS = [
  'Chase Sapphire Reserve',
  'American Express Gold',
  'Citi Double Cash',
  'Capital One Venture',
];

/**
 * Generates a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random amount within range, rounded to 2 decimals
 */
function randomAmount(min: number, max: number): number {
  const amount = Math.random() * (max - min) + min;
  return Math.round(amount * 100) / 100;
}

/**
 * Selects a random item from an array
 */
function randomItem<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

/**
 * Generates a realistic mock transaction for demo mode.
 * Each call returns different randomized data.
 *
 * @param userCard - Optional user card name to use instead of fallback
 * @returns MockTransaction object with realistic data
 *
 * @example
 * const tx = generateMockTransaction();
 * // { amount: 5.47, merchant: 'Starbucks', card: 'Chase Sapphire Reserve', ... }
 *
 * const tx2 = generateMockTransaction('My Visa Card');
 * // { amount: 52.30, merchant: 'Shell', card: 'My Visa Card', ... }
 */
export function generateMockTransaction(userCard?: string | null): MockTransaction {
  // Select random merchant
  const merchant = randomItem(MERCHANTS);

  // Generate amount within merchant's realistic range
  const amount = randomAmount(merchant.minAmount, merchant.maxAmount);

  // Use provided card or fallback to mock card
  const card = userCard || randomItem(FALLBACK_CARDS);

  return {
    amount,
    merchant: merchant.name,
    card,
    timestamp: new Date(),
    source: 'demo',
  };
}

/**
 * Checks if demo mode is enabled via environment variable
 *
 * @returns true if demo mode is active, false otherwise
 */
export function isDemoMode(): boolean {
  return process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
}

/**
 * Gets a mock transaction if in demo mode, otherwise returns null
 *
 * @param userCard - Optional user card name
 * @returns MockTransaction if demo mode, null if production
 */
export function getMockTransactionIfDemo(userCard?: string | null): MockTransaction | null {
  if (!isDemoMode()) {
    return null;
  }
  return generateMockTransaction(userCard);
}
