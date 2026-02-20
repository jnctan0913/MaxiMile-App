/**
 * Utility helpers for the Miles Portfolio feature (F13-F17).
 */

/**
 * Format a miles number with comma separators (en-SG locale).
 * Always returns an integer string — no decimals.
 */
export function formatMiles(miles: number): string {
  return Math.round(miles).toLocaleString('en-SG');
}

/**
 * Convert an ISO date string into a human-readable relative time.
 * Returns strings like "just now", "2 hours ago", "3 days ago", "2 weeks ago".
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return 'just now';

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  return `${months} month${months === 1 ? '' : 's'} ago`;
}
