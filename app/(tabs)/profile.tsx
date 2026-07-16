import { StyleSheet, View, Text, Pressable, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { Profile } from '@/types/database';
import ProfileAvatar from '@/components/ProfileAvatar';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const navigation = useNavigation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('No active session');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setProfile(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      setError(message);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch profile every time this screen comes into focus
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
          <Text style={[styles.errorText, { color: '#DC2626' }]}>{error}</Text>
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
        {/* Avatar and Name Header */}
        <View style={styles.header}>
          <ProfileAvatar
            firstName={profile?.first_name || ''}
            lastName={profile?.last_name || ''}
            size={80}
          />
          <Text style={[styles.name, { color: colors.text }]}>{fullName}</Text>
        </View>

        {/* Profile Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {profile?.student_id && (
            <InfoRow label="Student ID" value={profile.student_id} colors={colors} />
          )}
          {profile?.program && (
            <>
              {profile?.student_id && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              <InfoRow label="Program" value={profile.program} colors={colors} />
            </>
          )}
          {profile?.year_level && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <InfoRow label="Year Level" value={`${profile.year_level}`} colors={colors} />
            </>
          )}
          {profile?.email && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <InfoRow label="Email" value={profile.email} colors={colors} />
            </>
          )}
          {phoneDisplay && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <InfoRow label="Phone" value={phoneDisplay} colors={colors} />
            </>
          )}
        </View>

        {/* Edit Profile Button */}
        <Pressable
          style={[styles.editButton, { backgroundColor: colors.tint }]}
          onPress={handleEditProfile}
          accessibilityLabel="Edit Profile"
          accessibilityRole="button"
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </Pressable>

        {/* Sign Out Button */}
        <Pressable
          style={[styles.signOutButton, { borderColor: colors.border }]}
          onPress={handleSignOut}
          accessibilityLabel="Sign Out"
          accessibilityRole="button"
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: Record<string, string> }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{value}</Text>
    </View>
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
    padding: 24,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 14,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  editButton: {
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signOutButton: {
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
