import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';

// ---------------------------------------------------------------------------
// FAQ Data
// ---------------------------------------------------------------------------

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: FAQItem[];
}

const FAQ_SECTIONS: FAQSection[] = [
  {
    title: 'Getting Started',
    icon: 'rocket-outline',
    items: [
      {
        question: 'How does MaxiMile work?',
        answer:
          'MaxiMile analyses the credit cards in your portfolio and recommends the best card for each spending category. It tracks spending caps so you always earn the maximum miles per dollar (mpd) on every purchase.',
      },
      {
        question: 'How do I add or remove cards?',
        answer:
          'Go to the Transactions tab and tap "Add More Cards" at the top. To remove a card, go to Profile > manage your portfolio. Your transaction history for removed cards is preserved.',
      },
    ],
  },
  {
    title: 'Miles Per Dollar (mpd)',
    icon: 'airplane-outline',
    items: [
      {
        question: 'What is miles per dollar (mpd)?',
        answer:
          'Miles per dollar (mpd) is how many airline miles you earn for every $1 spent. For example, 4 mpd on dining means spending $100 at a restaurant earns you 400 miles. Higher mpd = more miles = faster free flights.',
      },
      {
        question: 'Why does my card show different mpd for different categories?',
        answer:
          'Credit cards offer bonus earn rates for specific spending categories (e.g., 4 mpd on dining, 2 mpd on transport). The base rate (typically 0.4-1.4 mpd) applies to categories without a bonus. MaxiMile always recommends the card with the highest effective mpd for your purchase.',
      },
      {
        question: 'What is the Singapore average of 1.4 mpd?',
        answer:
          'The 1.4 mpd benchmark is the approximate average earn rate across popular Singapore miles cards. MaxiMile uses this as a baseline to calculate how many extra miles you earned by using the right card — shown as "Miles Saved" in your Earning Insights.',
      },
    ],
  },
  {
    title: 'Spending Caps',
    icon: 'bar-chart-outline',
    items: [
      {
        question: 'What is a spending cap?',
        answer:
          'A spending cap is the monthly limit set by your card issuer for bonus miles. For example, a card might offer 4 mpd on dining up to $1,000/month. After hitting the cap, you earn only the base rate (e.g., 0.4 mpd). MaxiMile tracks your progress toward each cap.',
      },
      {
        question: 'What happens when I hit a cap?',
        answer:
          'Once you exhaust a cap, that card drops to its base rate for that category. MaxiMile automatically adjusts its recommendations — it may suggest a different card that still has cap remaining, so you keep earning bonus miles.',
      },
      {
        question: 'How is my cap progress calculated?',
        answer:
          'Cap progress is based on the transactions you have logged in MaxiMile for the current calendar month. The progress bar shows how much of the cap you have used. Caps reset on the 1st of each month.',
      },
    ],
  },
  {
    title: 'Card Recommendations',
    icon: 'compass-outline',
    items: [
      {
        question: 'Why did my recommendation change?',
        answer:
          'Recommendations update in real time based on your spending. Common reasons: (1) You exhausted a cap on your previous best card, (2) A new month started and caps reset, (3) You added or removed a card from your portfolio.',
      },
      {
        question: 'What does "No cap limit" mean?',
        answer:
          'Some card-category combinations have no monthly spending cap — you earn the bonus rate on every dollar with no limit. These are marked "No cap limit" on the recommendation screen.',
      },
    ],
  },
  {
    title: 'Flash Pay & Auto-Capture',
    icon: 'flash-outline',
    items: [
      {
        question: 'What is Flash Pay?',
        answer:
          'Flash Pay uses your GPS location to detect which merchant you are at, identifies the spending category, and recommends the best card — all before you pay. After paying, it can auto-log the transaction.',
      },
      {
        question: 'How does Auto-Capture work?',
        answer:
          'On iOS, Auto-Capture uses Apple Shortcuts to detect Apple Pay transactions and send them to MaxiMile automatically. On Android, it listens for banking notifications. You can set this up from Profile > Auto-Capture.',
      },
    ],
  },
  {
    title: 'Transactions & History',
    icon: 'document-text-outline',
    items: [
      {
        question: 'How do I edit or delete a transaction?',
        answer:
          'On any transaction list, long-press a transaction to see Edit and Delete options. You can also swipe left on a transaction row to reveal the same actions. Deleted transactions can be undone within 5 seconds.',
      },
      {
        question: 'Do my transactions sync with my bank?',
        answer:
          'No. MaxiMile does not connect to your bank. Transactions are either logged manually, via Flash Pay, or through Auto-Capture. This keeps your banking credentials private and secure.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function HelpScreen() {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleSection = (index: number) => {
    setExpandedSection((prev) => (prev === index ? null : index));
    setExpandedItem(null);
  };

  const toggleItem = (key: string) => {
    setExpandedItem((prev) => (prev === key ? null : key));
  };

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
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.screenTitle}>Help & FAQ</Text>
            <Text style={styles.screenSubtitle}>
              Everything you need to know about MaxiMile
            </Text>

            {/* How It Works summary */}
            <View style={styles.howItWorksCard}>
              <Text style={styles.howItWorksTitle}>How MaxiMile Works</Text>
              <View style={styles.howItWorksStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Add your miles credit cards to your portfolio</Text>
              </View>
              <View style={styles.howItWorksStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Check which card to use before each purchase</Text>
              </View>
              <View style={styles.howItWorksStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Log transactions to track caps and earn insights</Text>
              </View>
              <View style={styles.howItWorksStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={styles.stepText}>MaxiMile adjusts recommendations as caps fill up</Text>
              </View>
            </View>

            {/* FAQ Accordion */}
            {FAQ_SECTIONS.map((section, sectionIndex) => {
              const isSectionOpen = expandedSection === sectionIndex;

              return (
                <View key={section.title} style={styles.faqSection}>
                  <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => toggleSection(sectionIndex)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.sectionHeaderLeft}>
                      <Ionicons name={section.icon} size={20} color={Colors.brandGold} />
                      <Text style={styles.sectionTitle}>{section.title}</Text>
                    </View>
                    <Ionicons
                      name={isSectionOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={Colors.textTertiary}
                    />
                  </TouchableOpacity>

                  {isSectionOpen &&
                    section.items.map((item, itemIndex) => {
                      const itemKey = `${sectionIndex}-${itemIndex}`;
                      const isItemOpen = expandedItem === itemKey;

                      return (
                        <View key={itemKey}>
                          <TouchableOpacity
                            style={styles.questionRow}
                            onPress={() => toggleItem(itemKey)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.questionText}>{item.question}</Text>
                            <Ionicons
                              name={isItemOpen ? 'remove' : 'add'}
                              size={18}
                              color={Colors.brandGold}
                            />
                          </TouchableOpacity>
                          {isItemOpen && (
                            <View style={styles.answerContainer}>
                              <Text style={styles.answerText}>{item.answer}</Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                </View>
              );
            })}

            {/* Contact */}
            <View style={styles.contactSection}>
              <Text style={styles.contactTitle}>Still have questions?</Text>
              <Text style={styles.contactSubtitle}>
                Send us feedback from your Profile and we'll get back to you.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
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
    marginBottom: Spacing.xl,
  },

  // How It Works card
  howItWorksCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    borderTopWidth: 3,
    borderTopColor: Colors.brandGold,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.10,
        shadowRadius: 24,
      },
      android: { elevation: 6 },
    }),
  },
  howItWorksTitle: {
    ...Typography.bodyBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  howItWorksStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.brandGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...Typography.captionBold,
    color: Colors.brandCharcoal,
    fontSize: 13,
  },
  stepText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
    fontSize: 14,
  },

  // FAQ sections
  faqSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  questionText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.md,
    fontSize: 14,
  },
  answerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  answerText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },

  // Contact
  contactSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  contactTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  contactSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
