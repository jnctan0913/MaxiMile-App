import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Stack, SplashScreen, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/theme';
import { parseAutoCaptureUrl } from '../lib/deep-link';

// Prevent the splash screen from auto-hiding before auth state is resolved
SplashScreen.preventAutoHideAsync();

/**
 * Root layout — wraps the entire app with global providers.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootContent />
      </AuthProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
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
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle shimmer pulse on the logo
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerOpacity, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerOpacity, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, []);

  // Fade out the loading overlay once auth resolves
  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

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
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="onboarding-auto-capture" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding-miles" />
        <Stack.Screen
          name="recommend/[category]"
          options={{
            headerShown: true,
            headerTitle: 'Recommendation',
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
        <Stack.Screen name="auto-capture-settings" options={{ headerShown: false }} />
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
