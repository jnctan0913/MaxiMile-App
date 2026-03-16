import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Stack, SplashScreen, useRouter, useSegments } from 'expo-router';
import { trackEvent } from '../lib/analytics';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Linking from 'expo-linking';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { AndroidAutoCaptureProvider } from '../contexts/AndroidAutoCaptureContext';
import { DemoNotificationProvider } from '../contexts/DemoNotificationContext';
import { Colors } from '../constants/theme';
import { parseAutoCaptureUrl } from '../lib/deep-link';
import { flushBufferedEvents } from '../lib/analytics';

// Prevent the splash screen from auto-hiding before auth state is resolved
SplashScreen.preventAutoHideAsync();

/**
 * Custom back button rendered in the Stack header on all platforms.
 * Replaces the system back button (which is unreliable on iOS simulator)
 * and the icon-dependent web back button with a consistent plain-text button.
 */
function BackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4 }}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Text style={{ color: Colors.brandGold, fontSize: 16, fontWeight: '600' }}>
        ← Back
      </Text>
    </TouchableOpacity>
  );
}

/**
 * Root layout — wraps the entire app with global providers.
 */
export default function RootLayout() {
  // On native: load icon font via expo-font (native bundles don't auto-include it).
  // On web: +html.tsx injects @font-face with font-display:block from /fonts/Ionicons.ttf
  //         (a clean path with no @ character that caused 404s on Vercel CDN).
  //         useFonts is still called so Font.isLoaded('ionicons') returns true,
  //         which the icon component checks before rendering glyphs.
  // On web the font is loaded via the @font-face in +html.tsx (/fonts/Ionicons.ttf).
  // Passing an empty object resolves immediately without attempting to load the
  // hashed /assets/node_modules/... path, which breaks on Vercel CDN because the
  // '@' character in the path causes the CDN to return an HTML error page.
  const [fontsLoaded] = useFonts(Platform.OS === 'web' ? {} : { ...Ionicons.font });

  // On web, additionally wait for the browser to actually download the font bytes.
  // useFonts resolves immediately on Safari/Firefox (expo-font skips FontObserver
  // on those browsers), so we gate on document.fonts.load() which uses the
  // /fonts/Ionicons.ttf @font-face declared in +html.tsx.
  const [webFontsReady, setWebFontsReady] = useState(Platform.OS !== 'web');
  useEffect(() => {
    if (Platform.OS !== 'web' || !fontsLoaded) return;
    if (typeof document !== 'undefined' && document.fonts?.load) {
      document.fonts.load('1em ionicons')
        .then(() => setWebFontsReady(true))
        .catch(() => setWebFontsReady(true));
    } else {
      setWebFontsReady(true);
    }
  }, [fontsLoaded]);

  // Keep the splash screen up until fonts are ready.
  if (!fontsLoaded || !webFontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <DemoNotificationProvider>
            <AndroidAutoCaptureProvider>
              <RootContent />
            </AndroidAutoCaptureProvider>
          </DemoNotificationProvider>
        </AuthProvider>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Inner component that lives inside AuthProvider so it can call useAuth().
 * Shows an animated branded loading screen while auth state resolves,
 * then fades out to reveal the app.
 */
function RootContent() {
  const { loading } = useAuth();
  const router = useRouter();

  // Animations
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const shimmerOpacity = useRef(new Animated.Value(0.3)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  // Entrance animation: logo fades in and scales up
  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    // Subtle shimmer pulse on the logo
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerOpacity, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shimmerOpacity, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, []);

  const segments = useSegments();

  // Fade out the loading overlay once auth resolves + flush buffered analytics
  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
      flushBufferedEvents();
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [loading]);

  // Track screen views
  useEffect(() => {
    const routeName = segments.join('/');
    if (routeName) {
      if (__DEV__) {
        console.log(`[Analytics] screen_view: ${routeName}`);
      }
      trackEvent('screen_view', { screen_name: routeName });
    }
  }, [segments]);

  // Deep link handler — route maximile://log URLs to auto-capture screen
  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      const params = parseAutoCaptureUrl(url);
      if (params) {
        router.push({
          pathname: '/auto-capture',
          params: {
            amount: params.amount?.toString() ?? '',
            merchant: params.merchant ?? '',
            card: params.card ?? '',
            source: params.source,
          },
        });
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  }, [router]);

  return (
    <View style={styles.root}>
      <Stack
        screenOptions={{
          headerShown: false,
          headerLeft: () => <BackButton />,
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="onboarding-auto-capture" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding-miles" />
        <Stack.Screen
          name="pay/index"
          options={{
            headerShown: true,
            headerTitle: 'Smart Pay',
            headerBackTitle: 'Back',
            headerTintColor: Colors.brandGold,
            headerStyle: { backgroundColor: Colors.background },
            headerTitleStyle: {
              fontWeight: '600',
              color: Colors.textPrimary,
            },
          }}
        />
        <Stack.Screen
          name="card/[id]"
          options={{
            headerShown: true,
            headerTitle: 'Card Detail',
            headerBackTitle: 'Back',
            headerTintColor: Colors.brandGold,
            headerStyle: { backgroundColor: Colors.background },
            headerTitleStyle: {
              fontWeight: '600',
              color: Colors.textPrimary,
            },
          }}
        />
        <Stack.Screen
          name="card-transactions/[cardId]"
          options={{
            headerShown: true,
            headerTitle: 'Card Transactions',
            headerBackTitle: 'Back',
            headerTintColor: Colors.brandGold,
            headerStyle: { backgroundColor: Colors.background },
            headerTitleStyle: {
              fontWeight: '600',
              color: Colors.textPrimary,
            },
          }}
        />
        <Stack.Screen
          name="miles/[programId]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="transactions"
          options={{
            headerShown: true,
            headerTitle: 'Transaction History',
            headerBackTitle: 'Back',
            headerTintColor: Colors.brandGold,
            headerStyle: { backgroundColor: Colors.background },
            headerTitleStyle: {
              fontWeight: '600',
              color: Colors.textPrimary,
            },
          }}
        />
        <Stack.Screen
          name="earning-insights"
          options={{
            headerShown: true,
            headerTitle: 'Earning Insights',
            headerBackTitle: 'Miles',
            headerTintColor: Colors.brandGold,
            headerStyle: { backgroundColor: Colors.background },
            headerTitleStyle: {
              fontWeight: '600',
              color: Colors.textPrimary,
            },
          }}
        />
        <Stack.Screen name="privacy-policy" />
        <Stack.Screen
          name="change-password"
          options={{
            headerShown: true,
            headerTitle: 'Change Password',
            headerBackTitle: 'Back',
            headerTintColor: Colors.brandGold,
            headerStyle: { backgroundColor: Colors.background },
            headerTitleStyle: {
              fontWeight: '600',
              color: Colors.textPrimary,
            },
          }}
        />
        <Stack.Screen
          name="change-email"
          options={{
            headerShown: true,
            headerTitle: 'Change Email',
            headerBackTitle: 'Back',
            headerTintColor: Colors.brandGold,
            headerStyle: { backgroundColor: Colors.background },
            headerTitleStyle: {
              fontWeight: '600',
              color: Colors.textPrimary,
            },
          }}
        />
        <Stack.Screen
          name="delete-account"
          options={{
            headerShown: true,
            headerTitle: 'Delete Account',
            headerBackTitle: 'Back',
            headerTintColor: Colors.brandGold,
            headerStyle: { backgroundColor: Colors.background },
            headerTitleStyle: {
              fontWeight: '600',
              color: Colors.textPrimary,
            },
          }}
        />
        <Stack.Screen name="auto-capture" options={{ headerShown: false }} />
        <Stack.Screen name="auto-capture-setup" options={{ headerShown: false }} />
        <Stack.Screen name="android-auto-capture-setup" options={{ headerShown: false }} />
        <Stack.Screen name="auto-capture-settings" options={{ headerShown: false }} />
        <Stack.Screen name="demo-controls" options={{ headerShown: false }} />
        <Stack.Screen
          name="notification-settings"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="notification-history"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="reset-password"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      </Stack>

      {/* Animated loading overlay */}
      <Animated.View
        style={[
          styles.loadingOverlay,
          { opacity: overlayOpacity },
        ]}
        pointerEvents={loading ? 'auto' : 'none'}
      >
        {/* Logo: fade in + scale + shimmer */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        >
          <Image
            source={require('../assets/logo_wName_contrast_b.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Subtle loading bar */}
        <Animated.View style={[styles.loadingBar, { opacity: shimmerOpacity }]}>
          <View style={styles.loadingBarInner} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// Background color sampled from the logo image
const SPLASH_BG = '#3C4554';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220,
    height: 220,
  },
  loadingBar: {
    position: 'absolute',
    bottom: 80,
    width: 120,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  loadingBarInner: {
    width: '60%',
    height: '100%',
    borderRadius: 1.5,
    backgroundColor: 'rgba(197, 165, 90, 0.8)',
  },
});
