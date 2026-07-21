import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatRelativeTime } from '@/lib/feed';

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  function setNow(date: Date) {
    vi.useFakeTimers();
    vi.setSystemTime(date);
  }

  const BASE = new Date('2025-07-15T12:00:00Z');

  // --- < 60 seconds ---
  it('returns "Xs ago" for less than 60 seconds', () => {
    setNow(BASE);
    const sent = new Date(BASE.getTime() - 30_000).toISOString(); // 30s ago
    expect(formatRelativeTime(sent)).toBe('30s ago');
  });

  it('returns "0s ago" for just now', () => {
    setNow(BASE);
    const sent = BASE.toISOString();
    expect(formatRelativeTime(sent)).toBe('0s ago');
  });

  it('returns "59s ago" for 59 seconds', () => {
    setNow(BASE);
    const sent = new Date(BASE.getTime() - 59_000).toISOString();
    expect(formatRelativeTime(sent)).toBe('59s ago');
  });

  // --- 60s to < 60 minutes ---
  it('returns "1m ago" for exactly 60 seconds', () => {
    setNow(BASE);
    const sent = new Date(BASE.getTime() - 60_000).toISOString();
    expect(formatRelativeTime(sent)).toBe('1m ago');
  });

  it('returns "45m ago" for 45 minutes', () => {
    setNow(BASE);
    const sent = new Date(BASE.getTime() - 45 * 60_000).toISOString();
    expect(formatRelativeTime(sent)).toBe('45m ago');
  });

  it('returns "59m ago" for 59 minutes', () => {
    setNow(BASE);
    const sent = new Date(BASE.getTime() - 59 * 60_000).toISOString();
    expect(formatRelativeTime(sent)).toBe('59m ago');
  });

  // --- 1h to < 24h ---
  it('returns "1h ago" for exactly 60 minutes', () => {
    setNow(BASE);
    const sent = new Date(BASE.getTime() - 60 * 60_000).toISOString();
    expect(formatRelativeTime(sent)).toBe('1h ago');
  });

  it('returns "12h ago" for 12 hours', () => {
    setNow(BASE);
    const sent = new Date(BASE.getTime() - 12 * 3600_000).toISOString();
    expect(formatRelativeTime(sent)).toBe('12h ago');
  });

  it('returns "23h ago" for 23 hours', () => {
    setNow(BASE);
    const sent = new Date(BASE.getTime() - 23 * 3600_000).toISOString();
    expect(formatRelativeTime(sent)).toBe('23h ago');
  });

  // --- 24h to < 48h (Yesterday) ---
  it('returns "Yesterday" for exactly 24 hours', () => {
    setNow(BASE);
    const sent = new Date(BASE.getTime() - 24 * 3600_000).toISOString();
    expect(formatRelativeTime(sent)).toBe('Yesterday');
  });

  it('returns "Yesterday" for 36 hours', () => {
    setNow(BASE);
    const sent = new Date(BASE.getTime() - 36 * 3600_000).toISOString();
    expect(formatRelativeTime(sent)).toBe('Yesterday');
  });

  it('returns "Yesterday" for 47 hours', () => {
    setNow(BASE);
    const sent = new Date(BASE.getTime() - 47 * 3600_000).toISOString();
    expect(formatRelativeTime(sent)).toBe('Yesterday');
  });

  // --- >= 48h (MMM D format) ---
  it('returns "MMM D" format for 48 hours', () => {
    setNow(BASE);
    const sent = new Date(BASE.getTime() - 48 * 3600_000).toISOString(); // Jul 13
    expect(formatRelativeTime(sent)).toBe('Jul 13');
  });

  it('returns "MMM D" format for a week ago', () => {
    setNow(BASE);
    const sent = new Date(BASE.getTime() - 7 * 24 * 3600_000).toISOString(); // Jul 8
    expect(formatRelativeTime(sent)).toBe('Jul 8');
  });

  it('handles cross-month correctly', () => {
    setNow(new Date('2025-07-02T12:00:00Z'));
    const sent = new Date('2025-06-28T12:00:00Z').toISOString();
    expect(formatRelativeTime(sent)).toBe('Jun 28');
  });
});
