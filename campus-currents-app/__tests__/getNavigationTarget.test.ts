import { describe, it, expect } from 'vitest';
import { getNavigationTarget } from '@/lib/notification-router';
import type { NotificationData } from '@/lib/notification-router';

describe('getNavigationTarget', () => {
  // --- emergency tier ---
  it('returns emergency when tier is "emergency"', () => {
    const data: NotificationData = { tier: 'emergency', broadcast_id: 'some-id' };
    expect(getNavigationTarget(data)).toEqual({ type: 'emergency' });
  });

  it('emergency tier takes priority over suspension channel', () => {
    const data: NotificationData = { tier: 'emergency', channel: 'suspension' };
    expect(getNavigationTarget(data)).toEqual({ type: 'emergency' });
  });

  // --- suspension channel ---
  it('returns status when channel is "suspension"', () => {
    const data: NotificationData = { channel: 'suspension', broadcast_id: 'some-id' };
    expect(getNavigationTarget(data)).toEqual({ type: 'status' });
  });

  it('suspension channel takes priority over broadcast_id', () => {
    const data: NotificationData = { channel: 'suspension', broadcast_id: 'valid-id' };
    expect(getNavigationTarget(data)).toEqual({ type: 'status' });
  });

  // --- valid broadcast_id ---
  it('returns broadcast_detail when broadcast_id is present', () => {
    const data: NotificationData = { broadcast_id: 'abc-123' };
    expect(getNavigationTarget(data)).toEqual({ type: 'broadcast_detail', broadcastId: 'abc-123' });
  });

  it('ignores empty broadcast_id (whitespace only)', () => {
    const data: NotificationData = { broadcast_id: '   ' };
    expect(getNavigationTarget(data)).toEqual({ type: 'feed' });
  });

  it('ignores empty string broadcast_id', () => {
    const data: NotificationData = { broadcast_id: '' };
    expect(getNavigationTarget(data)).toEqual({ type: 'feed' });
  });

  // --- fallback ---
  it('returns feed when data has no relevant fields', () => {
    const data: NotificationData = {};
    expect(getNavigationTarget(data)).toEqual({ type: 'feed' });
  });

  // --- null / undefined data ---
  it('returns feed when data is null', () => {
    expect(getNavigationTarget(null)).toEqual({ type: 'feed' });
  });

  it('returns feed when data is undefined', () => {
    expect(getNavigationTarget(undefined)).toEqual({ type: 'feed' });
  });
});
