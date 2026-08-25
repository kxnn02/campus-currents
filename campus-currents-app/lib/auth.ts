import { useEffect, useRef } from 'react';
import { Platform, ToastAndroid, Alert } from 'react-native';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { queryClient } from './query';

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

  // Clear all cached query data so the next user doesn't see stale profile/feed
  queryClient.clear();

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}


