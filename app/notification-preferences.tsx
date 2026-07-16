import { StyleSheet, View, Text, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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

        <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Emergency and Important alerts cannot be muted.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Routine Channels
        </Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {(Object.keys(CHANNEL_LABELS) as Array<keyof NotificationPreferences>).map((key, index) => (
            <View key={key}>
              {index > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
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
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoBox: {
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});
