import { StyleSheet, View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
        {/* Logo & Brand */}
        <View style={styles.branding}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>CC</Text>
          </View>
          <Text style={[styles.brandName, { color: colors.primary }]}>CampusCurrents</Text>
        </View>

        {/* Heading */}
        <View style={styles.headingSection}>
          <Text style={[styles.heading, { color: colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in to your campus portal
          </Text>
        </View>

        {/* Google Sign In Button */}
        <View style={styles.formSection}>
          <Pressable
            style={[
              styles.signInButton,
              { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 },
            ]}
            onPress={handleGoogleSignIn}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Google"
          >
            <Text style={styles.signInButtonText}>
              {loading ? 'SIGNING IN...' : 'SIGN IN WITH GOOGLE'}
            </Text>
          </Pressable>

          <Text style={[styles.emailHint, { color: colors.textSecondary }]}>
            Use your @sscrmnl.edu.ph email
          </Text>

          {/* Emergency consent notice (matches Figma) */}
          <View style={[styles.noticeBox, { backgroundColor: '#F3F3F3', borderLeftColor: colors.primary }]}>
            <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
              By signing in, you agree to receive urgent campus alerts and emergency notifications.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerLink, { color: colors.textSecondary }]}>Privacy Policy</Text>
          <Text style={[styles.footerDivider, { color: colors.border }]}>·</Text>
          <Text style={[styles.footerLink, { color: colors.textSecondary }]}>Terms of Service</Text>
          <Text style={[styles.footerDivider, { color: colors.border }]}>·</Text>
          <Text style={[styles.footerLink, { color: colors.textSecondary }]}>IT Support</Text>
        </View>
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
  // Branding
  branding: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  // Heading
  headingSection: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  // Form / Button
  formSection: {
    width: '100%',
    maxWidth: 340,
    gap: 16,
    alignItems: 'center',
  },
  signInButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  emailHint: {
    fontSize: 13,
    marginTop: 4,
  },
  noticeBox: {
    width: '100%',
    borderLeftWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 20,
    borderRadius: 2,
    marginTop: 8,
  },
  noticeText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'absolute',
    bottom: 32,
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '500',
  },
  footerDivider: {
    fontSize: 12,
  },
});
