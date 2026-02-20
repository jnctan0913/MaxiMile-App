/**
 * MaxiMile Unit Tests: Miles Utility Functions
 *
 * Tests formatMiles() and getRelativeTime() from lib/miles-utils.ts.
 */

import { formatMiles, getRelativeTime } from '../lib/miles-utils';

// ---------------------------------------------------------------------------
// formatMiles
// ---------------------------------------------------------------------------

describe('formatMiles', () => {
  it('formats 0 as "0"', () => {
    expect(formatMiles(0)).toBe('0');
  });

  it('formats 1000 with comma separator', () => {
    expect(formatMiles(1000)).toBe('1,000');
  });

  it('formats 1234567 with comma separators', () => {
    expect(formatMiles(1234567)).toBe('1,234,567');
  });

  it('formats negative numbers with comma separator', () => {
    expect(formatMiles(-1500)).toBe('-1,500');
  });

  it('rounds decimals to integer before formatting', () => {
    expect(formatMiles(1234.6)).toBe('1,235');
    expect(formatMiles(1234.4)).toBe('1,234');
    expect(formatMiles(999.5)).toBe('1,000');
  });
});

// ---------------------------------------------------------------------------
// getRelativeTime
// ---------------------------------------------------------------------------

describe('getRelativeTime', () => {
  const NOW = new Date('2026-02-20T12:00:00.000Z').getTime();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(NOW));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "just now" for < 1 minute ago', () => {
    const thirtySecsAgo = new Date(NOW - 30 * 1000).toISOString();
    expect(getRelativeTime(thirtySecsAgo)).toBe('just now');

    const fiveSecsAgo = new Date(NOW - 5 * 1000).toISOString();
    expect(getRelativeTime(fiveSecsAgo)).toBe('just now');
  });

  it('returns "X minutes ago" for 1-59 minutes', () => {
    const oneMinAgo = new Date(NOW - 60 * 1000).toISOString();
    expect(getRelativeTime(oneMinAgo)).toBe('1 minute ago');

    const thirtyMinsAgo = new Date(NOW - 30 * 60 * 1000).toISOString();
    expect(getRelativeTime(thirtyMinsAgo)).toBe('30 minutes ago');

    const fiftyNineMinsAgo = new Date(NOW - 59 * 60 * 1000).toISOString();
    expect(getRelativeTime(fiftyNineMinsAgo)).toBe('59 minutes ago');
  });

  it('returns "X hours ago" for 1-23 hours', () => {
    const oneHourAgo = new Date(NOW - 60 * 60 * 1000).toISOString();
    expect(getRelativeTime(oneHourAgo)).toBe('1 hour ago');

    const threeHoursAgo = new Date(NOW - 3 * 60 * 60 * 1000).toISOString();
    expect(getRelativeTime(threeHoursAgo)).toBe('3 hours ago');

    const twentyThreeHoursAgo = new Date(NOW - 23 * 60 * 60 * 1000).toISOString();
    expect(getRelativeTime(twentyThreeHoursAgo)).toBe('23 hours ago');
  });

  it('returns "X days ago" for 1-6 days', () => {
    const oneDayAgo = new Date(NOW - 24 * 60 * 60 * 1000).toISOString();
    expect(getRelativeTime(oneDayAgo)).toBe('1 day ago');

    const twoDaysAgo = new Date(NOW - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(getRelativeTime(twoDaysAgo)).toBe('2 days ago');

    const sixDaysAgo = new Date(NOW - 6 * 24 * 60 * 60 * 1000).toISOString();
    expect(getRelativeTime(sixDaysAgo)).toBe('6 days ago');
  });

  it('returns relative weeks/months for 7+ days', () => {
    const oneWeekAgo = new Date(NOW - 7 * 24 * 60 * 60 * 1000).toISOString();
    expect(getRelativeTime(oneWeekAgo)).toBe('1 week ago');

    const twoWeeksAgo = new Date(NOW - 14 * 24 * 60 * 60 * 1000).toISOString();
    expect(getRelativeTime(twoWeeksAgo)).toBe('2 weeks ago');

    const sixtyDaysAgo = new Date(NOW - 60 * 24 * 60 * 60 * 1000).toISOString();
    expect(getRelativeTime(sixtyDaysAgo)).toBe('2 months ago');
  });
});
