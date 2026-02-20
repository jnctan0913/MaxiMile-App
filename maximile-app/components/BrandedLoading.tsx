import React, { useEffect, useRef } from 'react';
import { View, Image, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Typography } from '../constants/theme';

const SPLASH_BG = '#3C4554';

export interface BrandedLoadingProps {
  message?: string;
}

export default function BrandedLoading({ message }: BrandedLoadingProps) {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const shimmerOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
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

  return (
    <View style={styles.container}>
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

      {message && (
        <Text style={styles.message}>{message}</Text>
      )}

      <Animated.View style={[styles.loadingBar, { opacity: shimmerOpacity }]}>
        <View style={styles.loadingBarInner} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPLASH_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  message: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 16,
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
