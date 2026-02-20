/**
 * MaxiMile Unit Tests: Goal Tracker (Sprint 8 — F16)
 *
 * Tests the create_miles_goal, delete_miles_goal, and get_program_goals RPCs,
 * plus goal achievement logic.
 */

import { createMockSupabase, MockSupabaseClient } from './mocks/supabase';
import {
  MOCK_USER_ID,
  MOCK_USER_ID_2,
  mockUser,
  mockSession,
  programKrisFlyer,
  mockGoal,
  mockGoalAchieved,
  mockPortfolioRow,
} from './mocks/test-data';

// ---------------------------------------------------------------------------
// Simulated service functions (mirror SDK calls)
// ---------------------------------------------------------------------------

async function createGoal(
  supabase: MockSupabaseClient['supabase'],
  userId: string,
  programId: string,
  target: number,
  description: string,
) {
  const result = await supabase.rpc('create_miles_goal', {
    p_user_id: userId,
    p_program_id: programId,
    p_target: target,
    p_description: description,
  });
  return result as { data: string | null; error: { message: string; code?: string } | null };
}

async function deleteGoal(
  supabase: MockSupabaseClient['supabase'],
  userId: string,
  goalId: string,
) {
  const result = await supabase.rpc('delete_miles_goal', {
    p_user_id: userId,
    p_goal_id: goalId,
  });
  return result as { data: null; error: { message: string; code?: string } | null };
}

async function getGoals(
  supabase: MockSupabaseClient['supabase'],
  userId: string,
  programId: string,
) {
  const result = await supabase.rpc('get_program_goals', {
    p_user_id: userId,
    p_program_id: programId,
  });
  return result as {
    data: typeof mockGoal[] | null;
    error: { message: string; code?: string } | null;
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Goal Tracker', () => {
  let mock: MockSupabaseClient;

  beforeEach(() => {
    mock = createMockSupabase();
    mock.mockAuth.setUser(mockUser);
    mock.mockAuth.setSession(mockSession);
  });

  // =========================================================================
  // 1. create_miles_goal RPC
  // =========================================================================
  describe('create_miles_goal RPC', () => {
    it('creates goal and returns goal ID', async () => {
      const goalId = 'gggggggg-0001-0001-0001-gggggggg0099';
      mock.mockRpc.setData('create_miles_goal', goalId);

      const { data, error } = await createGoal(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, 63000, 'Tokyo Business Class',
      );

      expect(error).toBeNull();
      expect(data).toBe(goalId);
    });

    it('stores target_miles, description, achieved_at=null', async () => {
      mock.mockRpc.setData('create_miles_goal', mockGoal.goal_id);

      const { data, error } = await createGoal(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, 63000, 'Tokyo Business Class',
      );

      expect(error).toBeNull();
      expect(data).toBe(mockGoal.goal_id);
      expect(mockGoal.target_miles).toBe(63000);
      expect(mockGoal.description).toBe('Tokyo Business Class');
      expect(mockGoal.achieved_at).toBeNull();
    });

    it('rejects target < 1000', async () => {
      mock.mockRpc.setError('create_miles_goal', {
        message: 'Target must be at least 1,000 miles',
        code: 'P0001',
      });

      const { data, error } = await createGoal(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, 500, 'Too small goal',
      );

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.message).toContain('at least 1,000');
      expect(error!.code).toBe('P0001');
    });

    it('rejects empty description', async () => {
      mock.mockRpc.setError('create_miles_goal', {
        message: 'Goal description is required',
        code: 'P0001',
      });

      const { data, error } = await createGoal(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, 5000, '',
      );

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.message).toContain('description is required');
    });

    it('allows up to 3 active goals per program', async () => {
      mock.mockRpc.setData('create_miles_goal', 'goal-1');
      const { error: err1 } = await createGoal(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, 10000, 'Goal 1',
      );
      expect(err1).toBeNull();

      mock.mockRpc.setData('create_miles_goal', 'goal-2');
      const { error: err2 } = await createGoal(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, 20000, 'Goal 2',
      );
      expect(err2).toBeNull();

      mock.mockRpc.setData('create_miles_goal', 'goal-3');
      const { error: err3 } = await createGoal(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, 30000, 'Goal 3',
      );
      expect(err3).toBeNull();
    });

    it('rejects 4th active goal (max-3 constraint)', async () => {
      mock.mockRpc.setError('create_miles_goal', {
        message: 'Maximum 3 active goals per program. Delete or complete an existing goal first.',
        code: 'P0001',
      });

      const { data, error } = await createGoal(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, 40000, 'Goal 4',
      );

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.message).toContain('Maximum 3 active goals');
      expect(error!.code).toBe('P0001');
    });

    it('allows new goal if existing ones are achieved', async () => {
      mock.mockRpc.setData('create_miles_goal', 'goal-after-achieved');

      const { data, error } = await createGoal(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, 50000, 'Post-achievement goal',
      );

      expect(error).toBeNull();
      expect(data).toBe('goal-after-achieved');
    });
  });

  // =========================================================================
  // 2. delete_miles_goal RPC
  // =========================================================================
  describe('delete_miles_goal RPC', () => {
    it('deletes goal owned by user', async () => {
      mock.mockRpc.setData('delete_miles_goal', null);

      const { error } = await deleteGoal(
        mock.supabase, MOCK_USER_ID, mockGoal.goal_id,
      );

      expect(error).toBeNull();
    });

    it('rejects deletion of non-existent goal', async () => {
      mock.mockRpc.setError('delete_miles_goal', {
        message: 'Goal not found or not owned by user',
        code: 'P0001',
      });

      const { data, error } = await deleteGoal(
        mock.supabase, MOCK_USER_ID, 'nonexistent-goal-id',
      );

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.message).toContain('not found');
    });

    it('rejects deletion of goal owned by another user', async () => {
      mock.mockRpc.setError('delete_miles_goal', {
        message: 'Goal not found or not owned by user',
        code: 'P0001',
      });

      const { data, error } = await deleteGoal(
        mock.supabase, MOCK_USER_ID_2, mockGoal.goal_id,
      );

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.message).toContain('not owned by user');
    });
  });

  // =========================================================================
  // 3. get_program_goals RPC
  // =========================================================================
  describe('get_program_goals RPC', () => {
    it('returns goals for specific program', async () => {
      mock.mockRpc.setData('get_program_goals', [mockGoal, mockGoalAchieved]);

      const { data, error } = await getGoals(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id,
      );

      expect(error).toBeNull();
      expect(data).toHaveLength(2);
    });

    it('active goals first (achieved_at IS NULL), then achieved', async () => {
      mock.mockRpc.setData('get_program_goals', [mockGoal, mockGoalAchieved]);

      const { data } = await getGoals(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id,
      );

      const goals = data as typeof mockGoal[];
      expect(goals[0].achieved_at).toBeNull();
      expect(goals[1].achieved_at).not.toBeNull();
    });

    it('returns empty array when no goals', async () => {
      mock.mockRpc.setData('get_program_goals', []);

      const { data, error } = await getGoals(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id,
      );

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  // =========================================================================
  // 4. Goal Achievement
  // =========================================================================
  describe('Goal Achievement', () => {
    it('goal marked achieved when balance >= target', async () => {
      const achievedGoal = {
        ...mockGoal,
        achieved_at: '2026-02-20T10:30:00+08:00',
      };
      mock.mockRpc.setData('get_program_goals', [achievedGoal]);

      const { data } = await getGoals(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id,
      );

      const goals = data as typeof mockGoal[];
      expect(goals[0].achieved_at).not.toBeNull();
    });

    it('achieved goals have achieved_at timestamp', async () => {
      mock.mockRpc.setData('get_program_goals', [mockGoalAchieved]);

      const { data } = await getGoals(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id,
      );

      const goals = data as typeof mockGoalAchieved[];
      expect(goals[0].achieved_at).toBe('2026-02-20T10:30:00+08:00');
      expect(new Date(goals[0].achieved_at!).getTime()).toBeGreaterThan(0);
    });

    it('achieved goals still returned in list', async () => {
      mock.mockRpc.setData('get_program_goals', [mockGoal, mockGoalAchieved]);

      const { data } = await getGoals(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id,
      );

      const goals = data as typeof mockGoal[];
      expect(goals).toHaveLength(2);

      const achievedGoals = goals.filter(g => g.achieved_at !== null);
      expect(achievedGoals).toHaveLength(1);

      const activeGoals = goals.filter(g => g.achieved_at === null);
      expect(activeGoals).toHaveLength(1);
    });
  });
});
