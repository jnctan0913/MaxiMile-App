import { supabase } from './supabase';

export interface MerchantMatch {
  categoryId: string;
  categoryName: string;
  confidence: number;
  source: 'user_override' | 'pattern_match' | 'default';
}

const CATEGORY_NAMES: Record<string, string> = {
  dining: 'Dining',
  transport: 'Transport',
  online: 'Online Shopping',
  groceries: 'Groceries',
  petrol: 'Petrol',
  bills: 'Bills',
  travel: 'Travel',
  general: 'General',
};

const MERCHANT_KEYWORDS: Record<string, string[]> = {
  dining: [
    'MCDONALDS', 'MCDONALD', 'STARBUCKS', 'KFC', 'BURGER KING', 'SUBWAY',
    'TOAST BOX', 'YA KUN', 'SUSHI TEI', 'SAKAE', 'GENKI', 'CRYSTAL JADE',
    'DIN TAI FUNG', 'SWENSEN', 'PIZZA HUT', 'DOMINO', 'NANDO',
    'OLD CHANG KEE', 'GONG CHA', 'JOLLIBEAN', 'FOODPANDA', 'GRABFOOD',
    'DELIVEROO', 'KOPITIAM', 'FOOD REPUBLIC', 'KOUFU', 'HAWKER', 'CAFE',
    'RESTAURANT', 'BISTRO', 'RAMEN', 'BAKERY',
  ],
  transport: [
    'GRAB', 'GOJEK', 'COMFORT', 'SMRT', 'EZLINK', 'EZ-LINK', 'TRANSIT',
    'TAXI', 'CDG', 'BUS SVC',
  ],
  online: [
    'SHOPEE', 'LAZADA', 'AMAZON', 'ZALORA', 'ASOS', 'SHEIN', 'SPOTIFY',
    'NETFLIX', 'DISNEY', 'APPLE.COM', 'GOOGLE', 'STEAM',
  ],
  groceries: [
    'NTUC', 'FAIRPRICE', 'FAIR PRICE', 'COLD STORAGE', 'GIANT',
    'SHENG SIONG', 'DONKI', 'DON DON', 'REDMART', 'DAISO', 'MUSTAFA',
  ],
  petrol: ['SHELL', 'ESSO', 'CALTEX', 'SPC', 'SINOPEC', 'PETROL', 'FUEL'],
  bills: [
    'SINGTEL', 'STARHUB', 'M1 ', 'SP SERVICE', 'SP GROUP', 'PUB ',
    'HDB', 'TOWN COUNCIL', 'AIA ', 'PRUDENTIAL', 'GREAT EASTERN', 'INCOME',
  ],
  travel: [
    'SINGAPORE AIR', 'SIA ', 'SCOOT', 'JETSTAR', 'AIRASIA', 'EXPEDIA',
    'BOOKING.COM', 'AGODA', 'AIRBNB', 'KLOOK', 'MARRIOTT', 'HILTON',
    'AIRPORT', 'CHANGI',
  ],
};

function normalizeMerchantName(name: string): string {
  return name.toUpperCase().trim().replace(/[^A-Z0-9 .]/g, '');
}

export function matchMerchantLocal(merchantName: string): MerchantMatch {
  const normalized = normalizeMerchantName(merchantName);

  for (const [categoryId, keywords] of Object.entries(MERCHANT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        return {
          categoryId,
          categoryName: CATEGORY_NAMES[categoryId] ?? 'General',
          confidence: keyword.length >= 6 ? 0.9 : 0.7,
          source: 'pattern_match',
        };
      }
    }
  }

  return {
    categoryId: 'general',
    categoryName: 'General',
    confidence: 0,
    source: 'default',
  };
}

export async function matchMerchant(
  userId: string,
  merchantName: string,
): Promise<MerchantMatch> {
  try {
    const { data, error } = await supabase.rpc('match_merchant', {
      p_user_id: userId,
      p_merchant_name: merchantName,
    });

    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    if (row) {
      return {
        categoryId: row.category_id,
        categoryName: CATEGORY_NAMES[row.category_id] ?? row.category_id,
        confidence: row.confidence,
        source: row.source,
      };
    }
  } catch {
    // RPC unavailable — fall through to local matching
  }

  return matchMerchantLocal(merchantName);
}

export async function saveMerchantOverride(
  userId: string,
  merchantPattern: string,
  categoryId: string,
): Promise<void> {
  const { error } = await supabase
    .from('user_merchant_overrides' as any)
    .upsert(
      {
        user_id: userId,
        merchant_pattern: merchantPattern,
        category_id: categoryId,
      },
      { onConflict: 'user_id,merchant_pattern' },
    );

  if (error) throw error;
}
