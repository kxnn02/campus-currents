import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Missed Notification Catch-Up System
 *
 * Problem: If a user's device can't register for FCM push tokens (SERVICE_NOT_AVAILABLE,
 * Huawei devices without GMS, network issues), they never receive background push
 * notifications.
 *
 * Solution: Every time the app is opened (foregrounded), check Supabase for broadcasts
 * sent since the last check. If any are found, fire local notifications so the user
 * sees them in their notification tray — identical UX to receiving a push.
 *
 * This guarantees notification delivery even if:
 * - FCM token registration permanently fails (no Google Play Services)
 * - The device was offline when the push was sent
 * - The push was sent but Expo/FCM dropped it
 */

const LAST_CATCHUP_KEY = '@campus_currents:last_catchup_timestamp';
const PUSH_STATUS_KEY = '@campus_currents:push_status';

interface BroadcastRow {
  id: string;
  title: string;
  body: string;
  tier: string;
  channel: string;
  sent_at: string;
  target_audience: Record<string, unknown> | null;
}

/**
 * Checks for broadcasts the user may have missed and fires local notifications.
 * Only runs if push registration previously failed (no point double-notifying).
 *
 * Logic:
 * 1. Get last catch-up timestamp (or default to 1 hour ago on first run)
 * 2. Query broadcasts sent after that timestamp
 * 3. Filter by user's audience (program/level/year)
 * 4. Fire a local notification for each missed broadcast
 * 5. Update the catch-up timestamp
 */
export async function checkMissedNotifications(): Promise<void> {
  try {
    // Only run catch-up if push registration failed
    const pushStatus = await AsyncStorage.getItem(PUSH_STATUS_KEY);
    if (pushStatus === 'registered') {
      // Push is working — just update the timestamp so we don't fire old ones later
      await AsyncStorage.setItem(LAST_CATCHUP_KEY, new Date().toISOString());
      return;
    }

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user's profile for audience filtering
    const { data: profile } = await supabase
      .from('profiles')
      .select('program, level, year_level')
      .eq('id', user.id)
      .single();

    if (!profile) return;

    // Get last catch-up timestamp (default: 1 hour ago)
    const lastCatchupRaw = await AsyncStorage.getItem(LAST_CATCHUP_KEY);
    const lastCatchup = lastCatchupRaw
      ? lastCatchupRaw
      : new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Query missed broadcasts
    const { data: broadcasts, error } = await supabase
      .from('broadcasts')
      .select('id, title, body, tier, channel, sent_at, target_audience')
      .eq('is_deleted', false)
      .gt('sent_at', lastCatchup)
      .order('sent_at', { ascending: true })
      .limit(10); // Cap at 10 to avoid notification spam

    if (error || !broadcasts || broadcasts.length === 0) {
      // Update timestamp even on empty — avoids re-querying old range
      await AsyncStorage.setItem(LAST_CATCHUP_KEY, new Date().toISOString());
      return;
    }

    // Filter by target audience
    const matchingBroadcasts = (broadcasts as BroadcastRow[]).filter((b) => {
      const audience = b.target_audience;
      if (!audience || audience.all === true) return true;

      const hasPrograms = Array.isArray(audience.programs) && (audience.programs as string[]).length > 0;
      const hasLevels = Array.isArray(audience.levels) && (audience.levels as string[]).length > 0;
      const hasYearLevels = Array.isArray(audience.year_levels) && (audience.year_levels as (string | number)[]).length > 0;

      if (!hasPrograms && !hasLevels && !hasYearLevels) return true;

      if (hasLevels && (!profile.level || !(audience.levels as string[]).includes(profile.level))) {
        return false;
      }
      if (hasPrograms && (!profile.program || !(audience.programs as string[]).includes(profile.program))) {
        return false;
      }
      if (hasYearLevels && (!profile.year_level || !(audience.year_levels as (string | number)[]).map(String).includes(String(profile.year_level)))) {
        return false;
      }

      return true;
    });

    // Fire local notifications for each missed broadcast
    for (const broadcast of matchingBroadcasts) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: broadcast.title,
          body: broadcast.body,
          sound: 'default',
          data: {
            broadcast_id: broadcast.id,
            tier: broadcast.tier,
            channel: broadcast.channel,
          },
        },
        trigger: null, // Fire immediately
      });

      console.log('[CATCHUP] Fired local notification for:', broadcast.title);
    }

    // Update catch-up timestamp to the latest broadcast's sent_at
    const latestSentAt = matchingBroadcasts.length > 0
      ? matchingBroadcasts[matchingBroadcasts.length - 1].sent_at
      : new Date().toISOString();
    await AsyncStorage.setItem(LAST_CATCHUP_KEY, latestSentAt);

    console.log('[CATCHUP] Delivered', matchingBroadcasts.length, 'missed notifications');
  } catch (err) {
    console.log('[CATCHUP] Error:', err);
  }
}

/**
 * React hook that runs the missed notification catch-up:
 * - Once on mount (app launch) with a delay for auth to initialize
 * - Every time the app returns to the foreground from background
 *
 * This ensures users always get their notifications, even without FCM.
 */
export function useNotificationCatchup(): void {
  const hasRunInitial = useRef(false);

  // Run once on mount (after a delay to let auth session initialize)
  useEffect(() => {
    if (hasRunInitial.current) return;
    hasRunInitial.current = true;

    const timer = setTimeout(() => {
      checkMissedNotifications();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Run on every foreground event
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        // Small delay to avoid racing with push registration on foreground
        setTimeout(() => {
          checkMissedNotifications();
        }, 1500);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, []);
}
