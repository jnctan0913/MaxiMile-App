// =============================================================================
// MaxiMile Scraper — Playwright Page Fetcher + CSS Extraction
// =============================================================================
// Fetches page content using either Playwright (for JS-rendered SPAs)
// or native fetch (for static HTML pages). Extracts content using
// CSS selectors when provided.
//
// Key design decisions:
//   - Playwright method: launches headless Chromium, waits for networkidle
//   - HTTP method: uses native fetch() for lightweight static page retrieval
//   - Timeout: 30 seconds per page
//   - Browser is launched and closed per call (stateless for GH Actions)
// =============================================================================

import { chromium, type Browser, type Page } from 'playwright';
import pdfParse from 'pdf-parse';
import { computeContentHash } from './hasher.js';
import type { ScrapeResult, ScrapeMethod } from './types.js';

/** Page load timeout in milliseconds (30 seconds). */
const PAGE_TIMEOUT_MS = 30_000;

/**
 * Scrape a single page and return extracted content with its SHA-256 hash.
 *
 * @param url         - The URL to fetch.
 * @param cssSelector - CSS selector targeting the main content area, or null for full page.
 * @param method      - 'playwright' for JS-rendered pages, 'http' for static HTML.
 * @returns A ScrapeResult with content, hash, and success/error info.
 */
export async function scrapePage(
  url: string,
  cssSelector: string | null,
  method: ScrapeMethod
): Promise<ScrapeResult> {
  try {
    let content: string;

    if (method === 'playwright') {
      content = await scrapeWithPlaywright(url, cssSelector);
    } else {
      content = await scrapeWithHttp(url, cssSelector);
    }

    // Normalize whitespace for consistent hashing
    content = normalizeContent(content);

    if (!content || content.trim().length === 0) {
      return {
        url,
        content: '',
        contentHash: '',
        success: false,
        error: 'Extracted content is empty',
        tcVersion: null,
        tcLastUpdated: null,
      };
    }

    // Warn if PDF text is suspiciously short (might be scanned image)
    if ((url.endsWith('.pdf') || content.length < 100) && content.length < 100) {
      console.warn(
        `[Scraper] Warning: Extracted text from ${url} is only ${content.length} chars — ` +
          `might be a scanned image PDF with no extractable text.`
      );
    }

    const contentHash = computeContentHash(content);

    // Extract T&C version and last-updated date from content
    const tcVersion = extractTcVersion(content);
    const tcLastUpdated = extractTcLastUpdated(content);

    if (tcVersion) {
      console.log(`[Scraper] Extracted T&C version: ${tcVersion}`);
    }
    if (tcLastUpdated) {
      console.log(`[Scraper] Extracted T&C last updated: ${tcLastUpdated}`);
    }

    return {
      url,
      content,
      contentHash,
      success: true,
      tcVersion,
      tcLastUpdated,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    return {
      url,
      content: '',
      contentHash: '',
      success: false,
      error: errorMessage,
      tcVersion: null,
      tcLastUpdated: null,
    };
  }
}

// ---------------------------------------------------------------------------
// Playwright-based scraping (JS-rendered pages)
// ---------------------------------------------------------------------------

/**
 * Fetch a JS-rendered page using headless Chromium.
 *
 * Launches a browser, navigates to the URL, waits for network idle,
 * then extracts text content via CSS selector (or full page body).
 */
async function scrapeWithPlaywright(
  url: string,
  cssSelector: string | null
): Promise<string> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      locale: 'en-SG',
      timezoneId: 'Asia/Singapore',
    });

    const page: Page = await context.newPage();
    page.setDefaultTimeout(PAGE_TIMEOUT_MS);

    // Navigate — use domcontentloaded (faster, more reliable than networkidle
    // which hangs on pages with long-polling or analytics scripts)
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: PAGE_TIMEOUT_MS,
    });

    // Give JS frameworks a moment to render after DOM is ready
    await page.waitForTimeout(3000);

    // Extract content — try CSS selector first, fall back to full body
    let content: string;

    if (cssSelector) {
      try {
        const element = await page.waitForSelector(cssSelector, {
          timeout: 8000, // Short timeout — don't waste 30s on a bad selector
        });
        content = (element ? await element.textContent() : null) ?? '';
      } catch {
        // Selector not found — fall back to full page body
        console.log(
          `[Scraper] Selector "${cssSelector}" not found on ${url}, falling back to body text`
        );
        content = await page.evaluate(() => document.body.innerText);
      }
    } else {
      content = await page.evaluate(() => document.body.innerText);
    }

    await context.close();
    return content;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// ---------------------------------------------------------------------------
// HTTP-based scraping (static pages)
// ---------------------------------------------------------------------------

/**
 * Fetch a static page using native fetch().
 *
 * For HTML pages, performs basic text extraction by stripping tags.
 * If a CSS selector is provided, attempts naive extraction by matching
 * class/id names (best-effort without a DOM parser).
 */
async function scrapeWithHttp(
  url: string,
  cssSelector: string | null
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PAGE_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') ?? '';

    // If it's a PDF, extract text using pdf-parse instead of base64.
    // This gives us searchable text content for AI classification.
    if (contentType.includes('application/pdf') || url.endsWith('.pdf')) {
      const buffer = await response.arrayBuffer();
      try {
        const pdfData = await pdfParse(Buffer.from(buffer));
        return pdfData.text;
      } catch (pdfError) {
        // Fallback: if pdf-parse fails, use base64 hash-only mode
        console.warn(
          `[Scraper] pdf-parse failed for ${url}: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}. ` +
            `Falling back to base64 hash-only mode.`
        );
        const base64 = Buffer.from(buffer).toString('base64');
        return `[PDF:base64:${base64.length}chars]${base64.slice(0, 50000)}`;
      }
    }

    const body = await response.text();

    // Extract text from HTML
    let content = stripHtmlTags(body);

    // If we have a CSS selector, try to extract a specific section.
    // This is a best-effort approach for static HTML — for JS-rendered
    // pages, use the Playwright method instead.
    if (cssSelector && body.includes('<')) {
      const extracted = extractByCssSelector(body, cssSelector);
      if (extracted) {
        content = extracted;
      }
    }

    return content;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ---------------------------------------------------------------------------
// Content processing utilities
// ---------------------------------------------------------------------------

/**
 * Strip HTML tags and decode basic entities, returning plain text.
 */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
    .replace(/<[^>]+>/g, ' ') // Remove remaining HTML tags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}

/**
 * Naive CSS selector extraction from raw HTML.
 *
 * Supports simple selectors like:
 *   - `.class-name`  → looks for class="class-name"
 *   - `#id-name`     → looks for id="id-name"
 *   - `tag .class`   → looks for class="class" inside <tag>
 *   - `main .content` → extracts content from main section
 *
 * This is intentionally basic — for complex selectors, use Playwright.
 */
function extractByCssSelector(html: string, selector: string): string | null {
  // Extract the main class or id from the selector
  const classMatch = selector.match(/\.([a-zA-Z0-9_-]+)/);
  const idMatch = selector.match(/#([a-zA-Z0-9_-]+)/);

  let searchPattern: string | null = null;

  if (classMatch) {
    // Look for elements with this class
    searchPattern = classMatch[1];
  } else if (idMatch) {
    // Look for elements with this id
    searchPattern = idMatch[1];
  }

  if (!searchPattern) {
    return null;
  }

  // Find the opening tag containing this class/id
  const regex = new RegExp(
    `<([a-z]+)[^>]*(?:class|id)="[^"]*${escapeRegex(searchPattern)}[^"]*"[^>]*>`,
    'i'
  );

  const match = regex.exec(html);
  if (!match) {
    return null;
  }

  // Find the matching closing tag (simple depth-based approach)
  const tagName = match[1];
  const startIndex = match.index;
  let depth = 1;
  let pos = startIndex + match[0].length;

  const openPattern = new RegExp(`<${tagName}[\\s>]`, 'gi');
  const closePattern = new RegExp(`</${tagName}>`, 'gi');

  while (depth > 0 && pos < html.length) {
    openPattern.lastIndex = pos;
    closePattern.lastIndex = pos;

    const nextOpen = openPattern.exec(html);
    const nextClose = closePattern.exec(html);

    if (!nextClose) break;

    if (nextOpen && nextOpen.index < nextClose.index) {
      depth++;
      pos = nextOpen.index + nextOpen[0].length;
    } else {
      depth--;
      if (depth === 0) {
        const section = html.slice(startIndex, nextClose.index + nextClose[0].length);
        return stripHtmlTags(section);
      }
      pos = nextClose.index + nextClose[0].length;
    }
  }

  return null;
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalize content for consistent hashing.
 *
 * Collapses all whitespace sequences to a single space and trims.
 * This prevents hash changes from minor formatting differences
 * (extra newlines, indentation changes, etc.).
 */
function normalizeContent(content: string): string {
  return content.replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// T&C version and date extraction
// ---------------------------------------------------------------------------

/**
 * Extract a T&C version number from document text.
 *
 * Matches patterns like:
 *   - "Version 1.0", "Version 2.3"
 *   - "V1.2", "v3.0"
 *   - "Rev 2024/01", "Revision 3"
 *   - "Edition 2025"
 *
 * @returns The extracted version string, or null if not found.
 */
export function extractTcVersion(text: string): string | null {
  const patterns = [
    /Version\s+(\d+(?:\.\d+)*)/i,
    /\bV(\d+(?:\.\d+)+)\b/i,
    /Rev(?:ision)?\s+(\d{4}\/\d{2}|\d+(?:\.\d+)*)/i,
    /Edition\s+(\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      return match[0].trim();
    }
  }

  return null;
}

/**
 * Extract a "last updated" date from T&C document text.
 *
 * Matches patterns like:
 *   - "Last updated: 15 Jan 2025"
 *   - "Last updated 15 January 2025"
 *   - "Effective date: 1 March 2025"
 *   - "Effective from 01/03/2025"
 *   - "Date of issue: 15 Feb 2025"
 *   - "With effect from 1 Jan 2025"
 *   - "Updated on 15 January 2025"
 *
 * @returns The extracted date string, or null if not found.
 */
export function extractTcLastUpdated(text: string): string | null {
  const patterns = [
    /Last\s+updated[:\s]+(\d{1,2}\s+\w+\s+\d{4})/i,
    /Effective\s+(?:date|from)[:\s]+(\d{1,2}\s+\w+\s+\d{4})/i,
    /Effective\s+(?:date|from)[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i,
    /Date\s+of\s+issue[:\s]+(\d{1,2}\s+\w+\s+\d{4})/i,
    /With\s+effect\s+from[:\s]+(\d{1,2}\s+\w+\s+\d{4})/i,
    /Updated\s+on[:\s]+(\d{1,2}\s+\w+\s+\d{4})/i,
    /(?:W\.?E\.?F\.?|wef)[:\s]+(\d{1,2}\s+\w+\s+\d{4})/i,
    /(?:W\.?E\.?F\.?|wef)[:\s]+(\d{1,2}\s+\w{3}\s+\d{2,4})/i,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}
