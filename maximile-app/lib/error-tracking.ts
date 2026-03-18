// =============================================================================
// MaxiMile — Error Tracking (Supabase-native crash reporting)
// =============================================================================
// Logs client-side errors to the error_events table in Supabase.
// Replaces Firebase Crashlytics with a single-system approach.
// =============================================================================

import { Platform } from 'react-native';
import { supabase } from './supabase';
import { restInsert, useDirectRest } from './supabase-rest';

interface ErrorReport {
  error_type: string;
  message: string;
  stack_trace?: string;
  screen?: string;
  platform?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an error to the Supabase error_events table.
 * Fire-and-forget — never throws.
 */
export async function logError(report: ErrorReport): Promise<void> {
  try {
    const row = {
      error_type: report.error_type,
      message: report.message.slice(0, 2000),
      stack_trace: report.stack_trace?.slice(0, 5000) ?? null,
      screen: report.screen ?? null,
      platform: report.platform ?? Platform.OS,
      metadata: report.metadata ?? {},
    };

    if (useDirectRest) {
      await restInsert('error_events', row);
    } else {
      await supabase.from('error_events').insert(row);
    }
  } catch {
    // Error tracking should never crash the app
    if (__DEV__) {
      console.warn('[ErrorTracking] Failed to log error:', report.error_type);
    }
  }
}

/**
 * Log an API/Supabase error.
 */
export function logApiError(
  endpoint: string,
  error: { message?: string; code?: string; status?: number },
  screen?: string,
): void {
  logError({
    error_type: 'api_error',
    message: `${endpoint}: ${error.message ?? 'Unknown error'}`,
    metadata: { endpoint, code: error.code, status: error.status },
    screen,
  });
}

/**
 * Log an unhandled JS error.
 */
export function logJsError(error: Error, screen?: string): void {
  logError({
    error_type: 'js_error',
    message: error.message,
    stack_trace: error.stack,
    screen,
  });
}
