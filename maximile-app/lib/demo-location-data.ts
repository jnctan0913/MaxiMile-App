// =============================================================================
// MaxiMile — Mock Location & Merchant Data for Demo Mode
// =============================================================================
// Provides realistic Singapore locations and merchants when demo mode is active
// Only used when EXPO_PUBLIC_DEMO_MODE=true
// =============================================================================

import type { LocationResult } from './location';
import type { MerchantResult } from './merchant';

/**
 * Mock Singapore locations for different areas
 */
const SINGAPORE_LOCATIONS = [
  { latitude: 1.3048, longitude: 103.8318, name: 'Orchard Road' },
  { latitude: 1.2812, longitude: 103.8636, name: 'Marina Bay' },
  { latitude: 1.2966, longitude: 103.7764, name: 'Jurong East' },
  { latitude: 1.3521, longitude: 103.8198, name: 'Ang Mo Kio' },
  { latitude: 1.3329, longitude: 103.7436, name: 'Bukit Batok' },
];

/**
 * Mock merchants organized by category
 * Matches the merchant patterns in the database
 */
const MOCK_MERCHANTS: Record<string, Array<{ name: string; address: string }>> = {
  dining: [
    { name: 'Starbucks Orchard', address: '313 Orchard Road, Singapore' },
    { name: 'McDonald\'s Marina Bay', address: 'Marina Bay Sands, Singapore' },
    { name: 'Din Tai Fung Vivocity', address: '1 HarbourFront Walk, Singapore' },
    { name: 'Crystal Jade Ion', address: '2 Orchard Turn, Singapore' },
  ],
  groceries: [
    { name: 'Cold Storage Orchard', address: 'Takashimaya Shopping Centre, Singapore' },
    { name: 'FairPrice Jurong Point', address: '1 Jurong West Central 2, Singapore' },
    { name: 'Sheng Siong Ang Mo Kio', address: '710 Ang Mo Kio Avenue 8, Singapore' },
  ],
  general: [
    { name: 'Uniqlo Orchard Central', address: '181 Orchard Road, Singapore' },
    { name: 'Takashimaya', address: '391 Orchard Road, Singapore' },
    { name: 'Ion Orchard', address: '2 Orchard Turn, Singapore' },
  ],
  travel: [
    { name: 'Singapore Airlines City Office', address: '77 Robinson Road, Singapore' },
    { name: 'Changi Airport Terminal 3', address: '65 Airport Boulevard, Singapore' },
  ],
  petrol: [
    { name: 'Shell Station Bukit Timah', address: '181 Bukit Timah Road, Singapore' },
    { name: 'Esso Station East Coast', address: '920 East Coast Parkway, Singapore' },
  ],
  transport: [
    { name: 'Grab (Current Location)', address: 'Orchard Road, Singapore' },
    { name: 'ComfortDelGro Taxi', address: 'Marina Bay, Singapore' },
  ],
  online: [
    { name: 'Shopee (Online)', address: 'Online Purchase' },
    { name: 'Lazada (Online)', address: 'Online Purchase' },
  ],
  bills: [
    { name: 'Singtel Bill Payment', address: 'Online Payment' },
    { name: 'SP Services Bill', address: 'Online Payment' },
  ],
};

/**
 * Get mock Singapore location for demo mode
 * Returns random Singapore coordinates with high accuracy
 */
export function getMockLocation(): LocationResult {
  const randomLocation = SINGAPORE_LOCATIONS[
    Math.floor(Math.random() * SINGAPORE_LOCATIONS.length)
  ];

  return {
    latitude: randomLocation.latitude,
    longitude: randomLocation.longitude,
    accuracy: 15, // High accuracy in meters
    cached: false,
  };
}

/**
 * Get mock merchant for demo mode
 * Returns merchant matching the category (or general if no category)
 *
 * @param categoryId - Category to match (e.g., 'groceries', 'dining')
 * @returns Mock merchant result matching the category
 */
export function getMockMerchant(categoryId?: string | null): MerchantResult {
  // Default to 'general' if no category or category not found
  const category = (categoryId && MOCK_MERCHANTS[categoryId])
    ? categoryId
    : 'general';

  const merchants = MOCK_MERCHANTS[category] || MOCK_MERCHANTS.general;
  const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];

  return {
    name: randomMerchant.name,
    category: category,
    confidence: 0.95,
    placeId: `demo_${category}_${Date.now()}`,
    address: randomMerchant.address,
  };
}

/**
 * Check if demo mode is enabled
 */
export function isDemoMode(): boolean {
  return process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
}
