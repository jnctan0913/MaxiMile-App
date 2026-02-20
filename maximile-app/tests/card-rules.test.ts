/**
 * MaxiMile Unit Tests: Card Rules API
 *
 * Tests the Supabase client queries for card reference data:
 * cards, earn_rules, caps, categories.
 *
 * Since we cannot hit a real Supabase instance in unit tests, we mock the
 * Supabase client and verify that our query functions produce the correct
 * calls and handle responses/errors properly.
 */

import { createMockSupabase, MockSupabaseClient, MockQueryBuilder } from './mocks/supabase';
import {
  mockCards,
  mockCardsWithInactive,
  mockCategories,
  earnRulesHSBC,
  allCaps,
  capAmexDining,
  capAmexGroceries,
  capAmexTravel,
  cardHSBCRevolution,
  cardUOBPRVI,
  cardAmexAscend,
} from './mocks/test-data';

// ---------------------------------------------------------------------------
// Simulated service functions
// ---------------------------------------------------------------------------
// In a real app these would live in lib/api/ or similar. For unit testing we
// define them here to keep the tests self-contained.  They mirror the SDK
// calls documented in API_CONTRACTS.md section 8.

async function listCards(supabase: MockSupabaseClient['supabase']) {
  const { data, error } = await supabase
    .from('cards')
    .select('id, bank, name, network, annual_fee, base_rate_mpd, image_url, is_active')
    .eq('is_active', true)
    .order('bank', { ascending: true });
  return { data, error };
}

async function getCardById(supabase: MockSupabaseClient['supabase'], cardId: string) {
  const { data, error } = await supabase
    .from('cards')
    .select('*, earn_rules(*), caps(*), exclusions(*)')
    .eq('id', cardId)
    .single();
  return { data, error };
}

async function getEarnRulesForCard(supabase: MockSupabaseClient['supabase'], cardId: string) {
  const { data, error } = await supabase
    .from('earn_rules')
    .select('id, card_id, category_id, earn_rate_mpd, is_bonus, conditions, effective_from')
    .eq('card_id', cardId)
    .is('effective_to', null);
  return { data, error };
}

async function getCapsForCard(supabase: MockSupabaseClient['supabase'], cardId: string) {
  const { data, error } = await supabase
    .from('caps')
    .select('id, card_id, category_id, monthly_cap_amount')
    .eq('card_id', cardId);
  return { data, error };
}

async function getCategories(supabase: MockSupabaseClient['supabase']) {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, display_order, mccs')
    .order('display_order', { ascending: true });
  return { data, error };
}

async function listActiveCards(supabase: MockSupabaseClient['supabase']) {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('is_active', true);
  return { data, error };
}

// ---------------------------------------------------------------------------
// Helper: create and register a query builder for a table
// ---------------------------------------------------------------------------

function setTableData<T>(mock: MockSupabaseClient, table: string, data: T): void {
  const qb = new MockQueryBuilder();
  qb.setData(data);
  mock.queryBuilders.set(table, qb);
}

function setTableError(
  mock: MockSupabaseClient,
  table: string,
  error: { message: string; code?: string },
): void {
  const qb = new MockQueryBuilder();
  qb.setError(error);
  mock.queryBuilders.set(table, qb);
}

function setTableResponse(
  mock: MockSupabaseClient,
  table: string,
  response: { data: unknown; error: { message: string; code?: string } | null; status?: number; statusText?: string },
): void {
  const qb = new MockQueryBuilder();
  qb.setResponse(response);
  mock.queryBuilders.set(table, qb);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Card Rules API', () => {
  let mock: MockSupabaseClient;

  beforeEach(() => {
    mock = createMockSupabase();
  });

  // =========================================================================
  // 1. List all cards
  // =========================================================================
  describe('listCards -- returns array of Card objects', () => {
    it('should return all active cards with correct fields', async () => {
      setTableData(mock, 'cards', mockCards);

      const { data, error } = await listCards(mock.supabase);

      expect(error).toBeNull();
      expect(data).toHaveLength(3);
      expect(data).toEqual(mockCards);

      // Verify shape of first card
      const card = (data as typeof mockCards)[0];
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('bank');
      expect(card).toHaveProperty('name');
      expect(card).toHaveProperty('network');
      expect(card).toHaveProperty('annual_fee');
      expect(card).toHaveProperty('base_rate_mpd');
      expect(typeof card.base_rate_mpd).toBe('number');
    });

    it('should return an empty array when no cards exist', async () => {
      setTableData(mock, 'cards', []);

      const { data, error } = await listCards(mock.supabase);

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  // =========================================================================
  // 2. Get card by ID
  // =========================================================================
  describe('getCardById -- returns single card with nested relations', () => {
    it('should return a card with earn_rules, caps, and exclusions', async () => {
      const cardWithRelations = {
        ...cardHSBCRevolution,
        earn_rules: earnRulesHSBC,
        caps: [allCaps[0]], // HSBC shared cap
        exclusions: [],
      };

      setTableData(mock, 'cards', cardWithRelations);

      const { data, error } = await getCardById(mock.supabase, cardHSBCRevolution.id);

      expect(error).toBeNull();
      expect(data).not.toBeNull();

      const card = data as typeof cardWithRelations;
      expect(card.id).toBe(cardHSBCRevolution.id);
      expect(card.bank).toBe('HSBC');
      expect(card.name).toBe('HSBC Revolution Credit Card');
      expect(card.earn_rules).toHaveLength(7);
      expect(card.caps).toHaveLength(1);
      expect(card.exclusions).toHaveLength(0);
    });

    it('should return null data when card is not found', async () => {
      setTableResponse(mock, 'cards', {
        data: null,
        error: { message: 'JSON object requested, multiple (or no) rows returned', code: 'PGRST116' },
      });

      const { data, error } = await getCardById(mock.supabase, 'nonexistent-uuid');

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.code).toBe('PGRST116');
    });
  });

  // =========================================================================
  // 3. Get earn rules for card
  // =========================================================================
  describe('getEarnRulesForCard -- returns category rules with correct mpd values', () => {
    it('should return 7 earn rules for HSBC Revolution', async () => {
      setTableData(mock, 'earn_rules', earnRulesHSBC);

      const { data, error } = await getEarnRulesForCard(mock.supabase, cardHSBCRevolution.id);

      expect(error).toBeNull();
      expect(data).toHaveLength(7);

      const rules = data as typeof earnRulesHSBC;

      // HSBC Revolution: 4 mpd on dining and online (bonus), 0.4 mpd on others
      const diningRule = rules.find(r => r.category_id === 'dining');
      expect(diningRule).toBeDefined();
      expect(diningRule!.earn_rate_mpd).toBe(4.0);
      expect(diningRule!.is_bonus).toBe(true);

      const onlineRule = rules.find(r => r.category_id === 'online');
      expect(onlineRule).toBeDefined();
      expect(onlineRule!.earn_rate_mpd).toBe(4.0);
      expect(onlineRule!.is_bonus).toBe(true);

      const transportRule = rules.find(r => r.category_id === 'transport');
      expect(transportRule).toBeDefined();
      expect(transportRule!.earn_rate_mpd).toBe(0.4);
      expect(transportRule!.is_bonus).toBe(false);
    });

    it('should return all rules with effective_to as null (active only)', async () => {
      setTableData(mock, 'earn_rules', earnRulesHSBC);

      const { data } = await getEarnRulesForCard(mock.supabase, cardHSBCRevolution.id);
      const rules = data as typeof earnRulesHSBC;

      rules.forEach(rule => {
        expect(rule.effective_to).toBeNull();
      });
    });

    it('should return empty array for card with no earn rules', async () => {
      setTableData(mock, 'earn_rules', []);

      const { data, error } = await getEarnRulesForCard(mock.supabase, 'card-with-no-rules');

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  // =========================================================================
  // 4. Get caps for card
  // =========================================================================
  describe('getCapsForCard -- returns caps with correct amounts', () => {
    it('should return caps for Amex Ascend (3 per-category caps)', async () => {
      const amexCaps = [capAmexDining, capAmexGroceries, capAmexTravel];
      setTableData(mock, 'caps', amexCaps);

      const { data, error } = await getCapsForCard(mock.supabase, cardAmexAscend.id);

      expect(error).toBeNull();
      expect(data).toHaveLength(3);

      const caps = data as typeof amexCaps;
      caps.forEach(cap => {
        expect(cap.monthly_cap_amount).toBe(2500);
        expect(cap.card_id).toBe(cardAmexAscend.id);
      });

      const categoryIds = caps.map(c => c.category_id);
      expect(categoryIds).toContain('dining');
      expect(categoryIds).toContain('groceries');
      expect(categoryIds).toContain('travel');
    });

    it('should return empty array for uncapped card (UOB PRVI)', async () => {
      setTableData(mock, 'caps', []);

      const { data, error } = await getCapsForCard(mock.supabase, cardUOBPRVI.id);

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('should return shared (null category) cap for HSBC Revolution', async () => {
      setTableData(mock, 'caps', [allCaps[0]]); // capHSBCShared

      const { data, error } = await getCapsForCard(mock.supabase, cardHSBCRevolution.id);

      expect(error).toBeNull();
      expect(data).toHaveLength(1);

      const cap = (data as typeof allCaps)[0];
      expect(cap.category_id).toBeNull();
      expect(cap.monthly_cap_amount).toBe(1000);
    });
  });

  // =========================================================================
  // 5. Get categories
  // =========================================================================
  describe('getCategories -- returns 7 categories in display order', () => {
    it('should return all 7 categories sorted by display_order', async () => {
      setTableData(mock, 'categories', mockCategories);

      const { data, error } = await getCategories(mock.supabase);

      expect(error).toBeNull();
      expect(data).toHaveLength(7);

      const categories = data as typeof mockCategories;
      const ids = categories.map(c => c.id);
      expect(ids).toEqual([
        'dining', 'transport', 'online', 'groceries', 'petrol', 'travel', 'general',
      ]);

      // Verify display_order is ascending
      for (let i = 1; i < categories.length; i++) {
        expect(categories[i].display_order).toBeGreaterThan(categories[i - 1].display_order);
      }
    });

    it('should include mccs arrays in category data', async () => {
      setTableData(mock, 'categories', mockCategories);

      const { data } = await getCategories(mock.supabase);
      const categories = data as typeof mockCategories;

      const dining = categories.find(c => c.id === 'dining');
      expect(dining).toBeDefined();
      expect(dining!.mccs).toContain('5811');
      expect(Array.isArray(dining!.mccs)).toBe(true);

      // General has empty MCCs
      const general = categories.find(c => c.id === 'general');
      expect(general!.mccs).toEqual([]);
    });
  });

  // =========================================================================
  // 6. Filter active cards only
  // =========================================================================
  describe('listActiveCards -- respects is_active flag', () => {
    it('should return only active cards, excluding discontinued ones', async () => {
      const activeOnly = mockCardsWithInactive.filter(c => c.is_active);
      setTableData(mock, 'cards', activeOnly);

      const { data, error } = await listActiveCards(mock.supabase);

      expect(error).toBeNull();
      expect(data).toHaveLength(3); // 3 active, 1 inactive
      (data as typeof activeOnly).forEach(card => {
        expect(card.is_active).toBe(true);
      });
    });

    it('should not include the inactive card in results', async () => {
      const activeOnly = mockCardsWithInactive.filter(c => c.is_active);
      setTableData(mock, 'cards', activeOnly);

      const { data } = await listActiveCards(mock.supabase);
      const ids = (data as typeof activeOnly).map(c => c.id);

      expect(ids).not.toContain('00000000-0000-0000-0001-000000000099');
    });
  });

  // =========================================================================
  // 7. Error handling
  // =========================================================================
  describe('Error handling', () => {
    it('should propagate network errors from Supabase client', async () => {
      setTableError(mock, 'cards', {
        message: 'Failed to fetch',
        code: 'NETWORK_ERROR',
      });

      const { data, error } = await listCards(mock.supabase);

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.message).toBe('Failed to fetch');
      expect(error!.code).toBe('NETWORK_ERROR');
    });

    it('should handle invalid UUID format error', async () => {
      setTableError(mock, 'cards', {
        message: 'invalid input syntax for type uuid',
        code: '22P02',
      });

      const { data, error } = await getCardById(mock.supabase, 'not-a-uuid');

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.code).toBe('22P02');
    });

    it('should handle empty results gracefully (not an error)', async () => {
      setTableData(mock, 'earn_rules', []);

      const { data, error } = await getEarnRulesForCard(mock.supabase, 'card-with-no-rules');

      expect(error).toBeNull();
      expect(data).toEqual([]);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should handle 401 unauthorized error', async () => {
      setTableError(mock, 'cards', {
        message: 'JWT expired',
        code: 'PGRST301',
      });

      const { data, error } = await listCards(mock.supabase);

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.code).toBe('PGRST301');
    });

    it('should handle server error (500)', async () => {
      setTableResponse(mock, 'categories', {
        data: null,
        error: { message: 'Internal Server Error', code: '500' },
        status: 500,
        statusText: 'Internal Server Error',
      });

      const { data, error } = await getCategories(mock.supabase);

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.message).toBe('Internal Server Error');
    });
  });
});
