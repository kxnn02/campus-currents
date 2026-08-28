/**
 * Pure predicates mirroring the security-critical BEFORE UPDATE triggers in
 * supabase/migrations/20260828100000_* and 20260828100100_*.
 *
 * These are the single source of truth for the *decision* ("is this update allowed?").
 * The SQL triggers enforce the same rules server-side; these functions exist so the
 * logic is unit-testable without a live database. If you change a rule here, change the
 * matching trigger, and vice versa.
 */

type Caller = 'service_role' | 'admin' | 'super_admin' | 'faculty' | 'student' | 'anon';

export interface ProfilePrivCols {
  role: string | null;
  can_send_emergency: boolean | null;
  pin_hash: string | null;
}

/**
 * C1/C3: may `caller` change any of role / can_send_emergency / pin_hash from `oldRow` to `newRow`?
 * service_role always may; existing admin/super_admin may; everyone else may not touch these columns.
 */
export function canUpdateProfilePrivilegedColumns(
  caller: Caller,
  oldRow: ProfilePrivCols,
  newRow: ProfilePrivCols
): boolean {
  if (caller === 'service_role') return true;

  const changed =
    oldRow.role !== newRow.role ||
    oldRow.can_send_emergency !== newRow.can_send_emergency ||
    oldRow.pin_hash !== newRow.pin_hash;

  if (!changed) return true;

  return caller === 'admin' || caller === 'super_admin';
}

export interface ReceiptCols {
  broadcast_id: string;
  student_id: string;
  delivered_at: string | null;
  read_at: string | null;
  acknowledged_at: string | null;
}

/**
 * H2: may `caller` apply this delivery_receipts update?
 * service_role may set anything. Clients may not change identity columns or delivered_at,
 * and read_at/acknowledged_at are write-once (NULL -> value only).
 */
export function canUpdateDeliveryReceipt(
  caller: Caller,
  oldRow: ReceiptCols,
  newRow: ReceiptCols
): boolean {
  if (caller === 'service_role') return true;

  if (newRow.broadcast_id !== oldRow.broadcast_id) return false;
  if (newRow.student_id !== oldRow.student_id) return false;
  if (newRow.delivered_at !== oldRow.delivered_at) return false;

  if (oldRow.read_at !== null && newRow.read_at !== oldRow.read_at) return false;
  if (oldRow.acknowledged_at !== null && newRow.acknowledged_at !== oldRow.acknowledged_at) return false;

  return true;
}

/**
 * C3: normalise a bcrypt hash's version tag to $2a$ for verification.
 * Mirrors the logic in verify_pin() (migration 20260828100300). bcryptjs emits $2b$,
 * pgcrypto seeds used $2a$; the variants are byte-identical apart from the tag and derive
 * the same key, so normalising lets pgcrypto's crypt() verify a hash from either source.
 * A hash that is not bcrypt, or already $2a$, is returned unchanged.
 */
export function normalizeBcryptPrefix(hash: string): string {
  if (hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
    return '$2a$' + hash.slice(4);
  }
  return hash;
}
