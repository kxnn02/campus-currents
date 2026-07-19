import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

// AsyncStorage key for locally stored push token
const PUSH_TOKEN_STORAGE_KEY = '@campus_currents:push_token';

// Configure notification handler (how notifications display when app is in foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Sets up Android notification channels with tiered importance levels.
 * Must be called before requesting notification permissions.
 *
 * Channels:
 * - emergency: MAX importance, bypassDnd, alarm vibration pattern
 * - important: HIGH importance, elevated vibration
 * - routine: DEFAULT importance, standard behavior
 */
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  // Emergency channel - overrides silent mode / Do Not Disturb
  await Notifications.setNotificationChannelAsync('emergency', {
    name: 'Emergency Alerts',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 500, 250, 500, 250, 500],
    lightColor: '#DC2626',
    sound: 'default',
    bypassDnd: true,
  });

  // Important channel - elevated priority, audible during quiet hours
  await Notifications.setNotificationChannelAsync('important', {
    name: 'Important Announcements',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#F59E0B',
    sound: 'default',
  });

  // Routine channel - standard notifications, respects silent mode
  await Notifications.setNotificationChannelAsync('routine', {
    name: 'General Announcements',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

/**
 * Stores the push token in the user's Supabase profile (fcm_token field).
 * Retries up to 3 times with exponential backoff (1s, 2s, 4s).
 * On total failure, stores the token locally for sync on next launch.
 */
async function storeTokenInSupabase(token: string): Promise<boolean> {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('[Notifications] No authenticated user, cannot store token');
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ fcm_token: token })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Success - also update local storage as reference
      await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
      return true;
    } catch (error) {
      console.warn(
        `[Notifications] Token storage attempt ${attempt + 1}/${maxRetries} failed:`,
        error
      );

      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed — store locally for sync on next launch
  console.warn('[Notifications] All retries failed, storing token locally');
  await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
  return false;
}

/**
 * Requests notification permissions, gets Expo push token, and stores it
 * in the user's Supabase profile's fcm_token field.
 *
 * Behavior:
 * - Sets up Android notification channels first
 * - Requests OS notification permission if not already granted
 * - Retrieves Expo push token (with 3x retry for SERVICE_NOT_AVAILABLE errors)
 * - Stores token in Supabase with 3x retry (exponential backoff: 1s, 2s, 4s)
 * - On total failure: stores token in AsyncStorage for sync later
 *
 * @returns The Expo push token string, or undefined if registration fails
 */
export async function registerForPushNotifications(): Promise<string | undefined> {
  if (!Device.isDevice) {
    console.warn('[Notifications] Push notifications require a physical device');
    return undefined;
  }

  // Set up notification channels before requesting permissions
  await setupNotificationChannels();

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Notifications] Notification permission not granted');
    return undefined;
  }

  // Get Expo push token with retry logic
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId ?? '3a405c4f-d07a-4544-b28c-cea875f147c1';

  if (!projectId) {
    console.warn('[Notifications] No project ID found for push notifications');
    return undefined;
  }

  const token = await getTokenWithRetry(projectId);

  if (token) {
    // Store token in Supabase (with retry logic)
    await storeTokenInSupabase(token);
  }

  return token;
}

/**
 * Attempts to get the Expo push token with retry logic.
 * SERVICE_NOT_AVAILABLE is transient on many Android devices (especially MIUI/Xiaomi)
 * because Google Play Services takes time to initialize after boot or app install.
 *
 * Retries 4 times with exponential backoff: 2s, 4s, 8s, 16s.
 * Total wait: up to ~30 seconds, which covers the typical GCM registration delay.
 */
async function getTokenWithRetry(projectId: string): Promise<string | undefined> {
  const maxRetries = 4;
  const baseDelay = 2000; // 2 seconds

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[Notifications] Token fetch retry ${attempt}/${maxRetries}...`);
      } else {
        console.log('[Notifications] Getting push token with projectId:', projectId);
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      const token = tokenData.data;
      console.log('[Notifications] Got push token:', token);
      return token;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isTransient =
        errorMessage.includes('SERVICE_NOT_AVAILABLE') ||
        errorMessage.includes('TIMEOUT') ||
        errorMessage.includes('IOException');

      if (isTransient && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(
          `[Notifications] Token fetch attempt ${attempt + 1} failed (transient), retrying in ${delay}ms:`,
          errorMessage
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // Non-transient error or all retries exhausted
        console.warn('[Notifications] Failed to get Expo push token after all attempts:', errorMessage);

        // Try native device push token as fallback (works on some MIUI devices where Expo token fails)
        if (Platform.OS === 'android') {
          return await getDeviceTokenFallback(projectId);
        }
        return undefined;
      }
    }
  }

  return undefined;
}

/**
 * Fallback: Try getting a native FCM device push token directly.
 * Some Xiaomi/MIUI devices have issues with Expo's token wrapper but
 * can still register via the native FCM path. If this works, we still
 * return it — the Expo push service accepts device tokens with the right project.
 */
async function getDeviceTokenFallback(projectId: string): Promise<string | undefined> {
  try {
    console.log('[Notifications] Trying native device push token fallback...');
    const deviceToken = await Notifications.getDevicePushTokenAsync();
    console.log('[Notifications] Got native device token, converting to Expo token...');

    // Now try Expo token one more time — sometimes getting the device token first
    // warms up Play Services enough for the Expo call to succeed
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
        devicePushToken: deviceToken,
      });
      console.log('[Notifications] Expo token via device token:', tokenData.data);
      return tokenData.data;
    } catch {
      // If Expo token still fails, store the native token as-is
      // The backend can send via FCM directly using this token
      console.log('[Notifications] Storing native FCM token as fallback');
      return `fcm:${deviceToken.data}`;
    }
  } catch (error) {
    console.warn('[Notifications] Device token fallback also failed:', error);
    return undefined;
  }
}

/**
 * Compares the current Expo push token with the locally stored one.
 * If they differ, updates the token in Supabase.
 *
 * Should be called on app launch when a profile already exists.
 * Also attempts to sync any locally stored token that failed to upload previously.
 */
export async function checkAndUpdateToken(): Promise<void> {
  if (!Device.isDevice) return;

  // Check if we have permission
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

  if (!projectId) return;

  try {
    const currentToken = await getTokenWithRetry(projectId);
    if (!currentToken) return;

    // Get the previously stored token
    const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);

    if (currentToken !== storedToken) {
      // Token has changed (or first sync after local-only storage) — update Supabase
      console.log('[Notifications] Token changed, updating Supabase');
      await storeTokenInSupabase(currentToken);
    }
  } catch (error) {
    console.warn('[Notifications] Failed to check/update token:', error);
  }
}

/**
 * React hook that returns the current notification permission status.
 * Used by the Feed screen to show a "Notifications disabled" banner when permission is denied.
 *
 * @returns { permissionGranted: boolean } - true if notifications are permitted
 */
export function useNotificationPermission(): { permissionGranted: boolean } {
  const [permissionGranted, setPermissionGranted] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function checkPermission() {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (isMounted) {
          setPermissionGranted(status === 'granted');
        }
      } catch {
        // Default to true to avoid showing banner unnecessarily
        if (isMounted) {
          setPermissionGranted(true);
        }
      }
    }

    checkPermission();

    // Re-check when app returns to foreground (user may have changed settings)
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      checkPermission();
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return { permissionGranted };
}
