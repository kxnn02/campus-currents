import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';

const ALLOWED_DOMAIN = 'sscrmnl.edu.ph';

/**
 * Extract session from the OAuth callback URL.
 * Called when the app receives a deep link after Google OAuth.
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

  const email = data.session?.user?.email;
  if (email && !email.endsWith(`@${ALLOWED_DOMAIN}`)) {
    await supabase.auth.signOut();
    throw new Error('Please use your SSC-R school email (@sscrmnl.edu.ph) to sign in.');
  }

  return data.session;
}

/**
 * Sign in with Google OAuth via Supabase.
 * Opens the SYSTEM browser (Chrome) for auth — most reliable on Android.
 */
export async function signInWithGoogle() {
  const redirectTo = Linking.createURL('/auth-callback');
  console.log('[Auth] Redirect URI:', redirectTo);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        hd: ALLOWED_DOMAIN,
      },
    },
  });

  if (error) throw error;

  if (data?.url) {
    // Open in the system browser (Chrome) — not the in-app browser
    await Linking.openURL(data.url);
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
