// =============================================================================
// MaxiMile Scraper — Groq Llama Fallback Client (Sprint 15 — T15.04)
// =============================================================================
// Fallback AI classification provider using Groq's Llama 3.3 70B.
//
// Features:
//   - JSON mode for structured output
//   - Full system prompt with few-shot examples (no native tool_use)
//   - Retry once on parse/validation failure
//   - 30-second timeout
//   - Free tier: 1,000 requests/day
//
// Environment variables:
//   GROQ_API_KEY — Groq Cloud API key
//
// Architecture Reference: docs/RATE_DETECTION_ARCHITECTURE.md
// =============================================================================

import Groq from 'groq-sdk';

import type { ClassificationResponse } from './schema.js';
import { GROQ_RESPONSE_SCHEMA, validateClassificationResponse } from './schema.js';
import { buildFullSystemPrompt, buildClassificationPrompt } from './prompts.js';

/** Groq model identifier (free tier). */
const MODEL_NAME = 'llama-3.3-70b-versatile';

/** Request timeout in milliseconds. */
const TIMEOUT_MS = 30_000;

/**
 * Classify a page content change using Groq's Llama 3.3 70B.
 *
 * Uses JSON mode with the full system prompt (including few-shot examples)
 * since Groq does not support native function calling. Retries once on
 * parse or validation failure.
 *
 * @param oldContent - Previous page content (from earlier snapshot)
 * @param newContent - Current page content (from new snapshot)
 * @param bankName   - Bank that owns this page
 * @param url        - Source URL being analyzed
 * @param cardName   - The specific card this T&C belongs to, or null for bank-wide
 * @returns Validated ClassificationResponse
 * @throws Error if both attempts fail
 */
export async function classifyWithGroq(
  oldContent: string,
  newContent: string,
  bankName: string,
  url: string,
  cardName?: string | null
): Promise<ClassificationResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY environment variable');
  }

  const groq = new Groq({ apiKey });

  // Build the system prompt with few-shot examples and JSON schema guidance
  const systemPrompt =
    buildFullSystemPrompt() +
    '\n\nYou MUST respond with JSON matching this schema:\n' +
    JSON.stringify(GROQ_RESPONSE_SCHEMA, null, 2);

  // Build the user message
  const userMessage = buildClassificationPrompt(oldContent, newContent, bankName, url, cardName);

  // First attempt
  try {
    const result = await callGroq(groq, systemPrompt, userMessage);
    return result;
  } catch (firstError) {
    console.warn(
      `[Groq] First attempt failed: ${firstError instanceof Error ? firstError.message : String(firstError)}. Retrying...`
    );

    // Retry once
    const result = await callGroq(groq, systemPrompt, userMessage);
    return result;
  }
}

/**
 * Classify using a custom system prompt and user message (for MileLion comparison).
 *
 * Same as classifyWithGroq but accepts pre-built prompts.
 */
export async function classifyWithGroqCustomPrompt(
  systemPrompt: string,
  userMessage: string
): Promise<ClassificationResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY environment variable');
  }

  const groq = new Groq({ apiKey });

  const fullSystemPrompt =
    systemPrompt +
    '\n\nYou MUST respond with JSON matching this schema:\n' +
    JSON.stringify(GROQ_RESPONSE_SCHEMA, null, 2);

  try {
    return await callGroq(groq, fullSystemPrompt, userMessage);
  } catch (firstError) {
    console.warn(
      `[Groq] First attempt failed: ${firstError instanceof Error ? firstError.message : String(firstError)}. Retrying...`
    );
    return await callGroq(groq, fullSystemPrompt, userMessage);
  }
}

/**
 * Make a single Groq API call with JSON mode and validate the response.
 */
async function callGroq(
  groq: Groq,
  systemPrompt: string,
  userMessage: string
): Promise<ClassificationResponse> {
  const completion = await groq.chat.completions.create(
    {
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 4096,
    },
    {
      timeout: TIMEOUT_MS,
    }
  );

  const choice = completion.choices[0];
  if (!choice || !choice.message?.content) {
    throw new Error('Groq returned no response content');
  }

  const rawContent = choice.message.content;

  // Parse JSON response
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch (parseError) {
    throw new Error(
      `Groq returned invalid JSON: ${rawContent.substring(0, 200)}`
    );
  }

  // Validate the response
  const validation = validateClassificationResponse(parsed);
  if (!validation.valid) {
    throw new Error(
      `Groq response validation failed: ${validation.errors.join('; ')}`
    );
  }

  return validation.data;
}
