import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import type { AcknowledgmentType } from '@/types/database';

const PENDING_RECEIPTS_KEY = '@campus_currents:pending_receipts';

export interface PendingReceipt {
  broadcast_id: string;
  student_id: string;
  type: 'delivery' | 'read' | 'acknowledgment';
  acknowledgment_type?: AcknowledgmentType;
  timestamp: string;
}

/**
 * Upsert a delivery receipt with delivered_at.
 * Uses ignoreDuplicates so that if a row already exists for this
 * (broadcast_id, student_id) pair, the delivered_at is NOT overwritten.
 * Fire-and-forget: errors are caught and queued silently.
 */
export async function recordDelivery(broadcastId: string, studentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('delivery_receipts')
      .upsert(
        {
          broadcast_id: broadcastId,
          student_id: studentId,
          delivered_at: new Date().toISOString(),
        },
        {
          onConflict: 'broadcast_id,student_id',
          ignoreDuplicates: true,
        }
      );

    if (error) {
      throw error;
    }
  } catch {
    await queueReceipt({
      broadcast_id: broadcastId,
      student_id: studentId,
      type: 'delivery',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Update read_at to current timestamp where it is currently null.
 * Fire-and-forget: errors are caught and queued silently.
 */
export async function recordRead(broadcastId: string, studentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('delivery_receipts')
      .update({ read_at: new Date().toISOString() })
      .eq('broadcast_id', broadcastId)
      .eq('student_id', studentId)
      .is('read_at', null);

    if (error) {
      throw error;
    }
  } catch {
    await queueReceipt({
      broadcast_id: broadcastId,
      student_id: studentId,
      type: 'read',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Update acknowledged_at and acknowledgment_type on the delivery receipt.
 * Fire-and-forget: errors are caught and queued silently.
 */
export async function recordAcknowledgment(
  broadcastId: string,
  studentId: string,
  type: AcknowledgmentType
): Promise<void> {
  try {
    const { error } = await supabase
      .from('delivery_receipts')
      .update({
        acknowledged_at: new Date().toISOString(),
        acknowledgment_type: type,
      })
      .eq('broadcast_id', broadcastId)
      .eq('student_id', studentId);

    if (error) {
      throw error;
    }
  } catch {
    await queueReceipt({
      broadcast_id: broadcastId,
      student_id: studentId,
      type: 'acknowledgment',
      acknowledgment_type: type,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Append a pending receipt to the AsyncStorage queue.
 * Used when network operations fail — receipts are stored locally for later sync.
 */
export async function queueReceipt(receipt: PendingReceipt): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_RECEIPTS_KEY);
    const queue: PendingReceipt[] = raw ? JSON.parse(raw) : [];
    queue.push(receipt);
    await AsyncStorage.setItem(PENDING_RECEIPTS_KEY, JSON.stringify(queue));
  } catch {
    // Silently fail — cannot do anything if local storage itself fails
  }
}

/**
 * Drain the local pending receipts queue by processing each receipt.
 * Successfully synced items are removed; failed items remain for next attempt.
 * Called on: app foreground, connectivity restored, successful network request.
 */
export async function syncPendingReceipts(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_RECEIPTS_KEY);
    if (!raw) return;

    const queue: PendingReceipt[] = JSON.parse(raw);
    if (queue.length === 0) return;

    const failed: PendingReceipt[] = [];

    for (const receipt of queue) {
      try {
        await processReceipt(receipt);
      } catch {
        failed.push(receipt);
      }
    }

    if (failed.length > 0) {
      await AsyncStorage.setItem(PENDING_RECEIPTS_KEY, JSON.stringify(failed));
    } else {
      await AsyncStorage.removeItem(PENDING_RECEIPTS_KEY);
    }
  } catch {
    // Silently fail — will retry on next sync trigger
  }
}

/**
 * Process a single receipt directly against Supabase.
 * Does NOT queue on failure (used by syncPendingReceipts to avoid infinite loops).
 * Throws on error so the caller can retain the receipt in the queue.
 */
async function processReceipt(receipt: PendingReceipt): Promise<void> {
  switch (receipt.type) {
    case 'delivery': {
      const { error } = await supabase
        .from('delivery_receipts')
        .upsert(
          {
            broadcast_id: receipt.broadcast_id,
            student_id: receipt.student_id,
            delivered_at: receipt.timestamp,
          },
          {
            onConflict: 'broadcast_id,student_id',
            ignoreDuplicates: true,
          }
        );
      if (error) throw error;
      break;
    }
    case 'read': {
      const { error } = await supabase
        .from('delivery_receipts')
        .update({ read_at: receipt.timestamp })
        .eq('broadcast_id', receipt.broadcast_id)
        .eq('student_id', receipt.student_id)
        .is('read_at', null);
      if (error) throw error;
      break;
    }
    case 'acknowledgment': {
      const { error } = await supabase
        .from('delivery_receipts')
        .update({
          acknowledged_at: receipt.timestamp,
          acknowledgment_type: receipt.acknowledgment_type,
        })
        .eq('broadcast_id', receipt.broadcast_id)
        .eq('student_id', receipt.student_id);
      if (error) throw error;
      break;
    }
  }
}
