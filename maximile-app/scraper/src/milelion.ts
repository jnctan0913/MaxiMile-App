// =============================================================================
// MaxiMile Scraper — MileLion Review Page Scraper
// =============================================================================
// Fetches MileLion credit card review pages, extracts:
//   1. dateModified from JSON-LD structured data (for date gating)
//   2. Article body text (for AI comparison against our DB)
//   3. Content hash (SHA-256 of article text)
//
// MileLion is a WordPress site with server-rendered HTML — no Playwright needed.
// JSON-LD is embedded in <script type="application/ld+json"> tags.
// =============================================================================

import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MileLionScrapeResult {
  /** ISO 8601 dateModified from JSON-LD, or null if not found. */
  dateModified: string | null;
  /** Extracted article body text (HTML stripped). */
  content: string;
  /** SHA-256 hex digest of the content. */
  contentHash: string;
  /** Whether the scrape succeeded. */
  success: boolean;
  /** Error message if scrape failed. */
  error?: string;
}

// ---------------------------------------------------------------------------
// Main scraper function
// ---------------------------------------------------------------------------

/**
 * Scrape a MileLion review page.
 *
 * 1. HTTP fetch the page (WordPress is server-rendered, no JS needed)
 * 2. Extract dateModified from JSON-LD structured data
 * 3. Extract article body text (strip HTML tags)
 * 4. Compute SHA-256 content hash
 *
 * @param url - The MileLion review page URL
 * @returns MileLionScrapeResult with dateModified, content, and hash
 */
export async function scrapeMileLionPage(url: string): Promise<MileLionScrapeResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MaxiMile-RateBot/1.0 (+https://github.com/maximile-app)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      return {
        dateModified: null,
        content: '',
        contentHash: '',
        success: false,
        error: `HTTP ${response.status} ${response.statusText}`,
      };
    }

    const html = await response.text();

    // Extract dateModified from JSON-LD
    const dateModified = extractDateModified(html);

    // Extract article body text
    const content = extractArticleContent(html);

    if (!content) {
      return {
        dateModified,
        content: '',
        contentHash: '',
        success: false,
        error: 'No article content found on page',
      };
    }

    // Compute content hash
    const contentHash = crypto
      .createHash('sha256')
      .update(content, 'utf8')
      .digest('hex');

    return {
      dateModified,
      content,
      contentHash,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      dateModified: null,
      content: '',
      contentHash: '',
      success: false,
      error: errorMessage,
    };
  }
}

// ---------------------------------------------------------------------------
// JSON-LD dateModified extraction
// ---------------------------------------------------------------------------

/**
 * Extract dateModified from JSON-LD structured data in the page HTML.
 *
 * MileLion embeds JSON-LD like:
 *   <script type="application/ld+json">
 *   { "@type": "Article", "dateModified": "2026-02-04T09:28:49+08:00", ... }
 *   </script>
 *
 * We use regex on raw HTML for speed — no DOM parsing needed.
 *
 * @param html - Raw HTML of the page
 * @returns ISO 8601 dateModified string, or null if not found
 */
export function extractDateModified(html: string): string | null {
  // Match dateModified value in JSON-LD blocks
  const pattern = /"dateModified"\s*:\s*"([^"]+)"/;
  const match = html.match(pattern);

  if (match && match[1]) {
    return match[1];
  }

  return null;
}

// ---------------------------------------------------------------------------
// Article content extraction
// ---------------------------------------------------------------------------

/**
 * Extract the main article content from the MileLion page HTML.
 *
 * Strategy:
 *   1. Try to find content within <article> or .entry-content (WordPress standard)
 *   2. Fall back to <body> content
 *   3. Strip all HTML tags, normalize whitespace
 *
 * @param html - Raw HTML of the page
 * @returns Plain text content of the article
 */
export function extractArticleContent(html: string): string {
  let articleHtml = '';

  // Try WordPress entry-content div first (most precise)
  const entryContentMatch = html.match(
    /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<\/div>|<footer|<div[^>]*class="[^"]*(?:post-tags|sharedaddy|comments))/i
  );
  if (entryContentMatch) {
    articleHtml = entryContentMatch[1];
  }

  // Try <article> tag
  if (!articleHtml) {
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
      articleHtml = articleMatch[1];
    }
  }

  // Fall back to body
  if (!articleHtml) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      articleHtml = bodyMatch[1];
    }
  }

  if (!articleHtml) {
    return '';
  }

  return stripHtml(articleHtml);
}

/**
 * Strip HTML tags and normalize whitespace to produce clean plain text.
 */
function stripHtml(html: string): string {
  return html
    // Remove script and style blocks
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Replace common block-level elements with newlines
    .replace(/<\/(p|div|h[1-6]|li|tr|br\s*\/?)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Normalize whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}
