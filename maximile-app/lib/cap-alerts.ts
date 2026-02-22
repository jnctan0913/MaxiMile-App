/**
 * Cap Approaching Alerts (F6)
 * Sprint 20: Push Notifications - Complete System
 *
 * Monitors user spending against card caps and sends alerts when:
 * - 80% of cap reached (primary threshold)
 * - 90% of cap reached (optional)
 * - 100% cap exhausted (optional)
 *
 * Features:
 * - De-duplication (one alert per threshold per period)
 * - Alternative card suggestions
 * - Monthly period tracking
 * - Feature flag gating
 */

import { supabase } from './supabase';
import { buildCapApproachingNotification, triggerNotification } from './notification-triggers';
import { trackEvent } from './analytics';

// ============================================================================
// Types
// ============================================================================

export interface CapUsage {
  user_id: string;
  card_id: string;
  card_name: string;
  category_id: string;
  category_name: string;
  usage: number;
  limit: number;
  percentage: number;
  period_start: string;
}

export interface AlternativeCard {
  id: string;
  name: string;
  earn_rate: number;
  has_cap: boolean;
}

// ============================================================================
// Configuration
// ============================================================================

const ALERT_THRESHOLDS = [80, 90, 100]; // Percentage thresholds
const PRIMARY_THRESHOLD = 80; // Main alert threshold

// ============================================================================
// Feature Flag Check
// ============================================================================

/**
 * Check if cap alerts are enabled globally
 */
export async function isCapAlertsEnabled(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_feature_enabled', {
      p_flag_name: 'push_cap_alerts_enabled',
    });

    if (error) {
      console.error('Error checking cap alerts feature flag:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Exception checking cap alerts feature flag:', error);
    return false;
  }
}

// ============================================================================
// Cap Monitoring
// ============================================================================

/**
 * Get current month's start date
 */
function getCurrentPeriodStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Check if alert has already been sent for this threshold and period
 */
async function hasAlertBeenSent(
  userId: string,
  cardId: string,
  categoryId: string,
  threshold: number,
  periodStart: Date
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('cap_alert_tracking')
      .select('id')
      .eq('user_id', userId)
      .eq('card_id', cardId)
      .eq('category_id', categoryId)
      .eq('alert_threshold', threshold)
      .eq('period_start', periodStart.toISOString().split('T')[0])
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found
      console.error('Error checking alert tracking:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Exception checking alert tracking:', error);
    return false;
  }
}

/**
 * Record that an alert was sent
 */
async function recordAlertSent(
  userId: string,
  cardId: string,
  categoryId: string,
  threshold: number,
  periodStart: Date,
  usage: number,
  limit: number
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('record_cap_alert', {
      p_user_id: userId,
      p_card_id: cardId,
      p_category_id: categoryId,
      p_alert_threshold: threshold,
      p_period_start: periodStart.toISOString().split('T')[0],
      p_usage_at_alert: usage,
      p_cap_limit: limit,
    });

    if (error) {
      console.error('Error recording cap alert:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception recording cap alert:', error);
    return false;
  }
}

/**
 * Get cap usage for all user's cards
 */
export async function getCapUsage(userId: string): Promise<CapUsage[]> {
  try {
    // Get current period start
    const periodStart = getCurrentPeriodStart();
    const periodStartStr = periodStart.toISOString().split('T')[0];

    // Query cap status from database
    const { data, error } = await supabase
      .from('user_cards')
      .select(`
        id,
        card_id,
        user_id,
        cards!inner(
          id,
          name,
          earn_rules!inner(
            id,
            category_id,
            earn_rate,
            cap_amount,
            cap_period,
            categories!inner(id, name)
          )
        )
      `)
      .eq('user_id', userId)
      .not('cards.earn_rules.cap_amount', 'is', null);

    if (error) {
      console.error('Error fetching cap usage:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Calculate usage for each cap
    const capUsages: CapUsage[] = [];

    for (const userCard of data) {
      const card = userCard.cards as any;

      for (const earnRule of card.earn_rules) {
        if (!earnRule.cap_amount || earnRule.cap_period !== 'month') {
          continue;
        }

        const categoryId = earnRule.category_id;
        const capLimit = earnRule.cap_amount;

        // Get spending for this category this month
        const { data: transactions, error: txError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', userId)
          .eq('card_id', card.id)
          .eq('category_id', categoryId)
          .gte('transaction_date', periodStartStr);

        if (txError) {
          console.error('Error fetching transactions:', txError);
          continue;
        }

        const usage = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
        const percentage = Math.round((usage / capLimit) * 100);

        capUsages.push({
          user_id: userId,
          card_id: card.id,
          card_name: card.name,
          category_id: categoryId,
          category_name: earnRule.categories.name,
          usage,
          limit: capLimit,
          percentage,
          period_start: periodStartStr,
        });
      }
    }

    return capUsages;
  } catch (error) {
    console.error('Error getting cap usage:', error);
    return [];
  }
}

/**
 * Get alternative cards for a category (cards without caps or with remaining capacity)
 */
async function getAlternativeCards(
  userId: string,
  categoryId: string,
  excludeCardId: string
): Promise<AlternativeCard[]> {
  try {
    const { data, error } = await supabase
      .from('user_cards')
      .select(`
        id,
        card_id,
        cards!inner(
          id,
          name,
          earn_rules!inner(
            category_id,
            earn_rate,
            cap_amount
          )
        )
      `)
      .eq('user_id', userId)
      .eq('cards.earn_rules.category_id', categoryId)
      .neq('card_id', excludeCardId)
      .limit(3)
      .order('cards.earn_rules.earn_rate', { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((uc) => {
      const card = uc.cards as any;
      const earnRule = card.earn_rules[0];

      return {
        id: card.id,
        name: card.name,
        earn_rate: earnRule.earn_rate,
        has_cap: !!earnRule.cap_amount,
      };
    });
  } catch (error) {
    console.error('Error getting alternative cards:', error);
    return [];
  }
}

// ============================================================================
// Alert Triggering
// ============================================================================

/**
 * Check all caps for a user and send alerts if needed
 */
export async function checkCapAlerts(userId: string): Promise<void> {
  try {
    // Check global feature flag
    const enabled = await isCapAlertsEnabled();
    if (!enabled) {
      console.log('[Cap Alerts] Feature disabled, skipping');
      return;
    }

    // Get all cap usages
    const capUsages = await getCapUsage(userId);

    if (capUsages.length === 0) {
      console.log('[Cap Alerts] No caps found for user');
      return;
    }

    const periodStart = getCurrentPeriodStart();

    // Check each cap usage against thresholds
    for (const capUsage of capUsages) {
      // Find highest threshold that has been crossed
      let thresholdToAlert: number | null = null;

      for (const threshold of ALERT_THRESHOLDS) {
        if (capUsage.percentage >= threshold) {
          // Check if alert already sent
          const alreadySent = await hasAlertBeenSent(
            userId,
            capUsage.card_id,
            capUsage.category_id,
            threshold,
            periodStart
          );

          if (!alreadySent) {
            thresholdToAlert = threshold;
            break; // Send for highest threshold only
          }
        }
      }

      // Send alert if threshold crossed and not yet alerted
      if (thresholdToAlert) {
        await sendCapAlert(capUsage, thresholdToAlert, periodStart);
      }
    }
  } catch (error) {
    console.error('Error checking cap alerts:', error);
    trackEvent('cap_alert_check_error', {
      error: error instanceof Error ? error.message : 'Unknown',
    });
  }
}

/**
 * Send a cap approaching alert
 */
async function sendCapAlert(
  capUsage: CapUsage,
  threshold: number,
  periodStart: Date
): Promise<void> {
  try {
    // Build notification payload
    const payload = buildCapApproachingNotification(
      capUsage.user_id,
      capUsage.card_name,
      capUsage.card_id,
      capUsage.category_name,
      capUsage.usage,
      capUsage.limit,
      threshold
    );

    // Get alternative cards
    const alternatives = await getAlternativeCards(
      capUsage.user_id,
      capUsage.category_id,
      capUsage.card_id
    );

    // Add alternatives to notification data
    if (alternatives.length > 0) {
      payload.data = {
        ...payload.data,
        alternatives: alternatives.map((a) => ({
          id: a.id,
          name: a.name,
          rate: a.earn_rate,
        })),
      };

      // Update body to suggest alternatives
      payload.body += ` Try ${alternatives[0].name} instead (${alternatives[0].earn_rate}x).`;
    }

    // Trigger notification
    const sent = await triggerNotification(payload);

    if (sent) {
      // Record that alert was sent
      await recordAlertSent(
        capUsage.user_id,
        capUsage.card_id,
        capUsage.category_id,
        threshold,
        periodStart,
        capUsage.usage,
        capUsage.limit
      );

      trackEvent('cap_alert_sent', {
        card_id: capUsage.card_id,
        category_id: capUsage.category_id,
        threshold,
        percentage: capUsage.percentage,
      });

      console.log(
        `[Cap Alert] Sent ${threshold}% alert for ${capUsage.card_name} - ${capUsage.category_name}`
      );
    }
  } catch (error) {
    console.error('Error sending cap alert:', error);
    trackEvent('cap_alert_send_error', {
      error: error instanceof Error ? error.message : 'Unknown',
    });
  }
}

// ============================================================================
// Manual Trigger (for testing)
// ============================================================================

/**
 * Manually trigger a test cap alert (for development/testing)
 */
export async function sendTestCapAlert(
  userId: string,
  cardName: string = 'Test Card',
  categoryName: string = 'Dining'
): Promise<boolean> {
  const payload = buildCapApproachingNotification(
    userId,
    cardName,
    'test-card-id',
    categoryName,
    800,
    1000,
    80
  );

  payload.data = {
    ...payload.data,
    isTest: true,
  };

  return await triggerNotification(payload);
}

// ============================================================================
// Background Job Entry Point
// ============================================================================

/**
 * Background job to check cap alerts for all active users
 * This should be called daily by a cron job or Edge Function
 */
export async function checkCapAlertsForAllUsers(): Promise<void> {
  try {
    console.log('[Cap Alerts] Starting daily check for all users');

    // Get all users with push notifications enabled
    const { data: users, error } = await supabase
      .from('push_tokens')
      .select('user_id')
      .eq('push_enabled', true)
      .eq('push_permission_status', 'granted');

    if (error) {
      console.error('Error fetching users for cap alerts:', error);
      return;
    }

    if (!users || users.length === 0) {
      console.log('[Cap Alerts] No users with push enabled');
      return;
    }

    console.log(`[Cap Alerts] Checking ${users.length} users`);

    // Check each user
    for (const user of users) {
      await checkCapAlerts(user.user_id);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log('[Cap Alerts] Daily check complete');
  } catch (error) {
    console.error('Error in cap alerts background job:', error);
  }
}
