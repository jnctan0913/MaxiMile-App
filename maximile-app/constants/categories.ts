// =============================================================================
// MaxiMile — Spend Categories
// =============================================================================
// The 7 fixed spend categories used throughout the app.
// These match the categories table in the database (database/schema/card_rules.sql).
// =============================================================================

export interface CategoryInfo {
  id: string;
  name: string;
  emoji: string;
  icon: string;
  iconFilled: string;
  displayOrder: number;
  description: string;
}

/**
 * The 7 spend categories for Singapore miles credit card optimization.
 * Order matches UI display order (display_order ascending).
 */
export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'dining',
    name: 'Dining',
    emoji: '\uD83C\uDF7D\uFE0F',
    icon: 'restaurant-outline',
    iconFilled: 'restaurant',
    displayOrder: 0,
    description: 'Restaurants, cafes, food delivery, bars',
  },
  {
    id: 'transport',
    name: 'Transport',
    emoji: '\uD83D\uDE95',
    icon: 'car-outline',
    iconFilled: 'car',
    displayOrder: 1,
    description: 'Grab, taxis, public transport, parking',
  },
  {
    id: 'online',
    name: 'Online',
    emoji: '\uD83D\uDED2',
    icon: 'laptop-outline',
    iconFilled: 'laptop',
    displayOrder: 2,
    description: 'E-commerce, online shopping, subscriptions',
  },
  {
    id: 'travel',
    name: 'Travel',
    emoji: '\u2708\uFE0F',
    icon: 'airplane-outline',
    iconFilled: 'airplane',
    displayOrder: 3,
    description: 'Airlines, hotels, travel agencies, booking platforms',
  },
  {
    id: 'groceries',
    name: 'Groceries',
    emoji: '\uD83E\uDED2',
    icon: 'cart-outline',
    iconFilled: 'cart',
    displayOrder: 4,
    description: 'Supermarkets, convenience stores, wet markets',
  },
  {
    id: 'bills',
    name: 'Bills',
    emoji: '\uD83D\uDCB3',
    icon: 'receipt-outline',
    iconFilled: 'receipt',
    displayOrder: 5,
    description: 'Utilities, insurance, telco, recurring payments',
  },
  {
    id: 'general',
    name: 'General',
    emoji: '\uD83D\uDCB0',
    icon: 'wallet-outline',
    iconFilled: 'wallet',
    displayOrder: 6,
    description: 'Everything else not covered by specific categories',
  },
];

/**
 * Lookup a category by its ID.
 */
export const getCategoryById = (id: string): CategoryInfo | undefined =>
  CATEGORIES.find((cat) => cat.id === id);

/**
 * Map of category ID to CategoryInfo for O(1) lookups.
 */
export const CATEGORY_MAP: Record<string, CategoryInfo> = Object.fromEntries(
  CATEGORIES.map((cat) => [cat.id, cat])
);
