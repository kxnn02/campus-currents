import { StyleSheet, View, Text, Pressable, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { theme, useThemeColors } from '@/constants/Theme';
import { signInWithGoogle } from '@/lib/auth';

export default function LoginScreen() {
  const colors = useThemeColors();
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
    paddingHorizontal: theme.layout.screenPaddingHorizontal,
  },
  branding: {
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
  },
  logoPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: theme.radius['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logoText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  title: {
    ...theme.typography.display,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    textAlign: 'center',
  },
  description: {
    ...theme.typography.bodyLarge,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing['5xl'],
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md + 2,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    width: '100%',
    gap: theme.spacing.md,
    ...theme.shadows.md,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    ...theme.typography.label,
    flex: 1,
  },
  note: {
    ...theme.typography.caption,
    marginTop: theme.spacing.lg,
  },
});
