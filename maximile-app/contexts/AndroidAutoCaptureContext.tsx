// =============================================================================
// MaxiMile — Android Auto-Capture Context (S17.3)
// =============================================================================
// Manages Android notification listener state and integrates with auto-capture flow.
// Automatically starts listening when permission granted.
// =============================================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { notificationListener, BankingNotification } from '../lib/notification-listener';
import { parseNotification } from '../lib/notification-parsers';

interface AndroidAutoCaptureContextType {
  isEnabled: boolean;
  hasPermission: boolean;
  checkPermission: () => Promise<void>;
  startListening: () => Promise<void>;
  stopListening: () => void;
}

const AndroidAutoCaptureContext = createContext<AndroidAutoCaptureContextType | undefined>(
  undefined
);

export function AndroidAutoCaptureProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Check permission status on mount
  useEffect(() => {
    checkPermission();
  }, []);

  // Auto-start listening when permission granted
  useEffect(() => {
    if (hasPermission && !isEnabled) {
      startListening();
    }
  }, [hasPermission]);

  const checkPermission = async () => {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      const status = await notificationListener.hasPermission();
      setHasPermission(status);
    } catch (error) {
      console.error('[AndroidAutoCapture] Error checking permission:', error);
    }
  };

  const startListening = async () => {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      await notificationListener.startListening(handleNotification);
      setIsEnabled(true);
      console.log('[AndroidAutoCapture] Started listening');
    } catch (error) {
      console.error('[AndroidAutoCapture] Error starting listener:', error);
      setIsEnabled(false);
    }
  };

  const stopListening = () => {
    notificationListener.stopListening();
    setIsEnabled(false);
    console.log('[AndroidAutoCapture] Stopped listening');
  };

  const handleNotification = (notification: BankingNotification) => {
    console.log('[AndroidAutoCapture] Received notification:', notification);

    // Parse the notification
    const parsed = parseNotification(notification.packageName, notification.text);

    if (!parsed || !parsed.success) {
      console.warn('[AndroidAutoCapture] Failed to parse notification');
      return;
    }

    console.log('[AndroidAutoCapture] Parsed transaction:', parsed);

    // Navigate to auto-capture confirmation screen with pre-filled data
    // Using the same deep link format as iOS auto-capture for consistency
    const params = new URLSearchParams({
      amount: parsed.amount.toString(),
      merchant: parsed.merchant,
      card: parsed.cardLast4, // Will be matched to user's portfolio cards
      source: 'notification',
    });

    // Navigate to the confirmation screen
    // Note: This assumes the auto-capture confirmation screen exists from Sprint 16
    router.push(`/(tabs)/log?${params.toString()}`);
  };

  return (
    <AndroidAutoCaptureContext.Provider
      value={{
        isEnabled,
        hasPermission,
        checkPermission,
        startListening,
        stopListening,
      }}
    >
      {children}
    </AndroidAutoCaptureContext.Provider>
  );
}

export function useAndroidAutoCapture() {
  const context = useContext(AndroidAutoCaptureContext);
  if (context === undefined) {
    throw new Error('useAndroidAutoCapture must be used within AndroidAutoCaptureProvider');
  }
  return context;
}
