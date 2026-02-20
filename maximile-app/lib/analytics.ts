// =============================================================================
// MaxiMile — Analytics Instrumentation (T4.07)
// =============================================================================
// Lightweight analytics module for tracking key events locally.
// Events are buffered in AsyncStorage and can be extended to send to
// Mixpanel, Amplitude, or a custom Supabase analytics_events table.
//
// North Star Metric: MARU (Monthly Active Recommendations Used)
// Key Events: card_added, recommendation_used, transaction_logged, screen_view
// =============================================================================

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Web-safe storage wrapper (AsyncStorage breaks during SSR)
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    }
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
      return;
    }
    return AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.removeItem(key);
      return;
    }
    return AsyncStorage.removeItem(key);
  },
};

// ---------------------------------------------------------------------------
// Event Types
// ---------------------------------------------------------------------------

export type AnalyticsEvent =
  | 'card_added'
  | 'card_removed'
  | 'recommendation_used'
  | 'transaction_logged'
  | 'screen_view'
  | 'onboarding_completed'
  | 'feedback_submitted'
  | 'sign_in'
  | 'sign_up'
  | 'sign_out'
  | 'pay_flow_started'
  | 'pay_flow_error'
  | 'pay_flow_abandoned'
  | 'location_detected'
  | 'merchant_detected'
  | 'merchant_confirmed'
  | 'wallet_opened'
  | 'pay_transaction_logged'
  | 'onboarding_miles_view'
  | 'onboarding_miles_save'
  | 'onboarding_miles_skip'
  | 'redemption_logged'
  | 'goal_created'
  | 'goal_deleted'
  | 'rate_alert_dismissed'
  | 'rate_alert_viewed';

export interface AnalyticsPayload {
  event: AnalyticsEvent;
  properties?: Record<string, string | number | boolean | null>;
  timestamp: string;
  userId?: string;
}

// ---------------------------------------------------------------------------
// Storage Keys
// ---------------------------------------------------------------------------

const ANALYTICS_BUFFER_KEY = '@maximile_analytics_buffer';
const MARU_KEY = '@maximile_maru'; // Monthly Active Recommendations Used

// ---------------------------------------------------------------------------
// Core API
// ---------------------------------------------------------------------------

/**
 * Track an analytics event. Buffers locally in AsyncStorage.
 *
 * @param event  - The event name (e.g. 'recommendation_used')
 * @param properties - Optional key-value properties for the event
 * @param userId - Optional user ID to associate with the event
 */
export async function track(
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean | null>,
  userId?: string
): Promise<void> {
  try {
    const payload: AnalyticsPayload = {
      event,
      properties,
      timestamp: new Date().toISOString(),
      userId,
    };

    // Append to local buffer
    const existing = await storage.getItem(ANALYTICS_BUFFER_KEY);
    const buffer: AnalyticsPayload[] = existing ? JSON.parse(existing) : [];
    buffer.push(payload);

    // Keep buffer capped at 500 events to prevent storage bloat
    const trimmed = buffer.length > 500 ? buffer.slice(-500) : buffer;
    await storage.setItem(ANALYTICS_BUFFER_KEY, JSON.stringify(trimmed));

    // Track MARU separately for the north star metric
    if (event === 'recommendation_used') {
      await incrementMARU();
    }

    if (__DEV__) {
      console.log(`[Analytics] ${event}`, properties ?? '');
    }
  } catch {
    // Analytics should never crash the app
    if (__DEV__) {
      console.warn('[Analytics] Failed to track event:', event);
    }
  }
}

// ---------------------------------------------------------------------------
// MARU Tracking (North Star Metric)
// ---------------------------------------------------------------------------

interface MARUData {
  month: string;   // YYYY-MM
  count: number;   // Number of recommendations used this month
  userIds: string[]; // Unique user IDs (for MAU)
}

async function incrementMARU(): Promise<void> {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const existing = await storage.getItem(MARU_KEY);
    const data: MARUData = existing
      ? JSON.parse(existing)
      : { month: currentMonth, count: 0, userIds: [] };

    // Reset if new month
    if (data.month !== currentMonth) {
      data.month = currentMonth;
      data.count = 0;
      data.userIds = [];
    }

    data.count += 1;
    await storage.setItem(MARU_KEY, JSON.stringify(data));
  } catch {
    // Silent fail
  }
}

/**
 * Get the current month's MARU count.
 */
export async function getMARU(): Promise<number> {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const existing = await storage.getItem(MARU_KEY);
    if (!existing) return 0;

    const data: MARUData = JSON.parse(existing);
    return data.month === currentMonth ? data.count : 0;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Buffer Management
// ---------------------------------------------------------------------------

/**
 * Get all buffered events (for future sync to backend).
 */
export async function getBufferedEvents(): Promise<AnalyticsPayload[]> {
  try {
    const existing = await storage.getItem(ANALYTICS_BUFFER_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch {
    return [];
  }
}

/**
 * Clear all buffered events (call after successful sync).
 */
export async function clearBuffer(): Promise<void> {
  try {
    await storage.removeItem(ANALYTICS_BUFFER_KEY);
  } catch {
    // Silent fail
  }
}

/**
 * Get the count of buffered events.
 */
export async function getBufferCount(): Promise<number> {
  const events = await getBufferedEvents();
  return events.length;
}
