// =============================================================================
// MaxiMile Scraper — AI Classifier (Sprint 15 — T15.05–T15.06)
// =============================================================================
// Main classifier that orchestrates Gemini (primary) and Groq (fallback).
//
// Flow:
//   1. Try Gemini Flash first (structured tool_use output)
//   2. If Gemini fails, try Groq Llama (JSON mode fallback)
//   3. If both fail, return a "no changes" response with failure notes
//
// Architecture Reference: docs/RATE_DETECTION_ARCHITECTURE.md
// =============================================================================

import type { ClassificationResponse } from './schema.js';
import { classifyWithGemini } from './gemini-client.js';
import { classifyWithGroq } from './groq-client.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Result of the classification pipeline, including provider metadata.
 */
export interface ClassificationResult {
  /** The validated classification response from the AI model. */
  response: ClassificationResponse;
  /** Which AI provider produced this result. */
  provider: 'gemini' | 'groq';
  /** Total latency in milliseconds (including retries). */
  latencyMs: number;
}

// ---------------------------------------------------------------------------
// Main classifier
// ---------------------------------------------------------------------------

/**
 * Classify a page content change using AI.
 *
 * Tries Gemini first (primary provider with function calling), then falls
 * back to Groq (Llama with JSON mode). If both fail, returns a safe
 * "no changes" response with error details in analysis_notes.
 *
 * @param oldContent - Previous page content (from earlier snapshot)
 * @param newContent - Current page content (from new snapshot)
 * @param bankName   - Bank that owns this page
 * @param url        - Source URL being analyzed
 * @returns ClassificationResult with response, provider, and latency
 */
export async function classifyPageChange(
  oldContent: string,
  newContent: string,
  bankName: string,
  url: string
): Promise<ClassificationResult> {
  const startTime = Date.now();

  // Attempt 1: Gemini Flash (primary)
  try {
    console.log('[Classifier] Trying Gemini Flash...');
    const response = await classifyWithGemini(oldContent, newContent, bankName, url);
    const latencyMs = Date.now() - startTime;

    console.log(
      `[Classifier] Gemini succeeded in ${latencyMs}ms. ` +
        `Changes: ${response.changes.length}, No changes: ${response.no_changes_detected}`
    );

    return {
      response,
      provider: 'gemini',
      latencyMs,
    };
  } catch (geminiError) {
    const geminiErrorMsg =
      geminiError instanceof Error ? geminiError.message : String(geminiError);
    console.warn(`[Classifier] Gemini failed: ${geminiErrorMsg}`);

    // Attempt 2: Groq Llama (fallback)
    try {
      console.log('[Classifier] Falling back to Groq Llama...');
      const response = await classifyWithGroq(oldContent, newContent, bankName, url);
      const latencyMs = Date.now() - startTime;

      console.log(
        `[Classifier] Groq succeeded in ${latencyMs}ms. ` +
          `Changes: ${response.changes.length}, No changes: ${response.no_changes_detected}`
      );

      return {
        response,
        provider: 'groq',
        latencyMs,
      };
    } catch (groqError) {
      const groqErrorMsg =
        groqError instanceof Error ? groqError.message : String(groqError);
      console.error(`[Classifier] Groq also failed: ${groqErrorMsg}`);

      // Both providers failed — return safe "no changes" response
      const latencyMs = Date.now() - startTime;

      console.error(
        `[Classifier] Both providers failed after ${latencyMs}ms. ` +
          `Returning safe "no changes" response.`
      );

      return {
        response: {
          changes: [],
          no_changes_detected: true,
          analysis_notes:
            `AI classification failed. Gemini error: ${geminiErrorMsg}. ` +
            `Groq error: ${groqErrorMsg}. ` +
            `This page change requires manual review.`,
        },
        provider: 'gemini', // Default provider (neither actually produced the result)
        latencyMs,
      };
    }
  }
}
