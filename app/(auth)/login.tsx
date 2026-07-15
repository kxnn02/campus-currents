import { StyleSheet, View, Text, Pressable, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { signInWithGoogle } from '@/lib/auth';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      await signInWithGoogle();
      // If successful, the auth state listener in _layout.tsx will redirect to tabs
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      Alert.alert('Sign In Error', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Logo / Branding */}
        <View style={styles.branding}>
          <View style={[styles.logoPlaceholder, { backgroundColor: colors.tint }]}>
            <Text style={styles.logoText}>CC</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>CampusCurrents</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            San Sebastian College – Recoletos, Manila
          </Text>
        </View>

        {/* Description */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Get instant class suspension alerts, emergency notifications, and school event updates — all in one app.
        </Text>

        {/* Sign In Button */}
        <Pressable
          style={[styles.googleButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={[styles.googleButtonText, { color: colors.text }]}>
            {loading ? 'Signing in...' : 'Sign in with your SSC-R Google account'}
          </Text>
        </Pressable>

        {/* Domain note */}
        <Text style={[styles.note, { color: colors.textSecondary }]}>
          Use your @sscrmnl.edu.ph email to sign in
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  branding: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
    gap: 12,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  note: {
    fontSize: 12,
    marginTop: 16,
  },
});
