import { describe, it, expect } from 'vitest';
import {
  canUpdateProfilePrivilegedColumns,
  canUpdateDeliveryReceipt,
  normalizeBcryptPrefix,
  type ProfilePrivCols,
  type ReceiptCols,
} from '@/lib/rls-guards';

const baseProfile: ProfilePrivCols = { role: 'student', can_send_emergency: false, pin_hash: null };

describe('canUpdateProfilePrivilegedColumns (C1/C3)', () => {
  it('BLOCKS a student promoting themselves to super_admin', () => {
    expect(
      canUpdateProfilePrivilegedColumns('student', baseProfile, { ...baseProfile, role: 'super_admin' })
    ).toBe(false);
  });

  it('BLOCKS a student granting themselves can_send_emergency', () => {
    expect(
      canUpdateProfilePrivilegedColumns('student', baseProfile, { ...baseProfile, can_send_emergency: true })
    ).toBe(false);
  });

  it('BLOCKS a student overwriting pin_hash', () => {
    expect(
      canUpdateProfilePrivilegedColumns('student', baseProfile, { ...baseProfile, pin_hash: 'x' })
    ).toBe(false);
  });

  it('BLOCKS faculty from escalating to admin', () => {
    expect(
      canUpdateProfilePrivilegedColumns('faculty', baseProfile, { ...baseProfile, role: 'admin' })
    ).toBe(false);
  });

  it('ALLOWS a student to update non-privileged columns (no priv change)', () => {
    expect(canUpdateProfilePrivilegedColumns('student', baseProfile, { ...baseProfile })).toBe(true);
  });

  it('ALLOWS an existing admin to change a role', () => {
    expect(
      canUpdateProfilePrivilegedColumns('admin', baseProfile, { ...baseProfile, role: 'faculty' })
    ).toBe(true);
  });

  it('ALLOWS service_role to change anything', () => {
    expect(
      canUpdateProfilePrivilegedColumns('service_role', baseProfile, {
        role: 'super_admin',
        can_send_emergency: true,
        pin_hash: 'hash',
      })
    ).toBe(true);
  });
});

const baseReceipt: ReceiptCols = {
  broadcast_id: 'b1',
  student_id: 's1',
  delivered_at: null,
  read_at: null,
  acknowledged_at: null,
};

describe('canUpdateDeliveryReceipt (H2)', () => {
  it('BLOCKS a client forging delivered_at (delivery metric integrity)', () => {
    expect(
      canUpdateDeliveryReceipt('student', baseReceipt, { ...baseReceipt, delivered_at: '2026-01-01T00:00:00Z' })
    ).toBe(false);
  });

  it('BLOCKS re-pointing a receipt to another student', () => {
    expect(
      canUpdateDeliveryReceipt('student', baseReceipt, { ...baseReceipt, student_id: 's2' })
    ).toBe(false);
  });

  it('BLOCKS rewriting an already-set acknowledged_at', () => {
    const acked = { ...baseReceipt, acknowledged_at: '2026-01-01T00:00:00Z' };
    expect(
      canUpdateDeliveryReceipt('student', acked, { ...acked, acknowledged_at: '2026-02-02T00:00:00Z' })
    ).toBe(false);
  });

  it('ALLOWS a student to set read_at from NULL (write-once)', () => {
    expect(
      canUpdateDeliveryReceipt('student', baseReceipt, { ...baseReceipt, read_at: '2026-01-01T00:00:00Z' })
    ).toBe(true);
  });

  it('ALLOWS a student to acknowledge from NULL', () => {
    expect(
      canUpdateDeliveryReceipt('student', baseReceipt, { ...baseReceipt, acknowledged_at: '2026-01-01T00:00:00Z' })
    ).toBe(true);
  });

  it('ALLOWS service_role to set delivered_at (check-push-receipts)', () => {
    expect(
      canUpdateDeliveryReceipt('service_role', baseReceipt, { ...baseReceipt, delivered_at: '2026-01-01T00:00:00Z' })
    ).toBe(true);
  });
});

describe('normalizeBcryptPrefix (C3)', () => {
  const body = '$N9qo8uLOickgx2ZMRZoMye'; // 22-char salt + rest, tag-agnostic body

  it('rewrites $2b$ (bcryptjs) to $2a$ so pgcrypto can verify it', () => {
    expect(normalizeBcryptPrefix('$2b$10' + body)).toBe('$2a$10' + body);
  });

  it('rewrites $2y$ to $2a$', () => {
    expect(normalizeBcryptPrefix('$2y$10' + body)).toBe('$2a$10' + body);
  });

  it('leaves $2a$ (pgcrypto seed) unchanged', () => {
    expect(normalizeBcryptPrefix('$2a$10' + body)).toBe('$2a$10' + body);
  });

  it('only changes the tag, preserving cost + salt + digest', () => {
    const original = '$2b$12$abcdefghijklmnopqrstuv0123456789ABCDEFGHIJKLMNOPQRST';
    const result = normalizeBcryptPrefix(original);
    expect(result.slice(4)).toBe(original.slice(4)); // everything after the tag is identical
    expect(result.startsWith('$2a$')).toBe(true);
  });
});
