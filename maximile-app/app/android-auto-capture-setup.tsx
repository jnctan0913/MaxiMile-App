// =============================================================================
// MaxiMile — Android Auto-Capture Setup Screen (S17.3)
// =============================================================================
// Privacy disclosure and permission flow for Android notification access.
// Only shown on Android devices.
// =============================================================================

import { View, Text, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { Button } from '@rneui/themed';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { notificationListener } from '../lib/notification-listener';

export default function AndroidAutoCaptureSetup() {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check permission status on mount
  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const status = await notificationListener.hasPermission();
      setHasPermission(status);
    } catch (error) {
      console.error('Error checking permission:', error);
    }
  };

  const handleGrantAccess = async () => {
    setIsLoading(true);
    try {
      await notificationListener.requestPermission();

      // Re-check permission after returning from Settings
      setTimeout(async () => {
        await checkPermission();
        setIsLoading(false);

        const newStatus = await notificationListener.hasPermission();
        if (newStatus) {
          Alert.alert(
            'Success!',
            'Auto-capture is now active. Your banking notifications will be used to pre-fill transactions.',
            [{ text: 'Got it', onPress: () => router.back() }]
          );
        }
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      console.error('Error requesting permission:', error);
      Alert.alert(
        'Error',
        'Failed to request notification access. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSkip = () => {
    router.back();
  };

  // Only show on Android
  if (Platform.OS !== 'android') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          This feature is only available on Android devices.
        </Text>
        <Button title="Go Back" onPress={handleSkip} />
      </View>
    );
  }

  // Show confirmation if permission already granted
  if (hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.title}>Auto-Capture is Active</Text>
        <Text style={styles.description}>
          Your banking notifications are being used to automatically pre-fill transactions.
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Done"
            onPress={handleSkip}
            containerStyle={styles.button}
          />
        </View>
      </View>
    );
  }

  // Privacy disclosure screen
  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Enable Auto-Capture</Text>

        <Text style={styles.subtitle}>How it works</Text>
        <Text style={styles.description}>
          MaxiMile can automatically detect your card transactions from banking app notifications
          and pre-fill them for you — reducing logging time from 20 seconds to 2 seconds.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 What data we access</Text>
          <Text style={styles.sectionText}>
            • Banking app notifications only (DBS, OCBC, UOB, Citi, AMEX){'\n'}
            • Google Pay / Samsung Pay notifications (if you use them){'\n'}
            • No access to other app notifications
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 What we extract</Text>
          <Text style={styles.sectionText}>
            • Transaction amount{'\n'}
            • Merchant name{'\n'}
            • Last 4 digits of your card{'\n'}
            • Nothing else
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Your privacy</Text>
          <Text style={styles.sectionText}>
            • All processing happens on your device only{'\n'}
            • No raw notification content is stored{'\n'}
            • No data uploaded to servers{'\n'}
            • You can revoke access anytime in Settings
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Battery impact</Text>
          <Text style={styles.sectionText}>
            • Efficient filtering (only banking apps processed){'\n'}
            • Less than 2% additional battery drain per day{'\n'}
            • Background service runs only when needed
          </Text>
        </View>

        <View style={styles.privacyNote}>
          <Text style={styles.privacyNoteText}>
            💡 This feature complies with Google Play's data safety requirements.
            We only access banking notifications to help you log transactions faster.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Grant Access"
            onPress={handleGrantAccess}
            loading={isLoading}
            containerStyle={styles.button}
          />
          <Button
            title="Not Now"
            type="outline"
            onPress={handleSkip}
            containerStyle={styles.button}
          />
        </View>

        <Text style={styles.footnote}>
          You can always enable this later in Profile → Auto-Capture Settings
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  privacyNote: {
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    marginBottom: 24,
  },
  privacyNoteText: {
    fontSize: 14,
    color: '#1565c0',
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 16,
  },
  button: {
    width: '100%',
  },
  footnote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});
