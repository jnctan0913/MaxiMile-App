// =============================================================================
// MaxiMile Scraper — SHA-256 Content Hashing
// =============================================================================
// Computes SHA-256 hex digests of page content and compares hashes
// to detect changes efficiently (hash gating — avoids full-text diff
// when content is unchanged).
// =============================================================================

import crypto from 'crypto';

/**
 * Compute the SHA-256 hex digest of a string.
 *
 * Used to fingerprint page content so we can quickly detect whether
 * the content has changed since the last snapshot.
 *
 * @param content - The raw text content extracted from a page.
 * @returns A lowercase hex string (64 characters).
 */
export function computeContentHash(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Compare a new content hash against the previous snapshot's hash.
 *
 * Returns `true` if:
 *   - There is no previous hash (first time scraping this source), OR
 *   - The new hash differs from the previous hash (content changed).
 *
 * Returns `false` if the hashes match (content unchanged).
 *
 * @param newHash      - SHA-256 hex digest of the newly scraped content.
 * @param previousHash - SHA-256 hex digest from the latest snapshot, or null.
 * @returns Whether the content has changed (or is new).
 */
export function hasContentChanged(
  newHash: string,
  previousHash: string | null
): boolean {
  if (previousHash === null) {
    return true; // No previous snapshot — treat as "changed" (first run)
  }
  return newHash !== previousHash;
}
