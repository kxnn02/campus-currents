import { StyleSheet, View, Text, Pressable, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { theme, useThemeColors } from '@/constants/Theme';
import { signOut } from '@/lib/auth';
import { useProfile } from '@/lib/profile';
import { Profile } from '@/types/database';
import ProfileAvatar from '@/components/ProfileAvatar';

export default function ProfileScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const navigation = useNavigation();
  const { profile, isLoading: loading, error, refetch: fetchProfile } = useProfile();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
    });
    return unsubscribe;
  }, [navigation, fetchProfile]);

  function handleEditProfile() {
    router.push('/profile-edit' as never);
  }

  function handleSignOut() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login' as never);
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Sign out failed';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <Pressable style={[styles.retryButton, { borderColor: colors.border }]} onPress={fetchProfile}>
            <Text style={[styles.retryText, { color: colors.tint }]}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'User';
  const phoneDisplay = profile?.phone_number
    ? profile.phone_number.startsWith('+63')
      ? profile.phone_number
      : `+63${profile.phone_number}`
    : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Card with Avatar */}
        <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.headerBanner, { backgroundColor: colors.primaryBg }]} />
          <View style={styles.headerContent}>
            <ProfileAvatar
              firstName={profile?.first_name || ''}
              lastName={profile?.last_name || ''}
              size={80}
            />
            <Text style={[styles.name, { color: colors.text }]}>{fullName}</Text>
            {profile?.student_id && (
              <Text style={[styles.studentId, { color: colors.textSecondary }]}>
                {profile.student_id}
              </Text>
            )}
            {profile?.program && (
              <View style={[styles.programBadge, { backgroundColor: colors.primaryBg }]}>
                <Text style={[styles.programBadgeText, { color: colors.primary }]}>
                  {profile.program}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Academic Information Section */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          ACADEMIC INFORMATION
        </Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {profile?.program && (
            <InfoRow
              icon="school-outline"
              label="Program"
              value={profile.program}
              colors={colors}
            />
          )}
          {profile?.year_level && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
              <InfoRow
                icon="layers-outline"
                label="Year Level"
                value={`${profile.year_level}`}
                colors={colors}
              />
            </>
          )}
          {profile?.email && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
              <InfoRow
                icon="mail-outline"
                label="Email"
                value={profile.email}
                colors={colors}
              />
            </>
          )}
          {phoneDisplay && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
              <InfoRow
                icon="call-outline"
                label="Phone"
                value={phoneDisplay}
                colors={colors}
              />
            </>
          )}
        </View>

        {/* Preferences Section */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          PREFERENCES
        </Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MenuRow
            icon="create-outline"
            label="Edit Profile"
            onPress={handleEditProfile}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          <MenuRow
            icon="notifications-outline"
            label="Notification Preferences"
            onPress={() => router.push('/notification-preferences' as never)}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          <MenuRow
            icon="chatbubble-ellipses-outline"
            label="Send Feedback"
            onPress={() => router.push('/feedback' as never)}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          <MenuRow
            icon="bug-outline"
            label="Report a Bug"
            onPress={() => router.push('/report-bug' as never)}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          <MenuRow
            icon="log-out-outline"
            label="Sign Out"
            onPress={handleSignOut}
            colors={colors}
            destructive
          />
        </View>

        {/* App Version */}
        <Text style={[styles.versionText, { color: colors.textTertiary }]}>
          CampusCurrents v{Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: Record<string, string> }) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconBg, { backgroundColor: colors.primaryBg }]}>
        <Ionicons name={icon as any} size={18} color={colors.primary} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

function MenuRow({ icon, label, onPress, colors, destructive }: { icon: string; label: string; onPress: () => void; colors: Record<string, string>; destructive?: boolean }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.7 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons
        name={icon as any}
        size={18}
        color={destructive ? colors.error : colors.text}
      />
      <Text style={[styles.menuLabel, { color: destructive ? colors.error : colors.text }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing['2xl'],
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 96,
  },
  versionText: {
    ...theme.typography.caption,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  // Header Card
  headerCard: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: theme.spacing['2xl'],
    ...theme.shadows.sm,
  },
  headerBanner: {
    height: 64,
  },
  headerContent: {
    alignItems: 'center',
    paddingBottom: theme.spacing['2xl'],
    marginTop: -40,
  },
  name: {
    ...theme.typography.h2,
    marginTop: theme.spacing.md,
  },
  studentId: {
    ...theme.typography.bodySmall,
    marginTop: theme.spacing.xs,
  },
  programBadge: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  programBadgeText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  // Section headers
  sectionHeader: {
    ...theme.typography.overline,
    letterSpacing: 0.6,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  // Section card
  sectionCard: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: theme.spacing.xs,
    marginBottom: theme.spacing['2xl'],
    ...theme.shadows.sm,
  },
  // Info rows (icon + label/value)
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  infoIconBg: {
    width: 40,
    height: 40,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  infoLabel: {
    ...theme.typography.caption,
  },
  infoValue: {
    ...theme.typography.body,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: theme.spacing.lg,
  },
  // Menu rows (settings-style)
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  menuLabel: {
    ...theme.typography.body,
    fontWeight: '500',
    flex: 1,
  },
  // Error/retry states
  errorText: {
    ...theme.typography.body,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing['2xl'],
    borderWidth: 1,
  },
  retryText: {
    ...theme.typography.button,
  },
});
