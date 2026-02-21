// =============================================================================
// MaxiMile Scraper — Retry Logic & Error Handling
// =============================================================================
// Provides exponential-backoff retry for flaky network operations
// (page fetches, Supabase writes, etc.).
// =============================================================================

/**
 * Execute an async function with exponential-backoff retry.
 *
 * On each failure the delay doubles (1s → 2s → 4s by default).
 * All retry attempts are logged to stdout for observability in
 * GitHub Actions logs.
 *
 * @param fn         - The async function to execute.
 * @param maxRetries - Maximum number of retry attempts (default 3).
 * @param delayMs    - Initial delay in milliseconds before the first retry (default 1000).
 * @returns The result of `fn()` once it succeeds.
 * @throws The last error if all retries are exhausted.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (attempt < maxRetries) {
        const backoffMs = delayMs * Math.pow(2, attempt - 1);
        console.warn(
          `[Retry] Attempt ${attempt}/${maxRetries} failed: ${errorMessage}. ` +
            `Retrying in ${backoffMs}ms...`
        );
        await sleep(backoffMs);
      } else {
        console.error(
          `[Retry] Attempt ${attempt}/${maxRetries} failed: ${errorMessage}. ` +
            `No retries remaining.`
        );
      }
    }
  }

  throw lastError;
}

/**
 * Promise-based sleep utility.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
