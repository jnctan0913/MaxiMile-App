// =============================================================================
// MaxiMile — Demo Notification Context
// =============================================================================
// Provides centralized control for demo notification previews
// Manages notification queue to prevent overlapping
// ONLY active in demo mode
// =============================================================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import DemoNotificationPreview, {
  DemoNotificationPreviewProps,
} from '../components/DemoNotificationPreview';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NotificationConfig {
  id: string;
  type: 'critical' | 'warning' | 'positive' | 'multiple' | 'cap_approaching';
  title: string;
  body: string;
  onTap?: () => void;
  duration?: number;
  // Allow additional metadata fields (e.g., cardId, targetScreen) that won't be used for rendering
  [key: string]: any;
}

interface DemoNotificationContextValue {
  /** Show a demo notification */
  showDemoNotification: (config: Omit<NotificationConfig, 'id'>) => void;

  /** Manually dismiss the current notification */
  hideDemoNotification: () => void;

  /** Check if a notification is currently visible */
  isVisible: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const DemoNotificationContext = createContext<DemoNotificationContextValue | undefined>(
  undefined
);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function DemoNotificationProvider({ children }: { children: React.ReactNode }) {
  const [currentNotification, setCurrentNotification] = useState<NotificationConfig | null>(
    null
  );
  const [queue, setQueue] = useState<NotificationConfig[]>([]);
  const [notificationCounter, setNotificationCounter] = useState(0);

  // -------------------------------------------------------------------------
  // Show notification
  // -------------------------------------------------------------------------
  const showDemoNotification = useCallback(
    (config: Omit<NotificationConfig, 'id'>) => {
      const notification: NotificationConfig = {
        ...config,
        id: `notification-${notificationCounter}`,
      };

      setNotificationCounter((prev) => prev + 1);

      if (currentNotification) {
        // Queue it if one is already showing
        setQueue((prev) => [...prev, notification]);
      } else {
        // Show immediately
        setCurrentNotification(notification);
      }
    },
    [currentNotification, notificationCounter]
  );

  // -------------------------------------------------------------------------
  // Hide notification
  // -------------------------------------------------------------------------
  const hideDemoNotification = useCallback(() => {
    setCurrentNotification(null);

    // Show next notification in queue after 1 second delay
    if (queue.length > 0) {
      setTimeout(() => {
        const next = queue[0];
        setQueue((prev) => prev.slice(1));
        setCurrentNotification(next);
      }, 1000);
    }
  }, [queue]);

  // -------------------------------------------------------------------------
  // Handle notification dismiss
  // -------------------------------------------------------------------------
  const handleDismiss = useCallback(() => {
    hideDemoNotification();
    currentNotification?.onTap?.(); // Preserve onTap callback
  }, [hideDemoNotification, currentNotification]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const value: DemoNotificationContextValue = {
    showDemoNotification,
    hideDemoNotification,
    isVisible: currentNotification !== null,
  };

  return (
    <DemoNotificationContext.Provider value={value}>
      {children}

      {/* Render current notification */}
      {currentNotification && (
        <DemoNotificationPreview
          type={currentNotification.type}
          title={currentNotification.title}
          body={currentNotification.body}
          duration={currentNotification.duration}
          onTap={() => {
            currentNotification.onTap?.();
            hideDemoNotification();
          }}
          onDismiss={hideDemoNotification}
        />
      )}
    </DemoNotificationContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access demo notification controls
 * Must be used within a DemoNotificationProvider
 */
export function useDemoNotification(): DemoNotificationContextValue {
  const context = useContext(DemoNotificationContext);
  if (context === undefined) {
    throw new Error('useDemoNotification must be used within a DemoNotificationProvider');
  }
  return context;
}
