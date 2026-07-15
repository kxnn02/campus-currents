import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { supabase } from '@/lib/supabase';
import { createSessionFromUrl } from '@/lib/auth';
import * as Linking from 'expo-linking';

export {
  ErrorBoundary,
} from 'expo-router';

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

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Handle deep link redirects from OAuth
  const url = Linking.useURL();
  useEffect(() => {
    if (url) {
      createSessionFromUrl(url).catch(console.error);
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

  async function checkProfileAndRedirect() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, program, year_level')
        .eq('id', session!.user.id)
        .single();

      if (error || !data || !data.program) {
        // No profile or incomplete profile — redirect to profile completion
        router.replace('/profile-completion' as never);
      } else {
        // Profile exists and is complete — redirect to tabs
        router.replace('/(tabs)' as never);
      }
    } catch {
      // On error, default to tabs (profile check is non-blocking)
      router.replace('/(tabs)' as never);
    }
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile-completion" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
