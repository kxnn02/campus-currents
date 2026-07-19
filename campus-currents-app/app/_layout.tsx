import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';

import { supabase } from '@/lib/supabase';
import { createSessionFromUrl } from '@/lib/auth';
import { queryClient } from '@/lib/query';
import { EmergencyProvider, useEmergency } from '@/lib/emergency';
import { NetworkProvider, StaleDataBanner, TimeoutToast } from '@/lib/network';
import { useConnectivitySync } from '@/lib/connectivity';
import { UnreadCountProvider } from '@/lib/feed';
import { ProfileProvider } from '@/lib/profile';
import { InAppBannerProvider, useInAppBanner } from '@/components/InAppBanner';
import { registerBannerHandler, handleNotificationResponse, handleForegroundNotification } from '@/lib/notification-router';
import { registerForPushNotifications, checkAndUpdateToken } from '@/lib/notifications';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <EmergencyProvider>
        <NetworkProvider>
          <ProfileProvider>
            <UnreadCountProvider>
              <InAppBannerProvider>
                <RootLayoutNav />
              </InAppBannerProvider>
            </UnreadCountProvider>
          </ProfileProvider>
        </NetworkProvider>
      </EmergencyProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const appState = useRef(AppState.currentState);
  const { checkActiveEmergency, activeEmergency, hasAcknowledged, showOverlay } = useEmergency();
  const { isServingStaleData, showTimeoutToast, dismissTimeoutToast } = useConnectivitySync();
  const { show: showBanner } = useInAppBanner();

  // Register in-app banner handler for notification-router
  useEffect(() => {
    registerBannerHandler(showBanner);
  }, [showBanner]);

  // Handle deep link redirects from OAuth
  const url = Linking.useURL();
  useEffect(() => {
    if (url) {
      createSessionFromUrl(url).catch(() => {
        // Silently fail — user will see login screen if auth callback fails
      });
    }
  }, [url]);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = (segments[0] as string) === '(auth)';

    if (session && inAuthGroup) {
      // User is signed in — check if profile exists before redirecting to tabs
      checkProfileAndRedirect();
    } else if (!session && !inAuthGroup) {
      // User is not signed in but trying to access protected screen — redirect to login
      router.replace('/(auth)/login' as never);
    }
  }, [session, initialized, segments]);

  // Register push notifications when user is authenticated
  useEffect(() => {
    if (session) {
      registerForPushNotifications().catch(() => {
        // Silently fail — will retry on next app launch
      });
    }
  }, [session]);

  // Notification listeners: foreground + tap response
  useEffect(() => {
    // Foreground: handle notifications while app is open
    const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
      handleForegroundNotification(notification);
    });

    // Tap: handle when user taps a notification
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationResponse(response);
    });

    return () => {
      foregroundSub.remove();
      responseSub.remove();
    };
  }, []);

  // AppState listener: check for active emergency when app returns to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to foreground — check if there's an active unacknowledged emergency
        checkActiveEmergency();
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [checkActiveEmergency]);

  // Navigate to emergency overlay when emergency is active and unacknowledged
  useEffect(() => {
    if (showOverlay && activeEmergency && !hasAcknowledged) {
      router.push('/emergency-overlay' as never);
    }
  }, [showOverlay, activeEmergency, hasAcknowledged]);

  async function checkProfileAndRedirect() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, program, year_level')
        .eq('id', session!.user.id)
        .maybeSingle();

      if (error || !data) {
        // No profile row at all — redirect to profile completion
        router.replace('/profile-completion' as never);
      } else if (!data.program || !data.year_level) {
        // Profile exists but incomplete (missing program/year) — redirect to profile completion
        router.replace('/profile-completion' as never);
      } else {
        // Profile exists and is complete — check for active emergency with prior acknowledgment
        const destination = await getPostLaunchDestination();
        router.replace(destination as never);
      }
    } catch {
      // On error, redirect to profile completion (safe default)
      router.replace('/profile-completion' as never);
    }
  }

  /**
   * App relaunch logic:
   * - If emergency still active AND student already acknowledged → show post-ack screen
   * - If resolved or no emergency → proceed to normal navigation (tabs)
   */
  async function getPostLaunchDestination(): Promise<string> {
    try {
      const { data: emergency } = await supabase
        .from('active_emergencies')
        .select('id, status')
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      if (!emergency) {
        return '/(tabs)';
      }

      // Check if student already acknowledged this emergency
      const ackKey = `@campus_currents:emergency_ack_${emergency.id}`;
      const ackData = await AsyncStorage.getItem(ackKey);

      if (ackData) {
        // Already acknowledged — go to post-acknowledgment screen
        const parsed = JSON.parse(ackData) as { type: string };
        return `/post-acknowledgment?type=${parsed.type}`;
      }

      // Active emergency but not acknowledged — normal flow will show overlay
      return '/(tabs)';
    } catch {
      return '/(tabs)';
    }
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <TimeoutToast visible={showTimeoutToast} onDismiss={dismissTimeoutToast} />
      <StaleDataBanner visible={isServingStaleData} />
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile-completion" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="post-acknowledgment" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="profile-edit" options={{ title: 'Edit Profile' }} />
        <Stack.Screen name="notification-preferences" options={{ title: 'Notifications' }} />
        <Stack.Screen name="broadcast-detail" options={{ title: 'Announcement' }} />
        <Stack.Screen name="event-detail" options={{ headerShown: true }} />
        <Stack.Screen
          name="emergency-overlay"
          options={{
            presentation: 'fullScreenModal',
            headerShown: false,
            gestureEnabled: false,
            animation: 'fade',
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
