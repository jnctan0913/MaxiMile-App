import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';

interface InfoTooltipProps {
  title: string;
  message: string;
  size?: number;
  color?: string;
}

export default function InfoTooltip({ title, message, size = 16, color = Colors.textTertiary }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.6}
      >
        <Ionicons name="information-circle-outline" size={size} color={color} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={30}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          )}
          <View style={styles.tooltipCard}>
            <View style={styles.header}>
              <Ionicons name="information-circle" size={22} color={Colors.brandGold} />
              <Text style={styles.title}>{title}</Text>
            </View>
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.closeText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginHorizontal: Spacing.xl,
    maxWidth: 320,
    width: '85%',
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  message: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: Spacing.lg,
  },
  closeButton: {
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.md,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
    fontSize: 14,
  },
});
