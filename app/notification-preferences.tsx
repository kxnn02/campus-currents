import { StyleSheet, View, Text, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme, useThemeColors } from '@/constants/Theme';

const STORAGE_KEY = '@campus_currents:notification_preferences';

interface NotificationPreferences {
  school_events: boolean;
  org_announcements: boolean;
  seminars_workshops: boolean;
  career_job_postings: boolean;
  facilities_notices: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  school_events: true,
  org_announcements: true,
  seminars_workshops: true,
  career_job_postings: true,
  facilities_notices: true,
};

const CHANNEL_LABELS: Record<keyof NotificationPreferences, string> = {
  school_events: 'School Events',
  org_announcements: 'Org Announcements',
  seminars_workshops: 'Seminars & Workshops',
  career_job_postings: 'Career & Job Postings',
  facilities_notices: 'Facilities Notices',
};

export default function NotificationPreferencesScreen() {
  const colors = useThemeColors();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load notification preferences:', err);
    }
  }

  async function togglePreference(key: keyof NotificationPreferences) {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save notification preferences:', err);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.header, { color: colors.text }]}>Notification Settings</Text>

        <View style={[styles.infoBox, { backgroundColor: colors.primaryBg, borderColor: colors.borderLight }]}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Emergency and Important alerts cannot be muted — these keep you safe.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Routine Channels
        </Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {(Object.keys(CHANNEL_LABELS) as Array<keyof NotificationPreferences>).map((key, index) => (
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
});
