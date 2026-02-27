// =============================================================================
// MaxiMile — Supabase Database Types
// =============================================================================
// TypeScript types matching the database schema defined in
// database/schema/card_rules.sql and the user-data tables.
// =============================================================================

// ---------------------------------------------------------------------------
// Core Reference Tables (publicly readable)
// ---------------------------------------------------------------------------

/** Spend category (e.g. dining, transport, online) */
export interface Category {
  id: string;                 // Lowercase slug: 'dining', 'transport', etc.
  name: string;               // Display name: 'Dining', 'Transport', etc.
  display_order: number;      // UI sort order (ascending, 0 = first)
  icon: string | null;        // Emoji or icon name for UI
  mccs: string[];             // Array of MCC codes mapped to this category
  description: string | null; // Short user-facing description
  created_at: string;         // ISO timestamp
  updated_at: string;         // ISO timestamp
}

/** Supported credit card metadata */
export interface Card {
  id: string;                 // UUID
  bank: string;               // e.g. 'DBS', 'UOB', 'Citi'
  name: string;               // e.g. 'Altitude Visa'
  slug: string;               // URL-safe slug: 'dbs-altitude-visa'
  network: 'visa' | 'mastercard' | 'amex';
  annual_fee: number;         // SGD, 0 = no fee or first year waived
  base_rate_mpd: number;      // Base miles per dollar (outside bonus categories)
  image_url: string | null;   // Card face image URL
  apply_url: string | null;   // Bank application link
  is_active: boolean;         // FALSE = discontinued/hidden
  notes: string | null;       // Admin notes or caveats
  /** Eligibility restrictions JSONB (F22). NULL = unrestricted card. */
  eligibility_criteria: EligibilityCriteria | null;
  created_at: string;
  updated_at: string;
}

/** Eligibility criteria for restricted cards (F22 — Card Coverage Expansion) */
export interface EligibilityCriteria {
  gender?: string;            // e.g. 'female'
  age_min?: number;           // Minimum applicant age
  age_max?: number;           // Maximum applicant age
  min_income?: number;        // Minimum annual income in SGD
  banking_tier?: string;      // e.g. 'priority_banking', 'premier', 'treasures'
}

/** Miles earn rate per card per category */
export interface EarnRule {
  id: string;                 // UUID
  card_id: string;            // FK to cards.id
  category_id: string;        // FK to categories.id
  earn_rate_mpd: number;      // Miles per dollar for this card+category combo
  is_bonus: boolean;          // TRUE = bonus/accelerated rate
  conditions: Record<string, unknown>; // JSONB conditions (v1: assumed met)
  conditions_note: string | null;      // Human-readable conditions summary
  effective_from: string;     // Date string (YYYY-MM-DD)
  effective_to: string | null; // NULL = currently active
  source_url: string | null;  // Bank T&C URL for verification
  created_at: string;
  updated_at: string;
}

/** Monthly bonus spending/miles cap per card (optionally per category) */
export interface Cap {
  id: string;                 // UUID
  card_id: string;            // FK to cards.id
  category_id: string | null; // FK to categories.id, NULL = across all categories
  monthly_cap_amount: number; // SGD or miles amount cap per month
  cap_type: 'spend' | 'miles'; // Cap on spend amount vs. miles earned
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** MCC/condition-based exclusions from bonus earning */
export interface Exclusion {
  id: string;                 // UUID
  card_id: string;            // FK to cards.id
  category_id: string | null; // FK to categories.id, NULL = all categories
  excluded_mccs: string[];    // Array of excluded MCC codes
  conditions: Record<string, unknown>; // JSONB exclusion conditions
  description: string | null; // Human-readable explanation
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// User Data Tables (RLS-protected, per-user isolation)
// ---------------------------------------------------------------------------

/** A card in the user's portfolio (composite PK: user_id + card_id) */
export interface UserCard {
  user_id: string;            // FK to auth.users.id (part of composite PK)
  card_id: string;            // FK to cards.id (part of composite PK)
  nickname: string | null;    // Optional user-given name (max 50 chars)
  is_default: boolean;        // TRUE = fallback card when no bonus applies
  added_at: string;           // ISO timestamp
  updated_at: string;         // ISO timestamp
}

/** A manually-logged transaction */
export interface Transaction {
  id: string;                 // UUID
  user_id: string;            // FK to auth.users.id
  card_id: string;            // FK to cards.id
  category_id: string;        // FK to categories.id
  amount: number;             // SGD amount
  transaction_date: string;   // Date string (YYYY-MM-DD)
  notes: string | null;       // Optional user note
  merchant_name: string | null;  // Merchant name from Google Places (Smart Pay)
  merchant_mcc: string | null;   // Merchant category code (Smart Pay)
  logged_at: string;          // ISO timestamp (when the user logged it)
  created_at: string;
  updated_at: string;
}

/** Aggregated spending state per user/card/category/month for cap tracking */
export interface SpendingState {
  id: string;                 // UUID
  user_id: string;            // FK to auth.users.id
  card_id: string;            // FK to cards.id
  category_id: string;        // FK to categories.id
  month: string;              // YYYY-MM format (e.g. '2026-02')
  total_spent: number;        // SGD spent so far this month in this combo
  remaining_cap: number;      // Remaining cap amount (cap - total_spent)
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Rate Change Monitoring Tables (F23 — Sprint 12)
// ---------------------------------------------------------------------------

/** Rate change record for monitoring and alerts (F23) */
export interface RateChange {
  id: string;
  card_id: string | null;
  program_id: string | null;
  change_type: 'earn_rate' | 'cap_change' | 'devaluation' | 'partner_change' | 'fee_change';
  category: string | null;
  old_value: string;
  new_value: string;
  effective_date: string;
  alert_title: string;
  alert_body: string;
  severity: 'info' | 'warning' | 'critical';
  source_url: string | null;
  created_at: string;
}

/** User alert read/dismissal tracking (F23) */
export interface UserAlertRead {
  id: string;
  user_id: string;
  rate_change_id: string;
  read_at: string;
}

// ---------------------------------------------------------------------------
// User Settings (F31 — Min Spend Enforcement)
// ---------------------------------------------------------------------------

/** User-level settings for recommendation personalization */
export interface UserSettings {
  user_id: string;                    // FK to auth.users.id (PK)
  estimated_monthly_spend: number;    // SGD estimated monthly card spend
  created_at: string;                 // ISO timestamp
  updated_at: string;                 // ISO timestamp
}

// ---------------------------------------------------------------------------
// User Card Preferences (Sprint 24 — UOB Lady's Solitaire Category Selection)
// ---------------------------------------------------------------------------

/** Per-user, per-card category preference (e.g. UOB Lady's Solitaire choose 2 of 7) */
export interface UserCardPreference {
  id: string;                   // UUID
  user_id: string;              // FK to auth.users.id
  card_id: string;              // FK to cards.id
  selected_categories: string[]; // Array of chosen category IDs
  max_selections: number;       // Max allowed selections (e.g. 2)
  updated_at: string;           // ISO timestamp
  created_at: string;           // ISO timestamp
}

// ---------------------------------------------------------------------------
// RPC Function Return Types
// ---------------------------------------------------------------------------

/** Result row from get_user_rate_changes() / get_card_rate_changes() RPCs */
export interface UserRateChangeResult {
  rate_change_id: string;
  card_id: string | null;
  card_name: string | null;
  card_bank: string | null;
  program_id: string | null;
  program_name: string | null;
  change_type: string;
  category: string | null;
  old_value: string;
  new_value: string;
  effective_date: string;
  alert_title: string;
  alert_body: string;
  severity: string;
  source_url: string | null;
  created_at: string;
}

/** Result row from the recommend() RPC function */
export interface RecommendResult {
  card_id: string;
  card_name: string;
  bank: string;
  earn_rate_mpd: number;        // Effective earn rate (miles per dollar)
  remaining_cap: number | null; // Remaining cap for this card+category. NULL = uncapped. 0 = exhausted.
  monthly_cap_amount: number | null; // Total monthly cap amount. NULL if uncapped.
  is_recommended: boolean;      // TRUE for the top pick
  image_url: string | null;
  network: string;
  base_rate_mpd: number;
  conditions_note: string | null;
  min_spend_threshold: number | null;   // Min monthly spend required for bonus rate (NULL = none)
  min_spend_met: boolean | null;        // Whether user meets the min spend threshold
  total_monthly_spend: number;          // User's actual + estimated monthly spend used
  requires_contactless: boolean;        // TRUE if bonus rate requires contactless payment
}

// ---------------------------------------------------------------------------
// Phase 4 Tables
// ---------------------------------------------------------------------------

/** User-submitted feedback (bug reports and feature suggestions) */
export interface Feedback {
  id: string;
  user_id: string;
  type: 'bug' | 'feature';
  message: string;
  app_version: string | null;
  platform: string | null;
  status: 'new' | 'reviewed' | 'resolved' | 'wont_fix';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Analytics event record */
export interface AnalyticsEvent {
  id: string;
  user_id: string | null;
  event: string;
  properties: Record<string, unknown>;
  app_version: string | null;
  platform: string | null;
  created_at: string;
}

/** Privacy policy consent record (immutable audit log) */
export interface PrivacyConsent {
  id: string;
  user_id: string;
  policy_version: string;
  consented_at: string;
  platform: string | null;
  app_version: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Community Submissions (F24 — Sprint 13)
// ---------------------------------------------------------------------------

/** Submission workflow status */
export type SubmissionStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'merged';

/** A community-submitted rate change report */
export interface CommunitySubmission {
  id: string;                       // UUID
  user_id: string;                  // FK to auth.users.id
  card_id: string;                  // FK to cards.id
  change_type: 'earn_rate' | 'cap_change' | 'devaluation' | 'partner_change' | 'fee_change';
  category: string | null;          // Spend category (e.g. 'dining', 'online')
  old_value: string;                // Previous value description
  new_value: string;                // New value description
  effective_date: string | null;    // Date string (YYYY-MM-DD) or null
  evidence_url: string | null;      // Link to bank T&C or source
  screenshot_path: string | null;   // Supabase Storage path for evidence screenshot
  notes: string | null;             // User-provided notes
  status: SubmissionStatus;         // Workflow status
  reviewer_notes: string | null;    // Admin reviewer notes (set on review)
  reviewed_at: string | null;       // ISO timestamp of review
  dedup_fingerprint: string | null; // SHA-256 dedup hash (auto-generated by trigger)
  created_at: string;               // ISO timestamp
}

/** Parameters for the submit_rate_change RPC */
export interface SubmitRateChangeParams {
  p_card_id: string;                // UUID of the card
  p_change_type: 'earn_rate' | 'cap_change' | 'devaluation' | 'partner_change' | 'fee_change';
  p_category?: string | null;       // Spend category (optional)
  p_old_value: string;              // Previous value description
  p_new_value: string;              // New value description
  p_effective_date?: string | null; // Date string (YYYY-MM-DD) or null
  p_evidence_url?: string | null;   // Source URL (optional)
  p_screenshot_path?: string | null; // Supabase Storage path (optional)
  p_notes?: string | null;          // User notes (optional)
}

/** Result from the submit_rate_change RPC wrapper */
export interface SubmitRateChangeResult {
  success: boolean;
  submission_id: string | null;     // UUID of the new submission (null on error)
  error?: string;                   // Error message if success is false
}

/** Pending submission with joined card info (from get_pending_submissions RPC) */
export interface PendingSubmission extends CommunitySubmission {
  card_name: string;                // Joined from cards.name
  card_bank: string;                // Joined from cards.bank
}

/** Result from the review_submission RPC wrapper */
export interface ReviewSubmissionResult {
  success: boolean;
  action: 'approved' | 'rejected';
  submission_id: string;
  rate_change_id?: string;          // UUID of the new rate_changes row (only on approve)
  error?: string;                   // Error message if success is false
}

// ---------------------------------------------------------------------------
// Supabase Database Type (for typed client)
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>;
      };
      cards: {
        Row: Card;
        Insert: Omit<Card, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Card, 'id' | 'created_at' | 'updated_at'>>;
      };
      earn_rules: {
        Row: EarnRule;
        Insert: Omit<EarnRule, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EarnRule, 'id' | 'created_at' | 'updated_at'>>;
      };
      caps: {
        Row: Cap;
        Insert: Omit<Cap, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Cap, 'id' | 'created_at' | 'updated_at'>>;
      };
      exclusions: {
        Row: Exclusion;
        Insert: Omit<Exclusion, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Exclusion, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_cards: {
        Row: UserCard;
        Insert: Omit<UserCard, 'added_at' | 'updated_at'>;
        Update: Partial<Omit<UserCard, 'user_id' | 'card_id' | 'added_at' | 'updated_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'logged_at' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Transaction, 'id' | 'logged_at' | 'created_at' | 'updated_at'>>;
      };
      spending_state: {
        Row: SpendingState;
        Insert: Omit<SpendingState, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SpendingState, 'id' | 'created_at' | 'updated_at'>>;
      };
      feedback: {
        Row: Feedback;
        Insert: Omit<Feedback, 'id' | 'status' | 'admin_notes' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Feedback, 'id' | 'created_at' | 'updated_at'>>;
      };
      analytics_events: {
        Row: AnalyticsEvent;
        Insert: Omit<AnalyticsEvent, 'id' | 'created_at'>;
        Update: Partial<Omit<AnalyticsEvent, 'id' | 'created_at'>>;
      };
      privacy_consents: {
        Row: PrivacyConsent;
        Insert: Omit<PrivacyConsent, 'id' | 'created_at'>;
        Update: never; // Immutable audit log — no updates allowed
      };
      rate_changes: {
        Row: RateChange;
        Insert: Omit<RateChange, 'id' | 'created_at'>;
        Update: Partial<Omit<RateChange, 'id' | 'created_at'>>;
      };
      user_alert_reads: {
        Row: UserAlertRead;
        Insert: Omit<UserAlertRead, 'id' | 'read_at'>;
        Update: never;
      };
      community_submissions: {
        Row: CommunitySubmission;
        Insert: Omit<CommunitySubmission, 'id' | 'status' | 'reviewer_notes' | 'reviewed_at' | 'dedup_fingerprint' | 'created_at'>;
        Update: Partial<Omit<CommunitySubmission, 'id' | 'user_id' | 'dedup_fingerprint' | 'created_at'>>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Omit<UserSettings, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSettings, 'user_id' | 'created_at' | 'updated_at'>>;
      };
      user_card_preferences: {
        Row: UserCardPreference;
        Insert: Omit<UserCardPreference, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserCardPreference, 'id' | 'user_id' | 'card_id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      maru_monthly: {
        Row: { month: string; total_recommendations: number; unique_users: number };
      };
    };
    Functions: {
      recommend: {
        Args: { p_category_id: string };
        Returns: RecommendResult[];
      };
      get_user_rate_changes: {
        Args: { p_user_id: string };
        Returns: UserRateChangeResult[];
      };
      get_card_rate_changes: {
        Args: { p_card_id: string };
        Returns: UserRateChangeResult[];
      };
      submit_rate_change: {
        Args: SubmitRateChangeParams;
        Returns: string; // UUID of the new submission
      };
      review_submission: {
        Args: { p_submission_id: string; p_action: string; p_reviewer_notes?: string };
        Returns: ReviewSubmissionResult;
      };
      get_pending_submissions: {
        Args: Record<string, never>;
        Returns: PendingSubmission[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
