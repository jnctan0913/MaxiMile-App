/**
 * MaxiMile Unit Tests: Cap Status Dashboard
 *
 * Tests for the cap status dashboard feature:
 *   - Displaying caps for user's cards
 *   - Color coding (green/amber/red) by usage threshold
 *   - Sorting by urgency (nearest to full first)
 *   - Handling uncapped cards
 *   - Monthly period display
 *   - Pull-to-refresh
 *   - Empty state
 *   - Multiple categories per card
 */

import { createMockSupabase, MockSupabaseClient, MockQueryBuilder } from './mocks/supabase';
import {
  cardHSBCRevolution,
  cardUOBPRVI,
  cardAmexAscend,
  capHSBCShared,
  capAmexDining,
  capAmexGroceries,
  capAmexTravel,
  MOCK_USER_ID,
  mockUser,
  mockSession,
  mockSpendingStates,
  createTransaction,
} from './mocks/test-data';
import type { SpendingState, Cap, Card } from '../lib/supabase-types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CapStatusItem {
  card_id: string;
  card_name: string;
  bank: string;
  category_id: string;
  category_name: string;
  total_spent: number;
  remaining_cap: number;
  monthly_cap_amount: number;
  usage_percent: number;
  color: 'green' | 'amber' | 'red';
}

interface CapStatusDashboard {
  month: string;
  month_display: string;
  items: CapStatusItem[];
  has_caps: boolean;
}

// ---------------------------------------------------------------------------
// Cap Status Business Logic
// ---------------------------------------------------------------------------

/** Determine color for a given usage percentage. */
function getCapColor(usagePercent: number): 'green' | 'amber' | 'red' {
  if (usagePercent >= 100) return 'red';
  if (usagePercent >= 80) return 'amber';
  return 'green';
}

/** Format month string (YYYY-MM) for display. */
function formatMonthDisplay(month: string): string {
  const [year, mon] = month.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthIndex = parseInt(mon, 10) - 1;
  return `${monthNames[monthIndex]} ${year}`;
}

/**
 * Build the cap status dashboard from spending states and cap definitions.
 * Cards without caps are excluded from the items list.
 * Items are sorted by usage_percent DESC (most urgent first).
 */
function buildCapStatusDashboard(
  month: string,
  spendingStates: SpendingState[],
  caps: Cap[],
  cards: Card[],
  categoryNames: Record<string, string>,
): CapStatusDashboard {
  const items: CapStatusItem[] = [];

  for (const cap of caps) {
    const card = cards.find(c => c.id === cap.card_id);
    if (!card) continue;

    // For shared caps (null category), represent them as a general entry
    const categories = cap.category_id ? [cap.category_id] : ['shared'];

    for (const catId of categories) {
      const state = spendingStates.find(
        s =>
          s.card_id === cap.card_id &&
          s.category_id === (catId === 'shared' ? cap.category_id || catId : catId) &&
          s.month === month,
      );

      const totalSpent = state ? state.total_spent : 0;
      const remainingCap = state ? state.remaining_cap : cap.monthly_cap_amount;
      const usagePercent = (totalSpent / cap.monthly_cap_amount) * 100;

      items.push({
        card_id: cap.card_id,
        card_name: card.name,
        bank: card.bank,
        category_id: catId,
        category_name: categoryNames[catId] || catId,
        total_spent: totalSpent,
        remaining_cap: remainingCap,
        monthly_cap_amount: cap.monthly_cap_amount,
        usage_percent: usagePercent,
        color: getCapColor(usagePercent),
      });
    }
  }

  // Sort by urgency: highest usage first
  items.sort((a, b) => b.usage_percent - a.usage_percent);

  return {
    month,
    month_display: formatMonthDisplay(month),
    items,
    has_caps: items.length > 0,
  };
}

// ---------------------------------------------------------------------------
// Constants for tests
// ---------------------------------------------------------------------------

const ALL_CAPS: Cap[] = [capHSBCShared, capAmexDining, capAmexGroceries, capAmexTravel];
const ALL_CARDS: Card[] = [cardHSBCRevolution, cardUOBPRVI, cardAmexAscend];
const CATEGORY_NAMES: Record<string, string> = {
  dining: 'Dining',
  transport: 'Transport',
  online: 'Online Shopping',
  groceries: 'Groceries',
  petrol: 'Petrol',
  travel: 'Travel / Hotels',
  general: 'General / Others',
  shared: 'All Categories (Shared)',
};

// ===========================================================================
// Tests
// ===========================================================================

describe('Cap Status Dashboard', () => {
  let mock: MockSupabaseClient;

  beforeEach(() => {
    mock = createMockSupabase();
    mock.mockAuth.setUser(mockUser);
    mock.mockAuth.setSession(mockSession);
  });

  // =========================================================================
  // 1. Display caps for user's cards
  // =========================================================================
  describe('Display caps for user cards', () => {
    it('should display cap entries for all capped card+category combos', () => {
      const dashboard = buildCapStatusDashboard(
        '2026-02',
        [],
        ALL_CAPS,
        ALL_CARDS,
        CATEGORY_NAMES,
      );

      expect(dashboard.has_caps).toBe(true);
      // HSBC shared + Amex dining + Amex groceries + Amex travel = 4 items
      expect(dashboard.items).toHaveLength(4);
    });

    it('should include card name and bank in each item', () => {
      const dashboard = buildCapStatusDashboard(
        '2026-02',
        [],
        ALL_CAPS,
        ALL_CARDS,
        CATEGORY_NAMES,
      );

      const hsbcItem = dashboard.items.find(i => i.card_id === cardHSBCRevolution.id);
      expect(hsbcItem).toBeDefined();
      expect(hsbcItem!.card_name).toBe('HSBC Revolution Credit Card');
      expect(hsbcItem!.bank).toBe('HSBC');
    });

    it('should show correct monthly cap amounts', () => {
      const dashboard = buildCapStatusDashboard(
        '2026-02',
        [],
        ALL_CAPS,
        ALL_CARDS,
        CATEGORY_NAMES,
      );

      const hsbcItem = dashboard.items.find(i => i.card_id === cardHSBCRevolution.id);
      expect(hsbcItem!.monthly_cap_amount).toBe(1000);

      const amexDining = dashboard.items.find(
        i => i.card_id === cardAmexAscend.id && i.category_id === 'dining',
      );
      expect(amexDining!.monthly_cap_amount).toBe(2500);
    });
  });

  // =========================================================================
  // 2. Green color when <80% used
  // =========================================================================
  describe('Color coding — green (<80% used)', () => {
    it('should show green when no spending (0% used)', () => {
      const dashboard = buildCapStatusDashboard(
        '2026-02',
        [],
        ALL_CAPS,
        ALL_CARDS,
        CATEGORY_NAMES,
      );

      dashboard.items.forEach(item => {
        expect(item.color).toBe('green');
        expect(item.usage_percent).toBe(0);
      });
    });

    it('should show green at 50% usage', () => {
      const states: SpendingState[] = [{
        id: 'ss-test',
        user_id: MOCK_USER_ID,
        card_id: cardHSBCRevolution.id,
        category_id: 'shared',
        month: '2026-02',
        total_spent: 500,
        remaining_cap: 500,
        created_at: '',
        updated_at: '',
      }];

      const color = getCapColor((500 / 1000) * 100);
      expect(color).toBe('green');
    });

    it('should show green at 79% usage', () => {
      expect(getCapColor(79)).toBe('green');
    });
  });

  // =========================================================================
  // 3. Amber color when 80-99% used
  // =========================================================================
  describe('Color coding — amber (80-99% used)', () => {
    it('should show amber at exactly 80% usage', () => {
      expect(getCapColor(80)).toBe('amber');
    });

    it('should show amber at 90% usage', () => {
      expect(getCapColor(90)).toBe('amber');
    });

    it('should show amber at 99% usage', () => {
      expect(getCapColor(99)).toBe('amber');
    });

    it('should show amber for spending state at 80% threshold', () => {
      const states: SpendingState[] = [{
        id: 'ss-amber',
        user_id: MOCK_USER_ID,
        card_id: cardAmexAscend.id,
        category_id: 'dining',
        month: '2026-02',
        total_spent: 2000,
        remaining_cap: 500,
        created_at: '',
        updated_at: '',
      }];

      const dashboard = buildCapStatusDashboard(
        '2026-02',
        states,
        [capAmexDining],
        ALL_CARDS,
        CATEGORY_NAMES,
      );

      const amexDining = dashboard.items.find(
        i => i.card_id === cardAmexAscend.id && i.category_id === 'dining',
      )!;
      expect(amexDining.usage_percent).toBe(80);
      expect(amexDining.color).toBe('amber');
    });
  });

  // =========================================================================
  // 4. Red color when 100% used
  // =========================================================================
  describe('Color coding — red (100% used)', () => {
    it('should show red at exactly 100% usage', () => {
      expect(getCapColor(100)).toBe('red');
    });

    it('should show red when cap is over 100% (overspend)', () => {
      expect(getCapColor(120)).toBe('red');
    });

    it('should show red for exhausted cap in dashboard', () => {
      const states: SpendingState[] = [{
        id: 'ss-red',
        user_id: MOCK_USER_ID,
        card_id: cardHSBCRevolution.id,
        category_id: 'shared',
        month: '2026-02',
        total_spent: 1000,
        remaining_cap: 0,
        created_at: '',
        updated_at: '',
      }];

      const dashboard = buildCapStatusDashboard(
        '2026-02',
        states,
        [capHSBCShared],
        ALL_CARDS,
        CATEGORY_NAMES,
      );

      const hsbcItem = dashboard.items[0];
      expect(hsbcItem.usage_percent).toBe(100);
      expect(hsbcItem.color).toBe('red');
      expect(hsbcItem.remaining_cap).toBe(0);
    });
  });

  // =========================================================================
  // 5. Cards sorted by urgency (nearest to full first)
  // =========================================================================
  describe('Sorting by urgency', () => {
    it('should sort items by usage percentage descending', () => {
      const states: SpendingState[] = [
        {
          id: 'ss-1',
          user_id: MOCK_USER_ID,
          card_id: cardHSBCRevolution.id,
          category_id: 'shared',
          month: '2026-02',
          total_spent: 200,
          remaining_cap: 800,
          created_at: '',
          updated_at: '',
        },
        {
          id: 'ss-2',
          user_id: MOCK_USER_ID,
          card_id: cardAmexAscend.id,
          category_id: 'dining',
          month: '2026-02',
          total_spent: 2500,
          remaining_cap: 0,
          created_at: '',
          updated_at: '',
        },
        {
          id: 'ss-3',
          user_id: MOCK_USER_ID,
          card_id: cardAmexAscend.id,
          category_id: 'groceries',
          month: '2026-02',
          total_spent: 1250,
          remaining_cap: 1250,
          created_at: '',
          updated_at: '',
        },
      ];

      const dashboard = buildCapStatusDashboard(
        '2026-02',
        states,
        ALL_CAPS,
        ALL_CARDS,
        CATEGORY_NAMES,
      );

      // Expected order: Amex dining (100%) > Amex groceries (50%) > HSBC shared (20%) > Amex travel (0%)
      expect(dashboard.items[0].card_id).toBe(cardAmexAscend.id);
      expect(dashboard.items[0].category_id).toBe('dining');
      expect(dashboard.items[0].usage_percent).toBe(100);

      expect(dashboard.items[1].card_id).toBe(cardAmexAscend.id);
      expect(dashboard.items[1].category_id).toBe('groceries');
      expect(dashboard.items[1].usage_percent).toBe(50);

      expect(dashboard.items[2].card_id).toBe(cardHSBCRevolution.id);
      expect(dashboard.items[2].usage_percent).toBe(20);

      // Last is Amex travel (0% usage)
      expect(dashboard.items[3].usage_percent).toBe(0);
    });

    it('should put all green items after amber and red', () => {
      const states: SpendingState[] = [
        {
          id: 'ss-g',
          user_id: MOCK_USER_ID,
          card_id: cardHSBCRevolution.id,
          category_id: 'shared',
          month: '2026-02',
          total_spent: 100,
          remaining_cap: 900,
          created_at: '',
          updated_at: '',
        },
        {
          id: 'ss-a',
          user_id: MOCK_USER_ID,
          card_id: cardAmexAscend.id,
          category_id: 'dining',
          month: '2026-02',
          total_spent: 2250,
          remaining_cap: 250,
          created_at: '',
          updated_at: '',
        },
      ];

      const dashboard = buildCapStatusDashboard(
        '2026-02',
        states,
        ALL_CAPS,
        ALL_CARDS,
        CATEGORY_NAMES,
      );

      // First item should be amber or red
      const firstColor = dashboard.items[0].color;
      expect(['amber', 'red']).toContain(firstColor);

      // Items should be in descending usage order
      for (let i = 1; i < dashboard.items.length; i++) {
        expect(dashboard.items[i].usage_percent).toBeLessThanOrEqual(
          dashboard.items[i - 1].usage_percent,
        );
      }
    });
  });

  // =========================================================================
  // 6. Cards with no caps show "No bonus caps"
  // =========================================================================
  describe('Uncapped cards', () => {
    it('should not include uncapped card (UOB PRVI) in cap status items', () => {
      const dashboard = buildCapStatusDashboard(
        '2026-02',
        [],
        ALL_CAPS,
        ALL_CARDS,
        CATEGORY_NAMES,
      );

      const uobItems = dashboard.items.filter(i => i.card_id === cardUOBPRVI.id);
      expect(uobItems).toHaveLength(0);
    });

    it('should have has_caps=false when only uncapped cards exist', () => {
      const dashboard = buildCapStatusDashboard(
        '2026-02',
        [],
        [], // no caps
        [cardUOBPRVI],
        CATEGORY_NAMES,
      );

      expect(dashboard.has_caps).toBe(false);
      expect(dashboard.items).toHaveLength(0);
    });
  });

  // =========================================================================
  // 7. Monthly period shows correct month
  // =========================================================================
  describe('Monthly period display', () => {
    it('should show February 2026 for month 2026-02', () => {
      const dashboard = buildCapStatusDashboard(
        '2026-02',
        [],
        ALL_CAPS,
        ALL_CARDS,
        CATEGORY_NAMES,
      );

      expect(dashboard.month).toBe('2026-02');
      expect(dashboard.month_display).toBe('February 2026');
    });

    it('should show January 2026 for month 2026-01', () => {
      expect(formatMonthDisplay('2026-01')).toBe('January 2026');
    });

    it('should show December 2025 for month 2025-12', () => {
      expect(formatMonthDisplay('2025-12')).toBe('December 2025');
    });
  });

  // =========================================================================
  // 8. Pull-to-refresh fetches fresh data
  // =========================================================================
  describe('Pull-to-refresh', () => {
    it('should fetch fresh spending state data on refresh', async () => {
      // First fetch: old data
      const ssQb1 = new MockQueryBuilder();
      ssQb1.setData([{
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        month: '2026-02',
        total_spent: 200,
        remaining_cap: 800,
      }]);
      mock.queryBuilders.set('spending_state', ssQb1);

      const { data: data1 } = await mock.supabase
        .from('spending_state')
        .select('*')
        .eq('month', '2026-02');

      expect((data1 as any[])[0].total_spent).toBe(200);

      // Simulate refresh: new data (after more spending)
      const ssQb2 = new MockQueryBuilder();
      ssQb2.setData([{
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        month: '2026-02',
        total_spent: 500,
        remaining_cap: 500,
      }]);
      mock.queryBuilders.set('spending_state', ssQb2);

      const { data: data2 } = await mock.supabase
        .from('spending_state')
        .select('*')
        .eq('month', '2026-02');

      expect((data2 as any[])[0].total_spent).toBe(500);
      expect((data2 as any[])[0].total_spent).toBeGreaterThan((data1 as any[])[0].total_spent);
    });
  });

  // =========================================================================
  // 9. Empty state when no cards added
  // =========================================================================
  describe('Empty state', () => {
    it('should show empty state when user has no cards', () => {
      const dashboard = buildCapStatusDashboard(
        '2026-02',
        [],
        [],
        [],
        CATEGORY_NAMES,
      );

      expect(dashboard.has_caps).toBe(false);
      expect(dashboard.items).toHaveLength(0);
    });

    it('should return empty array from Supabase for user with no spending state', async () => {
      const ssQb = new MockQueryBuilder();
      ssQb.setData([]);
      mock.queryBuilders.set('spending_state', ssQb);

      const { data, error } = await mock.supabase
        .from('spending_state')
        .select('*')
        .eq('month', '2026-02');

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  // =========================================================================
  // 10. Multiple categories per card each show separate progress bar
  // =========================================================================
  describe('Multiple categories per card', () => {
    it('should show separate progress bars for each category on Amex Ascend', () => {
      const states: SpendingState[] = [
        {
          id: 'ss-amex-dining',
          user_id: MOCK_USER_ID,
          card_id: cardAmexAscend.id,
          category_id: 'dining',
          month: '2026-02',
          total_spent: 1000,
          remaining_cap: 1500,
          created_at: '',
          updated_at: '',
        },
        {
          id: 'ss-amex-groceries',
          user_id: MOCK_USER_ID,
          card_id: cardAmexAscend.id,
          category_id: 'groceries',
          month: '2026-02',
          total_spent: 2000,
          remaining_cap: 500,
          created_at: '',
          updated_at: '',
        },
        {
          id: 'ss-amex-travel',
          user_id: MOCK_USER_ID,
          card_id: cardAmexAscend.id,
          category_id: 'travel',
          month: '2026-02',
          total_spent: 0,
          remaining_cap: 2500,
          created_at: '',
          updated_at: '',
        },
      ];

      // Only include Amex caps for clarity
      const amexCaps = [capAmexDining, capAmexGroceries, capAmexTravel];

      const dashboard = buildCapStatusDashboard(
        '2026-02',
        states,
        amexCaps,
        ALL_CARDS,
        CATEGORY_NAMES,
      );

      const amexItems = dashboard.items.filter(i => i.card_id === cardAmexAscend.id);
      expect(amexItems).toHaveLength(3);

      // Each category has its own progress
      const dining = amexItems.find(i => i.category_id === 'dining')!;
      expect(dining.total_spent).toBe(1000);
      expect(dining.usage_percent).toBe(40);
      expect(dining.color).toBe('green');

      const groceries = amexItems.find(i => i.category_id === 'groceries')!;
      expect(groceries.total_spent).toBe(2000);
      expect(groceries.usage_percent).toBe(80);
      expect(groceries.color).toBe('amber');

      const travel = amexItems.find(i => i.category_id === 'travel')!;
      expect(travel.total_spent).toBe(0);
      expect(travel.usage_percent).toBe(0);
      expect(travel.color).toBe('green');
    });

    it('should show both shared cap and category-specific caps', () => {
      const dashboard = buildCapStatusDashboard(
        '2026-02',
        [],
        ALL_CAPS,
        ALL_CARDS,
        CATEGORY_NAMES,
      );

      // HSBC has a shared cap (category_id null)
      const hsbcItems = dashboard.items.filter(i => i.card_id === cardHSBCRevolution.id);
      expect(hsbcItems).toHaveLength(1); // one shared cap entry

      // Amex has 3 category-specific caps
      const amexItems = dashboard.items.filter(i => i.card_id === cardAmexAscend.id);
      expect(amexItems).toHaveLength(3);
    });
  });

  // =========================================================================
  // Additional: Cap status with real spending states from test data
  // =========================================================================
  describe('Cap status with mock spending states', () => {
    it('should correctly display existing spending states from test fixtures', () => {
      const dashboard = buildCapStatusDashboard(
        '2026-02',
        mockSpendingStates,
        ALL_CAPS,
        ALL_CARDS,
        CATEGORY_NAMES,
      );

      expect(dashboard.has_caps).toBe(true);

      // HSBC dining: from mockSpendingStates, total_spent=750, remaining=250
      // But the cap is shared (null category_id), so the lookup depends on category match
      // Amex dining: total_spent=500, remaining=2000
      const amexDining = dashboard.items.find(
        i => i.card_id === cardAmexAscend.id && i.category_id === 'dining',
      );
      expect(amexDining).toBeDefined();
      expect(amexDining!.total_spent).toBe(500);
      expect(amexDining!.remaining_cap).toBe(2000);
      expect(amexDining!.usage_percent).toBe(20);
      expect(amexDining!.color).toBe('green');
    });
  });

  // =========================================================================
  // Boundary tests for color thresholds
  // =========================================================================
  describe('Color boundary tests', () => {
    it('should be green at 79.99%', () => {
      expect(getCapColor(79.99)).toBe('green');
    });

    it('should be amber at 80.00%', () => {
      expect(getCapColor(80.0)).toBe('amber');
    });

    it('should be amber at 99.99%', () => {
      expect(getCapColor(99.99)).toBe('amber');
    });

    it('should be red at 100.00%', () => {
      expect(getCapColor(100.0)).toBe('red');
    });

    it('should be green at 0%', () => {
      expect(getCapColor(0)).toBe('green');
    });
  });
});
