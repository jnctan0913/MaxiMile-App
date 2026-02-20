// =============================================================================
// MaxiMile -- Centralized Error Handler
// =============================================================================
// Provides user-friendly error messages from Supabase errors, network errors,
// and other runtime failures. Used across all screens for consistent UX.
// =============================================================================

import { Alert, Platform } from 'react-native';
import { AuthError, PostgrestError } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Error classification
// ---------------------------------------------------------------------------

export type ErrorCategory =
  | 'network'
  | 'auth_expired'
  | 'auth_invalid'
  | 'rls_violation'
  | 'constraint_violation'
  | 'not_found'
  | 'rate_limit'
  | 'server'
  | 'unknown';

interface ParsedError {
  category: ErrorCategory;
  userMessage: string;
  technicalMessage: string;
}

// ---------------------------------------------------------------------------
// Supabase error → user-friendly message
// ---------------------------------------------------------------------------

/**
 * Takes a Supabase PostgrestError and returns a user-friendly message string.
 * Also logs the technical error for debugging.
 */
export function handleSupabaseError(error: PostgrestError | null): string {
  if (!error) return '';

  const parsed = parsePostgrestError(error);
  logError(parsed.category, parsed.technicalMessage);
  return parsed.userMessage;
}

/**
 * Takes a Supabase AuthError and returns a user-friendly message string.
 */
export function handleAuthError(error: AuthError | null): string {
  if (!error) return '';

  const parsed = parseAuthError(error);
  logError(parsed.category, parsed.technicalMessage);
  return parsed.userMessage;
}

/**
 * Handles any unknown error (network failures, runtime errors, etc.)
 * and returns a user-friendly message string.
 */
export function handleGenericError(error: unknown): string {
  const parsed = parseGenericError(error);
  logError(parsed.category, parsed.technicalMessage);
  return parsed.userMessage;
}

// ---------------------------------------------------------------------------
// Parsing functions
// ---------------------------------------------------------------------------

function parsePostgrestError(error: PostgrestError): ParsedError {
  const code = error.code;
  const message = error.message?.toLowerCase() ?? '';
  const details = error.details?.toLowerCase() ?? '';

  // Network / connectivity
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return {
      category: 'network',
      userMessage: 'Unable to connect. Please check your internet and try again.',
      technicalMessage: `Network error: ${error.message}`,
    };
  }

  // RLS violation (insufficient permissions)
  if (code === '42501' || message.includes('rls') || message.includes('policy')) {
    return {
      category: 'rls_violation',
      userMessage: 'You do not have permission to perform this action. Please sign in again.',
      technicalMessage: `RLS violation: ${error.message}`,
    };
  }

  // Unique constraint violation
  if (code === '23505') {
    if (message.includes('user_cards') || details.includes('user_cards')) {
      return {
        category: 'constraint_violation',
        userMessage: 'This card is already in your portfolio.',
        technicalMessage: `Duplicate user_card: ${error.message}`,
      };
    }
    return {
      category: 'constraint_violation',
      userMessage: 'This record already exists.',
      technicalMessage: `Unique constraint: ${error.message}`,
    };
  }

  // Foreign key violation
  if (code === '23503') {
    return {
      category: 'constraint_violation',
      userMessage: 'The referenced item no longer exists. Please refresh and try again.',
      technicalMessage: `FK violation: ${error.message}`,
    };
  }

  // Check constraint violation
  if (code === '23514') {
    if (message.includes('amount_positive') || message.includes('amount')) {
      return {
        category: 'constraint_violation',
        userMessage: 'Please enter a valid amount greater than zero.',
        technicalMessage: `Check constraint: ${error.message}`,
      };
    }
    return {
      category: 'constraint_violation',
      userMessage: 'Invalid data. Please check your input and try again.',
      technicalMessage: `Check constraint: ${error.message}`,
    };
  }

  // Not found
  if (code === 'PGRST116' || message.includes('not found') || message.includes('no rows')) {
    return {
      category: 'not_found',
      userMessage: 'The requested item was not found.',
      technicalMessage: `Not found: ${error.message}`,
    };
  }

  // Rate limit
  if (code === '429' || message.includes('rate limit') || message.includes('too many')) {
    return {
      category: 'rate_limit',
      userMessage: 'Too many requests. Please wait a moment and try again.',
      technicalMessage: `Rate limit: ${error.message}`,
    };
  }

  // Generic server error
  return {
    category: 'server',
    userMessage: 'Something went wrong. Please try again later.',
    technicalMessage: `Supabase error [${code}]: ${error.message}`,
  };
}

function parseAuthError(error: AuthError): ParsedError {
  const message = error.message?.toLowerCase() ?? '';
  const status = error.status;

  // Session expired / invalid token
  if (
    message.includes('expired') ||
    message.includes('invalid token') ||
    message.includes('jwt') ||
    status === 401
  ) {
    return {
      category: 'auth_expired',
      userMessage: 'Your session has expired. Please sign in again.',
      technicalMessage: `Auth expired: ${error.message}`,
    };
  }

  // Invalid credentials
  if (
    message.includes('invalid login') ||
    message.includes('invalid password') ||
    message.includes('invalid email') ||
    message.includes('no user found')
  ) {
    return {
      category: 'auth_invalid',
      userMessage: 'Invalid email or password. Please try again.',
      technicalMessage: `Auth invalid: ${error.message}`,
    };
  }

  // Email already registered
  if (message.includes('already registered') || message.includes('already exists')) {
    return {
      category: 'constraint_violation',
      userMessage: 'An account with this email already exists. Please sign in instead.',
      technicalMessage: `Auth duplicate: ${error.message}`,
    };
  }

  // Rate limit on auth
  if (message.includes('rate limit') || status === 429) {
    return {
      category: 'rate_limit',
      userMessage: 'Too many sign-in attempts. Please wait a moment and try again.',
      technicalMessage: `Auth rate limit: ${error.message}`,
    };
  }

  // Network
  if (message.includes('fetch') || message.includes('network')) {
    return {
      category: 'network',
      userMessage: 'Unable to connect. Please check your internet and try again.',
      technicalMessage: `Auth network: ${error.message}`,
    };
  }

  return {
    category: 'unknown',
    userMessage: error.message || 'Authentication failed. Please try again.',
    technicalMessage: `Auth error [${status}]: ${error.message}`,
  };
}

function parseGenericError(error: unknown): ParsedError {
  if (error instanceof TypeError && error.message?.includes('fetch')) {
    return {
      category: 'network',
      userMessage: 'Unable to connect. Please check your internet and try again.',
      technicalMessage: `Network TypeError: ${error.message}`,
    };
  }

  if (error instanceof Error) {
    return {
      category: 'unknown',
      userMessage: 'Something went wrong. Please try again.',
      technicalMessage: `Error: ${error.message}`,
    };
  }

  return {
    category: 'unknown',
    userMessage: 'An unexpected error occurred. Please try again.',
    technicalMessage: `Unknown error: ${String(error)}`,
  };
}

// ---------------------------------------------------------------------------
// Alert helpers
// ---------------------------------------------------------------------------

/**
 * Shows a native alert with a user-friendly error message.
 * Optionally includes a retry callback.
 */
export function showErrorAlert(
  message: string,
  options?: {
    title?: string;
    onRetry?: () => void;
  }
): void {
  const title = options?.title ?? 'Error';
  const buttons: Array<{ text: string; style?: 'cancel' | 'destructive' | 'default'; onPress?: () => void }> = [];

  if (options?.onRetry) {
    buttons.push({ text: 'Cancel', style: 'cancel' });
    buttons.push({ text: 'Retry', onPress: options.onRetry });
  } else {
    buttons.push({ text: 'OK' });
  }

  Alert.alert(title, message, buttons);
}

/**
 * Shows a network error alert with a retry option.
 */
export function showNetworkErrorAlert(onRetry?: () => void): void {
  showErrorAlert(
    'Unable to connect. Please check your internet connection and try again.',
    {
      title: 'Connection Error',
      onRetry,
    }
  );
}

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

function logError(category: ErrorCategory, technicalMessage: string): void {
  if (__DEV__) {
    console.error(`[MaxiMile Error] [${category}] ${technicalMessage}`);
  }
  // In production, this could send to Sentry, Crashlytics, etc.
}
