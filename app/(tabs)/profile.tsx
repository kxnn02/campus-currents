import { StyleSheet, View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { Profile } from '@/types/database';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await signOut();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      Alert.alert('Error', message);
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  const displayName = profile?.first_name || profile?.email?.split('@')[0] || 'User';
  const initials = profile?.first_name
    ? `${profile.first_name[0]}${profile.last_name?.[0] || ''}`
    : profile?.email?.[0]?.toUpperCase() || 'U';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <View style={styles.content}>
        {/* Avatar + Name */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : displayName}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>
            {profile?.email}
          </Text>
        </View>

        {/* Info card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <InfoRow label="Role" value={profile?.role || 'student'} colors={colors} />
          {profile?.level && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <InfoRow label="Level" value={profile.level.replace('_', ' ')} colors={colors} />
            </>
          )}
          {profile?.program && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <InfoRow label="Program" value={profile.program} colors={colors} />
            </>
          )}
          {profile?.year_level && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <InfoRow label="Year Level" value={`${profile.year_level}`} colors={colors} />
            </>
          )}
          {profile?.section && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <InfoRow label="Section" value={profile.section} colors={colors} />
            </>
          )}
          {profile?.student_id && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <InfoRow label="Student ID" value={profile.student_id} colors={colors} />
            </>
          )}
        </View>

        {/* Profile incomplete notice */}
        {(!profile?.program || !profile?.level) && (
          <View style={[styles.notice, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
            <Text style={styles.noticeText}>
              Complete your profile to receive targeted announcements for your program and level.
            </Text>
          </View>
        )}

        {/* Logout */}
        <Pressable
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          <Text style={styles.logoutText}>
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: Record<string, string> }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  notice: {
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  noticeText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  button: {
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
});
