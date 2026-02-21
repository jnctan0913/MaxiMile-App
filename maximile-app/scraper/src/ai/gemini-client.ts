// =============================================================================
// MaxiMile Scraper — Gemini Flash API Client (Sprint 15 — T15.03)
// =============================================================================
// Primary AI classification provider using Google Gemini 2.0 Flash.
//
// Features:
//   - Function calling (tool_use) with RATE_CHANGE_TOOL schema
//   - Structured output enforced at generation time
//   - Retry once on validation failure with temperature=0
//   - 30-second timeout
//   - Free tier: 250 requests/day
//
// Environment variables:
//   GEMINI_API_KEY — Google AI Studio API key
//
// Architecture Reference: docs/RATE_DETECTION_ARCHITECTURE.md
// =============================================================================

import {
  GoogleGenerativeAI,
  SchemaType,
  type FunctionDeclaration,
} from '@google/generative-ai';

import type { ClassificationResponse } from './schema.js';
import { validateClassificationResponse } from './schema.js';
import {
  SYSTEM_PROMPT,
  formatFewShotExamples,
  buildClassificationPrompt,
} from './prompts.js';

/** Gemini model identifier (free tier). */
const MODEL_NAME = 'gemini-2.0-flash';

/** Request timeout in milliseconds. */
const TIMEOUT_MS = 30_000;

// ---------------------------------------------------------------------------
// Gemini-compatible function declaration
// ---------------------------------------------------------------------------
// The RATE_CHANGE_TOOL in schema.ts uses string literal types ('object', etc.)
// which are incompatible with the Gemini SDK's SchemaType enum. We build the
// properly typed declaration here for Gemini specifically.
// ---------------------------------------------------------------------------

const GEMINI_RATE_CHANGE_TOOL: FunctionDeclaration = {
  name: 'report_rate_changes',
  description:
    'Report detected credit card rate changes from page content comparison. ' +
    'Call this function with all identified changes between the old and new page content. ' +
    'If no rate-relevant changes are found, call with an empty changes array and no_changes_detected set to true.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      changes: {
        type: SchemaType.ARRAY,
        description: 'Array of detected rate changes. Empty array if no changes found.',
        items: {
          type: SchemaType.OBJECT,
          properties: {
            card_name: {
              type: SchemaType.STRING,
              description: 'Exact card name from the 29 tracked cards.',
            },
            change_type: {
              type: SchemaType.STRING,
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
              type: SchemaType.STRING,
              nullable: true,
              enum: [
                'dining',
                'transport',
                'online',
                'groceries',
                'petrol',
                'travel',
                'general',
              ],
              description: 'Spend category affected, or null for program-wide changes.',
            },
            old_value: {
              type: SchemaType.STRING,
              description: 'Previous value as a human-readable string.',
            },
            new_value: {
              type: SchemaType.STRING,
              description: 'New value as a human-readable string.',
            },
            effective_date: {
              type: SchemaType.STRING,
              nullable: true,
              description: 'Effective date in YYYY-MM-DD format, or null if unknown.',
            },
            severity: {
              type: SchemaType.STRING,
              enum: ['info', 'warning', 'critical'],
              description: 'Severity level of the change.',
            },
            confidence: {
              type: SchemaType.NUMBER,
              description: 'Confidence score from 0.00 to 1.00.',
            },
            alert_title: {
              type: SchemaType.STRING,
              description: 'Short human-readable title for the alert (max 60 chars).',
            },
            alert_body: {
              type: SchemaType.STRING,
              description: 'Detailed description of the change and its impact (max 300 chars).',
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
        type: SchemaType.BOOLEAN,
        description: 'True if no rate-relevant changes were found.',
      },
      analysis_notes: {
        type: SchemaType.STRING,
        description: 'Brief reasoning for the classification decisions.',
      },
    },
    required: ['changes', 'no_changes_detected'],
  },
};

/**
 * Classify a page content change using Google Gemini 2.0 Flash.
 *
 * Uses function calling (tool_use) with the RATE_CHANGE_TOOL schema
 * to get structured output. Retries once on validation failure with
 * temperature=0 for more deterministic results.
 *
 * @param oldContent - Previous page content (from earlier snapshot)
 * @param newContent - Current page content (from new snapshot)
 * @param bankName   - Bank that owns this page
 * @param url        - Source URL being analyzed
 * @returns Validated ClassificationResponse
 * @throws Error if both attempts fail
 */
export async function classifyWithGemini(
  oldContent: string,
  newContent: string,
  bankName: string,
  url: string
): Promise<ClassificationResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Build the system instruction with few-shot examples
  const systemInstruction = `${SYSTEM_PROMPT}\n\n## Few-Shot Examples\n\n${formatFewShotExamples()}`;

  // Build the user message
  const userMessage = buildClassificationPrompt(oldContent, newContent, bankName, url);

  // First attempt with default temperature
  try {
    const result = await callGemini(genAI, systemInstruction, userMessage, undefined);
    return result;
  } catch (firstError) {
    console.warn(
      `[Gemini] First attempt failed: ${firstError instanceof Error ? firstError.message : String(firstError)}. Retrying with temperature=0...`
    );

    // Retry once with temperature=0 for more deterministic output
    const result = await callGemini(genAI, systemInstruction, userMessage, 0);
    return result;
  }
}

/**
 * Make a single Gemini API call with function calling and validate the response.
 */
async function callGemini(
  genAI: GoogleGenerativeAI,
  systemInstruction: string,
  userMessage: string,
  temperature: number | undefined
): Promise<ClassificationResponse> {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction,
    tools: [
      {
        functionDeclarations: [GEMINI_RATE_CHANGE_TOOL],
      },
    ],
    generationConfig: {
      temperature: temperature,
    },
  });

  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const result = await Promise.race([
      model.generateContent(userMessage),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error(`Gemini request timed out after ${TIMEOUT_MS}ms`));
        });
      }),
    ]);

    clearTimeout(timeoutId);

    const response = result.response;
    const candidates = response.candidates;

    if (!candidates || candidates.length === 0) {
      throw new Error('Gemini returned no candidates');
    }

    const candidate = candidates[0];
    const parts = candidate.content?.parts;

    if (!parts || parts.length === 0) {
      throw new Error('Gemini candidate has no content parts');
    }

    // Look for a function call part
    const functionCallPart = parts.find((part) => part.functionCall);

    if (!functionCallPart || !functionCallPart.functionCall) {
      // If no function call, try to extract from text
      const textPart = parts.find((part) => part.text);
      if (textPart?.text) {
        // Attempt to parse text as JSON (fallback)
        try {
          const parsed = JSON.parse(textPart.text);
          const validation = validateClassificationResponse(parsed);
          if (validation.valid) {
            return validation.data;
          }
          throw new Error(
            `Gemini text response validation failed: ${validation.errors.join('; ')}`
          );
        } catch (parseError) {
          if (parseError instanceof Error && parseError.message.startsWith('Gemini text response')) {
            throw parseError;
          }
          throw new Error(
            `Gemini did not return a function call and text is not valid JSON: ${textPart.text.substring(0, 200)}`
          );
        }
      }
      throw new Error('Gemini response contains no function call or text');
    }

    // Parse the function call arguments
    const fnCall = functionCallPart.functionCall;

    if (fnCall.name !== 'report_rate_changes') {
      throw new Error(
        `Gemini called unexpected function: ${fnCall.name}`
      );
    }

    const args = fnCall.args;
    if (!args) {
      throw new Error('Gemini function call has no arguments');
    }

    // Validate the response
    const validation = validateClassificationResponse(args);
    if (!validation.valid) {
      throw new Error(
        `Gemini response validation failed: ${validation.errors.join('; ')}`
      );
    }

    return validation.data;
  } finally {
    clearTimeout(timeoutId);
  }
}
