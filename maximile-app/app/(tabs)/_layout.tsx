import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Image, TouchableOpacity } from 'react-native';
import { Tabs, useFocusEffect, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Colors, Typography, Glass } from '../../constants/theme';
import { track } from '../../lib/analytics';

/**
 * Tab navigator layout (DRD Section 10)
 *
 * 5 tabs with frosted glass tab bar using expo-blur:
 *   1. Recommend (home)
 *   2. My Cards
 *   3. Cap Status (with red dot badge when any cap >= 80%)
 *   4. Log Transaction
 *   5. Profile
 *
 * Glassmorphism: BlurView intensity=30, tint="light", position absolute,
 * transparent background so content scrolls beneath.
 */
export default function TabsLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const [showCapBadge, setShowCapBadge] = useState(false);

  // -------------------------------------------------------------------------
  // Check if any cap is at >= 80% usage for the badge
  // -------------------------------------------------------------------------
  const checkCapBadge = useCallback(async () => {
    if (!user) return;

    const currentMonth = new Date().toISOString().slice(0, 7);

    try {
      // Fetch user cards
      const { data: userCards } = await supabase
        .from('user_cards')
        .select('card_id')
        .eq('user_id', user.id);

      if (!userCards || userCards.length === 0) {
        setShowCapBadge(false);
        return;
      }

      const cardIds = userCards.map((uc) => uc.card_id);

      // Fetch caps and transactions in parallel
      const now = new Date();
      const monthStart = `${currentMonth}-01`;
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const nextMonthStr = nextMonthDate.toISOString().slice(0, 10);

      const [capsRes, txnRes] = await Promise.all([
        supabase.from('caps').select('card_id, category_id, monthly_cap_amount').in('card_id', cardIds),
        supabase
          .from('transactions')
          .select('card_id, category_id, amount')
          .eq('user_id', user.id)
          .gte('transaction_date', monthStart)
          .lt('transaction_date', nextMonthStr)
          .in('card_id', cardIds),
      ]);

      const caps = capsRes.data ?? [];
      const txns = (txnRes.data ?? []) as { card_id: string; category_id: string; amount: number }[];

      // Compute spending per card+category and per card total
      const txnSpending = new Map<string, number>();
      const txnCardTotal = new Map<string, number>();
      for (const txn of txns) {
        const key = `${txn.card_id}:${txn.category_id}`;
        txnSpending.set(key, (txnSpending.get(key) ?? 0) + txn.amount);
        txnCardTotal.set(txn.card_id, (txnCardTotal.get(txn.card_id) ?? 0) + txn.amount);
      }

      // Check if any cap is >= 80% used
      const hasHighUsage = caps.some((cap) => {
        const spent = cap.category_id
          ? txnSpending.get(`${cap.card_id}:${cap.category_id}`) ?? 0
          : txnCardTotal.get(cap.card_id) ?? 0;
        const pct = cap.monthly_cap_amount > 0 ? spent / cap.monthly_cap_amount : 0;
        return pct >= 0.8;
      });

      setShowCapBadge(hasHighUsage);
    } catch {
      // Silently fail — badge is non-critical
      setShowCapBadge(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      checkCapBadge();
    }, [checkCapBadge])
  );

  return (
    <Tabs
      screenListeners={{
        tabPress: (e) => {
          track('screen_view', { screen: e.target?.split('-')[0] ?? 'unknown' });
        },
      }}
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: { ...Typography.subheading },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ marginRight: Platform.OS === 'ios' ? 8 : 16 }}
          >
            <Ionicons name="person-circle-outline" size={28} color={Colors.brandGold} />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: Colors.brandGold,
        tabBarInactiveTintColor: '#9AA0A6',
        tabBarLabelStyle: {
          ...Typography.caption,
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
        },
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <LinearGradient
              colors={['#FFFFFF', '#F4F4F5', '#EDEDEE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {Platform.OS === 'ios' && (
              <BlurView
                intensity={40}
                tint="light"
                style={StyleSheet.absoluteFill}
              />
            )}
            <LinearGradient
              colors={[
                'rgba(197, 165, 90, 0)',
                'rgba(197, 165, 90, 0.25)',
                'rgba(197, 165, 90, 0)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: StyleSheet.hairlineWidth,
              }}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="cards"
        options={{
          title: 'My Cards',
          headerTitle: () => (
            <Image
              source={require('../../assets/Name.png')}
              style={{ height: 28, width: 120 }}
              resizeMode="contain"
            />
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'card' : 'card-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="caps"
        options={{
          title: 'Caps',
          headerTitle: () => (
            <Image
              source={require('../../assets/Name.png')}
              style={{ height: 28, width: 120 }}
              resizeMode="contain"
            />
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={size} color={color} />
              {showCapBadge && <View style={tabBadgeStyles.badge} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          headerTitle: () => (
            <Image
              source={require('../../assets/Name.png')}
              style={{ height: 28, width: 120 }}
              resizeMode="contain"
            />
          ),
          tabBarIcon: ({ focused }) => (
            <View style={[
              heroTabStyles.container,
              focused && heroTabStyles.containerActive,
            ]}>
              <Ionicons
                name={focused ? 'compass' : 'compass-outline'}
                size={28}
                color={focused ? Colors.brandCharcoal : '#FFFFFF'}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{
              fontSize: 10,
              fontWeight: '600',
              letterSpacing: 0.3,
              color: focused ? Colors.brandGold : '#9AA0A6',
              marginTop: 14,
            }}>
              Recommend
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log',
          headerTitle: () => (
            <Image
              source={require('../../assets/Name.png')}
              style={{ height: 28, width: 120 }}
              resizeMode="contain"
            />
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          headerTitle: () => (
            <Image
              source={require('../../assets/Name.png')}
              style={{ height: 28, width: 120 }}
              resizeMode="contain"
            />
          ),
          headerRight: () => null,
        }}
      />
      <Tabs.Screen
        name="miles"
        options={{
          title: 'Miles',
          headerTitle: () => (
            <Image
              source={require('../../assets/Name.png')}
              style={{ height: 28, width: 120 }}
              resizeMode="contain"
            />
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'airplane' : 'airplane-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const heroTabStyles = StyleSheet.create({
  container: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brandGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 20 : 16,
    shadowColor: Colors.brandGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  containerActive: {
    backgroundColor: Colors.brandGold,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    transform: [{ scale: 1.05 }],
  },
});

const tabBadgeStyles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
});
