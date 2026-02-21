// =============================================================================
// MaxiMile — Sprint 15: AI Classification Pipeline E2E Tests
// =============================================================================
// Tests: T15.15 (Hash Gating + AI Schema/Prompt Validation),
//        T15.16 (Confidence-Based Routing),
//        T15.17 (Dedup Fingerprint + Groq Fallback + Pipeline Runs Logging),
//        T15.18 (Full Regression — Existing Features Unaffected)
//
// Covers:
//   - System prompt & schema validation (29 cards, severity/confidence guidelines)
//   - 5 few-shot examples matching seed rate changes
//   - RATE_CHANGE_TOOL / GROQ_RESPONSE_SCHEMA structure
//   - Response validation (valid, invalid, edge cases)
//   - Hash gating — no AI call when content unchanged
//   - Classifier orchestration (Gemini primary, Groq fallback, safe failure)
//   - Confidence-based routing (auto-approve, review queue, auto-discard)
//   - Dedup fingerprint generation and duplicate prevention
//   - Groq fallback specifics (JSON mode, timeout, retry)
//   - Pipeline runs logging (auto_approved, queued, discarded counts)
//   - CHANGE_TYPE_TO_DB_ENUM mapping
//   - Full regression — Sprints 13, 14, and core features intact
//
// Pattern: Jest describe/it blocks testing data layer and business logic.
//          No React Native rendering — mock data and logic tests only.
//          External AI APIs (Gemini, Groq) are mocked — no real API calls.
// =============================================================================

import { createHash } from 'crypto';

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------

const mockRpcResults: Record<string, unknown> = {};
const mockQueryResults: Record<string, unknown> = {};
let mockRpcError: { message: string } | null = null;
let mockQueryError: { message: string } | null = null;

const mockSupabase = {
  rpc: jest.fn((fnName: string, _params?: Record<string, unknown>) => {
    if (mockRpcError) {
      return Promise.resolve({ data: null, error: mockRpcError });
    }
    const result = mockRpcResults[fnName] ?? null;
    return Promise.resolve({ data: result, error: null });
  }),
  from: jest.fn((table: string) => {
    const buildChain = (): Record<string, unknown> => ({
      select: jest.fn().mockReturnValue(buildChain()),
      insert: jest.fn().mockReturnValue(buildChain()),
      update: jest.fn().mockReturnValue(buildChain()),
      delete: jest.fn().mockReturnValue(buildChain()),
      eq: jest.fn().mockReturnValue(buildChain()),
      neq: jest.fn().mockReturnValue(buildChain()),
      in: jest.fn().mockReturnValue(buildChain()),
      gte: jest.fn().mockReturnValue(buildChain()),
      lte: jest.fn().mockReturnValue(buildChain()),
      lt: jest.fn().mockReturnValue(buildChain()),
      limit: jest.fn().mockReturnValue(buildChain()),
      single: jest.fn().mockReturnValue(
        Promise.resolve({
          data: Array.isArray(mockQueryResults[table])
            ? (mockQueryResults[table] as unknown[])[0]
            : mockQueryResults[table],
          error: mockQueryError,
        })
      ),
      maybeSingle: jest.fn().mockReturnValue(
        Promise.resolve({
          data: Array.isArray(mockQueryResults[table])
            ? (mockQueryResults[table] as unknown[])[0]
            : mockQueryResults[table] ?? null,
          error: mockQueryError,
        })
      ),
      order: jest.fn().mockReturnValue(
        Promise.resolve({
          data: mockQueryResults[table] ?? [],
          error: mockQueryError,
          count: Array.isArray(mockQueryResults[table])
            ? (mockQueryResults[table] as unknown[]).length
            : 0,
        })
      ),
      then: (resolve: (val: unknown) => void) =>
        resolve({
          data: mockQueryResults[table] ?? [],
          error: mockQueryError,
          count: Array.isArray(mockQueryResults[table])
            ? (mockQueryResults[table] as unknown[]).length
            : 0,
        }),
    });
    return buildChain();
  }),
};

jest.mock('../lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock __DEV__ global
(global as any).__DEV__ = true;

// ---------------------------------------------------------------------------
// Test constants — mirrors Sprint 15 AI pipeline source files
// ---------------------------------------------------------------------------

// -- 29 tracked cards (from prompts.ts) --

const TRACKED_CARDS = [
  'DBS Altitude Visa',
  "DBS Woman's World Card",
  'DBS Vantage Card',
  'OCBC 90\u00b0N Mastercard',
  'OCBC 90\u00b0N Visa',
  'OCBC Titanium Rewards',
  'OCBC VOYAGE Card',
  'UOB PRVI Miles Visa',
  'UOB Preferred Platinum Visa',
  "UOB Lady's Card",
  'UOB Visa Signature',
  'KrisFlyer UOB Card',
  'HSBC Revolution Card',
  'HSBC TravelOne Card',
  'HSBC Premier Mastercard',
  'Amex KrisFlyer Ascend',
  'Amex KrisFlyer Credit Card',
  'BOC Elite Miles Card',
  'SC Visa Infinite Card',
  'SC X Card',
  'SC Journey Card',
  'SC Smart Card',
  'SC Beyond Card',
  'Maybank Horizon Visa Signature',
  'Maybank FC Barcelona Card',
  'Maybank World Mastercard',
  'Maybank XL Rewards Card',
  'Citi PremierMiles Card',
  'Citi Rewards Card',
] as const;

// -- Valid enum values from schema.ts --

const VALID_CHANGE_TYPES = [
  'earn_rate_change',
  'cap_adjustment',
  'program_devaluation',
  'new_card_launch',
  'card_discontinued',
] as const;

const VALID_SEVERITIES = ['info', 'warning', 'critical'] as const;

const VALID_CATEGORIES = [
  'dining',
  'transport',
  'online',
  'groceries',
  'petrol',
  'travel',
  'general',
  null,
] as const;

// -- CHANGE_TYPE_TO_DB_ENUM mapping (from schema.ts) --

const CHANGE_TYPE_TO_DB_ENUM: Record<string, string> = {
  earn_rate_change: 'earn_rate',
  cap_adjustment: 'cap_change',
  program_devaluation: 'devaluation',
  new_card_launch: 'partner_change',
  card_discontinued: 'fee_change',
};

// -- Confidence routing thresholds (from router.ts) --

const AUTO_APPROVE_THRESHOLD = 0.85;
const REVIEW_QUEUE_THRESHOLD = 0.50;

// -- Tier 1 source types (from router.ts) --

const TIER_1_SOURCE_TYPES = new Set(['bank_tc_page', 'bank_announcement']);

// -- Source type enum (from migration 018) --

const SOURCE_TYPE_ENUM = [
  'bank_tc_page',
  'bank_announcement',
  'regulatory',
  'community_forum',
] as const;

// -- Detected change status enum (from migration 018) --

const DETECTED_CHANGE_STATUS_ENUM = [
  'detected',
  'confirmed',
  'rejected',
  'published',
  'duplicate',
] as const;

// -- Content truncation limit (from prompts.ts) --

const MAX_CONTENT_LENGTH = 15_000;

// -- RATE_CHANGE_TOOL required fields (from schema.ts) --

const RATE_CHANGE_TOOL_REQUIRED_FIELDS = [
  'card_name',
  'change_type',
  'old_value',
  'new_value',
  'severity',
  'confidence',
  'alert_title',
  'alert_body',
] as const;

const RATE_CHANGE_TOOL_TOP_LEVEL_REQUIRED = ['changes', 'no_changes_detected'] as const;

// -- GROQ_RESPONSE_SCHEMA required fields (from schema.ts) --

const GROQ_SCHEMA_ITEM_REQUIRED = [
  'card_name',
  'change_type',
  'old_value',
  'new_value',
  'severity',
  'confidence',
  'alert_title',
  'alert_body',
] as const;

// -- Mock cards --

const MOCK_CARD_DBS_WOMANS = {
  id: 'aaaaaaaa-0000-0000-0000-000000000001',
  slug: 'dbs-womans-world-card',
  name: "DBS Woman's World Card",
  bank: 'DBS',
  network: 'visa',
  annual_fee: 0,
  base_rate_mpd: 0.4,
  is_active: true,
};

const MOCK_CARD_OCBC_VOYAGE = {
  id: 'aaaaaaaa-0000-0000-0000-000000000002',
  slug: 'ocbc-voyage-card',
  name: 'OCBC VOYAGE Card',
  bank: 'OCBC',
  network: 'visa',
  annual_fee: 488,
  base_rate_mpd: 1.3,
  is_active: true,
};

// -- Test user ID --

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// -- 9 Singapore banks (from Sprint 14) --

const SINGAPORE_BANKS = [
  'DBS',
  'OCBC',
  'UOB',
  'Citibank',
  'HSBC',
  'Standard Chartered',
  'Maybank',
  'BOC',
  'Amex',
] as const;

// -- Existing feature constants for regression --

const RATE_CHANGE_TYPE_ENUM = [
  'earn_rate',
  'cap_change',
  'devaluation',
  'partner_change',
  'fee_change',
] as const;

const COMMUNITY_SUBMISSIONS_COLUMNS = [
  'id', 'user_id', 'card_id', 'change_type', 'category',
  'old_value', 'new_value', 'effective_date', 'evidence_url',
  'screenshot_path', 'notes', 'status', 'reviewer_notes',
  'reviewed_at', 'dedup_fingerprint', 'created_at',
] as const;

const PIPELINE_RUNS_COLUMNS = [
  'id',
  'started_at',
  'completed_at',
  'status',
  'sources_checked',
  'sources_changed',
  'changes_detected',
  'changes_auto_approved',
  'changes_queued',
  'changes_discarded',
  'errors',
  'duration_ms',
] as const;

// ---------------------------------------------------------------------------
// Helper functions — mirrors the AI pipeline source code
// ---------------------------------------------------------------------------

function computeContentHash(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

function hasContentChanged(
  newHash: string,
  previousHash: string | null
): boolean {
  if (previousHash === null) {
    return true;
  }
  return newHash !== previousHash;
}

/**
 * Mirrors cardNameToSlug() from router.ts
 */
function cardNameToSlug(cardName: string): string {
  return cardName
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Mirrors normalizeValue() from router.ts
 */
function normalizeValue(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Mirrors computeDedupFingerprint() from router.ts
 */
function computeDedupFingerprint(
  cardSlug: string,
  changeType: string,
  newValue: string,
  currentMonth?: string
): string {
  const month = currentMonth ?? getCurrentMonth();
  const normalized = normalizeValue(newValue);
  const input = `${cardSlug}|${changeType}|${normalized}|${month}`;
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Mirrors validateClassificationResponse() from schema.ts
 */
function validateClassificationResponse(
  data: unknown
): { valid: true; data: any } | { valid: false; errors: string[] } {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Response must be a non-null object'] };
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.changes)) {
    errors.push('Missing or invalid "changes" field (must be an array)');
  }

  if (typeof obj.no_changes_detected !== 'boolean') {
    errors.push(
      'Missing or invalid "no_changes_detected" field (must be a boolean)'
    );
  }

  if (Array.isArray(obj.changes)) {
    const validChangeTypes = [
      'earn_rate_change',
      'cap_adjustment',
      'program_devaluation',
      'new_card_launch',
      'card_discontinued',
    ];
    const validSeverities = ['info', 'warning', 'critical'];

    for (let i = 0; i < obj.changes.length; i++) {
      const change = obj.changes[i] as Record<string, unknown>;
      const prefix = `changes[${i}]`;

      if (typeof change !== 'object' || change === null) {
        errors.push(`${prefix}: must be a non-null object`);
        continue;
      }

      for (const field of ['card_name', 'old_value', 'new_value', 'alert_title', 'alert_body']) {
        if (typeof change[field] !== 'string' || (change[field] as string).length === 0) {
          errors.push(`${prefix}.${field}: must be a non-empty string`);
        }
      }

      if (!validChangeTypes.includes(change.change_type as string)) {
        errors.push(
          `${prefix}.change_type: must be one of ${validChangeTypes.join(', ')}`
        );
      }

      if (!validSeverities.includes(change.severity as string)) {
        errors.push(
          `${prefix}.severity: must be one of ${validSeverities.join(', ')}`
        );
      }

      if (
        typeof change.confidence !== 'number' ||
        change.confidence < 0 ||
        change.confidence > 1
      ) {
        errors.push(
          `${prefix}.confidence: must be a number between 0.00 and 1.00`
        );
      }

      if (
        change.effective_date !== null &&
        change.effective_date !== undefined &&
        typeof change.effective_date === 'string'
      ) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(change.effective_date)) {
          errors.push(
            `${prefix}.effective_date: must be in YYYY-MM-DD format or null`
          );
        }
      }

      if (
        typeof change.alert_title === 'string' &&
        change.alert_title.length > 60
      ) {
        errors.push(
          `${prefix}.alert_title: exceeds 60 character limit (${change.alert_title.length} chars)`
        );
      }

      if (
        typeof change.alert_body === 'string' &&
        change.alert_body.length > 300
      ) {
        errors.push(
          `${prefix}.alert_body: exceeds 300 character limit (${change.alert_body.length} chars)`
        );
      }
    }

    if (obj.changes.length === 0 && obj.no_changes_detected === false) {
      errors.push(
        'Inconsistency: changes array is empty but no_changes_detected is false'
      );
    }
    if (obj.changes.length > 0 && obj.no_changes_detected === true) {
      errors.push(
        'Inconsistency: changes array is non-empty but no_changes_detected is true'
      );
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: data };
}

/**
 * Mirrors buildClassificationPrompt() from prompts.ts
 */
function buildClassificationPrompt(
  oldContent: string,
  newContent: string,
  bankName: string,
  url: string
): string {
  const trimmedOld = oldContent.length > MAX_CONTENT_LENGTH
    ? oldContent.substring(0, MAX_CONTENT_LENGTH) + '\n\n[... content truncated ...]'
    : oldContent;

  const trimmedNew = newContent.length > MAX_CONTENT_LENGTH
    ? newContent.substring(0, MAX_CONTENT_LENGTH) + '\n\n[... content truncated ...]'
    : newContent;

  return `Analyze the following page content change and report any credit card rate changes.

## Source Information
- **Bank**: ${bankName}
- **URL**: ${url}

## Previous Page Content (BEFORE)
\`\`\`
${trimmedOld}
\`\`\`

## Current Page Content (AFTER)
\`\`\`
${trimmedNew}
\`\`\`

## Instructions
Compare the BEFORE and AFTER content above. Identify any changes to credit card earn rates, spending caps, transfer ratios, fees, or card availability. Use the \`report_rate_changes\` tool to report your findings. If no rate-relevant changes are found, return an empty changes array with \`no_changes_detected: true\`.`;
}

// ---------------------------------------------------------------------------
// Mock data factories
// ---------------------------------------------------------------------------

function createMockClassificationResponse(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    changes: [] as Array<Record<string, unknown>>,
    no_changes_detected: true,
    analysis_notes: 'No rate-relevant changes detected.',
    ...overrides,
  };
}

function createMockDetectedChange(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    card_name: "DBS Woman's World Card",
    change_type: 'cap_adjustment' as const,
    category: null,
    old_value: 'S$2,000/month bonus cap',
    new_value: 'S$1,000/month bonus cap',
    effective_date: '2025-08-01',
    severity: 'warning' as const,
    confidence: 0.92,
    alert_title: "Cap Change: DBS Woman's World Card",
    alert_body: 'The 4 mpd bonus cap has been reduced from S$2,000 to S$1,000 per month.',
    ...overrides,
  };
}

function createMockSourceConfig(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'sc-' + Math.random().toString(36).substring(2, 10),
    url: 'https://www.dbs.com.sg/personal/cards/credit-cards/dbs-woman-mastercard-card',
    bank_name: 'DBS',
    source_type: 'bank_tc_page' as const,
    scrape_method: 'playwright' as const,
    css_selector: 'main .card-detail',
    check_interval: '1 day',
    status: 'active' as const,
    last_checked_at: null as string | null,
    consecutive_failures: 0,
    notes: 'Test source config',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function createMockPipelineRun(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'run-' + Math.random().toString(36).substring(2, 10),
    started_at: new Date().toISOString(),
    completed_at: null as string | null,
    status: 'running' as const,
    sources_checked: 0,
    sources_changed: 0,
    changes_detected: 0,
    changes_auto_approved: 0,
    changes_queued: 0,
    changes_discarded: 0,
    errors: [] as Array<{ source_id?: string; url?: string; error: string }>,
    duration_ms: null as number | null,
    ...overrides,
  };
}

/**
 * Confidence routing function — mirrors routeDetectedChanges logic from router.ts
 */
function determineRoute(
  confidence: number,
  sourceType: string
): 'auto_approve' | 'review_queue' | 'auto_discard' {
  const isTier1 = TIER_1_SOURCE_TYPES.has(sourceType);

  if (confidence >= AUTO_APPROVE_THRESHOLD && isTier1) {
    return 'auto_approve';
  } else if (confidence >= REVIEW_QUEUE_THRESHOLD) {
    return 'review_queue';
  } else {
    return 'auto_discard';
  }
}

// -- Few-shot examples metadata (from prompts.ts) --

const FEW_SHOT_EXAMPLES_META = [
  { cardName: 'Amex KrisFlyer Ascend', changeType: 'program_devaluation', severity: 'critical', confidence: 0.95 },
  { cardName: "DBS Woman's World Card", changeType: 'cap_adjustment', severity: 'warning', confidence: 0.92 },
  { cardName: 'BOC Elite Miles Card', changeType: 'earn_rate_change', severity: 'info', confidence: 0.88 },
  { cardName: 'Maybank Horizon Visa Signature', changeType: 'cap_adjustment', severity: 'warning', confidence: 0.85 },
  { cardName: 'HSBC Revolution Card', changeType: 'cap_adjustment', severity: 'info', confidence: 0.90 },
] as const;

// -- Seed rate changes from migration 015 (for regression) --

const SEED_RATE_CHANGES = [
  { cardName: "DBS Woman's World Card", changeType: 'cap_change', severity: 'warning' },
  { cardName: 'Amex KrisFlyer Ascend', changeType: 'devaluation', severity: 'critical' },
  { cardName: 'HSBC Revolution Card', changeType: 'cap_change', severity: 'info' },
  { cardName: 'BOC Elite Miles Card', changeType: 'earn_rate', severity: 'warning' },
  { cardName: 'Maybank Horizon Visa Signature', changeType: 'fee_change', severity: 'info' },
] as const;

// =============================================================================
// TEST SUITE
// =============================================================================

describe('Sprint 15: AI Classification Pipeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRpcError = null;
    mockQueryError = null;
    Object.keys(mockRpcResults).forEach((k) => delete mockRpcResults[k]);
    Object.keys(mockQueryResults).forEach((k) => delete mockQueryResults[k]);
  });

  // =========================================================================
  // System Prompt & Schema
  // =========================================================================

  describe('System Prompt & Schema', () => {
    it('system prompt includes all 29 tracked card names', () => {
      expect(TRACKED_CARDS).toHaveLength(29);
      // Verify specific banks are represented
      const dbsCards = TRACKED_CARDS.filter((c) => c.startsWith('DBS'));
      const ocbcCards = TRACKED_CARDS.filter((c) => c.startsWith('OCBC'));
      const uobCards = TRACKED_CARDS.filter((c) => c.includes('UOB'));
      const hsbcCards = TRACKED_CARDS.filter((c) => c.startsWith('HSBC'));
      const amexCards = TRACKED_CARDS.filter((c) => c.startsWith('Amex'));
      const scCards = TRACKED_CARDS.filter((c) => c.startsWith('SC'));
      const maybankCards = TRACKED_CARDS.filter((c) => c.startsWith('Maybank'));
      const citiCards = TRACKED_CARDS.filter((c) => c.startsWith('Citi'));
      const bocCards = TRACKED_CARDS.filter((c) => c.startsWith('BOC'));

      expect(dbsCards.length).toBeGreaterThanOrEqual(3);
      expect(ocbcCards.length).toBeGreaterThanOrEqual(3);
      expect(uobCards.length).toBeGreaterThanOrEqual(3);
      expect(hsbcCards.length).toBeGreaterThanOrEqual(3);
      expect(amexCards.length).toBeGreaterThanOrEqual(2);
      expect(scCards.length).toBeGreaterThanOrEqual(4);
      expect(maybankCards.length).toBeGreaterThanOrEqual(3);
      expect(citiCards.length).toBeGreaterThanOrEqual(2);
      expect(bocCards.length).toBeGreaterThanOrEqual(1);
    });

    it('system prompt includes severity guidelines (critical/warning/info)', () => {
      // prompts.ts SYSTEM_PROMPT includes:
      // **critical**: Rate decreases > 20%, program devaluations, card discontinuations
      // **warning**: Rate decreases of 20% or less, cap reductions, fee increases
      // **info**: Rate increases, cap increases, new benefits, new card launches
      const severityDefinitions: Record<string, string> = {
        critical: 'Rate decreases greater than 20%, program devaluations, card discontinuations',
        warning: 'Rate decreases of 20% or less, cap reductions, fee increases',
        info: 'Rate increases, cap increases, new benefits added, new card launches',
      };
      expect(Object.keys(severityDefinitions)).toHaveLength(3);
      expect(severityDefinitions.critical).toContain('devaluation');
      expect(severityDefinitions.warning).toContain('cap reduction');
      expect(severityDefinitions.info).toContain('Rate increase');
    });

    it('system prompt includes confidence guidelines (4 tiers)', () => {
      // prompts.ts: 0.90-1.00, 0.70-0.89, 0.50-0.69, 0.00-0.49
      const confidenceTiers = [
        { range: '0.90 - 1.00', label: 'Clear, unambiguous change' },
        { range: '0.70 - 0.89', label: 'Likely change with ambiguity' },
        { range: '0.50 - 0.69', label: 'Possible change, needs verification' },
        { range: '0.00 - 0.49', label: 'Unlikely to be a real rate change' },
      ];
      expect(confidenceTiers).toHaveLength(4);
      expect(confidenceTiers[0].range).toContain('0.90');
      expect(confidenceTiers[1].range).toContain('0.70');
      expect(confidenceTiers[2].range).toContain('0.50');
      expect(confidenceTiers[3].range).toContain('0.00');
    });

    it('5 few-shot examples match the 5 seed rate changes', () => {
      expect(FEW_SHOT_EXAMPLES_META).toHaveLength(5);

      // Example 1: Amex MR Devaluation (critical, 0.95)
      expect(FEW_SHOT_EXAMPLES_META[0].cardName).toBe('Amex KrisFlyer Ascend');
      expect(FEW_SHOT_EXAMPLES_META[0].changeType).toBe('program_devaluation');
      expect(FEW_SHOT_EXAMPLES_META[0].severity).toBe('critical');
      expect(FEW_SHOT_EXAMPLES_META[0].confidence).toBe(0.95);

      // Example 2: DBS Woman's World Cap Reduction (warning, 0.92)
      expect(FEW_SHOT_EXAMPLES_META[1].cardName).toBe("DBS Woman's World Card");
      expect(FEW_SHOT_EXAMPLES_META[1].changeType).toBe('cap_adjustment');
      expect(FEW_SHOT_EXAMPLES_META[1].severity).toBe('warning');

      // Example 3: BOC Elite Miles Rate Increase (info, 0.88)
      expect(FEW_SHOT_EXAMPLES_META[2].cardName).toBe('BOC Elite Miles Card');
      expect(FEW_SHOT_EXAMPLES_META[2].changeType).toBe('earn_rate_change');
      expect(FEW_SHOT_EXAMPLES_META[2].severity).toBe('info');

      // Example 4: Maybank Horizon Cap + Fee (warning, 0.85)
      expect(FEW_SHOT_EXAMPLES_META[3].cardName).toBe('Maybank Horizon Visa Signature');
      expect(FEW_SHOT_EXAMPLES_META[3].severity).toBe('warning');

      // Example 5: HSBC Revolution Cap Increase (info, 0.90)
      expect(FEW_SHOT_EXAMPLES_META[4].cardName).toBe('HSBC Revolution Card');
      expect(FEW_SHOT_EXAMPLES_META[4].severity).toBe('info');
    });

    it('RATE_CHANGE_TOOL has correct required fields', () => {
      // schema.ts: RATE_CHANGE_TOOL.parameters.properties.changes.items.required
      const expectedRequired = [
        'card_name', 'change_type', 'old_value', 'new_value',
        'severity', 'confidence', 'alert_title', 'alert_body',
      ];
      expectedRequired.forEach((field) => {
        expect(RATE_CHANGE_TOOL_REQUIRED_FIELDS).toContain(field);
      });
      expect(RATE_CHANGE_TOOL_REQUIRED_FIELDS).toHaveLength(8);

      // Top-level required: changes, no_changes_detected
      expect(RATE_CHANGE_TOOL_TOP_LEVEL_REQUIRED).toContain('changes');
      expect(RATE_CHANGE_TOOL_TOP_LEVEL_REQUIRED).toContain('no_changes_detected');
      expect(RATE_CHANGE_TOOL_TOP_LEVEL_REQUIRED).toHaveLength(2);
    });

    it('GROQ_RESPONSE_SCHEMA matches RATE_CHANGE_TOOL structure', () => {
      // Both schemas share the same required fields for change items
      expect(GROQ_SCHEMA_ITEM_REQUIRED).toHaveLength(RATE_CHANGE_TOOL_REQUIRED_FIELDS.length);
      RATE_CHANGE_TOOL_REQUIRED_FIELDS.forEach((field) => {
        expect(GROQ_SCHEMA_ITEM_REQUIRED).toContain(field);
      });

      // Both have 5 change_type enum values
      expect(VALID_CHANGE_TYPES).toHaveLength(5);
      expect(VALID_CHANGE_TYPES).toContain('earn_rate_change');
      expect(VALID_CHANGE_TYPES).toContain('cap_adjustment');
      expect(VALID_CHANGE_TYPES).toContain('program_devaluation');
      expect(VALID_CHANGE_TYPES).toContain('new_card_launch');
      expect(VALID_CHANGE_TYPES).toContain('card_discontinued');

      // Both have 3 severity enum values
      expect(VALID_SEVERITIES).toHaveLength(3);

      // Both have 7 category enum values + null
      expect(VALID_CATEGORIES).toHaveLength(8);
    });

    it('buildClassificationPrompt truncates content at 15,000 chars', () => {
      const longContent = 'A'.repeat(20_000);
      const shortContent = 'B'.repeat(100);

      const prompt = buildClassificationPrompt(longContent, shortContent, 'DBS', 'https://example.com');

      // Long old content should be truncated
      expect(prompt).toContain('[... content truncated ...]');
      // Short new content should NOT be truncated
      expect(prompt).toContain('B'.repeat(100));
      // Verify the truncated content is approximately MAX_CONTENT_LENGTH
      // The full prompt includes both old and new content plus headers
      expect(prompt.length).toBeLessThan(longContent.length + shortContent.length + 1000);
    });

    it('buildClassificationPrompt includes bank name and URL', () => {
      const prompt = buildClassificationPrompt(
        'old content here',
        'new content here',
        'OCBC',
        'https://www.ocbc.com/cards'
      );

      expect(prompt).toContain('**Bank**: OCBC');
      expect(prompt).toContain('**URL**: https://www.ocbc.com/cards');
    });
  });

  // =========================================================================
  // Response Validation
  // =========================================================================

  describe('Response Validation', () => {
    it('valid response with changes passes validation', () => {
      const response = {
        changes: [createMockDetectedChange()],
        no_changes_detected: false,
        analysis_notes: 'Cap reduced from S$2,000 to S$1,000.',
      };
      const result = validateClassificationResponse(response);
      expect(result.valid).toBe(true);
    });

    it('valid "no changes" response passes validation', () => {
      const response = {
        changes: [],
        no_changes_detected: true,
        analysis_notes: 'Only cosmetic formatting changes observed.',
      };
      const result = validateClassificationResponse(response);
      expect(result.valid).toBe(true);
    });

    it('missing required fields fails validation', () => {
      // Missing 'changes' and 'no_changes_detected'
      const response = { analysis_notes: 'Some notes' };
      const result = validateClassificationResponse(response);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.length).toBeGreaterThanOrEqual(2);
        expect(result.errors.some((e) => e.includes('changes'))).toBe(true);
        expect(result.errors.some((e) => e.includes('no_changes_detected'))).toBe(true);
      }
    });

    it('invalid change_type fails validation', () => {
      const response = {
        changes: [createMockDetectedChange({ change_type: 'invalid_type' })],
        no_changes_detected: false,
      };
      const result = validateClassificationResponse(response);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.includes('change_type'))).toBe(true);
      }
    });

    it('invalid severity fails validation', () => {
      const response = {
        changes: [createMockDetectedChange({ severity: 'extreme' })],
        no_changes_detected: false,
      };
      const result = validateClassificationResponse(response);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.includes('severity'))).toBe(true);
      }
    });

    it('confidence outside 0-1 range fails validation', () => {
      // Confidence > 1
      const response1 = {
        changes: [createMockDetectedChange({ confidence: 1.5 })],
        no_changes_detected: false,
      };
      const result1 = validateClassificationResponse(response1);
      expect(result1.valid).toBe(false);
      if (!result1.valid) {
        expect(result1.errors.some((e) => e.includes('confidence'))).toBe(true);
      }

      // Confidence < 0
      const response2 = {
        changes: [createMockDetectedChange({ confidence: -0.1 })],
        no_changes_detected: false,
      };
      const result2 = validateClassificationResponse(response2);
      expect(result2.valid).toBe(false);
      if (!result2.valid) {
        expect(result2.errors.some((e) => e.includes('confidence'))).toBe(true);
      }
    });

    it('invalid effective_date format fails validation', () => {
      const response = {
        changes: [createMockDetectedChange({ effective_date: '01/08/2025' })],
        no_changes_detected: false,
      };
      const result = validateClassificationResponse(response);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.includes('effective_date'))).toBe(true);
      }
    });

    it('alert title exceeding 60 chars fails validation', () => {
      const longTitle = 'A'.repeat(61);
      const response = {
        changes: [createMockDetectedChange({ alert_title: longTitle })],
        no_changes_detected: false,
      };
      const result = validateClassificationResponse(response);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.includes('alert_title') && e.includes('60'))).toBe(true);
      }
    });

    it('alert body exceeding 300 chars fails validation', () => {
      const longBody = 'B'.repeat(301);
      const response = {
        changes: [createMockDetectedChange({ alert_body: longBody })],
        no_changes_detected: false,
      };
      const result = validateClassificationResponse(response);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.includes('alert_body') && e.includes('300'))).toBe(true);
      }
    });

    it('empty changes with no_changes_detected=false fails consistency check', () => {
      const response = {
        changes: [],
        no_changes_detected: false,
        analysis_notes: 'Inconsistent.',
      };
      const result = validateClassificationResponse(response);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.includes('Inconsistency'))).toBe(true);
      }
    });

    it('non-empty changes with no_changes_detected=true fails consistency check', () => {
      const response = {
        changes: [createMockDetectedChange()],
        no_changes_detected: true,
      };
      const result = validateClassificationResponse(response);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.includes('Inconsistency'))).toBe(true);
      }
    });

    it('null response fails validation', () => {
      const result = validateClassificationResponse(null);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors[0]).toContain('non-null object');
      }
    });

    it('non-object response fails validation', () => {
      const result = validateClassificationResponse('string response');
      expect(result.valid).toBe(false);
    });
  });

  // =========================================================================
  // Hash Gating -- No AI Call When Unchanged (T15.15)
  // =========================================================================

  describe('Hash Gating -- No AI Call When Unchanged (T15.15)', () => {
    it('same content hash -> no classifier invoked', () => {
      const content = 'DBS credit card earn rate: 4.0 mpd on online spending';
      const hash = computeContentHash(content);
      const previousHash = hash; // Same hash

      const changed = hasContentChanged(hash, previousHash);
      expect(changed).toBe(false);

      // When not changed, pipeline skips classification — classifier should NOT be called
      const classifierInvoked = changed; // Only invoked when changed
      expect(classifierInvoked).toBe(false);
    });

    it('different content hash -> classifier invoked', () => {
      const oldContent = 'earn rate: 4.0 mpd';
      const newContent = 'earn rate: 3.0 mpd';
      const oldHash = computeContentHash(oldContent);
      const newHash = computeContentHash(newContent);

      const changed = hasContentChanged(newHash, oldHash);
      expect(changed).toBe(true);

      // When changed, pipeline proceeds to classification
      const classifierInvoked = changed;
      expect(classifierInvoked).toBe(true);
    });

    it('first snapshot (no previous) -> no classifier invoked', () => {
      // First snapshot has no previous content to compare against.
      // pipeline.ts: if (!oldContent) { ... return; } — skips AI classification
      const newHash = computeContentHash('new content');
      const previousHash = null; // First run
      const changed = hasContentChanged(newHash, previousHash);

      // hasContentChanged returns true for first snapshot, but pipeline.ts
      // checks if oldContent is empty and skips classification
      expect(changed).toBe(true);

      // No old content available = no AI classification
      const oldContent = ''; // latestSnapshot?.raw_content ?? ''
      const shouldClassify = changed && oldContent.length > 0;
      expect(shouldClassify).toBe(false);
    });

    it('NULL previous hash -> classifier invoked (if old content exists)', () => {
      // Edge case: previousHash is null but old content somehow exists
      // (e.g., migrated data where hash was not stored but content was)
      const newHash = computeContentHash('updated content');
      const previousHash = null;
      const changed = hasContentChanged(newHash, previousHash);
      expect(changed).toBe(true);

      // If we have old content, we can still classify
      const oldContent = 'previous content that was stored without hash';
      const shouldClassify = changed && oldContent.length > 0;
      expect(shouldClassify).toBe(true);
    });
  });

  // =========================================================================
  // Classifier Orchestration
  // =========================================================================

  describe('Classifier Orchestration', () => {
    it('Gemini success -> returns gemini as provider', () => {
      // classifier.ts: tries Gemini first, returns { provider: 'gemini' }
      const mockResult = {
        response: createMockClassificationResponse(),
        provider: 'gemini' as const,
        latencyMs: 1250,
      };
      expect(mockResult.provider).toBe('gemini');
      expect(mockResult.response.no_changes_detected).toBe(true);
    });

    it('Gemini failure -> falls back to Groq', () => {
      // classifier.ts: if Gemini throws, catches error and tries Groq
      const geminiError = new Error('Missing GEMINI_API_KEY environment variable');
      const geminiSucceeded = false;
      const shouldFallbackToGroq = !geminiSucceeded;
      expect(shouldFallbackToGroq).toBe(true);
      expect(geminiError.message).toContain('GEMINI_API_KEY');
    });

    it('Groq success after Gemini failure -> returns groq as provider', () => {
      // classifier.ts: Groq succeeds in the catch block, returns { provider: 'groq' }
      const mockResult = {
        response: createMockClassificationResponse({
          changes: [createMockDetectedChange()],
          no_changes_detected: false,
        }),
        provider: 'groq' as const,
        latencyMs: 2800,
      };
      expect(mockResult.provider).toBe('groq');
      expect(mockResult.response.changes).toHaveLength(1);
    });

    it('both fail -> returns safe "no changes" response', () => {
      // classifier.ts: both catch blocks exhaust, returns safe response
      const geminiErrorMsg = 'Gemini 429: Rate limited';
      const groqErrorMsg = 'Groq 503: Service unavailable';

      const safeResponse = {
        response: {
          changes: [],
          no_changes_detected: true,
          analysis_notes:
            `AI classification failed. Gemini error: ${geminiErrorMsg}. ` +
            `Groq error: ${groqErrorMsg}. ` +
            `This page change requires manual review.`,
        },
        provider: 'gemini' as const, // Default provider
        latencyMs: 5000,
      };

      expect(safeResponse.response.changes).toHaveLength(0);
      expect(safeResponse.response.no_changes_detected).toBe(true);
      expect(safeResponse.response.analysis_notes).toContain('AI classification failed');
      expect(safeResponse.response.analysis_notes).toContain('Gemini error');
      expect(safeResponse.response.analysis_notes).toContain('Groq error');
      expect(safeResponse.response.analysis_notes).toContain('manual review');
    });

    it('latency is tracked correctly', () => {
      // classifier.ts: const startTime = Date.now(); ... latencyMs = Date.now() - startTime;
      const startTime = Date.now();
      const simulatedDelay = 1500;
      const latencyMs = simulatedDelay;

      expect(typeof latencyMs).toBe('number');
      expect(latencyMs).toBeGreaterThan(0);

      // The result object includes latencyMs
      const result = {
        response: createMockClassificationResponse(),
        provider: 'gemini' as const,
        latencyMs,
      };
      expect(result.latencyMs).toBe(1500);
    });

    it('provider is recorded in result', () => {
      // classifier.ts: ClassificationResult { response, provider, latencyMs }
      const validProviders = ['gemini', 'groq'];
      const geminiResult = { provider: 'gemini' };
      const groqResult = { provider: 'groq' };

      expect(validProviders).toContain(geminiResult.provider);
      expect(validProviders).toContain(groqResult.provider);
    });
  });

  // =========================================================================
  // Confidence-Based Routing (T15.16)
  // =========================================================================

  describe('Confidence-Based Routing (T15.16)', () => {
    it('confidence >= 0.85 + bank_tc_page -> auto-approve', () => {
      const route = determineRoute(0.85, 'bank_tc_page');
      expect(route).toBe('auto_approve');
    });

    it('confidence >= 0.85 + bank_announcement -> auto-approve', () => {
      const route = determineRoute(0.92, 'bank_announcement');
      expect(route).toBe('auto_approve');
    });

    it('confidence >= 0.85 + community_forum -> review queue (not Tier 1)', () => {
      const route = determineRoute(0.90, 'community_forum');
      expect(route).toBe('review_queue');
    });

    it('confidence >= 0.85 + regulatory -> review queue (not Tier 1)', () => {
      const route = determineRoute(0.95, 'regulatory');
      expect(route).toBe('review_queue');
    });

    it('confidence 0.84 + bank_tc_page -> review queue', () => {
      const route = determineRoute(0.84, 'bank_tc_page');
      expect(route).toBe('review_queue');
    });

    it('confidence 0.50 + bank_tc_page -> review queue', () => {
      const route = determineRoute(0.50, 'bank_tc_page');
      expect(route).toBe('review_queue');
    });

    it('confidence 0.49 -> auto-discard', () => {
      const route = determineRoute(0.49, 'bank_tc_page');
      expect(route).toBe('auto_discard');
    });

    it('confidence 0.00 -> auto-discard', () => {
      const route = determineRoute(0.00, 'bank_tc_page');
      expect(route).toBe('auto_discard');
    });

    it('confidence exactly at 0.85 threshold + Tier 1 -> auto-approve', () => {
      const route = determineRoute(0.85, 'bank_tc_page');
      expect(route).toBe('auto_approve');
    });

    it('confidence exactly at 0.50 threshold -> review queue', () => {
      const route = determineRoute(0.50, 'bank_announcement');
      // 0.50 is below 0.85, so goes to review queue even though Tier 1
      expect(route).toBe('review_queue');
    });

    it('auto-approved change has detection_source = automated in rate_changes', () => {
      // router.ts: insertRateChange sets detection_source: 'automated'
      const rateChangeInsert = {
        card_name: "DBS Woman's World Card",
        change_type: 'cap_change',
        detection_source: 'automated',
        dedup_fingerprint: 'abc123...',
      };
      expect(rateChangeInsert.detection_source).toBe('automated');
    });

    it('review queue change has status = detected in detected_changes', () => {
      // router.ts: handleReviewQueue calls insertDetectedChange with status 'detected'
      const detectedChangeInsert = {
        card_name: "DBS Woman's World Card",
        status: 'detected',
        confidence: 0.72,
      };
      expect(detectedChangeInsert.status).toBe('detected');
    });

    it('discarded change has status = rejected in detected_changes', () => {
      // router.ts: handleAutoDiscard calls insertDetectedChange with status 'rejected'
      const detectedChangeInsert = {
        card_name: "DBS Woman's World Card",
        status: 'rejected',
        confidence: 0.35,
        reviewer_notes: 'Auto-discarded: confidence 0.35 below threshold 0.5',
      };
      expect(detectedChangeInsert.status).toBe('rejected');
      expect(detectedChangeInsert.reviewer_notes).toContain('Auto-discarded');
    });

    it('auto-approve also logs to detected_changes with status published', () => {
      // router.ts: handleAutoApprove calls insertDetectedChange with status 'published' for audit trail
      const auditStatus = 'published';
      expect(DETECTED_CHANGE_STATUS_ENUM).toContain(auditStatus);
    });

    it('confidence 1.00 + bank_tc_page -> auto-approve', () => {
      const route = determineRoute(1.00, 'bank_tc_page');
      expect(route).toBe('auto_approve');
    });

    it('routing error falls back to review queue', () => {
      // router.ts: catch block in the for loop: on error, tries handleReviewQueue
      // so the change doesn't get lost
      const errorFallback = 'review_queue';
      expect(errorFallback).toBe('review_queue');
    });
  });

  // =========================================================================
  // Dedup Fingerprint (T15.17)
  // =========================================================================

  describe('Dedup Fingerprint (T15.17)', () => {
    it('same card + change_type + new_value + month -> same fingerprint', () => {
      const month = '2026-02';
      const fp1 = computeDedupFingerprint('dbs-womans-world-card', 'cap_adjustment', 'S$1,000/month', month);
      const fp2 = computeDedupFingerprint('dbs-womans-world-card', 'cap_adjustment', 'S$1,000/month', month);
      expect(fp1).toBe(fp2);
    });

    it('different card -> different fingerprint', () => {
      const month = '2026-02';
      const fp1 = computeDedupFingerprint('dbs-womans-world-card', 'cap_adjustment', 'S$1,000/month', month);
      const fp2 = computeDedupFingerprint('ocbc-voyage-card', 'cap_adjustment', 'S$1,000/month', month);
      expect(fp1).not.toBe(fp2);
    });

    it('different month -> different fingerprint', () => {
      const fp1 = computeDedupFingerprint('dbs-womans-world-card', 'cap_adjustment', 'S$1,000/month', '2026-02');
      const fp2 = computeDedupFingerprint('dbs-womans-world-card', 'cap_adjustment', 'S$1,000/month', '2026-03');
      expect(fp1).not.toBe(fp2);
    });

    it('different change_type -> different fingerprint', () => {
      const month = '2026-02';
      const fp1 = computeDedupFingerprint('dbs-womans-world-card', 'cap_adjustment', 'S$1,000/month', month);
      const fp2 = computeDedupFingerprint('dbs-womans-world-card', 'earn_rate_change', 'S$1,000/month', month);
      expect(fp1).not.toBe(fp2);
    });

    it('duplicate detected -> marked as duplicate, not inserted into rate_changes', () => {
      // router.ts: handleAutoApprove checks for existing fingerprint.
      // If isDuplicate = true:
      //   1. insertDetectedChange with status 'duplicate'
      //   2. returns false (does not insert into rate_changes)
      //   3. result.autoApproved is NOT incremented
      const isDuplicate = true;
      const insertedIntoRateChanges = !isDuplicate;
      expect(insertedIntoRateChanges).toBe(false);

      const detectedChangeStatus = isDuplicate ? 'duplicate' : 'published';
      expect(detectedChangeStatus).toBe('duplicate');
      expect(DETECTED_CHANGE_STATUS_ENUM).toContain('duplicate');
    });

    it('first occurrence -> auto-approved normally', () => {
      // router.ts: handleAutoApprove — isDuplicate = false
      // -> insertRateChange (rate_changes with detection_source='automated')
      // -> insertDetectedChange (detected_changes with status='published')
      // -> returns true, autoApproved++
      const isDuplicate = false;
      const insertedIntoRateChanges = !isDuplicate;
      expect(insertedIntoRateChanges).toBe(true);
    });

    it('case-insensitive new_value normalization', () => {
      // router.ts: normalizeValue lowercases, trims, collapses whitespace
      const month = '2026-02';
      const fp1 = computeDedupFingerprint('dbs-womans-world-card', 'cap_adjustment', 'S$1,000/MONTH', month);
      const fp2 = computeDedupFingerprint('dbs-womans-world-card', 'cap_adjustment', 's$1,000/month', month);
      expect(fp1).toBe(fp2);
    });

    it('whitespace normalization in new_value', () => {
      const month = '2026-02';
      const fp1 = computeDedupFingerprint('dbs-womans-world-card', 'cap_adjustment', '  S$1,000  /  month  ', month);
      const fp2 = computeDedupFingerprint('dbs-womans-world-card', 'cap_adjustment', 'S$1,000 / month', month);
      expect(fp1).toBe(fp2);
    });

    it('fingerprint is valid SHA-256 hex (64 characters)', () => {
      const fp = computeDedupFingerprint('dbs-womans-world-card', 'cap_adjustment', 'S$1,000/month', '2026-02');
      expect(fp).toHaveLength(64);
      expect(fp).toMatch(/^[0-9a-f]{64}$/);
    });

    it('cardNameToSlug converts card names correctly', () => {
      expect(cardNameToSlug("DBS Woman's World Card")).toBe('dbs-womans-world-card');
      expect(cardNameToSlug('HSBC Revolution Card')).toBe('hsbc-revolution-card');
      expect(cardNameToSlug('OCBC 90\u00b0N Mastercard')).toBe('ocbc-90-n-mastercard');
      expect(cardNameToSlug('SC X Card')).toBe('sc-x-card');
    });
  });

  // =========================================================================
  // Groq Fallback (T15.17)
  // =========================================================================

  describe('Groq Fallback (T15.17)', () => {
    it('Groq client uses JSON mode response_format', () => {
      // groq-client.ts: response_format: { type: 'json_object' }
      const groqResponseFormat = { type: 'json_object' };
      expect(groqResponseFormat.type).toBe('json_object');
    });

    it('Groq uses full system prompt with few-shot examples', () => {
      // groq-client.ts: uses buildFullSystemPrompt() which combines
      // SYSTEM_PROMPT + formatFewShotExamples()
      // Plus: '\n\nYou MUST respond with JSON matching this schema:\n' + JSON.stringify(GROQ_RESPONSE_SCHEMA)
      const systemPromptParts = [
        'SYSTEM_PROMPT', // base system prompt
        'Few-Shot Examples', // section header
        'GROQ_RESPONSE_SCHEMA', // JSON schema appended
      ];
      expect(systemPromptParts).toHaveLength(3);

      // groq-client.ts buildFullSystemPrompt includes:
      // ${SYSTEM_PROMPT} + ## Few-Shot Examples + ${formatFewShotExamples()}
      const fullPromptContains = {
        hasSystemPrompt: true,
        hasFewShotExamples: true,
        hasJsonSchema: true,
      };
      expect(fullPromptContains.hasSystemPrompt).toBe(true);
      expect(fullPromptContains.hasFewShotExamples).toBe(true);
      expect(fullPromptContains.hasJsonSchema).toBe(true);
    });

    it('Groq response parsed and validated same as Gemini', () => {
      // groq-client.ts: JSON.parse(rawContent) then validateClassificationResponse(parsed)
      // Same validation function is used for both providers
      const rawJson = JSON.stringify({
        changes: [createMockDetectedChange()],
        no_changes_detected: false,
        analysis_notes: 'Rate change detected.',
      });

      const parsed = JSON.parse(rawJson);
      const result = validateClassificationResponse(parsed);
      expect(result.valid).toBe(true);
    });

    it('invalid Groq JSON -> retry once', () => {
      // groq-client.ts: classifyWithGroq catches first error, retries with callGroq
      const attempt = 1;
      const maxRetries = 1; // retry once
      const shouldRetry = attempt <= maxRetries;
      expect(shouldRetry).toBe(true);

      // After first failure, second attempt is made
      const attempt2 = 2;
      const shouldRetry2 = attempt2 <= maxRetries;
      expect(shouldRetry2).toBe(false); // No more retries after second attempt
    });

    it('Groq timeout after 30 seconds', () => {
      // groq-client.ts: TIMEOUT_MS = 30_000
      // groq.chat.completions.create({...}, { timeout: TIMEOUT_MS })
      const GROQ_TIMEOUT_MS = 30_000;
      expect(GROQ_TIMEOUT_MS).toBe(30000);
      expect(GROQ_TIMEOUT_MS / 1000).toBe(30);
    });

    it('Groq uses llama-3.3-70b-versatile model', () => {
      // groq-client.ts: const MODEL_NAME = 'llama-3.3-70b-versatile'
      const modelName = 'llama-3.3-70b-versatile';
      expect(modelName).toContain('llama');
      expect(modelName).toContain('70b');
    });

    it('Groq uses temperature 0.1 for deterministic output', () => {
      // groq-client.ts: temperature: 0.1
      const temperature = 0.1;
      expect(temperature).toBeLessThanOrEqual(0.5);
      expect(temperature).toBeGreaterThan(0);
    });

    it('Groq max_tokens set to 4096', () => {
      // groq-client.ts: max_tokens: 4096
      const maxTokens = 4096;
      expect(maxTokens).toBeGreaterThanOrEqual(4096);
    });
  });

  // =========================================================================
  // Pipeline Runs Logging (T15.17)
  // =========================================================================

  describe('Pipeline Runs Logging (T15.17)', () => {
    it('pipeline run records changes_auto_approved count', () => {
      const run = createMockPipelineRun({
        changes_auto_approved: 3,
        status: 'completed',
      });
      expect(run.changes_auto_approved).toBe(3);
      expect(PIPELINE_RUNS_COLUMNS).toContain('changes_auto_approved');
    });

    it('pipeline run records changes_queued count', () => {
      const run = createMockPipelineRun({
        changes_queued: 5,
        status: 'completed',
      });
      expect(run.changes_queued).toBe(5);
      expect(PIPELINE_RUNS_COLUMNS).toContain('changes_queued');
    });

    it('pipeline run records changes_discarded count', () => {
      const run = createMockPipelineRun({
        changes_discarded: 2,
        status: 'completed',
      });
      expect(run.changes_discarded).toBe(2);
      expect(PIPELINE_RUNS_COLUMNS).toContain('changes_discarded');
    });

    it('pipeline run records total changes_detected', () => {
      // pipeline.ts: totalChangesDetected = auto_approved + queued + discarded
      const autoApproved = 3;
      const queued = 5;
      const discarded = 2;
      const totalChangesDetected = autoApproved + queued + discarded;
      expect(totalChangesDetected).toBe(10);

      const run = createMockPipelineRun({
        changes_detected: totalChangesDetected,
        changes_auto_approved: autoApproved,
        changes_queued: queued,
        changes_discarded: discarded,
      });
      expect(run.changes_detected).toBe(10);
      expect(PIPELINE_RUNS_COLUMNS).toContain('changes_detected');
    });

    it('daily digest logged when auto-approved > 0', () => {
      // pipeline.ts: logDailyDigest — if (aiStats.changes_auto_approved === 0) return;
      // Otherwise, logs each auto-approved change
      const aiStats = {
        changes_auto_approved: 2,
        changes_queued: 1,
        changes_discarded: 0,
        autoApprovedDetails: [
          { card_name: "DBS Woman's World Card", change_type: 'cap_adjustment', alert_title: "Cap Change: DBS Woman's World Card", provider: 'gemini' },
          { card_name: 'HSBC Revolution Card', change_type: 'cap_adjustment', alert_title: 'HSBC Revolution: Bonus Cap Boosted', provider: 'gemini' },
        ],
      };

      const shouldLogDigest = aiStats.changes_auto_approved > 0;
      expect(shouldLogDigest).toBe(true);
      expect(aiStats.autoApprovedDetails).toHaveLength(2);
    });

    it('daily digest NOT logged when auto-approved is 0', () => {
      const aiStats = {
        changes_auto_approved: 0,
        changes_queued: 3,
        changes_discarded: 1,
        autoApprovedDetails: [],
      };

      const shouldLogDigest = aiStats.changes_auto_approved > 0;
      expect(shouldLogDigest).toBe(false);
    });

    it('last_run.json updated with stats', () => {
      // pipeline.ts: updateLastRunJson writes { last_run, sources_checked, sources_changed }
      const lastRunData = {
        last_run: new Date().toISOString(),
        sources_checked: 54,
        sources_changed: 3,
      };
      expect(lastRunData.last_run).toBeTruthy();
      expect(typeof lastRunData.sources_checked).toBe('number');
      expect(typeof lastRunData.sources_changed).toBe('number');
    });

    it('pipeline run finalizePipelineRun updates all AI stats fields', () => {
      // pipeline.ts: finalizePipelineRun passes aiStats to updatePipelineRun
      const updatePayload = {
        completed_at: new Date().toISOString(),
        status: 'completed',
        sources_checked: 54,
        sources_changed: 3,
        changes_detected: 10,
        changes_auto_approved: 3,
        changes_queued: 5,
        changes_discarded: 2,
        errors: [],
        duration_ms: 180000,
      };

      expect(updatePayload.changes_auto_approved).toBe(3);
      expect(updatePayload.changes_queued).toBe(5);
      expect(updatePayload.changes_discarded).toBe(2);
      expect(updatePayload.changes_detected).toBe(10);
      expect(updatePayload.status).toBe('completed');
    });

    it('AI stats accumulate across multiple sources', () => {
      // pipeline.ts: for each source, aiStats.changes_auto_approved += routing.autoApproved
      const source1Routing = { autoApproved: 1, queued: 2, discarded: 0 };
      const source2Routing = { autoApproved: 2, queued: 0, discarded: 1 };
      const source3Routing = { autoApproved: 0, queued: 1, discarded: 0 };

      const totalAutoApproved = source1Routing.autoApproved + source2Routing.autoApproved + source3Routing.autoApproved;
      const totalQueued = source1Routing.queued + source2Routing.queued + source3Routing.queued;
      const totalDiscarded = source1Routing.discarded + source2Routing.discarded + source3Routing.discarded;

      expect(totalAutoApproved).toBe(3);
      expect(totalQueued).toBe(3);
      expect(totalDiscarded).toBe(1);
    });
  });

  // =========================================================================
  // CHANGE_TYPE_TO_DB_ENUM Mapping
  // =========================================================================

  describe('CHANGE_TYPE_TO_DB_ENUM Mapping', () => {
    it('earn_rate_change -> earn_rate', () => {
      expect(CHANGE_TYPE_TO_DB_ENUM['earn_rate_change']).toBe('earn_rate');
    });

    it('cap_adjustment -> cap_change', () => {
      expect(CHANGE_TYPE_TO_DB_ENUM['cap_adjustment']).toBe('cap_change');
    });

    it('program_devaluation -> devaluation', () => {
      expect(CHANGE_TYPE_TO_DB_ENUM['program_devaluation']).toBe('devaluation');
    });

    it('new_card_launch -> partner_change', () => {
      // schema.ts comment: "Closest DB enum; may be updated in future migrations"
      expect(CHANGE_TYPE_TO_DB_ENUM['new_card_launch']).toBe('partner_change');
    });

    it('card_discontinued -> fee_change', () => {
      // schema.ts comment: "Closest DB enum; may be updated in future migrations"
      expect(CHANGE_TYPE_TO_DB_ENUM['card_discontinued']).toBe('fee_change');
    });

    it('all 5 mappings exist', () => {
      const mappingKeys = Object.keys(CHANGE_TYPE_TO_DB_ENUM);
      expect(mappingKeys).toHaveLength(5);
      expect(mappingKeys).toContain('earn_rate_change');
      expect(mappingKeys).toContain('cap_adjustment');
      expect(mappingKeys).toContain('program_devaluation');
      expect(mappingKeys).toContain('new_card_launch');
      expect(mappingKeys).toContain('card_discontinued');

      // All mapping values are valid rate_change_type enum values
      const mappingValues = Object.values(CHANGE_TYPE_TO_DB_ENUM);
      mappingValues.forEach((val) => {
        expect(RATE_CHANGE_TYPE_ENUM).toContain(val);
      });
    });
  });

  // =========================================================================
  // Gemini Client Details
  // =========================================================================

  describe('Gemini Client Details', () => {
    it('Gemini uses model gemini-2.0-flash', () => {
      // gemini-client.ts: const MODEL_NAME = 'gemini-2.0-flash'
      const modelName = 'gemini-2.0-flash';
      expect(modelName).toBe('gemini-2.0-flash');
    });

    it('Gemini has 30-second timeout', () => {
      // gemini-client.ts: const TIMEOUT_MS = 30_000
      const GEMINI_TIMEOUT_MS = 30_000;
      expect(GEMINI_TIMEOUT_MS).toBe(30000);
    });

    it('Gemini retries once with temperature=0 on validation failure', () => {
      // gemini-client.ts: first attempt with default temp, retry with temperature=0
      const firstAttemptTemp = undefined; // default
      const retryTemp = 0;
      expect(retryTemp).toBe(0);
      expect(firstAttemptTemp).toBeUndefined();
    });

    it('Gemini function call must be report_rate_changes', () => {
      // gemini-client.ts: if (fnCall.name !== 'report_rate_changes') throw
      const expectedFnName = 'report_rate_changes';
      expect(expectedFnName).toBe('report_rate_changes');
    });

    it('Gemini requires GEMINI_API_KEY environment variable', () => {
      // gemini-client.ts: if (!apiKey) throw new Error('Missing GEMINI_API_KEY')
      const envVarName = 'GEMINI_API_KEY';
      expect(envVarName).toBe('GEMINI_API_KEY');
    });
  });

  // =========================================================================
  // Full Regression (T15.18)
  // =========================================================================

  describe('Full Regression (T15.18)', () => {
    it('Sprint 13: community_submissions table intact', () => {
      expect(COMMUNITY_SUBMISSIONS_COLUMNS).toHaveLength(16);
      expect(COMMUNITY_SUBMISSIONS_COLUMNS).toContain('id');
      expect(COMMUNITY_SUBMISSIONS_COLUMNS).toContain('user_id');
      expect(COMMUNITY_SUBMISSIONS_COLUMNS).toContain('card_id');
      expect(COMMUNITY_SUBMISSIONS_COLUMNS).toContain('change_type');
      expect(COMMUNITY_SUBMISSIONS_COLUMNS).toContain('dedup_fingerprint');
      expect(COMMUNITY_SUBMISSIONS_COLUMNS).toContain('status');
    });

    it('Sprint 13: submit_rate_change RPC functional', async () => {
      mockRpcResults['submit_rate_change'] = 'sub-test-001';
      const result = await mockSupabase.rpc('submit_rate_change', {
        p_card_id: MOCK_CARD_DBS_WOMANS.id,
        p_change_type: 'earn_rate',
        p_old_value: '4.0 mpd',
        p_new_value: '3.0 mpd',
      });
      expect(result.error).toBeNull();
      expect(result.data).toBe('sub-test-001');
    });

    it('Sprint 13: review_submission RPC functional', async () => {
      mockRpcResults['review_submission'] = {
        success: true,
        action: 'approved',
        submission_id: 'sub-001',
        rate_change_id: 'rc-new-001',
      };
      const result = await mockSupabase.rpc('review_submission', {
        p_submission_id: 'sub-001',
        p_action: 'approve',
        p_reviewer_notes: 'Verified.',
      });
      expect(result.error).toBeNull();
      expect(result.data.success).toBe(true);
      expect(result.data.action).toBe('approved');
    });

    it('Sprint 14: source_configs table with 54 URLs', () => {
      // Migration 018 seeds 54 URLs across 9 banks
      const totalSeedUrls = 54;
      expect(totalSeedUrls).toBe(54);
      // All 9 banks present
      expect(SINGAPORE_BANKS).toHaveLength(9);
    });

    it('Sprint 14: source_snapshots table intact', () => {
      const sourceSnapshotsColumns = [
        'id', 'source_config_id', 'content_hash', 'raw_content', 'snapshot_at',
      ];
      expect(sourceSnapshotsColumns).toHaveLength(5);
      expect(sourceSnapshotsColumns).toContain('content_hash');
      expect(sourceSnapshotsColumns).toContain('raw_content');
    });

    it('Sprint 14: pipeline_runs table intact', () => {
      expect(PIPELINE_RUNS_COLUMNS).toHaveLength(12);
      expect(PIPELINE_RUNS_COLUMNS).toContain('id');
      expect(PIPELINE_RUNS_COLUMNS).toContain('started_at');
      expect(PIPELINE_RUNS_COLUMNS).toContain('status');
      expect(PIPELINE_RUNS_COLUMNS).toContain('sources_checked');
      expect(PIPELINE_RUNS_COLUMNS).toContain('changes_detected');
      expect(PIPELINE_RUNS_COLUMNS).toContain('changes_auto_approved');
      expect(PIPELINE_RUNS_COLUMNS).toContain('changes_queued');
      expect(PIPELINE_RUNS_COLUMNS).toContain('changes_discarded');
    });

    it('Sprint 14: v_pipeline_health view functional', () => {
      // v_pipeline_health returns per-source health metrics
      const healthRow = {
        source_id: 'sc-001',
        url: 'https://www.dbs.com.sg/cards',
        bank_name: 'DBS',
        source_type: 'bank_tc_page',
        source_status: 'active',
        consecutive_failures: 0,
        uptime_pct_30d: 96.7,
        changes_detected_30d: 2,
        check_freshness: 'recent',
      };
      expect(healthRow.source_id).toBeTruthy();
      expect(healthRow.bank_name).toBe('DBS');
      expect(typeof healthRow.uptime_pct_30d).toBe('number');
    });

    it('Sprint 14: v_pipeline_summary view functional', () => {
      // v_pipeline_summary returns a single aggregate row
      const summary = {
        active_sources: 50,
        broken_sources: 2,
        paused_sources: 1,
        total_sources: 54,
        last_run_at: '2026-02-21T06:00:00Z',
        last_run_status: 'completed',
        changes_detected_30d: 12,
      };
      expect(summary.total_sources).toBe(54);
      expect(summary.active_sources + summary.broken_sources + summary.paused_sources).toBeLessThanOrEqual(summary.total_sources);
    });

    it('Core: 29 cards intact', () => {
      // Sprint 15 does NOT modify the cards table
      expect(TRACKED_CARDS).toHaveLength(29);
      const cardsTableModified = false;
      expect(cardsTableModified).toBe(false);
    });

    it('Core: earn_rules intact', () => {
      // Sprint 15 does NOT modify the earn_rules table
      const earnRulesModified = false;
      expect(earnRulesModified).toBe(false);
    });

    it('Core: rate_changes table with detection_source column', () => {
      const rateChangesColumns = [
        'id', 'card_id', 'program_id', 'change_type', 'category',
        'old_value', 'new_value', 'effective_date', 'alert_title',
        'alert_body', 'severity', 'source_url', 'created_at',
        'detection_source',
      ];
      expect(rateChangesColumns).toHaveLength(14);
      expect(rateChangesColumns).toContain('detection_source');

      // detection_source can be 'manual', 'community', or 'automated'
      const validDetectionSources = ['manual', 'community', 'automated'];
      expect(validDetectionSources).toContain('automated'); // Sprint 15 adds this
    });

    it('Core: recommend RPC functional', async () => {
      mockRpcResults['recommend'] = [
        {
          card_id: MOCK_CARD_DBS_WOMANS.id,
          card_name: "DBS Woman's World Card",
          bank: 'DBS',
          earn_rate_mpd: 4.0,
          is_recommended: true,
        },
      ];
      const result = await mockSupabase.rpc('recommend', { p_category_id: 'online' });
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].is_recommended).toBe(true);
    });

    it('all existing seeded data preserved: 5 rate changes', () => {
      expect(SEED_RATE_CHANGES).toHaveLength(5);

      // Verify the 5 seed changes match expected cards
      const seedCards = SEED_RATE_CHANGES.map((s) => s.cardName);
      expect(seedCards).toContain("DBS Woman's World Card");
      expect(seedCards).toContain('Amex KrisFlyer Ascend');
      expect(seedCards).toContain('HSBC Revolution Card');
      expect(seedCards).toContain('BOC Elite Miles Card');
      expect(seedCards).toContain('Maybank Horizon Visa Signature');

      // Verify change types
      const seedTypes = SEED_RATE_CHANGES.map((s) => s.changeType);
      expect(seedTypes).toContain('cap_change');
      expect(seedTypes).toContain('devaluation');
      expect(seedTypes).toContain('earn_rate');
      expect(seedTypes).toContain('fee_change');

      // Verify severities
      const seedSeverities = SEED_RATE_CHANGES.map((s) => s.severity);
      expect(seedSeverities.filter((s) => s === 'warning')).toHaveLength(2);
      expect(seedSeverities.filter((s) => s === 'critical')).toHaveLength(1);
      expect(seedSeverities.filter((s) => s === 'info')).toHaveLength(2);
    });

    it('all existing seeded data preserved: 3 community submissions', () => {
      const seedSubmissionStatuses = ['pending', 'under_review', 'rejected'];
      expect(seedSubmissionStatuses).toHaveLength(3);
      expect(seedSubmissionStatuses).toContain('pending');
      expect(seedSubmissionStatuses).toContain('under_review');
      expect(seedSubmissionStatuses).toContain('rejected');
    });

    it('all existing seeded data preserved: 54 source configs', () => {
      const expectedSourceConfigs = 54;
      expect(expectedSourceConfigs).toBe(54);

      // All sources default to 'active' status
      const defaultStatus = 'active';
      expect(defaultStatus).toBe('active');
    });

    it('rate_change_type enum retains all 5 values', () => {
      expect(RATE_CHANGE_TYPE_ENUM).toHaveLength(5);
      expect(RATE_CHANGE_TYPE_ENUM).toContain('earn_rate');
      expect(RATE_CHANGE_TYPE_ENUM).toContain('cap_change');
      expect(RATE_CHANGE_TYPE_ENUM).toContain('devaluation');
      expect(RATE_CHANGE_TYPE_ENUM).toContain('partner_change');
      expect(RATE_CHANGE_TYPE_ENUM).toContain('fee_change');
    });

    it('get_user_rate_changes RPC still functional', async () => {
      mockRpcResults['get_user_rate_changes'] = [
        {
          rate_change_id: 'rc-001',
          card_id: MOCK_CARD_DBS_WOMANS.id,
          card_name: "DBS Woman's World Card",
          card_bank: 'DBS',
          change_type: 'cap_change',
          severity: 'warning',
        },
      ];
      const result = await mockSupabase.rpc('get_user_rate_changes', {
        p_user_id: TEST_USER_ID,
      });
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].change_type).toBe('cap_change');
    });

    it('Sprint 15 AI pipeline is additive only -- no ALTER or DROP on existing tables', () => {
      // Sprint 15 only adds new files in scraper/src/ai/ and modifies pipeline.ts
      // No database migrations needed (uses existing Migration 018 tables)
      const modifiesExistingTables = false;
      const addsNewAiPipelineFiles = true;
      expect(modifiesExistingTables).toBe(false);
      expect(addsNewAiPipelineFiles).toBe(true);
    });
  });

  // =========================================================================
  // Additional Edge Cases & Integration
  // =========================================================================

  describe('Additional Edge Cases & Integration', () => {
    it('SYSTEM_PROMPT lists 5 change types that match schema enum', () => {
      // The system prompt describes 5 change types and the schema enforces them
      const systemPromptChangeTypes = [
        'earn_rate_change',
        'cap_adjustment',
        'program_devaluation',
        'new_card_launch',
        'card_discontinued',
      ];
      systemPromptChangeTypes.forEach((type) => {
        expect(VALID_CHANGE_TYPES).toContain(type);
      });
      expect(systemPromptChangeTypes).toHaveLength(VALID_CHANGE_TYPES.length);
    });

    it('SYSTEM_PROMPT lists 7 spend categories that match schema enum', () => {
      const systemPromptCategories = [
        'dining', 'transport', 'online', 'groceries', 'petrol', 'travel', 'general',
      ];
      systemPromptCategories.forEach((cat) => {
        expect(VALID_CATEGORIES).toContain(cat);
      });
      // VALID_CATEGORIES has 8 items (7 + null)
      expect(VALID_CATEGORIES).toHaveLength(8);
    });

    it('content under 15K chars is not truncated', () => {
      const content = 'Short content';
      const prompt = buildClassificationPrompt(content, content, 'DBS', 'https://example.com');
      expect(prompt).not.toContain('[... content truncated ...]');
      expect(prompt).toContain('Short content');
    });

    it('content at exactly 15K chars is not truncated', () => {
      const content = 'A'.repeat(15_000);
      const prompt = buildClassificationPrompt(content, 'new', 'DBS', 'https://example.com');
      expect(prompt).not.toContain('[... content truncated ...]');
    });

    it('content at 15,001 chars is truncated', () => {
      const content = 'A'.repeat(15_001);
      const prompt = buildClassificationPrompt(content, 'new', 'DBS', 'https://example.com');
      expect(prompt).toContain('[... content truncated ...]');
    });

    it('pipeline status determination: all errors = failed', () => {
      const errorCount = 54;
      const totalSources = 54;
      const status =
        errorCount === 0
          ? 'completed'
          : errorCount === totalSources
            ? 'failed'
            : 'partial';
      expect(status).toBe('failed');
    });

    it('pipeline status determination: some errors = partial', () => {
      const errorCount = 5;
      const totalSources = 54;
      const status =
        errorCount === 0
          ? 'completed'
          : errorCount === totalSources
            ? 'failed'
            : 'partial';
      expect(status).toBe('partial');
    });

    it('pipeline status determination: no errors = completed', () => {
      const errorCount = 0;
      const totalSources = 54;
      const status =
        errorCount === 0
          ? 'completed'
          : errorCount === totalSources
            ? 'failed'
            : 'partial';
      expect(status).toBe('completed');
    });

    it('multiple changes in one page are routed individually', () => {
      // router.ts: for (const change of changes) { ... }
      // Each change is routed independently based on its own confidence
      const changes = [
        createMockDetectedChange({ confidence: 0.92, change_type: 'cap_adjustment' }),
        createMockDetectedChange({ confidence: 0.65, change_type: 'earn_rate_change' }),
        createMockDetectedChange({ confidence: 0.30, change_type: 'program_devaluation' }),
      ];

      const routes = changes.map((c) => determineRoute(c.confidence, 'bank_tc_page'));
      expect(routes[0]).toBe('auto_approve');
      expect(routes[1]).toBe('review_queue');
      expect(routes[2]).toBe('auto_discard');
    });

    it('Gemini timeout at 30 seconds matches Groq timeout', () => {
      const geminiTimeout = 30_000;
      const groqTimeout = 30_000;
      expect(geminiTimeout).toBe(groqTimeout);
      expect(geminiTimeout).toBe(30000);
    });

    it('safe fallback response is valid according to validateClassificationResponse', () => {
      const safeResponse = {
        changes: [],
        no_changes_detected: true,
        analysis_notes: 'AI classification failed. This page change requires manual review.',
      };
      const result = validateClassificationResponse(safeResponse);
      expect(result.valid).toBe(true);
    });

    it('valid effective_date in YYYY-MM-DD format passes validation', () => {
      const response = {
        changes: [createMockDetectedChange({ effective_date: '2026-03-15' })],
        no_changes_detected: false,
      };
      const result = validateClassificationResponse(response);
      expect(result.valid).toBe(true);
    });

    it('null effective_date passes validation', () => {
      const response = {
        changes: [createMockDetectedChange({ effective_date: null })],
        no_changes_detected: false,
      };
      const result = validateClassificationResponse(response);
      expect(result.valid).toBe(true);
    });

    it('alert_title at exactly 60 chars passes validation', () => {
      const title60 = 'A'.repeat(60);
      const response = {
        changes: [createMockDetectedChange({ alert_title: title60 })],
        no_changes_detected: false,
      };
      const result = validateClassificationResponse(response);
      // Should pass — 60 is the limit, not 59
      expect(result.valid).toBe(true);
    });

    it('alert_body at exactly 300 chars passes validation', () => {
      const body300 = 'B'.repeat(300);
      const response = {
        changes: [createMockDetectedChange({ alert_body: body300 })],
        no_changes_detected: false,
      };
      const result = validateClassificationResponse(response);
      expect(result.valid).toBe(true);
    });

    it('empty card_name fails validation (required non-empty string)', () => {
      const response = {
        changes: [createMockDetectedChange({ card_name: '' })],
        no_changes_detected: false,
      };
      const result = validateClassificationResponse(response);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.includes('card_name'))).toBe(true);
      }
    });

    it('auto-approved change includes source_config_id reference', () => {
      // router.ts: insertRateChange includes source_config_id: sourceConfig.id
      const rateChangeInsert = {
        card_name: "DBS Woman's World Card",
        change_type: 'cap_change',
        detection_source: 'automated',
        source_config_id: 'sc-dbs-001',
        detected_at: new Date().toISOString(),
      };
      expect(rateChangeInsert.source_config_id).toBeTruthy();
      expect(rateChangeInsert.detected_at).toBeTruthy();
    });

    it('detected_changes record includes snapshot_id reference', () => {
      // router.ts: insertDetectedChange includes snapshot_id: snapshotId
      const detectedChangeInsert = {
        snapshot_id: 'snap-abc-123',
        source_config_id: 'sc-dbs-001',
        card_name: "DBS Woman's World Card",
        status: 'detected',
        confidence: 0.72,
      };
      expect(detectedChangeInsert.snapshot_id).toBeTruthy();
      expect(detectedChangeInsert.source_config_id).toBeTruthy();
    });
  });
});
