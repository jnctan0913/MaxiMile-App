import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';

/**
 * Auth group layout — Stack navigator for login and signup screens.
 * Shown only when the user is not authenticated.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
