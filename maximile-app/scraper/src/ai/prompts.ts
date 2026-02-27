// =============================================================================
// MaxiMile Scraper — AI Classification Prompts (Sprint 15 — T15.01)
// =============================================================================
// System prompt and few-shot examples for the AI classification pipeline.
//
// Two AI providers are supported:
//   - Primary:  Google Gemini 2.5 Flash  (free tier, tool_use / function calling)
//   - Fallback: Groq Llama 3.3 70B      (free tier, JSON mode)
//
// The prompt instructs the model to compare old vs new page content and
// output structured rate change records matching the detected_changes table
// (Migration 018).
//
// Architecture Reference: docs/RATE_DETECTION_ARCHITECTURE.md
// DB Schema Reference:    database/migrations/018_detection_pipeline.sql
//
// Author:  AI Engineer
// Created: 2026-02-21
// Sprint:  15 — AI Classification Pipeline (F23 v2.0)
// =============================================================================

// ---------------------------------------------------------------------------
// All 30 tracked credit cards (must match database cards table exactly)
// ---------------------------------------------------------------------------

export const TRACKED_CARDS = [
  // DBS (3) + POSB (1)
  'DBS Altitude Visa',
  'DBS Woman\'s World Card',
  'DBS Vantage Visa Infinite',
  'POSB Everyday Card',
  // OCBC (3)
  'OCBC 90\u00b0N Visa',
  'OCBC Titanium Rewards',
  'OCBC VOYAGE Card',
  // UOB (6)
  'UOB PRVI Miles Visa',
  'UOB Preferred Platinum Visa',
  'UOB Lady\'s Card',
  'UOB Lady\'s Solitaire Metal Card',
  'UOB Visa Signature',
  'KrisFlyer UOB Card',
  // HSBC (3)
  'HSBC Revolution Card',
  'HSBC TravelOne Card',
  'HSBC Premier Mastercard',
  // Amex (2)
  'Amex KrisFlyer Ascend',
  'Amex KrisFlyer Credit Card',
  // BOC (1)
  'BOC Elite Miles Card',
  // Standard Chartered (5)
  'SC Visa Infinite Card',
  'SC X Card',
  'SC Journey Card',
  'SC Smart Card',
  'SC Beyond Card',
  // Maybank (4)
  'Maybank Horizon Visa Signature',
  'Maybank FC Barcelona Card',
  'Maybank World Mastercard',
  'Maybank XL Rewards Card',
  // Citi (2)
  'Citi Rewards Card',
  'Citi PremierMiles Card',
] as const;

export type TrackedCardName = (typeof TRACKED_CARDS)[number];

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

export const SYSTEM_PROMPT = `You are a Singapore credit card rate change detector for the MaxiMile app.

## Your Role

You analyze changes in official Terms & Conditions (T&C) documents for Singapore bank credit cards. Given a BEFORE (old) and AFTER (new) version of extracted PDF text from a bank's T&C document, you identify any meaningful changes to credit card earn rates, spending caps, transfer ratios, partner programs, annual fees, or card lifecycle events.

## Input Format

Your input is extracted text from official bank T&C PDF documents. Be aware of common PDF text extraction artifacts:
- Table columns may not align perfectly (numbers may appear separated from their labels)
- Headers and footers may be repeated on each page
- Bullet points may be extracted as special characters or missing
- Page numbers may appear inline with content
- Multi-column layouts may interleave text from different columns

Focus on the semantic meaning of the text rather than exact formatting.

## What Constitutes a Rate Change

You MUST detect these types of changes:

1. **earn_rate_change** — A change to the miles/points earned per dollar spent (mpd), including category-specific earn rates (e.g., dining, transport, online, groceries, petrol, bills, travel, general).
2. **cap_adjustment** — A change to spending caps, monthly/annual bonus limits, or points caps that affect how much a cardholder can earn at bonus rates.
3. **program_devaluation** — A change to transfer ratios between points/miles programs (e.g., MR to KrisFlyer conversion worsening), or a fundamental restructuring that reduces overall value.
4. **new_card_launch** — A new credit card product being introduced by a bank.
5. **card_discontinued** — An existing credit card product being retired, merged, or no longer available for new applications.

## Cards We Track

You should identify changes affecting any of these 30 Singapore credit cards:

${TRACKED_CARDS.map((card, i) => `${i + 1}. ${card}`).join('\n')}

If a change affects a card NOT on this list, still report it but note that the card is not currently tracked. Use the closest matching name from the list above when possible.

## Output Format

Use the provided tool/function \`report_rate_changes\` to return your analysis as structured JSON. Your output MUST include:

- **changes**: An array of detected rate changes (empty array if none found).
- **no_changes_detected**: Set to \`true\` if no rate-relevant changes were found, \`false\` otherwise.
- **analysis_notes**: A brief (1-3 sentence) explanation of your reasoning.

For each change in the \`changes\` array, provide ALL required fields:
- \`card_name\`: Exact card name from the tracked list above
- \`change_type\`: One of \`earn_rate_change\`, \`cap_adjustment\`, \`program_devaluation\`, \`new_card_launch\`, \`card_discontinued\`
- \`category\`: Spend category affected (\`dining\`, \`transport\`, \`online\`, \`groceries\`, \`petrol\`, \`bills\`, \`travel\`, \`general\`) or \`null\` for program-wide changes
- \`old_value\`: Previous value as a human-readable string (e.g., "4 mpd cap S$1,500/month")
- \`new_value\`: New value as a human-readable string (e.g., "4 mpd cap S$1,000/month")
- \`effective_date\`: When the change takes effect in YYYY-MM-DD format, or \`null\` if not stated
- \`severity\`: One of \`info\`, \`warning\`, \`critical\` (see guidelines below)
- \`confidence\`: A number from 0.00 to 1.00 (see guidelines below)
- \`alert_title\`: A short (max 60 characters) human-readable title for the alert
- \`alert_body\`: A detailed (max 300 characters) description of the change and its impact on cardholders

## Severity Guidelines

- **critical**: Rate decreases greater than 20%, program devaluations (transfer ratio worsening), card discontinuations. These are changes that significantly reduce the value proposition of a card.
- **warning**: Rate decreases of 20% or less, cap reductions, fee increases. These are negative changes that affect cardholders but do not fundamentally break the card's value.
- **info**: Rate increases, cap increases, new benefits added, new card launches. These are positive or neutral changes.

## Confidence Guidelines

- **0.90 - 1.00**: Clear, unambiguous change with specific numerical values mentioned in both old and new content. The change is explicitly stated (e.g., "effective 1 August 2025, the bonus cap will be reduced from S$2,000 to S$1,000").
- **0.70 - 0.89**: Likely change but some ambiguity in exact values or scope. The direction of change is clear but specific numbers may be inferred rather than explicitly stated.
- **0.50 - 0.69**: Possible change that needs human verification. The wording suggests a change but it could be a rephrasing, temporary promotion, or the scope is unclear.
- **0.00 - 0.49**: Unlikely to be a real rate change. Cosmetic edits, formatting changes, date updates, or promotional language that does not indicate a permanent terms change. Do NOT report these as changes.

## Important Rules

1. **Return an empty changes array** if no rate-relevant changes are detected. Do NOT fabricate changes.
2. **Ignore cosmetic changes**: Formatting, typo fixes, navigation changes, promotional banner rotations, footer updates, cookie consent changes, and layout adjustments are NOT rate changes.
3. **Ignore temporary promotions**: Short-term bonus earn rate promotions (e.g., "Earn 5X points this weekend only") are NOT permanent rate changes unless they explicitly state they are replacing the existing earn structure.
4. **Be precise with values**: Always quote the exact old and new values from the page content. Do not round or approximate.
5. **One change per item**: If a single page update contains multiple distinct changes (e.g., both a rate cut and a cap reduction), report them as separate items in the changes array.
6. **Singapore market only**: Only report changes relevant to Singapore-issued credit cards.`;

// ---------------------------------------------------------------------------
// Few-shot examples (based on the 5 seed records from Migration 015)
// ---------------------------------------------------------------------------

export interface FewShotExample {
  input: {
    bank_name: string;
    url: string;
    old_content: string;
    new_content: string;
  };
  output: {
    changes: Array<{
      card_name: string;
      change_type: string;
      category: string | null;
      old_value: string;
      new_value: string;
      effective_date: string | null;
      severity: string;
      confidence: number;
      alert_title: string;
      alert_body: string;
    }>;
    no_changes_detected: boolean;
    analysis_notes: string;
  };
}

export const FEW_SHOT_EXAMPLES: FewShotExample[] = [
  // -------------------------------------------------------------------------
  // Example 1: Amex MR Devaluation (critical, confidence 0.95)
  // -------------------------------------------------------------------------
  {
    input: {
      bank_name: 'Amex',
      url: 'https://www.americanexpress.com/en-sg/rewards/membership-rewards/about-program',
      old_content: `Membership Rewards Programme

Transfer your Membership Rewards points to our airline partners:

KrisFlyer (Singapore Airlines)
Transfer ratio: 1 MR point = 1 KrisFlyer mile
Minimum transfer: 5,000 points

Asia Miles (Cathay Pacific)
Transfer ratio: 1 MR point = 1 Asia Mile
Minimum transfer: 5,000 points

Points are earned on eligible purchases made with your American Express Card.
Earn 1 MR point per S$1.60 spent on the KrisFlyer Ascend card.`,
      new_content: `Membership Rewards Programme

Transfer your Membership Rewards points to our airline partners:

KrisFlyer (Singapore Airlines)
Transfer ratio: 1.5 MR points = 1 KrisFlyer mile
Minimum transfer: 5,000 points
Effective 1 November 2025

Asia Miles (Cathay Pacific)
Transfer ratio: 1 MR point = 1 Asia Mile
Minimum transfer: 5,000 points

Points are earned on eligible purchases made with your American Express Card.
Earn 1 MR point per S$1.60 spent on the KrisFlyer Ascend card.`,
    },
    output: {
      changes: [
        {
          card_name: 'Amex KrisFlyer Ascend',
          change_type: 'program_devaluation',
          category: null,
          old_value: '1 MR point = 1 KrisFlyer mile',
          new_value: '1.5 MR points = 1 KrisFlyer mile (33% devaluation)',
          effective_date: '2025-11-01',
          severity: 'critical',
          confidence: 0.95,
          alert_title: 'Rate Alert: Amex MR Devaluation',
          alert_body:
            'Amex Membership Rewards transfer rate to KrisFlyer has worsened by 33%. You now need 1.5 MR points per KrisFlyer mile instead of 1:1. Effective earn rate drops from ~1.2 mpd to ~0.8 mpd. Consider alternative cards for KrisFlyer earning.',
        },
      ],
      no_changes_detected: false,
      analysis_notes:
        'The KrisFlyer transfer ratio explicitly changed from 1:1 to 1.5:1 with a stated effective date. This is a clear 33% program devaluation affecting all Amex MR cardholders who transfer to KrisFlyer.',
    },
  },

  // -------------------------------------------------------------------------
  // Example 2: DBS Woman's World Cap Reduction (warning, confidence 0.92)
  // -------------------------------------------------------------------------
  {
    input: {
      bank_name: 'DBS',
      url: 'https://www.dbs.com.sg/personal/cards/credit-cards/dbs-woman-mastercard-card',
      old_content: `DBS Woman's World Mastercard

Earn 4 miles per dollar (mpd) on online, contactless, and selected categories.

10X DBS Points (4 mpd) on:
- Online spend
- Contactless (tap & pay)
- Selected online and contactless merchants

Bonus cap: S$2,000 per calendar month
Base earn rate: 0.4 mpd on all other spend

Annual fee: S$194.40 (First year waived)`,
      new_content: `DBS Woman's World Mastercard

Earn 4 miles per dollar (mpd) on online, contactless, and selected categories.

10X DBS Points (4 mpd) on:
- Online spend
- Contactless (tap & pay)
- Selected online and contactless merchants

Bonus cap: S$1,000 per calendar month
Effective 1 August 2025
Base earn rate: 0.4 mpd on all other spend

Annual fee: S$194.40 (First year waived)`,
    },
    output: {
      changes: [
        {
          card_name: "DBS Woman's World Card",
          change_type: 'cap_adjustment',
          category: null,
          old_value: 'S$2,000/month bonus cap',
          new_value: 'S$1,000/month bonus cap',
          effective_date: '2025-08-01',
          severity: 'warning',
          confidence: 0.92,
          alert_title: "Cap Change: DBS Woman's World Card",
          alert_body:
            'The 4 mpd bonus cap has been reduced from S$2,000 to S$1,000 per month. This means 50% less bonus spending capacity. Consider supplementing with another high-earn card for spend above S$1,000.',
        },
      ],
      no_changes_detected: false,
      analysis_notes:
        'The monthly bonus cap was explicitly reduced from S$2,000 to S$1,000 with a stated effective date. This is a significant cap reduction (50%) that limits the earning potential of the card.',
    },
  },

  // -------------------------------------------------------------------------
  // Example 3: BOC Elite Miles Rate Increase (info, confidence 0.88)
  // -------------------------------------------------------------------------
  {
    input: {
      bank_name: 'BOC',
      url: 'https://www.bankofchina.com/sg/bcservice/bc1/201909/t20190903_16537165.html',
      old_content: `BOC Elite Miles World Mastercard

Earn miles on every purchase:

Overseas spend: 3.0 miles per S$1 (mpd)
Dining (local): 2.0 miles per S$1 (mpd)
All other local spend: 1.5 miles per S$1 (mpd)

Miles are credited as BOC Travel Miles, convertible to KrisFlyer or Asia Miles at 1:1.

Annual fee: S$193.50 (waived for first year)
Minimum income: S$30,000 per annum`,
      new_content: `BOC Elite Miles World Mastercard

Earn miles on every purchase:

Overseas spend: 3.0 miles per S$1 (mpd)
Dining (local): 3.0 miles per S$1 (mpd)
All other local spend: 1.5 miles per S$1 (mpd)

Enhanced dining earn rate effective 1 June 2025.

Miles are credited as BOC Travel Miles, convertible to KrisFlyer or Asia Miles at 1:1.

Annual fee: S$193.50 (waived for first year)
Minimum income: S$30,000 per annum`,
    },
    output: {
      changes: [
        {
          card_name: 'BOC Elite Miles Card',
          change_type: 'earn_rate_change',
          category: 'dining',
          old_value: '2.0 mpd on dining',
          new_value: '3.0 mpd on dining',
          effective_date: '2025-06-01',
          severity: 'info',
          confidence: 0.88,
          alert_title: 'BOC Elite Miles: Dining Rate Improved',
          alert_body:
            'The dining earn rate has been increased from 2.0 mpd to 3.0 mpd, making BOC Elite Miles more competitive for dining spend. Now matches the overseas earn rate at 3.0 mpd.',
        },
      ],
      no_changes_detected: false,
      analysis_notes:
        'The dining earn rate was explicitly increased from 2.0 to 3.0 mpd with an effective date mentioned. This is a positive rate change for the dining category.',
    },
  },

  // -------------------------------------------------------------------------
  // Example 4: Maybank Horizon Cap Reduction (warning, confidence 0.85)
  // -------------------------------------------------------------------------
  {
    input: {
      bank_name: 'Maybank',
      url: 'https://www.maybank2u.com.sg/en/personal/cards/credit/maybank-horizon-visa-signature-card.page',
      old_content: `Maybank Horizon Visa Signature Card

Earn TreatsPoints on all purchases.

Earn rates:
- Local retail: 3.2 TreatsPoints per S$1 (0.8 mpd equivalent)
- Overseas: 5 TreatsPoints per S$1 (1.25 mpd equivalent)
- Contactless: 5 TreatsPoints per S$1 (1.25 mpd equivalent)

Bonus cap: S$800/month on accelerated categories

Annual fee: S$196.00 (first year waiver)
Minimum income: S$30,000`,
      new_content: `Maybank Horizon Visa Signature Card

Earn TreatsPoints on all purchases.

Earn rates:
- Local retail: 3.2 TreatsPoints per S$1 (0.8 mpd equivalent)
- Overseas: 5 TreatsPoints per S$1 (1.25 mpd equivalent)
- Contactless: 5 TreatsPoints per S$1 (1.25 mpd equivalent)

Bonus cap: S$600/month on accelerated categories

Annual fee: S$235.00 (first year waiver)
Minimum income: S$30,000`,
    },
    output: {
      changes: [
        {
          card_name: 'Maybank Horizon Visa Signature',
          change_type: 'cap_adjustment',
          category: null,
          old_value: 'S$800/month bonus cap on accelerated categories',
          new_value: 'S$600/month bonus cap on accelerated categories',
          effective_date: null,
          severity: 'warning',
          confidence: 0.85,
          alert_title: 'Maybank Horizon: Bonus Cap Reduced',
          alert_body:
            'The monthly bonus cap on accelerated categories (overseas, contactless) has been reduced from S$800 to S$600. You now earn bonus TreatsPoints on 25% less spend per month.',
        },
        {
          card_name: 'Maybank Horizon Visa Signature',
          change_type: 'earn_rate_change',
          category: null,
          old_value: '$196.00/year (first year waived)',
          new_value: '$235.00/year (first year waived)',
          effective_date: null,
          severity: 'warning',
          confidence: 0.85,
          alert_title: 'Maybank Horizon: Annual Fee Increase',
          alert_body:
            'Annual fee increased from S$196 to S$235 (20% increase). First year waiver still applies. Consider whether the TreatsPoints earn rate justifies the higher fee compared to alternatives.',
        },
      ],
      no_changes_detected: false,
      analysis_notes:
        'Two changes detected: (1) bonus cap reduced from S$800 to S$600 per month, and (2) annual fee increased from S$196 to S$235. No effective date is stated for either change, so confidence is slightly lower.',
    },
  },

  // -------------------------------------------------------------------------
  // Example 5: HSBC Revolution Cap Increase (info, confidence 0.90)
  // -------------------------------------------------------------------------
  {
    input: {
      bank_name: 'HSBC',
      url: 'https://www.hsbc.com.sg/credit-cards/products/revolution/',
      old_content: `HSBC Revolution Card

Earn 10X Reward Points (4 mpd) on:
- Dining
- Online shopping
- Tap & Go contactless payments
- Entertainment (movies, streaming, music)

Base earn rate: 1X on all other spend (0.4 mpd)

Monthly bonus cap: S$1,000
Points earned above the monthly cap revert to the base rate of 1X.

Annual fee: S$160.50 (waived for first 2 years)`,
      new_content: `HSBC Revolution Card

Earn 10X Reward Points (4 mpd) on:
- Dining
- Online shopping
- Tap & Go contactless payments
- Entertainment (movies, streaming, music)

Base earn rate: 1X on all other spend (0.4 mpd)

Monthly bonus cap: S$1,500
Effective 15 January 2026. Points earned above the monthly cap revert to the base rate of 1X.

Annual fee: S$160.50 (waived for first 2 years)`,
    },
    output: {
      changes: [
        {
          card_name: 'HSBC Revolution Card',
          change_type: 'cap_adjustment',
          category: null,
          old_value: 'S$1,000/month bonus cap',
          new_value: 'S$1,500/month bonus cap',
          effective_date: '2026-01-15',
          severity: 'info',
          confidence: 0.90,
          alert_title: 'HSBC Revolution: Bonus Cap Boosted',
          alert_body:
            'Great news! The monthly bonus cap has been increased from S$1,000 to S$1,500. You can now earn 10x points (4 mpd) on 50% more spending each month.',
        },
      ],
      no_changes_detected: false,
      analysis_notes:
        'The monthly bonus cap was explicitly increased from S$1,000 to S$1,500 with a stated effective date of 15 January 2026. This is a positive change for HSBC Revolution cardholders.',
    },
  },
];

// ---------------------------------------------------------------------------
// MileLion comparison prompt
// ---------------------------------------------------------------------------

export const MILELION_COMPARISON_PROMPT = buildMileLionSystemPrompt();

function buildMileLionSystemPrompt(): string {
  const cardList = TRACKED_CARDS.map((card, i) => `${i + 1}. ${card}`).join('\n');

  return `You are a Singapore credit card rate change detector for the MaxiMile app.

## Your Role

You compare credit card earn rate information from a MileLion review article against our internal database records. Your job is to identify any discrepancies — places where MileLion's data differs from what we have stored.

MileLion (milelion.com) is an authoritative Singapore miles & points blog that publishes detailed, human-verified credit card reviews. When their data differs from ours, it likely means either:
1. The bank has updated their card's terms (and MileLion has captured the change)
2. Our database has an error or is outdated

## What to Look For

Compare the MileLion article against our database and flag differences in:
1. **Earn rates** (mpd / points per dollar) for any spending category
2. **Spending caps** (monthly/annual bonus caps, minimum spend thresholds)
3. **Transfer ratios** (points-to-miles conversion rates)
4. **Category definitions** (which merchant types qualify for bonus rates)
5. **Card availability** (discontinued, new launches, name changes)

## Cards We Track

${cardList}

## Output Format

Use the provided tool/function report_rate_changes to return your analysis as structured JSON. Your output MUST include:

- **changes**: An array of detected discrepancies (empty array if none found).
- **no_changes_detected**: Set to true if MileLion data matches our DB, false otherwise.
- **analysis_notes**: A brief (1-3 sentence) explanation of your comparison.

For each discrepancy in the changes array, provide ALL required fields:
- card_name: Exact card name from the tracked list above
- change_type: One of earn_rate_change, cap_adjustment, program_devaluation, new_card_launch, card_discontinued
- category: Spend category affected or null for card-wide changes
- old_value: What our database currently shows
- new_value: What MileLion's review states
- effective_date: Date mentioned in MileLion article, or null
- severity: info (rate increase), warning (rate decrease <=20%), critical (rate decrease >20%)
- confidence: 0.00-1.00 based on how clear the discrepancy is
- alert_title: Short (max 60 chars) human-readable title
- alert_body: Detailed (max 300 chars) description

## Important Rules

1. **Return an empty changes array** if MileLion's data matches our database. Do NOT fabricate discrepancies.
2. **Ignore editorial content**: Opinions, recommendations, comparisons to other cards, and promotional language are NOT rate changes.
3. **Be precise**: Quote exact values from both MileLion and our DB.
4. **One discrepancy per item**: Report each difference as a separate item.
5. **Singapore market only**: Only report data for Singapore-issued cards.`;
}

/**
 * Builds the user-message prompt for MileLion comparison.
 *
 * Instead of comparing old vs new page content (T&C diff), this compares
 * MileLion's article content against our internal database summary.
 *
 * @param mileLionContent - Extracted text from the MileLion review article
 * @param dbSummary       - Formatted summary of our database's card data
 * @param bankName        - The bank that issues this card
 * @param cardName        - The specific card name
 * @param url             - The MileLion review URL
 * @returns The formatted user message string
 */
export function buildMileLionComparisonPrompt(
  mileLionContent: string,
  dbSummary: string,
  bankName: string,
  cardName: string,
  url: string
): string {
  // Truncate MileLion content if very long
  const MAX_CONTENT_LENGTH = 30_000;
  const trimmedContent = mileLionContent.length > MAX_CONTENT_LENGTH
    ? mileLionContent.substring(0, MAX_CONTENT_LENGTH) + '\n\n[... content truncated ...]'
    : mileLionContent;

  return `Compare the following MileLion review article against our database records and identify any discrepancies in earn rates, caps, or conditions.

## Source Information
- **Bank**: ${bankName}
- **Card**: ${cardName}
- **MileLion Review URL**: ${url}

## Our Database Records
\`\`\`
${dbSummary}
\`\`\`

## MileLion Review Content
\`\`\`
${trimmedContent}
\`\`\`

## Instructions
Compare the MileLion review content above against our database records. Identify any discrepancies in earn rates, spending caps, transfer ratios, category definitions, or card availability. Use the \`report_rate_changes\` tool to report your findings. If MileLion's data matches our database, return an empty changes array with \`no_changes_detected: true\`.

Focus on **factual earn rate data** in the MileLion article (tables, bullet points with rates) rather than editorial commentary.`;
}

// ---------------------------------------------------------------------------
// Format few-shot examples into prompt text
// ---------------------------------------------------------------------------

/**
 * Serializes the few-shot examples into a text block suitable for appending
 * to the system prompt (for providers that don't support native few-shot).
 */
export function formatFewShotExamples(): string {
  const parts: string[] = [];

  for (let i = 0; i < FEW_SHOT_EXAMPLES.length; i++) {
    const example = FEW_SHOT_EXAMPLES[i];
    parts.push(`--- Example ${i + 1} ---`);
    parts.push('INPUT:');
    parts.push(`Bank: ${example.input.bank_name}`);
    parts.push(`URL: ${example.input.url}`);
    parts.push(`Old content:\n${example.input.old_content}`);
    parts.push(`New content:\n${example.input.new_content}`);
    parts.push('');
    parts.push('OUTPUT:');
    parts.push(JSON.stringify(example.output, null, 2));
    parts.push('');
  }

  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Build classification prompt (user message)
// ---------------------------------------------------------------------------

/**
 * Builds the user-message prompt sent alongside the system prompt.
 *
 * This formats the old/new content comparison that the AI model will analyze.
 * The system prompt + few-shot examples provide the instructions; this function
 * provides the specific input for a single classification request.
 *
 * @param oldContent - The previous page content (from the earlier snapshot)
 * @param newContent - The current page content (from the new snapshot)
 * @param bankName   - The bank that owns this page (e.g., "DBS", "OCBC")
 * @param url        - The source URL being analyzed
 * @param cardName   - The specific card this T&C belongs to, or null for bank-wide
 * @returns The formatted user message string
 */
export function buildClassificationPrompt(
  oldContent: string,
  newContent: string,
  bankName: string,
  url: string,
  cardName?: string | null
): string {
  // Truncate very long content to stay within token limits.
  // T&C PDFs can be longer than web pages — allow 30,000 chars per side
  // (~8,000 tokens). Gemini 2.0 Flash has a 1M token context window.
  const MAX_CONTENT_LENGTH = 30_000;

  const trimmedOld = oldContent.length > MAX_CONTENT_LENGTH
    ? oldContent.substring(0, MAX_CONTENT_LENGTH) + '\n\n[... content truncated ...]'
    : oldContent;

  const trimmedNew = newContent.length > MAX_CONTENT_LENGTH
    ? newContent.substring(0, MAX_CONTENT_LENGTH) + '\n\n[... content truncated ...]'
    : newContent;

  const cardInfo = cardName ? `\n- **Card**: ${cardName}` : '';

  return `Analyze the following T&C document change and report any credit card rate changes.

## Source Information
- **Bank**: ${bankName}${cardInfo}
- **URL**: ${url}
- **Document type**: Official Terms & Conditions PDF

## Previous T&C Content (BEFORE)
\`\`\`
${trimmedOld}
\`\`\`

## Current T&C Content (AFTER)
\`\`\`
${trimmedNew}
\`\`\`

## Instructions
Compare the BEFORE and AFTER T&C content above. Identify any changes to credit card earn rates, spending caps, transfer ratios, fees, or card availability. Use the \`report_rate_changes\` tool to report your findings. If no rate-relevant changes are found, return an empty changes array with \`no_changes_detected: true\`.${cardName ? `\n\nNote: This T&C document is specifically for the **${cardName}**. Focus your analysis on changes affecting this card.` : ''}`;
}

// ---------------------------------------------------------------------------
// Build full prompt with few-shot (for providers without native few-shot)
// ---------------------------------------------------------------------------

/**
 * Combines the system prompt with few-shot examples into a single string.
 * Used for Groq (JSON mode) where we cannot send separate few-shot messages.
 *
 * For Gemini (tool_use mode), use SYSTEM_PROMPT directly and pass
 * FEW_SHOT_EXAMPLES as separate user/assistant message pairs.
 */
export function buildFullSystemPrompt(): string {
  return `${SYSTEM_PROMPT}

## Few-Shot Examples

The following examples demonstrate the expected input/output format:

${formatFewShotExamples()}`;
}
