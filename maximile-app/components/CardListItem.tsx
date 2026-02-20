import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';
import { getCardImage } from '../constants/cardImages';
import EligibilityBadge from './EligibilityBadge';
import type { EligibilityCriteria } from '../lib/supabase-types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CardListItemProps {
  /** Card UUID */
  id: string;
  /** Card display name (e.g. "Altitude Visa") */
  name: string;
  /** Bank name (e.g. "DBS") */
  bank: string;
  /** Card network: visa, mastercard, amex */
  network: 'visa' | 'mastercard' | 'amex';
  /** Earn rate in miles per dollar for the current context */
  earnRate?: number;
  /** Card slug for local image lookup */
  slug?: string;
  /** Card face image URL (optional, fallback to local asset by slug) */
  imageUrl?: string | null;
  /** Whether this card is the recommended pick */
  isRecommended?: boolean;
  /** The best earn rate category name (e.g. "Online Shopping") */
  bestCategory?: string;
  /** Remaining cap (if applicable) */
  remainingCap?: number | null;
  /** Total cap amount (if applicable, for percentage display) */
  totalCap?: number | null;
  /** Called when the card is tapped */
  onPress?: (id: string) => void;
  /** Called when user confirms removal via swipe. Enables swipe-to-remove. */
  onRemove?: (id: string) => void;
  /** Show a chevron indicator for navigation */
  showChevron?: boolean;
  /** Eligibility criteria for badge display */
  eligibilityCriteria?: EligibilityCriteria | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CardListItem({
  id,
  name,
  bank,
  network,
  earnRate,
  slug,
  imageUrl,
  isRecommended = false,
  bestCategory,
  remainingCap,
  totalCap,
  onPress,
  onRemove,
  showChevron = false,
  eligibilityCriteria,
}: CardListItemProps) {
  const networkLabel = network.charAt(0).toUpperCase() + network.slice(1);
  const translateX = useRef(new Animated.Value(0)).current;
  const swipeThreshold = 80;

  const isOpen = useRef(false);

  const panResponder = useRef(
    onRemove
      ? PanResponder.create({
          onMoveShouldSetPanResponder: (_, gestureState) => {
            // Respond to horizontal swipes in both directions
            return (
              Math.abs(gestureState.dx) > 10 &&
              Math.abs(gestureState.dy) < 20
            );
          },
          onPanResponderMove: (_, gestureState) => {
            const offset = isOpen.current ? -100 : 0;
            const newX = offset + gestureState.dx;
            translateX.setValue(Math.max(Math.min(newX, 0), -120));
          },
          onPanResponderRelease: (_, gestureState) => {
            if (isOpen.current) {
              // Currently open — close if swiped right or released near center
              if (gestureState.dx > 30) {
                isOpen.current = false;
                Animated.spring(translateX, {
                  toValue: 0,
                  useNativeDriver: true,
                }).start();
              } else {
                Animated.spring(translateX, {
                  toValue: -100,
                  useNativeDriver: true,
                }).start();
              }
            } else {
              // Currently closed — open if swiped left enough
              if (gestureState.dx < -swipeThreshold) {
                isOpen.current = true;
                Animated.spring(translateX, {
                  toValue: -100,
                  useNativeDriver: true,
                }).start();
              } else {
                Animated.spring(translateX, {
                  toValue: 0,
                  useNativeDriver: true,
                }).start();
              }
            }
          },
        })
      : PanResponder.create({})
  ).current;

  const handleRemovePress = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Remove ${bank} ${name} from your portfolio? You'll lose tracking for its bonus caps.`
      );
      if (confirmed) {
        onRemove?.(id);
      } else {
        isOpen.current = false;
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
      return;
    }
    Alert.alert(
      'Remove Card?',
      `Remove ${bank} ${name} from your portfolio? You'll lose tracking for its bonus caps.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => {
          isOpen.current = false;
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            onRemove?.(id);
          },
        },
      ]
    );
  };

  const localImage = slug ? getCardImage(slug) : undefined;
  const imageSource = imageUrl ? { uri: imageUrl } : localImage;

  const cardContent = (
    <View style={[styles.container, isRecommended && styles.recommended]}>
      {/* Card image or placeholder */}
      <View style={styles.imageContainer}>
        {imageSource ? (
          <Image source={imageSource} style={styles.cardImage} resizeMode="contain" />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.placeholderText}>{bank.charAt(0)}</Text>
          </View>
        )}
      </View>

      {/* Card info */}
      <View style={styles.info}>
        <Text style={styles.bankName}>{bank}</Text>
        <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
        {bestCategory && earnRate !== undefined ? (
          <Text style={styles.bestRate}>
            Best: {earnRate.toFixed(1)} mpd - {bestCategory}
          </Text>
        ) : (
          <Text style={styles.network}>{networkLabel}</Text>
        )}
        {eligibilityCriteria && (
          <EligibilityBadge
            eligibilityCriteria={eligibilityCriteria}
            size="sm"
          />
        )}
      </View>

      {/* Cap indicator */}
      {remainingCap !== undefined && remainingCap !== null && totalCap != null && totalCap > 0 && (
        <View style={styles.capIndicator}>
          <View style={styles.capBarTrack}>
            <View
              style={[
                styles.capBarFill,
                {
                  width: `${Math.min(((totalCap - Math.max(remainingCap, 0)) / totalCap) * 100, 100)}%`,
                  backgroundColor:
                    remainingCap <= 0
                      ? Colors.capExhausted
                      : remainingCap / totalCap < 0.2
                      ? Colors.capRed
                      : remainingCap / totalCap < 0.5
                      ? Colors.capAmber
                      : Colors.capGreen,
                },
              ]}
            />
          </View>
          <Text style={styles.capIndicatorText}>
            {remainingCap <= 0 ? 'Cap full' : `$${Math.round(remainingCap)} left`}
          </Text>
        </View>
      )}

      {/* Earn rate badge */}
      {earnRate !== undefined && !bestCategory && (
        <View style={[styles.rateBadge, isRecommended && styles.rateBadgeRecommended]}>
          <Text style={[styles.rateValue, isRecommended && styles.rateValueRecommended]}>
            {earnRate.toFixed(1)}
          </Text>
          <Text style={[styles.rateLabel, isRecommended && styles.rateLabelRecommended]}>
            mpd
          </Text>
        </View>
      )}

      {/* Chevron for navigation */}
      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.textTertiary}
          style={styles.chevron}
        />
      )}

      {/* Recommended badge */}
      {isRecommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>BEST</Text>
        </View>
      )}
    </View>
  );

  // If swipeable, wrap with PanResponder and show delete action behind
  if (onRemove) {
    return (
      <View style={styles.swipeContainer}>
        {/* Red remove action behind the card */}
        <TouchableOpacity
          style={styles.swipeAction}
          onPress={handleRemovePress}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={22} color={Colors.textInverse} />
          <Text style={styles.swipeActionText}>Remove</Text>
        </TouchableOpacity>

        {/* Animated card row */}
        <Animated.View
          style={[styles.swipeCardWrapper, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            onPress={() => onPress?.(id)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${bank} ${name}, ${networkLabel}`}
          >
            {cardContent}
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => onPress?.(id)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${bank} ${name}, ${networkLabel}`}
    >
      {cardContent}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  swipeContainer: {
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    borderRadius: 20,
  },
  swipeCardWrapper: {
    backgroundColor: Colors.background,
    borderRadius: 20,
  },
  swipeAction: {
    position: 'absolute',
    top: 4,
    right: 4,
    bottom: 4,
    width: 90,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  swipeActionText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '600',
    marginTop: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    padding: Spacing.lg,
    marginBottom: 0,
    minHeight: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 6,
  },
  recommended: {
    borderWidth: 2,
    borderColor: Colors.brandGold,
  },
  imageContainer: {
    width: 48,
    height: 32,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
  },
  placeholderText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  info: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  bankName: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  network: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  bestRate: {
    ...Typography.caption,
    color: Colors.success,
    marginTop: 2,
  },
  capIndicator: {
    alignItems: 'center',
    marginRight: Spacing.sm,
    width: 56,
  },
  capBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 2,
  },
  capBarFill: {
    height: 4,
    borderRadius: 2,
  },
  capIndicatorText: {
    fontSize: 9,
    color: Colors.textTertiary,
  },
  rateBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.borderLight,
  },
  rateBadgeRecommended: {
    backgroundColor: Colors.primary,
  },
  rateValue: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },
  rateValueRecommended: {
    color: Colors.textInverse,
  },
  rateLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  rateLabelRecommended: {
    color: Colors.textInverse,
  },
  chevron: {
    marginLeft: Spacing.sm,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -1,
    right: Spacing.lg,
    backgroundColor: Colors.babyYellow,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderBottomLeftRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
  },
  recommendedText: {
    ...Typography.label,
    color: Colors.brandCharcoal,
    fontSize: 9,
    fontWeight: '700',
  },
});
