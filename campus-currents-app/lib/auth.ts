import { useEffect, useRef, useState, useCallback } from 'react';
import { Alert, Platform, ToastAndroid } from 'react-native';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Profile } from '@/types/database';

const ALLOWED_DOMAIN = 'sscrmnl.edu.ph';
const EMERGENCY_ACK_PREFIX = '@campus_currents:emergency_ack_';

/**
 * Checks if an email belongs to the SSC-R school domain.
 */
export function isSchoolEmail(email: string | undefined | null): boolean {
  return !!email && email.endsWith(`@${ALLOWED_DOMAIN}`);
}

/**
 * Extract session from the OAuth callback URL.
 * Called when the app receives a deep link after Google OAuth.
 * Allows ALL Google accounts — domain check is only used for role assignment.
 */
export async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(errorCode);
  }

  const { access_token, refresh_token } = params;

  if (!access_token) return null;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) throw error;

  return data.session;
}

/**
 * Sign in with Google OAuth via Supabase.
 * Opens the SYSTEM browser (Chrome) for auth — most reliable on Android.
 * Allows any Google account — SSC-R and non-SSC-R users alike.
 */
export async function signInWithGoogle() {
  const redirectTo = Linking.createURL('/auth-callback');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });

  if (error) throw error;

  if (data?.url) {
    // Open in the system browser (Chrome) — not the in-app browser
    await Linking.openURL(data.url);
  }
}

/**
 * Sign out the current user.
 * Clears the Supabase session, removes emergency acknowledgment keys from AsyncStorage,
 * and signs out via Supabase Auth.
 */
export async function signOut() {
  // Clear emergency acknowledgment keys from AsyncStorage
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const emergencyAckKeys = allKeys.filter((key) => key.startsWith(EMERGENCY_ACK_PREFIX));
    if (emergencyAckKeys.length > 0) {
      await AsyncStorage.multiRemove(emergencyAckKeys);
    }
  } catch {
    // Silently fail — sign out should still proceed
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// --- useAuth Hook ---

/**
 * useAuth() — Reactive hook that tracks session and profile state.
 *
 * Behavior:
 * 1. Subscribes to supabase.auth.onAuthStateChange to track session.
 * 2. When session exists, fetches profile from `profiles` table.
 * 3. Returns isProfileComplete (true if profile has program set).
 * 4. isLoading is true until both session check and profile fetch complete.
 * 5. Handles session expiry: if auth state fires with null session (was previously set),
 *    clears AsyncStorage emergency keys and shows a "Session expired" toast.
 */
export function useAuth(): {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isProfileComplete: boolean;
} {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const previousSessionRef = useRef<Session | null>(null);
  const profileFetchedForRef = useRef<string | null>(null);

  // Show a toast/alert for session expiry
  const showSessionExpiredMessage = useCallback(() => {
    if (Platform.OS === 'android') {
      ToastAndroid.show('Session expired — please sign in again', ToastAndroid.LONG);
    } else {
      Alert.alert('Session Expired', 'Session expired — please sign in again');
    }
  }, []);

  // Clear emergency ack keys on session expiry
  const clearEmergencyAckKeys = useCallback(async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const emergencyAckKeys = allKeys.filter((key) => key.startsWith(EMERGENCY_ACK_PREFIX));
      if (emergencyAckKeys.length > 0) {
        await AsyncStorage.multiRemove(emergencyAckKeys);
      }
    } catch {
      // Silently fail
    }
  }, []);

  // Fetch profile for the given user ID
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) {
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) return;

        const hadSession = previousSessionRef.current !== null;
        const hasSession = newSession !== null;

        // Detect session expiry: previously had session, now null
        if (hadSession && !hasSession) {
          await clearEmergencyAckKeys();
          showSessionExpiredMessage();
        }

        previousSessionRef.current = newSession;
        setSession(newSession);

        if (newSession) {
          const userId = newSession.user.id;
          // Only re-fetch if user changed
          if (profileFetchedForRef.current !== userId) {
            profileFetchedForRef.current = userId;
            await fetchProfile(userId);
          }
        } else {
          setProfile(null);
          profileFetchedForRef.current = null;
        }

        if (isMounted) {
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [clearEmergencyAckKeys, showSessionExpiredMessage, fetchProfile]);

  const isProfileComplete = profile !== null && profile.program !== null;

  return {
    session,
    profile,
    isLoading,
    isProfileComplete,
  };
}
