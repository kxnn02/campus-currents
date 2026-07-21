import { StyleSheet, View, Text, Switch, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme, useThemeColors } from '@/constants/Theme';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/lib/profile';
import type { NotificationPreferences } from '@/types/database';

const STORAGE_KEY = '@campus_currents:notification_preferences';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  general: true,
  event: true,
  academic: true,
};

const CHANNEL_LABELS: Record<keyof NotificationPreferences, string> = {
  general: 'General Announcements',
  event: 'Events & Activities',
  academic: 'Academic Updates',
};

const CHANNEL_KEYS: Array<keyof NotificationPreferences> = ['general', 'event', 'academic'];

export default function NotificationPreferencesScreen() {
  const colors = useThemeColors();
  const { profile } = useProfile();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setSyncing] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [profile]);

  /**
   * Load preferences on mount:
   * 1. Try fetching from profiles.notification_preferences via Supabase
   * 2. Fall back to AsyncStorage if fetch fails
   * 3. Fall back to defaults if neither has data
   */
  async function loadPreferences() {
    setIsLoading(true);
    try {
      if (profile?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('notification_preferences')
          .eq('id', profile.id)
          .maybeSingle();

        if (!error && data?.notification_preferences) {
          const serverPrefs = data.notification_preferences as NotificationPreferences;
          const merged = { ...DEFAULT_PREFERENCES, ...serverPrefs };
          setPreferences(merged);
          // Update local cache with server truth
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          setIsLoading(false);
          return;
        }
      }

      // Fallback: read from AsyncStorage
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<NotificationPreferences>;
        // Migrate old keys: if stored data has old keys, start fresh with defaults
        if ('school_events' in parsed || 'org_announcements' in parsed) {
          setPreferences(DEFAULT_PREFERENCES);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
        } else {
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
        }
      }
    } catch {
      // Silently fail — defaults will be used
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Toggle a preference:
   * 1. Update state immediately (optimistic)
   * 2. Write to AsyncStorage (offline cache)
   * 3. PATCH profiles.notification_preferences via Supabase
   */
  const togglePreference = useCallback(async (key: keyof NotificationPreferences) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);

    // Write to AsyncStorage as offline cache
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Silently fail — preference is still in memory
    }

    // Sync to server
    if (profile?.id) {
      setSyncing(true);
      try {
        await supabase
          .from('profiles')
          .update({ notification_preferences: updated })
          .eq('id', profile.id);
      } catch {
        // Silently fail — local cache is still correct, will sync next time
      } finally {
        setSyncing(false);
      }
    }
  }, [preferences, profile]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.header, { color: colors.text }]}>Notification Settings</Text>

        <View style={[styles.infoBox, { backgroundColor: colors.primaryBg, borderColor: colors.borderLight }]}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Emergency and Important alerts cannot be muted. These settings control which routine announcements send you push notifications.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Routine Channels
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.tint} />
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {CHANNEL_KEYS.map((key, index) => (
              <View key={key}>
                {index > 0 && <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />}
                <View style={styles.row}>
                  <Text style={[styles.label, { color: colors.text }]}>{CHANNEL_LABELS[key]}</Text>
                  <Switch
                    value={preferences[key]}
                    onValueChange={() => togglePreference(key)}
                    trackColor={{ false: colors.border, true: colors.tint }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {isSyncing && (
          <Text style={[styles.syncText, { color: colors.textSecondary }]}>Saving...</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing['2xl'],
    paddingBottom: theme.spacing['5xl'],
  },
  header: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.lg,
  },
  infoBox: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md + 2,
    borderWidth: 1,
    marginBottom: theme.spacing['2xl'],
  },
  infoText: {
    ...theme.typography.body,
    lineHeight: 20,
  },
  sectionTitle: {
    ...theme.typography.overline,
    marginBottom: theme.spacing.sm + 2,
  },
  card: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xs,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md + 2,
    paddingHorizontal: theme.spacing.lg,
  },
  label: {
    ...theme.typography.body,
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginHorizontal: theme.spacing.lg,
  },
  loadingContainer: {
    paddingVertical: theme.spacing['2xl'],
    alignItems: 'center',
  },
  syncText: {
    ...theme.typography.body,
    fontSize: 12,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});
