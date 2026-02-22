// =============================================================================
// MaxiMile — Demo Notification Content Library
// =============================================================================
// Pre-defined notification content for easy demo triggering
// Follows iOS notification copy best practices
// =============================================================================

import { DemoNotificationPreviewProps } from '../components/DemoNotificationPreview';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DemoNotificationConfig {
  type: DemoNotificationPreviewProps['type'];
  title: string;
  body: string;
  cardId?: string;
  targetScreen?: 'CardDetail' | 'RateChangesList' | 'CapStatus' | 'AutoCaptureReview';
}

// ---------------------------------------------------------------------------
// Demo Notification Library
// ---------------------------------------------------------------------------

export const DEMO_NOTIFICATIONS = {
  // -------------------------------------------------------------------------
  // Rate Change Notifications
  // -------------------------------------------------------------------------
  rateChange: {
    critical: {
      type: 'critical' as const,
      title: '⚠️ Your Amex KrisFlyer: Major Change',
      body: 'Transfer rate to KrisFlyer dropped 33%. Tap to see better alternatives.',
      cardId: 'amex-krisflyer',
      targetScreen: 'CardDetail' as const,
    },
    warning: {
      type: 'warning' as const,
      title: "⚠️ DBS Woman's World: Cap Reduced",
      body: "Bonus cap cut from $2,000 to $1,000/month starting Aug 1. Review your strategy.",
      cardId: 'dbs-womans-world',
      targetScreen: 'CardDetail' as const,
    },
    positive: {
      type: 'positive' as const,
      title: '✨ HSBC Revolution: Cap Increased',
      body: 'Great news! Monthly bonus cap boosted to $1,500. You can now earn 4 mpd on 50% more.',
      cardId: 'hsbc-revolution',
      targetScreen: 'CardDetail' as const,
    },
    multiple: {
      type: 'multiple' as const,
      title: '📢 3 Rate Changes This Week',
      body: 'DBS, OCBC, and Citi changed earn rates. Review changes to keep maximizing miles.',
      targetScreen: 'RateChangesList' as const,
    },
  },

  // -------------------------------------------------------------------------
  // Cap Approaching Alert (Future F6)
  // -------------------------------------------------------------------------
  capApproaching: {
    type: 'cap_approaching' as const,
    title: '📊 Groceries cap: 80% used',
    body: 'You have $400 left. Switch cards for better rates.',
    cardId: 'dbs-womans-world',
    targetScreen: 'CapStatus' as const,
  },

  capApproachingDBS: {
    type: 'cap_approaching' as const,
    title: '📊 DBS WWC Cap Alert',
    body: "You've used $800 of your $1,000 bonus cap. Switch cards after $1,000 to keep earning.",
    cardId: 'dbs-womans-world',
    targetScreen: 'CapStatus' as const,
  },

  // -------------------------------------------------------------------------
  // Auto-Capture Transaction Captured
  // -------------------------------------------------------------------------
  autoCapture: {
    type: 'positive' as const,
    title: '🔔 Transaction Captured',
    body: 'Starbucks $5.47 logged. Review and confirm to earn miles.',
    targetScreen: 'AutoCaptureReview' as const,
  },

  autoCaptureGrocery: {
    type: 'positive' as const,
    title: '🔔 Transaction Captured',
    body: 'Whole Foods $47.23 logged. Review and confirm to earn miles.',
    targetScreen: 'AutoCaptureReview' as const,
  },

  autoCaptureGas: {
    type: 'positive' as const,
    title: '🔔 Transaction Captured',
    body: 'Shell $52.18 logged. Review and confirm to earn miles.',
    targetScreen: 'AutoCaptureReview' as const,
  },
} as const;

// ---------------------------------------------------------------------------
// Demo Sequences (for comprehensive presentations)
// ---------------------------------------------------------------------------

export interface DemoSequenceStep {
  notification: DemoNotificationConfig;
  delay: number; // milliseconds after sequence start
}

/**
 * Full Feature Showcase Sequence
 * Duration: ~30 seconds
 * Shows all notification types
 */
export const FEATURE_SHOWCASE_SEQUENCE: DemoSequenceStep[] = [
  { notification: DEMO_NOTIFICATIONS.rateChange.critical, delay: 0 },
  { notification: DEMO_NOTIFICATIONS.capApproaching, delay: 6000 },
  { notification: DEMO_NOTIFICATIONS.rateChange.warning, delay: 12000 },
  { notification: DEMO_NOTIFICATIONS.autoCapture, delay: 18000 },
  { notification: DEMO_NOTIFICATIONS.rateChange.positive, delay: 24000 },
];

/**
 * Rate Change Demo Sequence
 * Duration: ~18 seconds
 * Shows severity progression (critical → warning → positive)
 */
export const RATE_CHANGE_DEMO_SEQUENCE: DemoSequenceStep[] = [
  { notification: DEMO_NOTIFICATIONS.rateChange.critical, delay: 0 },
  { notification: DEMO_NOTIFICATIONS.rateChange.warning, delay: 6000 },
  { notification: DEMO_NOTIFICATIONS.rateChange.positive, delay: 12000 },
];

/**
 * Auto-Capture Demo Sequence
 * Duration: ~12 seconds
 * Shows transaction capture flow
 */
export const AUTO_CAPTURE_DEMO_SEQUENCE: DemoSequenceStep[] = [
  { notification: DEMO_NOTIFICATIONS.autoCapture, delay: 0 },
  { notification: DEMO_NOTIFICATIONS.autoCaptureGrocery, delay: 6000 },
];

// ---------------------------------------------------------------------------
// Helper: Play a notification sequence
// ---------------------------------------------------------------------------

export function playNotificationSequence(
  sequence: DemoSequenceStep[],
  onNotification: (notification: DemoNotificationConfig) => void
): () => void {
  const timers: NodeJS.Timeout[] = [];

  sequence.forEach((step) => {
    const timer = setTimeout(() => {
      onNotification(step.notification);
    }, step.delay);
    timers.push(timer);
  });

  // Return cleanup function
  return () => {
    timers.forEach((timer) => clearTimeout(timer));
  };
}
