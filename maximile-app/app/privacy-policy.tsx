import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Colors, Spacing, Typography } from '../constants/theme';
import PrivacyPolicyContent from '../components/PrivacyPolicyContent';

export default function PrivacyPolicyScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <Image
              source={require('../assets/Name.png')}
              style={{ height: 28, width: 120 }}
              resizeMode="contain"
            />
          ),
          headerBackTitle: 'Back',
          headerTintColor: Colors.brandGold,
          headerStyle: { backgroundColor: Colors.background },
        }}
      />
      <ImageBackground
        source={require('../assets/background.png')}
        style={styles.background}
        imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.screenTitle}>Privacy Policy</Text>
            <Text style={styles.screenSubtitle}>How we handle your data</Text>
            <PrivacyPolicyContent />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl + 40,
  },
  screenTitle: {
    ...Typography.heading,
    fontSize: 26,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  screenSubtitle: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
});
