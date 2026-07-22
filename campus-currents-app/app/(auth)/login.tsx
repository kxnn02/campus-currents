import { StyleSheet, View, Text, Pressable, Alert, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme, useThemeColors } from '@/constants/Theme';
import { signInWithGoogle } from '@/lib/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
      {/* Background decoration */}
      <View style={styles.bgDecorTop} />
      <View style={styles.bgDecorBottom} />

      <View style={styles.content}>
        {/* Top section - Logo & Welcome */}
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={[styles.heading, { color: colors.text }]}>
            Welcome to{'\n'}
            <Text style={{ color: colors.primary }}>CampusCurrents</Text>
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Stay informed. Stay safe. Real-time alerts{'\n'}for SSC-R Manila students.
          </Text>
        </View>

        {/* Middle section - Sign in */}
        <View style={styles.middleSection}>
          {/* Google Sign In Button */}
          <Pressable
            style={({ pressed }) => [
              styles.signInButton,
              { opacity: loading ? 0.7 : pressed ? 0.9 : 1 },
            ]}
            onPress={handleGoogleSignIn}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Google"
          >
            <View style={styles.googleIconContainer}>
              <Ionicons name="logo-google" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.signInButtonText}>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </Pressable>

          <Text style={[styles.emailHint, { color: colors.textTertiary }]}>
            Use your @sscrmnl.edu.ph account
          </Text>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.borderLight }]} />
            <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.borderLight }]} />
          </View>

          {/* Guest hint */}
          <Text style={[styles.guestHint, { color: colors.textSecondary }]}>
            Not an SSC-R student? You can still sign in{'\n'}with any Google account as a guest.
          </Text>
        </View>

        {/* Bottom section - Notice & Footer */}
        <View style={styles.bottomSection}>
          <View style={[styles.noticeCard, { backgroundColor: colors.primaryBg, borderColor: colors.borderLight }]}>
            <Ionicons name="notifications" size={16} color={colors.primary} style={{ marginTop: 1 }} />
            <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
              By signing in, you agree to receive urgent campus alerts and emergency notifications.
            </Text>
          </View>

          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            San Sebastian College - Recoletos, Manila
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
  // Background decoration (subtle warm blobs)
  bgDecorTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(175, 16, 26, 0.04)',
  },
  bgDecorBottom: {
    position: 'absolute',
    bottom: -60,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(248, 156, 0, 0.05)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 24,
  },

  // Top section
  topSection: {
    alignItems: 'center',
    paddingTop: 32,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#AF101A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(228, 190, 186, 0.5)',
  },
  logoImage: {
    width: 56,
    height: 56,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
  },

  // Middle section
  middleSection: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
  },
  signInButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: '#AF101A',
    shadowColor: '#AF101A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  googleIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  emailHint: {
    fontSize: 12,
    marginTop: 14,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Guest hint
  guestHint: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  // Bottom section
  bottomSection: {
    alignItems: 'center',
    gap: 16,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
