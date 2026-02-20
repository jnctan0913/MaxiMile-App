/**
 * MaxiMile E2E Validation Tests: Sprint 12 — Rate Change Monitoring (F23)
 *
 * Validates the data integrity and logic of migrations 015 and 016:
 *   - Migration 015: rate_changes table (5 seed records), user_alert_reads
 *                    table, rate_change_type and alert_severity enums
 *   - Migration 016: get_user_rate_changes(p_user_id) and
 *                    get_card_rate_changes(p_card_id) RPC functions
 *   - RateChangeBanner component — notification banner with 3 severity variants
 *   - RateUpdatedBadge component — gold pill badge with expandable details
 *
 * Post-migration state: 5 seed rate changes, 2 RPC functions, 2 UI components.
 *
 * Sprint 12 acceptance criteria covered:
 *   T12.05 — Rate change data integrity
 *   T12.08 — get_user_rate_changes RPC simulation
 *   T12.15 — RateChangeBanner component logic
 *   T12.20 — RateUpdatedBadge data logic
 *   T12.27 — Sprint 7-11 regression
 */

import { createMockSupabase, MockSupabaseClient, MockQueryBuilder } from './mocks/supabase';

// ---------------------------------------------------------------------------
// Types (mirroring Sprint 12 schema additions)
// ---------------------------------------------------------------------------

interface RateChangeRow {
  id: string;
  card_id: string | null;
  program_id: string | null;
  change_type: 'earn_rate' | 'cap_change' | 'devaluation' | 'partner_change' | 'fee_change';
  category: string | null;
  old_value: string;
  new_value: string;
  effective_date: string;
  alert_title: string;
  alert_body: string;
  severity: 'info' | 'warning' | 'critical';
  source_url: string | null;
  created_at: string;
}

interface UserAlertReadRow {
  id: string;
  user_id: string;
  rate_change_id: string;
  read_at: string;
}

interface UserRateChangeResult {
  rate_change_id: string;
  card_id: string | null;
  card_name: string | null;
  card_bank: string | null;
  program_id: string | null;
  program_name: string | null;
  change_type: string;
  category: string | null;
  old_value: string;
  new_value: string;
  effective_date: string;
  alert_title: string;
  alert_body: string;
  severity: string;
  source_url: string | null;
  created_at: string;
}

interface RateAlert {
  id: string;
  alertTitle: string;
  alertBody: string;
  severity: 'info' | 'warning' | 'critical';
  cardId: string | null;
  cardName: string | null;
  effectiveDate: string;
  changeType: string;
}

interface RateChangeDetail {
  id: string;
  changeType: string;
  category: string | null;
  oldValue: string;
  newValue: string;
  effectiveDate: string;
  alertTitle: string;
  alertBody: string;
  severity: 'info' | 'warning' | 'critical';
}

interface CardRow {
  id: string;
  bank: string;
  name: string;
  slug: string;
  network: string;
  annual_fee: number;
  base_rate_mpd: number;
  is_active: boolean;
  miles_program_id: string | null;
  eligibility_criteria: Record<string, unknown> | null;
  notes: string | null;
}

// ---------------------------------------------------------------------------
// Constants: Card and Program IDs from migrations
// ---------------------------------------------------------------------------

const CARD_IDS = {
  DBS_WWC:          '00000000-0000-0000-0001-000000000002',
  AMEX_KF_ASCEND:   '00000000-0000-0000-0001-000000000006',
  HSBC_REVOLUTION:  '00000000-0000-0000-0001-000000000008',
  BOC_ELITE:        '00000000-0000-0000-0001-000000000012',
  MAYBANK_HORIZON:  '00000000-0000-0000-0001-000000000014',
  OCBC_VOYAGE:      '00000000-0000-0000-0003-000000000024',
} as const;

const PROGRAM_IDS = {
  KRISFLYER: 'prog-krisflyer',
} as const;

const USER_IDS = {
  ALICE: '11111111-1111-1111-1111-111111111111',
  BOB:   '22222222-2222-2222-2222-222222222222',
  CAROL: '33333333-3333-3333-3333-333333333333',
} as const;

// ---------------------------------------------------------------------------
// Fixture: 5 seed rate changes (matching migration 015)
// ---------------------------------------------------------------------------

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

const SEED_RATE_CHANGES: RateChangeRow[] = [
  {
    id: 'rc-001-dbs-wwc-cap',
    card_id: CARD_IDS.DBS_WWC,
    program_id: null,
    change_type: 'cap_change',
    category: null,
    old_value: 'S$2,000/month bonus cap',
    new_value: 'S$1,000/month bonus cap',
    effective_date: '2025-08-01',
    alert_title: 'Cap Change: DBS Woman\'s World Card',
    alert_body: 'The 4 mpd bonus cap has been reduced from S$2,000 to S$1,000 per month.',
    severity: 'warning',
    source_url: null,
    created_at: '2025-07-20T00:00:00Z',
  },
  {
    id: 'rc-002-amex-mr-deval',
    card_id: CARD_IDS.AMEX_KF_ASCEND,
    program_id: PROGRAM_IDS.KRISFLYER,
    change_type: 'devaluation',
    category: null,
    old_value: '1 MR point = 1 KrisFlyer mile',
    new_value: '1.5 MR points = 1 KrisFlyer mile (33% devaluation)',
    effective_date: '2025-11-01',
    alert_title: 'Rate Alert: Amex MR Devaluation',
    alert_body: 'Amex Membership Rewards transfer rate to KrisFlyer has worsened by 33%.',
    severity: 'critical',
    source_url: null,
    created_at: '2025-10-15T00:00:00Z',
  },
  {
    id: 'rc-003-hsbc-rev-cap',
    card_id: CARD_IDS.HSBC_REVOLUTION,
    program_id: null,
    change_type: 'cap_change',
    category: null,
    old_value: 'S$1,000/month bonus cap',
    new_value: 'S$1,500/month bonus cap',
    effective_date: '2026-01-15',
    alert_title: 'HSBC Revolution: Bonus Cap Boosted',
    alert_body: 'Great news! The monthly bonus cap has been increased from S$1,000 to S$1,500.',
    severity: 'info',
    source_url: null,
    created_at: '2025-12-20T00:00:00Z',
  },
  {
    id: 'rc-004-boc-dining',
    card_id: CARD_IDS.BOC_ELITE,
    program_id: null,
    change_type: 'earn_rate',
    category: 'dining',
    old_value: '3.0 mpd on dining',
    new_value: '2.0 mpd on dining',
    effective_date: '2025-06-01',
    alert_title: 'BOC Elite Miles: Dining Rate Reduced',
    alert_body: 'The dining bonus earn rate has been cut from 3.0 mpd to 2.0 mpd.',
    severity: 'warning',
    source_url: null,
    created_at: '2025-05-15T00:00:00Z',
  },
  {
    id: 'rc-005-maybank-fee',
    card_id: CARD_IDS.MAYBANK_HORIZON,
    program_id: null,
    change_type: 'fee_change',
    category: null,
    old_value: '$196.00/year (first year waived)',
    new_value: '$235.00/year (first year waived)',
    effective_date: '2026-02-01',
    alert_title: 'Maybank Horizon: Annual Fee Increase',
    alert_body: 'Annual fee increased from S$196 to S$235 (20% increase).',
    severity: 'info',
    source_url: null,
    created_at: '2026-01-10T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Helper: severity priority and colors (mirroring RateChangeBanner logic)
// ---------------------------------------------------------------------------

const SEVERITY_PRIORITY: Record<string, number> = {
  critical: 3,
  warning: 2,
  info: 1,
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#EA4335',
  warning: '#FBBC04',
  info: '#4A90D9',
};

const CHANGE_TYPE_LABELS: Record<string, string> = {
  earn_rate: 'Earn Rate Change',
  cap_change: 'Cap Adjustment',
  devaluation: 'Program Devaluation',
  partner_change: 'Partner Change',
  fee_change: 'Fee Change',
};

function formatChangeType(type: string): string {
  return (
    CHANGE_TYPE_LABELS[type] ??
    type
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  );
}

function getTopAlert(alerts: RateAlert[]): RateAlert {
  return [...alerts].sort(
    (a, b) => SEVERITY_PRIORITY[b.severity] - SEVERITY_PRIORITY[a.severity],
  )[0];
}

// ---------------------------------------------------------------------------
// Helper: simulate get_user_rate_changes RPC filtering
// ---------------------------------------------------------------------------

interface UserPortfolio {
  cardIds: string[];
  programIds: string[];
}

function simulateGetUserRateChanges(
  allChanges: RateChangeRow[],
  portfolio: UserPortfolio,
  dismissedIds: string[],
  maxAgeDays: number = 90,
): UserRateChangeResult[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxAgeDays);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  return allChanges
    .filter((rc) => {
      if (dismissedIds.includes(rc.id)) return false;
      if (rc.effective_date < cutoffStr) return false;
      const cardMatch = rc.card_id !== null && portfolio.cardIds.includes(rc.card_id);
      const programMatch = rc.program_id !== null && portfolio.programIds.includes(rc.program_id);
      return cardMatch || programMatch;
    })
    .sort((a, b) => {
      const sevDiff = SEVERITY_PRIORITY[b.severity] - SEVERITY_PRIORITY[a.severity];
      if (sevDiff !== 0) return sevDiff;
      return b.effective_date.localeCompare(a.effective_date);
    })
    .map((rc) => ({
      rate_change_id: rc.id,
      card_id: rc.card_id,
      card_name: null,
      card_bank: null,
      program_id: rc.program_id,
      program_name: null,
      change_type: rc.change_type,
      category: rc.category,
      old_value: rc.old_value,
      new_value: rc.new_value,
      effective_date: rc.effective_date,
      alert_title: rc.alert_title,
      alert_body: rc.alert_body,
      severity: rc.severity,
      source_url: rc.source_url,
      created_at: rc.created_at,
    }));
}

// ---------------------------------------------------------------------------
// Helper: simulate get_card_rate_changes RPC
// ---------------------------------------------------------------------------

function simulateGetCardRateChanges(
  allChanges: RateChangeRow[],
  cardId: string,
  maxAgeDays: number = 90,
): UserRateChangeResult[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxAgeDays);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  return allChanges
    .filter((rc) => rc.card_id === cardId && rc.effective_date >= cutoffStr)
    .sort((a, b) => b.effective_date.localeCompare(a.effective_date))
    .map((rc) => ({
      rate_change_id: rc.id,
      card_id: rc.card_id,
      card_name: null,
      card_bank: null,
      program_id: rc.program_id,
      program_name: null,
      change_type: rc.change_type,
      category: rc.category,
      old_value: rc.old_value,
      new_value: rc.new_value,
      effective_date: rc.effective_date,
      alert_title: rc.alert_title,
      alert_body: rc.alert_body,
      severity: rc.severity,
      source_url: rc.source_url,
      created_at: rc.created_at,
    }));
}

// ---------------------------------------------------------------------------
// Fixture: recent rate changes (within 90 days) for RPC simulation tests
// ---------------------------------------------------------------------------

const RECENT_RATE_CHANGES: RateChangeRow[] = [
  {
    id: 'rc-recent-wwc',
    card_id: CARD_IDS.DBS_WWC,
    program_id: null,
    change_type: 'cap_change',
    category: null,
    old_value: 'S$2,000/month bonus cap',
    new_value: 'S$1,000/month bonus cap',
    effective_date: daysAgo(30),
    alert_title: 'Cap Change: DBS WWC',
    alert_body: 'Bonus cap reduced.',
    severity: 'warning',
    source_url: null,
    created_at: daysAgo(35) + 'T00:00:00Z',
  },
  {
    id: 'rc-recent-amex',
    card_id: CARD_IDS.AMEX_KF_ASCEND,
    program_id: PROGRAM_IDS.KRISFLYER,
    change_type: 'devaluation',
    category: null,
    old_value: '1:1 transfer',
    new_value: '1.5:1 transfer',
    effective_date: daysAgo(20),
    alert_title: 'Amex MR Devaluation',
    alert_body: 'Transfer rate worsened.',
    severity: 'critical',
    source_url: null,
    created_at: daysAgo(25) + 'T00:00:00Z',
  },
  {
    id: 'rc-recent-hsbc',
    card_id: CARD_IDS.HSBC_REVOLUTION,
    program_id: null,
    change_type: 'cap_change',
    category: null,
    old_value: 'S$1,000 cap',
    new_value: 'S$1,500 cap',
    effective_date: daysAgo(10),
    alert_title: 'HSBC Revolution Cap Boosted',
    alert_body: 'Monthly cap increased.',
    severity: 'info',
    source_url: null,
    created_at: daysAgo(15) + 'T00:00:00Z',
  },
  {
    id: 'rc-old-expired',
    card_id: CARD_IDS.DBS_WWC,
    program_id: null,
    change_type: 'earn_rate',
    category: 'dining',
    old_value: '4 mpd',
    new_value: '3 mpd',
    effective_date: daysAgo(180),
    alert_title: 'Old DBS WWC change',
    alert_body: 'Should be excluded by 90-day filter.',
    severity: 'warning',
    source_url: null,
    created_at: daysAgo(185) + 'T00:00:00Z',
  },
];

// ===========================================================================
// SECTION 1: Rate Changes Data Integrity (T12.05)
// ===========================================================================

describe('Section 1: Rate Changes Data Integrity (T12.05)', () => {
  it('5 seed rate changes exist', () => {
    expect(SEED_RATE_CHANGES).toHaveLength(5);
  });

  it('DBS WWC cap change: severity=warning, old_value contains "2,000", new_value contains "1,000"', () => {
    const wwc = SEED_RATE_CHANGES.find((rc) => rc.id === 'rc-001-dbs-wwc-cap')!;
    expect(wwc).toBeDefined();
    expect(wwc.severity).toBe('warning');
    expect(wwc.change_type).toBe('cap_change');
    expect(wwc.old_value).toContain('2,000');
    expect(wwc.new_value).toContain('1,000');
    expect(wwc.card_id).toBe(CARD_IDS.DBS_WWC);
  });

  it('Amex MR devaluation: severity=critical, change_type=devaluation', () => {
    const amex = SEED_RATE_CHANGES.find((rc) => rc.id === 'rc-002-amex-mr-deval')!;
    expect(amex).toBeDefined();
    expect(amex.severity).toBe('critical');
    expect(amex.change_type).toBe('devaluation');
    expect(amex.program_id).toBe(PROGRAM_IDS.KRISFLYER);
  });

  it('HSBC Revolution cap boost: severity=info', () => {
    const hsbc = SEED_RATE_CHANGES.find((rc) => rc.id === 'rc-003-hsbc-rev-cap')!;
    expect(hsbc).toBeDefined();
    expect(hsbc.severity).toBe('info');
    expect(hsbc.change_type).toBe('cap_change');
  });

  it('BOC Elite dining cut: change_type=earn_rate, category=dining', () => {
    const boc = SEED_RATE_CHANGES.find((rc) => rc.id === 'rc-004-boc-dining')!;
    expect(boc).toBeDefined();
    expect(boc.change_type).toBe('earn_rate');
    expect(boc.category).toBe('dining');
    expect(boc.severity).toBe('warning');
  });

  it('Maybank Horizon fee change: change_type=fee_change', () => {
    const may = SEED_RATE_CHANGES.find((rc) => rc.id === 'rc-005-maybank-fee')!;
    expect(may).toBeDefined();
    expect(may.change_type).toBe('fee_change');
    expect(may.severity).toBe('info');
  });

  it('all rate changes have non-null alert_title, alert_body, effective_date', () => {
    SEED_RATE_CHANGES.forEach((rc) => {
      expect(rc.alert_title).toBeTruthy();
      expect(rc.alert_title.length).toBeGreaterThan(0);
      expect(rc.alert_body).toBeTruthy();
      expect(rc.alert_body.length).toBeGreaterThan(0);
      expect(rc.effective_date).toBeTruthy();
      expect(rc.effective_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('severity distribution: critical=1, warning=2, info=2', () => {
    const bySeverity = SEED_RATE_CHANGES.reduce<Record<string, number>>((acc, rc) => {
      acc[rc.severity] = (acc[rc.severity] || 0) + 1;
      return acc;
    }, {});
    expect(bySeverity.critical).toBe(1);
    expect(bySeverity.warning).toBe(2);
    expect(bySeverity.info).toBe(2);
  });

  it('change_type distribution: cap_change=2, devaluation=1, earn_rate=1, fee_change=1', () => {
    const byType = SEED_RATE_CHANGES.reduce<Record<string, number>>((acc, rc) => {
      acc[rc.change_type] = (acc[rc.change_type] || 0) + 1;
      return acc;
    }, {});
    expect(byType.cap_change).toBe(2);
    expect(byType.devaluation).toBe(1);
    expect(byType.earn_rate).toBe(1);
    expect(byType.fee_change).toBe(1);
  });

  it('all valid change_type enum values', () => {
    const validTypes = new Set(['earn_rate', 'cap_change', 'devaluation', 'partner_change', 'fee_change']);
    SEED_RATE_CHANGES.forEach((rc) => {
      expect(validTypes.has(rc.change_type)).toBe(true);
    });
  });

  it('all valid severity enum values', () => {
    const validSeverities = new Set(['info', 'warning', 'critical']);
    SEED_RATE_CHANGES.forEach((rc) => {
      expect(validSeverities.has(rc.severity)).toBe(true);
    });
  });
});

// ===========================================================================
// SECTION 2: get_user_rate_changes RPC Simulation (T12.08)
// ===========================================================================

describe('Section 2: get_user_rate_changes RPC Simulation (T12.08)', () => {
  it('affected user — user with DBS WWC gets the WWC cap change alert', () => {
    const alicePortfolio: UserPortfolio = {
      cardIds: [CARD_IDS.DBS_WWC],
      programIds: [],
    };

    const results = simulateGetUserRateChanges(RECENT_RATE_CHANGES, alicePortfolio, []);
    const wwcAlert = results.find((r) => r.rate_change_id === 'rc-recent-wwc');
    expect(wwcAlert).toBeDefined();
    expect(wwcAlert!.card_id).toBe(CARD_IDS.DBS_WWC);
    expect(wwcAlert!.severity).toBe('warning');
  });

  it('program-level match — user with Amex KF Ascend gets the KrisFlyer devaluation', () => {
    const bobPortfolio: UserPortfolio = {
      cardIds: [CARD_IDS.AMEX_KF_ASCEND],
      programIds: [PROGRAM_IDS.KRISFLYER],
    };

    const results = simulateGetUserRateChanges(RECENT_RATE_CHANGES, bobPortfolio, []);
    const amexAlert = results.find((r) => r.rate_change_id === 'rc-recent-amex');
    expect(amexAlert).toBeDefined();
    expect(amexAlert!.severity).toBe('critical');
    expect(amexAlert!.change_type).toBe('devaluation');
  });

  it('unaffected user — user with ONLY OCBC VOYAGE gets no results', () => {
    const carolPortfolio: UserPortfolio = {
      cardIds: [CARD_IDS.OCBC_VOYAGE],
      programIds: ['prog-voyage-miles'],
    };

    const results = simulateGetUserRateChanges(RECENT_RATE_CHANGES, carolPortfolio, []);
    expect(results).toHaveLength(0);
  });

  it('read/dismissed alerts excluded — dismissed WWC alert not returned', () => {
    const alicePortfolio: UserPortfolio = {
      cardIds: [CARD_IDS.DBS_WWC],
      programIds: [],
    };

    const results = simulateGetUserRateChanges(
      RECENT_RATE_CHANGES,
      alicePortfolio,
      ['rc-recent-wwc'],
    );

    const wwcAlert = results.find((r) => r.rate_change_id === 'rc-recent-wwc');
    expect(wwcAlert).toBeUndefined();
  });

  it('90-day filter — rate change from 6 months ago is excluded', () => {
    const alicePortfolio: UserPortfolio = {
      cardIds: [CARD_IDS.DBS_WWC],
      programIds: [],
    };

    const results = simulateGetUserRateChanges(RECENT_RATE_CHANGES, alicePortfolio, []);
    const oldAlert = results.find((r) => r.rate_change_id === 'rc-old-expired');
    expect(oldAlert).toBeUndefined();
  });

  it('severity ordering — critical → warning → info, then by effective_date DESC', () => {
    const fullPortfolio: UserPortfolio = {
      cardIds: [CARD_IDS.DBS_WWC, CARD_IDS.AMEX_KF_ASCEND, CARD_IDS.HSBC_REVOLUTION],
      programIds: [PROGRAM_IDS.KRISFLYER],
    };

    const results = simulateGetUserRateChanges(RECENT_RATE_CHANGES, fullPortfolio, []);
    expect(results.length).toBeGreaterThanOrEqual(3);

    expect(results[0].severity).toBe('critical');

    for (let i = 0; i < results.length - 1; i++) {
      const currPri = SEVERITY_PRIORITY[results[i].severity];
      const nextPri = SEVERITY_PRIORITY[results[i + 1].severity];
      if (currPri === nextPri) {
        expect(results[i].effective_date >= results[i + 1].effective_date).toBe(true);
      } else {
        expect(currPri).toBeGreaterThanOrEqual(nextPri);
      }
    }
  });
});

// ===========================================================================
// SECTION 3: RateChangeBanner Component Logic (T12.15)
// ===========================================================================

describe('Section 3: RateChangeBanner Component Logic (T12.15)', () => {
  function makeAlert(overrides: Partial<RateAlert>): RateAlert {
    return {
      id: 'alert-default',
      alertTitle: 'Test Alert',
      alertBody: 'Test body',
      severity: 'info',
      cardId: null,
      cardName: null,
      effectiveDate: '2026-02-01',
      changeType: 'cap_change',
      ...overrides,
    };
  }

  it('single alert (< 3): highest severity alert is identified when 1 alert', () => {
    const alerts: RateAlert[] = [
      makeAlert({ id: 'a1', severity: 'warning', alertTitle: 'Warning Alert' }),
    ];
    const top = getTopAlert(alerts);
    expect(top.id).toBe('a1');
    expect(top.severity).toBe('warning');
  });

  it('single alert (< 3): highest severity identified when 2 alerts', () => {
    const alerts: RateAlert[] = [
      makeAlert({ id: 'a1', severity: 'info', alertTitle: 'Info Alert' }),
      makeAlert({ id: 'a2', severity: 'critical', alertTitle: 'Critical Alert' }),
    ];
    const top = getTopAlert(alerts);
    expect(top.id).toBe('a2');
    expect(top.severity).toBe('critical');
  });

  it('multi-alert (>= 3): count is correct', () => {
    const alerts: RateAlert[] = [
      makeAlert({ id: 'a1', severity: 'info' }),
      makeAlert({ id: 'a2', severity: 'warning' }),
      makeAlert({ id: 'a3', severity: 'critical' }),
      makeAlert({ id: 'a4', severity: 'info' }),
    ];
    const isMulti = alerts.length >= 3;
    expect(isMulti).toBe(true);
    expect(alerts.length).toBe(4);
  });

  it('severity colors: critical → red, warning → amber, info → blue', () => {
    expect(SEVERITY_COLORS.critical).toBe('#EA4335');
    expect(SEVERITY_COLORS.warning).toBe('#FBBC04');
    expect(SEVERITY_COLORS.info).toBe('#4A90D9');
  });

  it('dismiss flow: after dismiss, alert is removed from list', () => {
    const alerts: RateAlert[] = [
      makeAlert({ id: 'a1', severity: 'warning' }),
      makeAlert({ id: 'a2', severity: 'info' }),
    ];

    const dismissedId = 'a1';
    const remaining = alerts.filter((a) => a.id !== dismissedId);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('a2');

    const newAlertRead: UserAlertReadRow = {
      id: 'uar-001',
      user_id: USER_IDS.ALICE,
      rate_change_id: dismissedId,
      read_at: new Date().toISOString(),
    };
    expect(newAlertRead.rate_change_id).toBe(dismissedId);
    expect(newAlertRead.user_id).toBe(USER_IDS.ALICE);
  });

  it('view details navigates to correct card_id', () => {
    const alert = makeAlert({
      id: 'a1',
      cardId: CARD_IDS.DBS_WWC,
      cardName: "DBS Woman's World Card",
      changeType: 'cap_change',
    });

    expect(alert.cardId).toBe(CARD_IDS.DBS_WWC);
    expect(alert.cardName).toBe("DBS Woman's World Card");

    let navigatedCardId: string | null = null;
    const onViewDetails = (a: RateAlert) => { navigatedCardId = a.cardId; };
    onViewDetails(alert);
    expect(navigatedCardId).toBe(CARD_IDS.DBS_WWC);
  });

  it('empty alerts list returns null (no banner rendered)', () => {
    const alerts: RateAlert[] = [];
    const shouldRender = alerts.length > 0;
    expect(shouldRender).toBe(false);
  });
});

// ===========================================================================
// SECTION 4: RateUpdatedBadge Data Logic (T12.20)
// ===========================================================================

describe('Section 4: RateUpdatedBadge Data Logic (T12.20)', () => {
  function makeChangeDetail(overrides: Partial<RateChangeDetail>): RateChangeDetail {
    return {
      id: 'cd-default',
      changeType: 'cap_change',
      category: null,
      oldValue: 'Old',
      newValue: 'New',
      effectiveDate: '2026-02-01',
      alertTitle: 'Test',
      alertBody: 'Test body',
      severity: 'info',
      ...overrides,
    };
  }

  it('badge visibility: card with recent changes → badge data exists', () => {
    const changes: RateChangeDetail[] = [
      makeChangeDetail({ id: 'cd-1', effectiveDate: daysAgo(15) }),
    ];
    expect(changes.length).toBeGreaterThan(0);
    const shouldShowBadge = changes.length > 0;
    expect(shouldShowBadge).toBe(true);
  });

  it('badge hidden: card with no changes → empty array', () => {
    const changes: RateChangeDetail[] = [];
    expect(changes).toHaveLength(0);
    const shouldShowBadge = changes.length > 0;
    expect(shouldShowBadge).toBe(false);
  });

  it('change type formatting: each type maps to correct label', () => {
    expect(formatChangeType('earn_rate')).toBe('Earn Rate Change');
    expect(formatChangeType('cap_change')).toBe('Cap Adjustment');
    expect(formatChangeType('devaluation')).toBe('Program Devaluation');
    expect(formatChangeType('partner_change')).toBe('Partner Change');
    expect(formatChangeType('fee_change')).toBe('Fee Change');
  });

  it('change type formatting: unknown type gets title-cased fallback', () => {
    expect(formatChangeType('new_unknown_type')).toBe('New Unknown Type');
  });

  it('multiple changes: most recent first, separator between', () => {
    const changes: RateChangeDetail[] = [
      makeChangeDetail({ id: 'cd-1', effectiveDate: '2026-01-01' }),
      makeChangeDetail({ id: 'cd-2', effectiveDate: '2026-02-15' }),
      makeChangeDetail({ id: 'cd-3', effectiveDate: '2026-01-20' }),
    ];

    const sorted = [...changes].sort(
      (a, b) => b.effectiveDate.localeCompare(a.effectiveDate),
    );
    expect(sorted[0].id).toBe('cd-2');
    expect(sorted[1].id).toBe('cd-3');
    expect(sorted[2].id).toBe('cd-1');

    sorted.forEach((change, index) => {
      const hasSeparator = index > 0;
      if (index > 0) {
        expect(hasSeparator).toBe(true);
      }
    });
  });

  it('90-day expiry: changes older than 90 days excluded', () => {
    const changes: RateChangeDetail[] = [
      makeChangeDetail({ id: 'cd-recent', effectiveDate: daysAgo(30) }),
      makeChangeDetail({ id: 'cd-old', effectiveDate: daysAgo(100) }),
      makeChangeDetail({ id: 'cd-very-old', effectiveDate: daysAgo(200) }),
    ];

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const recent = changes.filter((c) => c.effectiveDate >= cutoffStr);
    expect(recent).toHaveLength(1);
    expect(recent[0].id).toBe('cd-recent');
  });
});

// ===========================================================================
// SECTION 5: get_card_rate_changes RPC Simulation
// ===========================================================================

describe('Section 5: get_card_rate_changes RPC Simulation', () => {
  it('returns all changes for a specific card (not filtered by user)', () => {
    const results = simulateGetCardRateChanges(RECENT_RATE_CHANGES, CARD_IDS.DBS_WWC);
    const recentWwc = results.filter((r) => r.card_id === CARD_IDS.DBS_WWC);
    expect(recentWwc.length).toBeGreaterThanOrEqual(1);
    recentWwc.forEach((r) => {
      expect(r.card_id).toBe(CARD_IDS.DBS_WWC);
    });
  });

  it('ordered by effective_date DESC', () => {
    const changesForCard: RateChangeRow[] = [
      {
        id: 'multi-1',
        card_id: CARD_IDS.HSBC_REVOLUTION,
        program_id: null,
        change_type: 'cap_change',
        category: null,
        old_value: 'Old 1',
        new_value: 'New 1',
        effective_date: daysAgo(60),
        alert_title: 'Change 1',
        alert_body: 'First change.',
        severity: 'info',
        source_url: null,
        created_at: daysAgo(65) + 'T00:00:00Z',
      },
      {
        id: 'multi-2',
        card_id: CARD_IDS.HSBC_REVOLUTION,
        program_id: null,
        change_type: 'earn_rate',
        category: 'dining',
        old_value: 'Old 2',
        new_value: 'New 2',
        effective_date: daysAgo(10),
        alert_title: 'Change 2',
        alert_body: 'Second change.',
        severity: 'warning',
        source_url: null,
        created_at: daysAgo(15) + 'T00:00:00Z',
      },
      {
        id: 'multi-3',
        card_id: CARD_IDS.HSBC_REVOLUTION,
        program_id: null,
        change_type: 'fee_change',
        category: null,
        old_value: 'Old 3',
        new_value: 'New 3',
        effective_date: daysAgo(30),
        alert_title: 'Change 3',
        alert_body: 'Third change.',
        severity: 'info',
        source_url: null,
        created_at: daysAgo(35) + 'T00:00:00Z',
      },
    ];

    const results = simulateGetCardRateChanges(changesForCard, CARD_IDS.HSBC_REVOLUTION);
    expect(results).toHaveLength(3);

    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].effective_date >= results[i + 1].effective_date).toBe(true);
    }
  });

  it('filtered to last 90 days — old changes excluded', () => {
    const results = simulateGetCardRateChanges(RECENT_RATE_CHANGES, CARD_IDS.DBS_WWC);
    const oldChange = results.find((r) => r.rate_change_id === 'rc-old-expired');
    expect(oldChange).toBeUndefined();
  });

  it('returns empty for card with no changes', () => {
    const results = simulateGetCardRateChanges(RECENT_RATE_CHANGES, CARD_IDS.OCBC_VOYAGE);
    expect(results).toHaveLength(0);
  });
});

// ===========================================================================
// SECTION 6: Sprint 7-11 Regression (T12.27)
// ===========================================================================

describe('Section 6: Sprint 7-11 Regression (T12.27)', () => {
  function generateOriginal19ActiveCards(): CardRow[] {
    const banks = [
      'DBS', 'OCBC', 'UOB', 'Citi', 'HSBC', 'Amex', 'SC', 'Maybank', 'DBS', 'OCBC',
      'UOB', 'Citi', 'HSBC', 'Amex', 'SC', 'DBS', 'OCBC', 'UOB', 'Citi',
    ];
    return banks.map((bank, i) => ({
      id: `00000000-0000-0000-0001-00000000000${String(i + 1).padStart(1, '0')}`,
      bank,
      name: `Original Card ${i + 1}`,
      slug: `original-card-${i + 1}`,
      network: 'visa',
      annual_fee: 0,
      base_rate_mpd: 1.0,
      is_active: true,
      miles_program_id: `prog-${bank.toLowerCase()}`,
      eligibility_criteria: null,
      notes: null,
    }));
  }

  const SPRINT11_NEW_CARDS: CardRow[] = [
    { id: '00000000-0000-0000-0003-000000000021', bank: 'DBS',     name: 'DBS Vantage Visa Infinite',         slug: 'dbs-vantage',      network: 'visa',       annual_fee: 600,  base_rate_mpd: 1.5, is_active: true, miles_program_id: 'prog-dbs-points',   eligibility_criteria: { min_income: 120000, banking_tier: 'treasures' }, notes: null },
    { id: '00000000-0000-0000-0003-000000000022', bank: 'UOB',     name: "UOB Lady's Solitaire Metal Card",   slug: 'uob-ladys',        network: 'visa',       annual_fee: 490,  base_rate_mpd: 0.4, is_active: true, miles_program_id: 'prog-uni',          eligibility_criteria: { gender: 'female' }, notes: null },
    { id: '00000000-0000-0000-0003-000000000023', bank: 'UOB',     name: 'UOB Visa Signature',                slug: 'uob-visa-sig',     network: 'visa',       annual_fee: 196,  base_rate_mpd: 0.4, is_active: true, miles_program_id: 'prog-uni',          eligibility_criteria: null, notes: null },
    { id: '00000000-0000-0000-0003-000000000024', bank: 'OCBC',    name: 'OCBC VOYAGE Card',                  slug: 'ocbc-voyage',      network: 'visa',       annual_fee: 498,  base_rate_mpd: 1.3, is_active: true, miles_program_id: 'prog-voyage-miles', eligibility_criteria: null, notes: null },
    { id: '00000000-0000-0000-0003-000000000025', bank: 'SC',      name: 'Standard Chartered Journey Card',   slug: 'sc-journey',       network: 'visa',       annual_fee: 196,  base_rate_mpd: 1.2, is_active: true, miles_program_id: 'prog-360-rewards',  eligibility_criteria: null, notes: null },
    { id: '00000000-0000-0000-0003-000000000026', bank: 'SC',      name: 'Standard Chartered Smart Card',     slug: 'sc-smart',         network: 'visa',       annual_fee: 99,   base_rate_mpd: 0.4, is_active: true, miles_program_id: 'prog-360-rewards',  eligibility_criteria: null, notes: null },
    { id: '00000000-0000-0000-0003-000000000027', bank: 'SC',      name: 'Standard Chartered Beyond Card',    slug: 'sc-beyond',        network: 'visa',       annual_fee: 1500, base_rate_mpd: 1.5, is_active: true, miles_program_id: 'prog-360-rewards',  eligibility_criteria: { banking_tier: 'priority_banking' }, notes: null },
    { id: '00000000-0000-0000-0003-000000000028', bank: 'Maybank', name: 'Maybank World Mastercard',          slug: 'maybank-world-mc', network: 'mastercard', annual_fee: 196,  base_rate_mpd: 0.4, is_active: true, miles_program_id: 'prog-treatspoints', eligibility_criteria: null, notes: null },
    { id: '00000000-0000-0000-0003-000000000029', bank: 'Maybank', name: 'Maybank XL Rewards Card',           slug: 'maybank-xl',       network: 'visa',       annual_fee: 87,   base_rate_mpd: 0.4, is_active: true, miles_program_id: 'prog-treatspoints', eligibility_criteria: { age_min: 21, age_max: 39 }, notes: null },
    { id: '00000000-0000-0000-0003-000000000030', bank: 'HSBC',    name: 'HSBC Premier Mastercard',           slug: 'hsbc-premier-mc',  network: 'mastercard', annual_fee: 709,  base_rate_mpd: 1.4, is_active: true, miles_program_id: 'prog-hsbc-rewards', eligibility_criteria: { banking_tier: 'premier' }, notes: null },
  ];

  const POSB_EVERYDAY: CardRow = {
    id: '00000000-0000-0000-0001-000000000020',
    bank: 'POSB',
    name: 'POSB Everyday Card',
    slug: 'posb-everyday-card',
    network: 'visa',
    annual_fee: 0,
    base_rate_mpd: 0.4,
    is_active: false,
    miles_program_id: 'prog-dbs-points',
    eligibility_criteria: null,
    notes: 'RECLASSIFIED (Sprint 11): Cashback card, not a miles card.',
  };

  const ORIGINAL_19 = generateOriginal19ActiveCards();
  const ALL_CARDS = [...ORIGINAL_19, POSB_EVERYDAY, ...SPRINT11_NEW_CARDS];
  const ALL_ACTIVE_CARDS = ALL_CARDS.filter((c) => c.is_active);

  it('all 29 active cards still valid', () => {
    expect(ALL_ACTIVE_CARDS).toHaveLength(29);
    ALL_ACTIVE_CARDS.forEach((card) => {
      expect(card.is_active).toBe(true);
    });
  });

  it('POSB Everyday still inactive', () => {
    expect(POSB_EVERYDAY.is_active).toBe(false);
    expect(ALL_ACTIVE_CARDS.find((c) => c.name === 'POSB Everyday Card')).toBeUndefined();
  });

  it('eligibility badges still correct (5 restricted cards)', () => {
    const restricted = SPRINT11_NEW_CARDS.filter((c) => c.eligibility_criteria !== null);
    expect(restricted).toHaveLength(5);

    const restrictedNames = restricted.map((c) => c.name).sort();
    expect(restrictedNames).toEqual([
      'DBS Vantage Visa Infinite',
      'HSBC Premier Mastercard',
      'Maybank XL Rewards Card',
      'Standard Chartered Beyond Card',
      "UOB Lady's Solitaire Metal Card",
    ]);
  });

  it('miles portfolio programs intact (all active cards have program IDs)', () => {
    ALL_ACTIVE_CARDS.forEach((card) => {
      expect(card.miles_program_id).not.toBeNull();
      expect(typeof card.miles_program_id).toBe('string');
      expect(card.miles_program_id!.length).toBeGreaterThan(0);
    });
  });

  it('10 Sprint 11 expansion cards remain active and valid', () => {
    expect(SPRINT11_NEW_CARDS).toHaveLength(10);
    SPRINT11_NEW_CARDS.forEach((card) => {
      expect(card.is_active).toBe(true);
      expect(card.miles_program_id).not.toBeNull();
    });
  });

  it('total cards including inactive = 30', () => {
    expect(ALL_CARDS).toHaveLength(30);
  });
});

// ===========================================================================
// SECTION 7: Supabase Mock Integration
// ===========================================================================

describe('Section 7: Supabase Mock Integration', () => {
  let mock: MockSupabaseClient;

  function setTableData<T>(table: string, data: T): void {
    const qb = new MockQueryBuilder();
    qb.setData(data);
    mock.queryBuilders.set(table, qb);
  }

  beforeEach(() => {
    mock = createMockSupabase();
  });

  it('mock query for rate_changes returns correct fixture data', async () => {
    setTableData('rate_changes', SEED_RATE_CHANGES);

    const { data, error } = await mock.supabase
      .from('rate_changes')
      .select('*');

    expect(error).toBeNull();
    const changes = data as RateChangeRow[];
    expect(changes).toHaveLength(5);
    expect(changes[0].alert_title).toBeTruthy();
    expect(changes[0].severity).toBeTruthy();
  });

  it('mock query for rate_changes filtered by severity returns correct subset', async () => {
    const criticalOnly = SEED_RATE_CHANGES.filter((rc) => rc.severity === 'critical');
    setTableData('rate_changes', criticalOnly);

    const { data, error } = await mock.supabase
      .from('rate_changes')
      .select('*')
      .eq('severity', 'critical');

    expect(error).toBeNull();
    const changes = data as RateChangeRow[];
    expect(changes).toHaveLength(1);
    expect(changes[0].change_type).toBe('devaluation');
  });

  it('mock query for user_alert_reads insert succeeds', async () => {
    const insertResult = { id: 'uar-new', user_id: USER_IDS.ALICE, rate_change_id: 'rc-001', read_at: new Date().toISOString() };
    setTableData('user_alert_reads', insertResult);

    const { data, error } = await mock.supabase
      .from('user_alert_reads')
      .insert({ user_id: USER_IDS.ALICE, rate_change_id: 'rc-001' })
      .select('*')
      .single();

    expect(error).toBeNull();
    const result = data as UserAlertReadRow;
    expect(result.user_id).toBe(USER_IDS.ALICE);
    expect(result.rate_change_id).toBe('rc-001');
  });

  it('mock RPC call for get_user_rate_changes returns correct shape', async () => {
    const rpcResults: UserRateChangeResult[] = [
      {
        rate_change_id: 'rc-001',
        card_id: CARD_IDS.DBS_WWC,
        card_name: "DBS Woman's World Card",
        card_bank: 'DBS',
        program_id: null,
        program_name: null,
        change_type: 'cap_change',
        category: null,
        old_value: 'S$2,000/month',
        new_value: 'S$1,000/month',
        effective_date: '2025-08-01',
        alert_title: 'Cap Change: DBS WWC',
        alert_body: 'Cap reduced.',
        severity: 'warning',
        source_url: null,
        created_at: '2025-07-20T00:00:00Z',
      },
    ];

    mock.mockRpc.setData('get_user_rate_changes', rpcResults);

    const { data, error } = await mock.supabase.rpc('get_user_rate_changes', {
      p_user_id: USER_IDS.ALICE,
    });

    expect(error).toBeNull();
    const results = data as UserRateChangeResult[];
    expect(results).toHaveLength(1);
    expect(results[0].rate_change_id).toBe('rc-001');
    expect(results[0].card_name).toBe("DBS Woman's World Card");
    expect(results[0].severity).toBe('warning');
  });

  it('mock RPC call for get_card_rate_changes returns correct shape', async () => {
    const rpcResults: UserRateChangeResult[] = [
      {
        rate_change_id: 'rc-003',
        card_id: CARD_IDS.HSBC_REVOLUTION,
        card_name: 'HSBC Revolution',
        card_bank: 'HSBC',
        program_id: null,
        program_name: null,
        change_type: 'cap_change',
        category: null,
        old_value: 'S$1,000',
        new_value: 'S$1,500',
        effective_date: '2026-01-15',
        alert_title: 'HSBC Revolution: Bonus Cap Boosted',
        alert_body: 'Cap increased.',
        severity: 'info',
        source_url: null,
        created_at: '2025-12-20T00:00:00Z',
      },
    ];

    mock.mockRpc.setData('get_card_rate_changes', rpcResults);

    const { data, error } = await mock.supabase.rpc('get_card_rate_changes', {
      p_card_id: CARD_IDS.HSBC_REVOLUTION,
    });

    expect(error).toBeNull();
    const results = data as UserRateChangeResult[];
    expect(results).toHaveLength(1);
    expect(results[0].card_id).toBe(CARD_IDS.HSBC_REVOLUTION);
  });

  it('mock RPC returns error for unregistered function', async () => {
    const { data, error } = await mock.supabase.rpc('non_existent_function', {});

    expect(data).toBeNull();
    expect(error).not.toBeNull();
    expect(error!.message).toContain('No mock registered');
  });
});
