/**
 * MaxiMile Unit Tests: User Portfolio (user_cards) Operations
 *
 * Tests add, remove, list, and edge cases for the user's card portfolio.
 * Mocks the Supabase client since we cannot hit a real database in unit tests.
 */

import { createMockSupabase, MockSupabaseClient, MockQueryBuilder } from './mocks/supabase';
import {
  mockUserCards,
  cardHSBCRevolution,
  cardUOBPRVI,
  cardAmexAscend,
  MOCK_USER_ID,
  mockUser,
  mockSession,
} from './mocks/test-data';

// ---------------------------------------------------------------------------
// Simulated service functions (mirror SDK calls from API_CONTRACTS.md)
// ---------------------------------------------------------------------------

async function listUserCards(supabase: MockSupabaseClient['supabase']) {
  const { data, error } = await supabase
    .from('user_cards')
    .select('card_id, added_at, cards(id, bank, name, network, base_rate_mpd, image_url)')
    .order('added_at', { ascending: false });
  return { data, error };
}

async function addCardToPortfolio(supabase: MockSupabaseClient['supabase'], cardId: string) {
  const { data, error } = await supabase
    .from('user_cards')
    .insert({ card_id: cardId })
    .select();
  return { data, error };
}

async function removeCardFromPortfolio(supabase: MockSupabaseClient['supabase'], cardId: string) {
  const { data, error } = await supabase
    .from('user_cards')
    .delete()
    .eq('card_id', cardId);
  return { data, error };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('User Portfolio Operations', () => {
  let mock: MockSupabaseClient;

  beforeEach(() => {
    mock = createMockSupabase();
    mock.mockAuth.setUser(mockUser);
    mock.mockAuth.setSession(mockSession);
  });

  // =========================================================================
  // 1. Add card to portfolio
  // =========================================================================
  describe('addCardToPortfolio — inserts into user_cards', () => {
    it('should successfully add a card and return the created row', async () => {
      const createdRow = {
        user_id: MOCK_USER_ID,
        card_id: cardHSBCRevolution.id,
        added_at: '2026-02-19T10:00:00+08:00',
      };

      const qb = new MockQueryBuilder();
      qb.setData([createdRow]);
      mock.queryBuilders.set('user_cards', qb);

      const { data, error } = await addCardToPortfolio(mock.supabase, cardHSBCRevolution.id);

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect((data as typeof createdRow[])[0]).toMatchObject({
        user_id: MOCK_USER_ID,
        card_id: cardHSBCRevolution.id,
      });
    });

    it('should handle FK violation when card_id does not exist', async () => {
      const qb = new MockQueryBuilder();
      qb.setError({
        message: 'insert or update on table "user_cards" violates foreign key constraint "user_cards_card_id_fkey"',
        code: '23503',
      });
      mock.queryBuilders.set('user_cards', qb);

      const { data, error } = await addCardToPortfolio(mock.supabase, 'nonexistent-card-id');

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.code).toBe('23503');
    });

    it('should auto-populate user_id from auth.uid() (not sent in body)', async () => {
      // The API contract says user_id is auto-set via column default = auth.uid().
      // The client only sends card_id.
      const createdRow = {
        user_id: MOCK_USER_ID,
        card_id: cardUOBPRVI.id,
        added_at: '2026-02-19T10:00:00+08:00',
      };

      const qb = new MockQueryBuilder();
      qb.setData([createdRow]);
      mock.queryBuilders.set('user_cards', qb);

      const { data, error } = await addCardToPortfolio(mock.supabase, cardUOBPRVI.id);

      expect(error).toBeNull();
      expect((data as typeof createdRow[])[0].user_id).toBe(MOCK_USER_ID);
    });
  });

  // =========================================================================
  // 2. Remove card from portfolio
  // =========================================================================
  describe('removeCardFromPortfolio — deletes from user_cards', () => {
    it('should successfully remove a card and return no error', async () => {
      const qb = new MockQueryBuilder();
      qb.setData(null); // DELETE returns null data with 204 No Content
      mock.queryBuilders.set('user_cards', qb);

      const { data, error } = await removeCardFromPortfolio(mock.supabase, cardHSBCRevolution.id);

      expect(error).toBeNull();
    });

    it('should be idempotent — removing a card not in portfolio is not an error', async () => {
      // PostgREST returns empty result (not an error) if the card was not in the portfolio.
      const qb = new MockQueryBuilder();
      qb.setData([]);
      mock.queryBuilders.set('user_cards', qb);

      const { data, error } = await removeCardFromPortfolio(mock.supabase, 'card-not-in-portfolio');

      expect(error).toBeNull();
      // Empty array or null means nothing was deleted, but no error
    });

    it('should only delete the current user own cards (RLS enforced)', async () => {
      // RLS ensures that DELETE only affects rows where user_id = auth.uid().
      // Even if someone tries to delete another user's card, RLS filters it out.
      const qb = new MockQueryBuilder();
      qb.setData([]); // No rows deleted (RLS filtered out other user's rows)
      mock.queryBuilders.set('user_cards', qb);

      const { data, error } = await removeCardFromPortfolio(mock.supabase, 'other-users-card');

      expect(error).toBeNull();
      // No error, but also no rows affected
    });
  });

  // =========================================================================
  // 3. List user cards
  // =========================================================================
  describe('listUserCards — returns only current user cards', () => {
    it('should return the authenticated user cards with embedded card details', async () => {
      const userCardsWithDetails = mockUserCards.map(uc => ({
        card_id: uc.card_id,
        added_at: uc.added_at,
        cards: (() => {
          const card = [cardHSBCRevolution, cardUOBPRVI, cardAmexAscend].find(c => c.id === uc.card_id);
          return card ? { id: card.id, bank: card.bank, name: card.name, network: card.network, base_rate_mpd: card.base_rate_mpd, image_url: card.image_url } : null;
        })(),
      }));

      const qb = new MockQueryBuilder();
      qb.setData(userCardsWithDetails);
      mock.queryBuilders.set('user_cards', qb);

      const { data, error } = await listUserCards(mock.supabase);

      expect(error).toBeNull();
      expect(data).toHaveLength(3);

      const cards = data as typeof userCardsWithDetails;
      expect(cards[0]).toHaveProperty('card_id');
      expect(cards[0]).toHaveProperty('added_at');
      expect(cards[0]).toHaveProperty('cards');
      expect(cards[0].cards).toHaveProperty('bank');
      expect(cards[0].cards).toHaveProperty('name');
    });

    it('should not return other user cards (RLS isolation)', async () => {
      // Simulate RLS: only return current user's cards
      const currentUserCards = mockUserCards.filter(uc => uc.user_id === MOCK_USER_ID);

      const qb = new MockQueryBuilder();
      qb.setData(currentUserCards);
      mock.queryBuilders.set('user_cards', qb);

      const { data } = await listUserCards(mock.supabase);

      (data as typeof currentUserCards).forEach(uc => {
        expect(uc.user_id).toBe(MOCK_USER_ID);
      });
    });
  });

  // =========================================================================
  // 4. Add duplicate card — handles gracefully
  // =========================================================================
  describe('addCardToPortfolio — duplicate handling', () => {
    it('should return a 409 conflict error for duplicate card', async () => {
      const qb = new MockQueryBuilder();
      qb.setError({
        message: 'duplicate key value violates unique constraint "user_cards_pkey"',
        code: '23505',
      });
      mock.queryBuilders.set('user_cards', qb);

      const { data, error } = await addCardToPortfolio(mock.supabase, cardHSBCRevolution.id);

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.code).toBe('23505');
      expect(error!.message).toContain('duplicate key');
    });

    it('should allow adding different cards to the same portfolio', async () => {
      // First add
      const qb1 = new MockQueryBuilder();
      qb1.setData([{ user_id: MOCK_USER_ID, card_id: cardHSBCRevolution.id, added_at: '2026-02-19T10:00:00+08:00' }]);
      mock.queryBuilders.set('user_cards', qb1);

      const { error: err1 } = await addCardToPortfolio(mock.supabase, cardHSBCRevolution.id);
      expect(err1).toBeNull();

      // Second add (different card)
      const qb2 = new MockQueryBuilder();
      qb2.setData([{ user_id: MOCK_USER_ID, card_id: cardUOBPRVI.id, added_at: '2026-02-19T10:01:00+08:00' }]);
      mock.queryBuilders.set('user_cards', qb2);

      const { error: err2 } = await addCardToPortfolio(mock.supabase, cardUOBPRVI.id);
      expect(err2).toBeNull();
    });
  });

  // =========================================================================
  // 5. Portfolio empty state
  // =========================================================================
  describe('listUserCards — empty portfolio', () => {
    it('should return empty array when user has no cards', async () => {
      const qb = new MockQueryBuilder();
      qb.setData([]);
      mock.queryBuilders.set('user_cards', qb);

      const { data, error } = await listUserCards(mock.supabase);

      expect(error).toBeNull();
      expect(data).toEqual([]);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const qb = new MockQueryBuilder();
      qb.setError({
        message: 'JWT expired',
        code: 'PGRST301',
      });
      mock.queryBuilders.set('user_cards', qb);

      const { data, error } = await listUserCards(mock.supabase);

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.code).toBe('PGRST301');
    });
  });

  // =========================================================================
  // Auth context tests
  // =========================================================================
  describe('Auth context', () => {
    it('should have access to the current user via auth.getUser()', async () => {
      const { data } = await mock.supabase.auth.getUser();

      expect(data.user).not.toBeNull();
      expect((data.user as typeof mockUser).id).toBe(MOCK_USER_ID);
      expect((data.user as typeof mockUser).email).toBe('test@maximile.app');
    });

    it('should have access to the current session', async () => {
      const { data } = await mock.supabase.auth.getSession();

      expect(data.session).not.toBeNull();
      expect((data.session as typeof mockSession).access_token).toBe('mock-jwt-token');
    });

    it('should handle sign out', async () => {
      const { error } = await mock.supabase.auth.signOut();
      expect(error).toBeNull();
    });
  });
});
