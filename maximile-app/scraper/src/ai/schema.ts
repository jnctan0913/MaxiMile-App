// =============================================================================
// MaxiMile Scraper — AI Classification Tool Schema (Sprint 15 — T15.02)
// =============================================================================
// Defines the structured output schema for the AI classification pipeline.
//
// Two schema formats are provided:
//   1. RATE_CHANGE_TOOL — Gemini function calling (tool_use) declaration.
//      Gemini enforces this schema at generation time, guaranteeing valid JSON.
//   2. GROQ_RESPONSE_SCHEMA — Groq JSON mode schema.
//      Passed as `response_format` guidance; the model follows it but without
//      strict enforcement (output is validated by the caller).
//
// Both schemas produce the same structure, matching the `detected_changes`
// table from Migration 018 (database/migrations/018_detection_pipeline.sql).
//
// Architecture Reference: docs/RATE_DETECTION_ARCHITECTURE.md
// DB Schema Reference:    database/migrations/018_detection_pipeline.sql
//
// Author:  AI Engineer
// Created: 2026-02-21
// Sprint:  15 — AI Classification Pipeline (F23 v2.0)
// =============================================================================

// ---------------------------------------------------------------------------
// TypeScript interfaces (for consuming the AI response in pipeline code)
// ---------------------------------------------------------------------------

/**
 * A single rate change detected by the AI classifier.
 *
 * Maps to one row in the `detected_changes` table (Migration 018, Section 4).
 * The pipeline code will map these fields to the DB columns:
 *   - card_name   -> resolved to card_id via cards table lookup
 *   - change_type -> detected_changes.change_type (rate_change_type enum)
 *   - category    -> detected_changes.category
 *   - old_value   -> detected_changes.old_value
 *   - new_value   -> detected_changes.new_value
 *   - effective_date -> detected_changes.effective_date
 *   - severity    -> detected_changes.severity (alert_severity enum)
 *   - confidence  -> detected_changes.confidence
 *   - alert_title -> detected_changes.alert_title
 *   - alert_body  -> detected_changes.alert_body
 */
export interface DetectedRateChange {
  card_name: string;
  change_type:
    | 'earn_rate_change'
    | 'cap_adjustment'
    | 'program_devaluation'
    | 'new_card_launch'
    | 'card_discontinued';
  category:
    | 'dining'
    | 'transport'
    | 'online'
    | 'groceries'
    | 'petrol'
    | 'bills'
    | 'travel'
    | 'general'
    | null;
  old_value: string;
  new_value: string;
  effective_date: string | null;
  severity: 'info' | 'warning' | 'critical';
  confidence: number;
  alert_title: string;
  alert_body: string;
}

/**
 * The full AI classification response.
 *
 * This is the top-level object returned by both Gemini (via tool_use) and
 * Groq (via JSON mode). The pipeline extracts `changes` and processes each
 * one into a `detected_changes` row.
 */
export interface ClassificationResponse {
  changes: DetectedRateChange[];
  no_changes_detected: boolean;
  analysis_notes?: string;
}

// ---------------------------------------------------------------------------
// Change type mapping: AI schema -> DB enum
// ---------------------------------------------------------------------------

/**
 * Maps AI classifier change_type values to the rate_change_type enum
 * values used in the database (Migration 015).
 *
 * The AI uses more descriptive names; the DB uses shorter enum values.
 */
export const CHANGE_TYPE_TO_DB_ENUM: Record<
  DetectedRateChange['change_type'],
  string
> = {
  earn_rate_change: 'earn_rate',
  cap_adjustment: 'cap_change',
  program_devaluation: 'devaluation',
  new_card_launch: 'partner_change', // Closest DB enum; may be updated in future migrations
  card_discontinued: 'fee_change',   // Closest DB enum; may be updated in future migrations
};

// ---------------------------------------------------------------------------
// Gemini tool_use function declaration
// ---------------------------------------------------------------------------

/**
 * Google Gemini function calling (tool_use) declaration.
 *
 * When passed as a tool definition to the Gemini API, the model is forced
 * to return a structured JSON response conforming to this schema. This
 * eliminates the need for manual JSON parsing and validation.
 *
 * Usage with Gemini SDK:
 * ```ts
 * const model = genAI.getGenerativeModel({
 *   model: 'gemini-2.5-flash',
 *   tools: [{ functionDeclarations: [RATE_CHANGE_TOOL] }],
 * });
 * ```
 */
export const RATE_CHANGE_TOOL = {
  name: 'report_rate_changes',
  description:
    'Report detected credit card rate changes from page content comparison. ' +
    'Call this function with all identified changes between the old and new page content. ' +
    'If no rate-relevant changes are found, call with an empty changes array and no_changes_detected set to true.',
  parameters: {
    type: 'object' as const,
    properties: {
      changes: {
        type: 'array' as const,
        description:
          'Array of detected rate changes. Empty array if no changes found.',
        items: {
          type: 'object' as const,
          properties: {
            card_name: {
              type: 'string' as const,
              description:
                'Exact card name from the tracked list (e.g., "DBS Woman\'s World Card", "HSBC Revolution Card"). ' +
                'Must match one of the 29 tracked cards.',
            },
            change_type: {
              type: 'string' as const,
              enum: [
                'earn_rate_change',
                'cap_adjustment',
                'program_devaluation',
                'new_card_launch',
                'card_discontinued',
              ],
              description:
                'Type of rate change detected. ' +
                'earn_rate_change: miles/points per dollar change. ' +
                'cap_adjustment: spending cap or bonus limit change. ' +
                'program_devaluation: transfer ratio or program value reduction. ' +
                'new_card_launch: new credit card product introduced. ' +
                'card_discontinued: existing card retired or no longer available.',
            },
            category: {
              type: 'string' as const,
              enum: [
                'dining',
                'transport',
                'online',
                'groceries',
                'petrol',
                'bills',
                'travel',
                'general',
              ],
              nullable: true,
              description:
                'Spend category affected by the change. ' +
                'Set to null for program-wide changes, fee changes, or card lifecycle events. ' +
                'Use "general" for base earn rate changes that apply to all spend.',
            },
            old_value: {
              type: 'string' as const,
              description:
                'Previous value before the change, as a human-readable string. ' +
                'Examples: "4 mpd cap S$1,500/month", "1 MR = 1 KrisFlyer mile", "S$194.40/year".',
            },
            new_value: {
              type: 'string' as const,
              description:
                'New value after the change, as a human-readable string. ' +
                'Examples: "4 mpd cap S$1,000/month", "1.5 MR = 1 KrisFlyer mile", "S$235/year".',
            },
            effective_date: {
              type: 'string' as const,
              nullable: true,
              description:
                'Date when the change takes effect, in YYYY-MM-DD format. ' +
                'Set to null if the effective date is not stated on the page.',
            },
            severity: {
              type: 'string' as const,
              enum: ['info', 'warning', 'critical'],
              description:
                'Severity level of the change. ' +
                'critical: Rate decrease >20%, devaluations, card discontinuations. ' +
                'warning: Rate decrease <=20%, cap reductions, fee increases. ' +
                'info: Rate increases, new benefits, new card launches.',
            },
            confidence: {
              type: 'number' as const,
              description:
                'Confidence score from 0.00 to 1.00. ' +
                '0.90-1.00: Clear, unambiguous change with specific values. ' +
                '0.70-0.89: Likely change with some ambiguity. ' +
                '0.50-0.69: Possible change, needs verification. ' +
                'Below 0.50: Do not report (cosmetic/formatting changes).',
            },
            alert_title: {
              type: 'string' as const,
              description:
                'Short human-readable title for the alert (max 60 characters). ' +
                'Format: "[Action]: [Card Name]" e.g., "Cap Change: DBS Woman\'s World Card".',
            },
            alert_body: {
              type: 'string' as const,
              description:
                'Detailed description of the change and its impact on cardholders (max 300 characters). ' +
                'Should explain what changed, quantify the impact, and suggest alternatives if negative.',
            },
          },
          required: [
            'card_name',
            'change_type',
            'old_value',
            'new_value',
            'severity',
            'confidence',
            'alert_title',
            'alert_body',
          ],
        },
      },
      no_changes_detected: {
        type: 'boolean' as const,
        description:
          'Set to true if no rate-relevant changes were found in the content diff. ' +
          'When true, the changes array should be empty.',
      },
      analysis_notes: {
        type: 'string' as const,
        description:
          'Brief reasoning (1-3 sentences) explaining the classification decisions. ' +
          'Mention what changes were found, why certain severity/confidence levels were assigned, ' +
          'or why no changes were detected (e.g., "Only cosmetic formatting changes observed").',
      },
    },
    required: ['changes', 'no_changes_detected'] as const,
  },
} as const;

// ---------------------------------------------------------------------------
// Groq JSON mode schema
// ---------------------------------------------------------------------------

/**
 * Groq JSON mode response schema.
 *
 * Groq does not support tool_use / function calling. Instead, we pass
 * this schema as guidance in the system prompt and set
 * `response_format: { type: "json_object" }` in the API call.
 *
 * The schema is identical in structure to RATE_CHANGE_TOOL.parameters
 * but formatted as a standalone JSON Schema (not wrapped in a function
 * declaration).
 *
 * Usage with Groq SDK:
 * ```ts
 * const response = await groq.chat.completions.create({
 *   model: 'llama-3.3-70b-versatile',
 *   messages: [
 *     { role: 'system', content: systemPrompt + '\n\nRespond with JSON matching this schema:\n' + JSON.stringify(GROQ_RESPONSE_SCHEMA) },
 *     { role: 'user', content: userMessage },
 *   ],
 *   response_format: { type: 'json_object' },
 * });
 * ```
 */
export const GROQ_RESPONSE_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'RateChangeClassificationResponse',
  description:
    'Structured response from the AI rate change classifier. ' +
    'Contains an array of detected changes (or empty array if none found).',
  type: 'object' as const,
  properties: {
    changes: {
      type: 'array' as const,
      description: 'Array of detected rate changes. Empty array if no changes found.',
      items: {
        type: 'object' as const,
        properties: {
          card_name: {
            type: 'string' as const,
            description: 'Exact card name from the 29 tracked cards.',
          },
          change_type: {
            type: 'string' as const,
            enum: [
              'earn_rate_change',
              'cap_adjustment',
              'program_devaluation',
              'new_card_launch',
              'card_discontinued',
            ],
            description: 'Type of rate change detected.',
          },
          category: {
            type: ['string', 'null'] as const,
            enum: [
              'dining',
              'transport',
              'online',
              'groceries',
              'petrol',
              'bills',
              'travel',
              'general',
              null,
            ],
            description:
              'Spend category affected, or null for program-wide changes.',
          },
          old_value: {
            type: 'string' as const,
            description: 'Previous value as a human-readable string.',
          },
          new_value: {
            type: 'string' as const,
            description: 'New value as a human-readable string.',
          },
          effective_date: {
            type: ['string', 'null'] as const,
            description: 'Effective date in YYYY-MM-DD format, or null if unknown.',
          },
          severity: {
            type: 'string' as const,
            enum: ['info', 'warning', 'critical'],
            description: 'Severity level of the change.',
          },
          confidence: {
            type: 'number' as const,
            minimum: 0,
            maximum: 1,
            description: 'Confidence score from 0.00 to 1.00.',
          },
          alert_title: {
            type: 'string' as const,
            maxLength: 60,
            description: 'Short human-readable title for the alert.',
          },
          alert_body: {
            type: 'string' as const,
            maxLength: 300,
            description: 'Detailed description of the change and its impact.',
          },
        },
        required: [
          'card_name',
          'change_type',
          'old_value',
          'new_value',
          'severity',
          'confidence',
          'alert_title',
          'alert_body',
        ],
      },
    },
    no_changes_detected: {
      type: 'boolean' as const,
      description: 'True if no rate-relevant changes were found.',
    },
    analysis_notes: {
      type: 'string' as const,
      description: 'Brief reasoning for the classification decisions.',
    },
  },
  required: ['changes', 'no_changes_detected'],
} as const;

// ---------------------------------------------------------------------------
// Validation helper
// ---------------------------------------------------------------------------

/**
 * Validates that an AI response conforms to the ClassificationResponse shape.
 *
 * This is used after parsing JSON from Groq (which does not enforce schemas
 * at generation time). Gemini's tool_use responses are already validated by
 * the API, but we run this check defensively regardless of provider.
 *
 * @param data - The parsed JSON response from the AI model
 * @returns An object with `valid` boolean and optional `errors` array
 */
export function validateClassificationResponse(
  data: unknown
): { valid: true; data: ClassificationResponse } | { valid: false; errors: string[] } {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Response must be a non-null object'] };
  }

  const obj = data as Record<string, unknown>;

  // Check required top-level fields
  if (!Array.isArray(obj.changes)) {
    errors.push('Missing or invalid "changes" field (must be an array)');
  }

  if (typeof obj.no_changes_detected !== 'boolean') {
    errors.push(
      'Missing or invalid "no_changes_detected" field (must be a boolean)'
    );
  }

  // Validate each change item
  if (Array.isArray(obj.changes)) {
    const validChangeTypes = [
      'earn_rate_change',
      'cap_adjustment',
      'program_devaluation',
      'new_card_launch',
      'card_discontinued',
    ];
    const validSeverities = ['info', 'warning', 'critical'];
    const validCategories = [
      'dining',
      'transport',
      'online',
      'groceries',
      'petrol',
      'bills',
      'travel',
      'general',
      null,
    ];

    for (let i = 0; i < obj.changes.length; i++) {
      const change = obj.changes[i] as Record<string, unknown>;
      const prefix = `changes[${i}]`;

      if (typeof change !== 'object' || change === null) {
        errors.push(`${prefix}: must be a non-null object`);
        continue;
      }

      // Required string fields
      for (const field of [
        'card_name',
        'old_value',
        'new_value',
        'alert_title',
        'alert_body',
      ]) {
        if (typeof change[field] !== 'string' || (change[field] as string).length === 0) {
          errors.push(`${prefix}.${field}: must be a non-empty string`);
        }
      }

      // change_type enum
      if (!validChangeTypes.includes(change.change_type as string)) {
        errors.push(
          `${prefix}.change_type: must be one of ${validChangeTypes.join(', ')}`
        );
      }

      // severity enum
      if (!validSeverities.includes(change.severity as string)) {
        errors.push(
          `${prefix}.severity: must be one of ${validSeverities.join(', ')}`
        );
      }

      // category (nullable enum)
      if (
        change.category !== null &&
        change.category !== undefined &&
        !validCategories.includes(change.category as string | null)
      ) {
        errors.push(
          `${prefix}.category: must be one of ${validCategories.filter((c) => c !== null).join(', ')} or null`
        );
      }

      // confidence (number 0-1)
      if (
        typeof change.confidence !== 'number' ||
        change.confidence < 0 ||
        change.confidence > 1
      ) {
        errors.push(
          `${prefix}.confidence: must be a number between 0.00 and 1.00`
        );
      }

      // effective_date (nullable string, should be YYYY-MM-DD if present)
      if (
        change.effective_date !== null &&
        change.effective_date !== undefined &&
        typeof change.effective_date === 'string'
      ) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(change.effective_date)) {
          errors.push(
            `${prefix}.effective_date: must be in YYYY-MM-DD format or null`
          );
        }
      }

      // alert_title length
      if (
        typeof change.alert_title === 'string' &&
        change.alert_title.length > 60
      ) {
        errors.push(
          `${prefix}.alert_title: exceeds 60 character limit (${change.alert_title.length} chars)`
        );
      }

      // alert_body length
      if (
        typeof change.alert_body === 'string' &&
        change.alert_body.length > 300
      ) {
        errors.push(
          `${prefix}.alert_body: exceeds 300 character limit (${change.alert_body.length} chars)`
        );
      }
    }

    // Consistency check: if changes array is empty, no_changes_detected should be true
    if (
      obj.changes.length === 0 &&
      obj.no_changes_detected === false
    ) {
      errors.push(
        'Inconsistency: changes array is empty but no_changes_detected is false'
      );
    }
    if (
      obj.changes.length > 0 &&
      obj.no_changes_detected === true
    ) {
      errors.push(
        'Inconsistency: changes array is non-empty but no_changes_detected is true'
      );
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: data as ClassificationResponse };
}
