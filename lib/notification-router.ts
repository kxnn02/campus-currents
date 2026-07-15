import { router } from 'expo-router';
import type * as Notifications from 'expo-notifications';
import { recordDelivery } from '@/lib/receipts';
import { supabase } from '@/lib/supabase';

// --- Types ---

export interface NotificationData {
  broadcast_id?: string;
  tier?: string;
  channel?: string;
  linked_suspension_id?: string;
  linked_emergency_id?: string;
}

export type NavigationTarget =
  | { type: 'emergency' }
  | { type: 'status' }
  | { type: 'broadcast_detail'; broadcastId: string }
  | { type: 'feed' }; // fallback

// --- Pure function: route determination ---

/**
 * Determines the navigation target based on notification data.
 *
 * Priority order:
 * 1. tier === "emergency" → emergency overlay
 * 2. channel === "suspension" → status tab
 * 3. valid broadcast_id present → broadcast detail
 * 4. fallback → feed tab
 */
export function getNavigationTarget(data: NotificationData | undefined | null): NavigationTarget {
  if (!data) {
    return { type: 'feed' };
  }

  // Priority 1: Emergency tier takes highest precedence
  if (data.tier === 'emergency') {
    return { type: 'emergency' };
  }

  // Priority 2: Suspension channel
  if (data.channel === 'suspension') {
    return { type: 'status' };
  }

  // Priority 3: Valid broadcast_id present
  if (data.broadcast_id && typeof data.broadcast_id === 'string' && data.broadcast_id.trim().length > 0) {
    return { type: 'broadcast_detail', broadcastId: data.broadcast_id };
  }

  // Priority 4: Fallback to feed
  return { type: 'feed' };
}

// --- Navigation helper ---

function navigateToTarget(target: NavigationTarget): void {
  switch (target.type) {
    case 'emergency':
      router.navigate('/modal');
      break;
    case 'status':
      router.navigate('/(tabs)/status');
      break;
    case 'broadcast_detail':
      router.navigate(`/broadcast/${target.broadcastId}`);
      break;
    case 'feed':
      router.navigate('/(tabs)');
      break;
  }
}

// --- Notification response handler (user tapped notification) ---

/**
 * Handles when a user taps on a notification.
 * Extracts data from the notification response, determines the navigation target,
 * and navigates the user to the appropriate screen.
 */
export function handleNotificationResponse(response: Notifications.NotificationResponse): void {
  const data = response.notification.request.content.data as NotificationData | undefined;
  const target = getNavigationTarget(data);
  navigateToTarget(target);
}

// --- Foreground notification handler ---

/**
 * Handles notifications received while the app is in the foreground.
 * - Records a delivery receipt (fire-and-forget)
 * - For non-emergency: shows in-app banner (placeholder for UI layer wiring)
 * - For emergency: does nothing (emergency overlay handles it)
 */
export function handleForegroundNotification(notification: Notifications.Notification): void {
  const data = notification.request.content.data as NotificationData | undefined;

  // Fire-and-forget delivery receipt
  recordDeliveryReceipt(data);

  // For non-emergency notifications, show in-app banner
  // Emergency notifications are handled by the EmergencyProvider overlay
  if (data?.tier !== 'emergency') {
    showInAppBanner(notification);
  }
}

// --- Internal helpers ---

/**
 * Records a delivery receipt for the notification.
 * Fire-and-forget: never blocks UI, errors are swallowed.
 */
async function recordDeliveryReceipt(data: NotificationData | undefined): Promise<void> {
  try {
    if (!data?.broadcast_id) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) return;

    // Fire-and-forget — do not await in caller
    await recordDelivery(data.broadcast_id, userId);
  } catch {
    // Silently fail — receipts module handles queuing on error
  }
}

/**
 * Placeholder for in-app banner display.
 * The UI layer (NotificationProvider) can wire this to show a toast/banner.
 * For now, this is a no-op that can be extended.
 */
function showInAppBanner(_notification: Notifications.Notification): void {
  // No-op placeholder — UI layer wires this via NotificationProvider context
  // When wired, this would trigger an in-app toast/banner for non-emergency notifications
}
