// =============================================================================
// MaxiMile — Mock Transaction Data for Demo Mode
// =============================================================================
// Provides realistic mock transaction data when returning from Wallet
// Only used when EXPO_PUBLIC_DEMO_MODE=true
// =============================================================================

export interface MockTransactionData {
  amount: string;
  merchant: string;
  card: string;
  category: string;
}

/**
 * Mock transaction data pool for demo mode
 * Organized by category for smart matching
 */
const MOCK_TRANSACTIONS: MockTransactionData[] = [
  // Dining
  {
    amount: '45.80',
    merchant: 'Starbucks',
    card: 'Citi PremierMiles Visa Signature',
    category: 'dining',
  },
  {
    amount: '35.00',
    merchant: 'McDonald\'s',
    card: 'Citi PremierMiles Visa Signature',
    category: 'dining',
  },
  {
    amount: '78.50',
    merchant: 'Din Tai Fung',
    card: 'HSBC Revolution Credit Card',
    category: 'dining',
  },
  {
    amount: '125.00',
    merchant: 'Crystal Jade',
    card: "UOB Lady's Card",
    category: 'dining',
  },

  // Groceries
  {
    amount: '128.50',
    merchant: 'Cold Storage',
    card: 'HSBC Revolution Credit Card',
    category: 'groceries',
  },
  {
    amount: '95.30',
    merchant: 'FairPrice',
    card: 'Standard Chartered Smart Credit Card',
    category: 'groceries',
  },
  {
    amount: '156.80',
    merchant: 'Sheng Siong',
    card: 'HSBC Revolution Credit Card',
    category: 'groceries',
  },

  // Shopping
  {
    amount: '89.90',
    merchant: 'Uniqlo',
    card: "UOB Lady's Card",
    category: 'general',
  },
  {
    amount: '215.80',
    merchant: 'Takashimaya',
    card: "UOB Lady's Card",
    category: 'general',
  },
  {
    amount: '450.00',
    merchant: 'Ion Orchard',
    card: 'American Express KrisFlyer Ascend',
    category: 'general',
  },

  // Travel
  {
    amount: '1250.00',
    merchant: 'Singapore Airlines',
    card: 'American Express KrisFlyer Ascend',
    category: 'travel',
  },
  {
    amount: '680.00',
    merchant: 'Changi Airport',
    card: 'American Express KrisFlyer Ascend',
    category: 'travel',
  },

  // Petrol
  {
    amount: '67.20',
    merchant: 'Shell',
    card: 'Standard Chartered Smart Credit Card',
    category: 'petrol',
  },
  {
    amount: '82.50',
    merchant: 'Esso',
    card: 'Citi PremierMiles Visa Signature',
    category: 'petrol',
  },

  // Transport
  {
    amount: '23.50',
    merchant: 'Grab',
    card: 'HSBC Revolution Credit Card',
    category: 'transport',
  },
  {
    amount: '15.80',
    merchant: 'ComfortDelGro',
    card: 'Standard Chartered Smart Credit Card',
    category: 'transport',
  },

  // Online
  {
    amount: '199.00',
    merchant: 'Shopee',
    card: "UOB Lady's Card",
    category: 'online',
  },
  {
    amount: '345.00',
    merchant: 'Lazada',
    card: 'HSBC Revolution Credit Card',
    category: 'online',
  },

  // Bills
  {
    amount: '89.00',
    merchant: 'Singtel',
    card: 'Standard Chartered Smart Credit Card',
    category: 'bills',
  },
  {
    amount: '156.00',
    merchant: 'SP Services',
    card: 'Citi PremierMiles Visa Signature',
    category: 'bills',
  },
];

/**
 * Get a random mock transaction for demo mode
 * Filters by category if provided for smart matching
 *
 * @param categoryId - Optional category to filter by (e.g., 'groceries', 'dining')
 * @returns Mock transaction data matching the category (or random if no match)
 */
export function getMockTransaction(categoryId?: string): MockTransactionData {
  // If category provided, try to find matching transactions
  if (categoryId) {
    const categoryMatches = MOCK_TRANSACTIONS.filter(
      (txn) => txn.category === categoryId
    );

    if (categoryMatches.length > 0) {
      const randomIndex = Math.floor(Math.random() * categoryMatches.length);
      return categoryMatches[randomIndex];
    }

    // If no exact category match, log warning and fall through to random
    console.log(`[DEMO MODE] No mock transactions for category "${categoryId}", using random`);
  }

  // Fallback: return random transaction from any category
  const randomIndex = Math.floor(Math.random() * MOCK_TRANSACTIONS.length);
  return MOCK_TRANSACTIONS[randomIndex];
}

/**
 * Check if demo mode is enabled
 */
export function isDemoMode(): boolean {
  return process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
}
