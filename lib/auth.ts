import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

// Required for web browser auth session to close properly
WebBrowser.maybeCompleteAuthSession();

// Build the redirect URI based on environment
const redirectTo = makeRedirectUri();

// Allowed email domain for SSC-R Manila
const ALLOWED_DOMAIN = 'sscrmnl.edu.ph';

/**
 * Sign in with Google OAuth via Supabase.
 * Restricted to @sscrmnl.edu.ph accounts.
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        hd: ALLOWED_DOMAIN, // Hints Google to show only school accounts
      },
    },
  });

  if (error) throw error;

  // Open the browser for OAuth flow
  if (data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo
    );

    if (result.type === 'success') {
      const { url } = result;
      await createSessionFromUrl(url);
    }
  }
}

/**
 * Extract session from OAuth callback URL
 */
async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(errorCode);
  }

  const { access_token, refresh_token } = params;

  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) throw error;

  // Verify the email domain after sign-in
  const email = data.session?.user?.email;
  if (email && !email.endsWith(`@${ALLOWED_DOMAIN}`)) {
    // Sign out if not a school email
    await supabase.auth.signOut();
    throw new Error('Please use your SSC-R school email (@sscrmnl.edu.ph) to sign in.');
  }

  return data.session;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current session
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
