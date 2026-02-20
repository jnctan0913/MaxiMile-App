import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BulletItem {
  text: string;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: string }) {
  return <Text style={styles.sectionHeading}>{children}</Text>;
}

function BodyText({ children }: { children: string }) {
  return <Text style={styles.bodyText}>{children}</Text>;
}

function Bullet({ text }: BulletItem) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>{'\u2022'}</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PrivacyPolicyContent() {
  return (
    <View>
      {/* Last updated notice */}
      <Text style={styles.lastUpdated}>Last updated: February 2026</Text>

      {/* 1. Introduction */}
      <View style={styles.section}>
        <SectionHeading>1. Introduction</SectionHeading>
        <BodyText>
          MaxiMile ("we", "us", "our") is a mobile application that helps users
          maximise credit-card miles. This policy explains how we collect, use,
          and protect your information. By using MaxiMile you consent to the
          practices described here.
        </BodyText>
      </View>

      <Divider />

      {/* 2. Information We Collect */}
      <View style={styles.section}>
        <SectionHeading>2. Information We Collect</SectionHeading>
        <Bullet text="Email address (for authentication)" />
        <Bullet text="Credit-card selections (cards you add to your portfolio — we never store card numbers)" />
        <Bullet text="Transaction logs you manually enter (amount, category, merchant)" />
        <Bullet text="Usage analytics (screens visited, features used)" />
        <Bullet text="Device information (platform, OS version, app version)" />
      </View>

      <Divider />

      {/* 3. How We Use Your Information */}
      <View style={styles.section}>
        <SectionHeading>3. How We Use Your Information</SectionHeading>
        <Bullet text="Provide personalised card recommendations" />
        <Bullet text="Track spending against monthly bonus caps" />
        <Bullet text="Power the Smart Pay location-based suggestions" />
        <Bullet text="Improve app performance and fix bugs" />
        <Bullet text="Send important service updates (email, only when necessary)" />
      </View>

      <Divider />

      {/* 4. Data Storage and Security */}
      <View style={styles.section}>
        <SectionHeading>4. Data Storage and Security</SectionHeading>
        <BodyText>
          Your data is stored on Supabase (hosted on AWS) with:
        </BodyText>
        <Bullet text="All traffic encrypted via TLS 1.2+" />
        <Bullet text="Row-Level Security (RLS) ensuring you can only access your own data" />
        <Bullet text="Passwords hashed and managed by Supabase Auth (never stored in plaintext)" />
        <Bullet text="No credit-card numbers are stored — only the cards you select from our catalogue" />
      </View>

      <Divider />

      {/* 5. Third-Party Services */}
      <View style={styles.section}>
        <SectionHeading>5. Third-Party Services</SectionHeading>
        <BodyText>We use:</BodyText>
        <Bullet text="Supabase (database, authentication, hosting)" />
        <Bullet text="Expo / React Native (app framework and push notifications)" />
        <Bullet text="Google Places API (merchant look-ups in Smart Pay)" />
        <BodyText>
          These providers have their own privacy policies; we encourage you to
          review them.
        </BodyText>
      </View>

      <Divider />

      {/* 6. Your Rights */}
      <View style={styles.section}>
        <SectionHeading>6. Your Rights</SectionHeading>
        <BodyText>
          Under Singapore's Personal Data Protection Act (PDPA) and general best
          practice you may:
        </BodyText>
        <Bullet text="Request access to the personal data we hold about you" />
        <Bullet text="Request correction of inaccurate data" />
        <Bullet text="Request deletion of your account and associated data" />
        <Bullet text="Export your data in a portable format" />
        <BodyText>
          Contact us (below) to exercise any of these rights.
        </BodyText>
      </View>

      <Divider />

      {/* 7. Data Retention */}
      <View style={styles.section}>
        <SectionHeading>7. Data Retention</SectionHeading>
        <BodyText>
          We retain your data for as long as your account is active. If you
          delete your account we will remove your personal data within 30 days,
          except where retention is required by law.
        </BodyText>
      </View>

      <Divider />

      {/* 8. Children's Privacy */}
      <View style={styles.section}>
        <SectionHeading>8. Children's Privacy</SectionHeading>
        <BodyText>
          MaxiMile is not intended for users under 18. We do not knowingly
          collect data from minors. If you believe a child has provided us with
          personal data, please contact us.
        </BodyText>
      </View>

      <Divider />

      {/* 9. Changes to This Policy */}
      <View style={styles.section}>
        <SectionHeading>9. Changes to This Policy</SectionHeading>
        <BodyText>
          We may update this policy from time to time. Material changes will be
          communicated via in-app notice or email. The "Last updated" date at
          the top of this page indicates the latest revision.
        </BodyText>
      </View>

      <Divider />

      {/* 10. Contact Us */}
      <View style={styles.section}>
        <SectionHeading>10. Contact Us</SectionHeading>
        <BodyText>
          If you have questions about this policy or your data, email us at:
          privacy@maximile.app
        </BodyText>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  lastUpdated: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeading: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  bodyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
    paddingRight: Spacing.lg,
  },
  bulletDot: {
    ...Typography.body,
    color: Colors.brandGold,
    lineHeight: 22,
    marginRight: Spacing.sm,
  },
  bulletText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(197, 165, 90, 0.15)',
    marginVertical: Spacing.md,
  },
});
