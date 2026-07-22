import { StyleSheet, View, Text, Pressable, Alert, Image } from 'react-native';
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
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
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
              { backgroundColor: '#AF101A', opacity: loading ? 0.7 : 1 },
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
            SSC-R students use @sscrmnl.edu.ph • Guests use any Google account
          </Text>

          {/* Emergency consent notice (matches Figma) */}
          <View style={[styles.noticeBox, { backgroundColor: '#F3F3F3', borderLeftColor: '#AF101A' }]}>
            <Text style={[styles.noticeText]}>
              By signing in, you agree to receive urgent campus alerts and emergency notifications.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            San Sebastian College–Recoletos Manila
          </Text>
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
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: '#AF101A',
  },
  // Heading
  headingSection: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1C1C',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5B403D',
  },
  // Form / Button
  formSection: {
    width: '100%',
    maxWidth: 384,
    gap: 24,
    alignItems: 'center',
  },
  signInButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  emailHint: {
    fontSize: 13,
    marginTop: 4,
    color: '#5B403D',
  },
  noticeBox: {
    width: '100%',
    borderLeftWidth: 4,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingLeft: 20,
    borderRadius: 2,
    marginTop: 0,
  },
  noticeText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#5B403D',
  },
  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    position: 'absolute',
    bottom: 32,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#5B403D',
  },
});
