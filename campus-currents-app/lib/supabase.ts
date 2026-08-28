import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Fail loud and clear if the build shipped without env vars. Without this guard,
// createClient(undefined, undefined) throws a cryptic error at import time, which
// surfaces to users as a silent crash right after the splash screen. This makes the
// misconfiguration obvious in logs instead. (EAS builds don't read the local .env —
// these must be set via `eas env:create` for the build's environment.)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY ' +
    'must be defined at build time (set them on the EAS build environment).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 2, // Rate-limit realtime events to reduce data usage
    },
  },
  global: {
    headers: {
      'x-client-info': 'campus-currents-mobile/1.0.0',
    },
  },
});
