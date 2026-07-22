import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { theme, useThemeColors } from '@/constants/Theme';
import { supabase } from '@/lib/supabase';

const SCREENS = [
  { key: 'feed', label: 'News Feed' },
  { key: 'status', label: 'Suspension Status' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'profile', label: 'Profile' },
  { key: 'emergency', label: 'Emergency Alert' },
  { key: 'login', label: 'Login / Sign Up' },
  { key: 'notifications', label: 'Push Notifications' },
  { key: 'other', label: 'Other' },
];

const SEVERITIES = [
  { key: 'critical', label: '🔴 App crashes or unusable', color: '#DC2626' },
  { key: 'major', label: '🟠 Feature broken but app works', color: '#F59E0B' },
  { key: 'minor', label: '🟢 Small issue or visual glitch', color: '#16A34A' },
];

export default function ReportBugScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [screen, setScreen] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string>('minor');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) {
      Alert.alert('Required', 'Please add a short title describing the bug.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required', 'Please describe what went wrong.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Error', 'Please sign in to report a bug.');
        return;
      }

      const deviceInfo = {
        brand: Device.brand,
        model: Device.modelName,
        os: Platform.OS,
        osVersion: Platform.Version,
      };

      const { error } = await supabase.from('bug_reports').insert({
        user_id: session.user.id,
        title: title.trim(),
        description: description.trim(),
        steps_to_reproduce: steps.trim() || null,
        screen: screen,
        severity,
        device_info: deviceInfo,
        app_version: Constants.expoConfig?.version ?? '1.0.0',
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit bug report';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Report Bug' }} />
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>🐛✅</Text>
          <Text style={[styles.successTitle, { color: colors.text }]}>Bug reported!</Text>
          <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
            Thank you for helping us squash bugs. We'll look into it.
          </Text>
          <Pressable
            style={[styles.doneButton, { backgroundColor: colors.tint }]}
            onPress={() => router.back()}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Report a Bug' }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.heading, { color: colors.text }]}>What went wrong?</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Describe the bug you found. The more detail, the faster we can fix it.
        </Text>

        {/* Title */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Bug title *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g. Feed doesn't refresh when I pull down"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        {/* Which screen */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Where did it happen?</Text>
          <View style={styles.chipGrid}>
            {SCREENS.map((s) => {
              const selected = screen === s.key;
              return (
                <Pressable
                  key={s.key}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.tint + '15' : colors.surface,
                      borderColor: selected ? colors.tint : colors.border,
                    },
                  ]}
                  onPress={() => setScreen(selected ? null : s.key)}
                >
                  <Text style={[styles.chipText, { color: selected ? colors.tint : colors.text }]}>
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>What happened? *</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Describe what you expected vs what actually happened..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            maxLength={1000}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        {/* Steps to reproduce */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Steps to reproduce (optional)</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, minHeight: 70 }]}
            placeholder="1. Go to Feed tab&#10;2. Pull down to refresh&#10;3. Nothing happens"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
            maxLength={500}
            value={steps}
            onChangeText={setSteps}
            textAlignVertical="top"
          />
        </View>

        {/* Severity */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>How bad is it?</Text>
          <View style={styles.severityList}>
            {SEVERITIES.map((s) => {
              const selected = severity === s.key;
              return (
                <Pressable
                  key={s.key}
                  style={[
                    styles.severityOption,
                    {
                      backgroundColor: selected ? s.color + '12' : colors.surface,
                      borderColor: selected ? s.color : colors.border,
                    },
                  ]}
                  onPress={() => setSeverity(s.key)}
                >
                  <Text style={[styles.severityText, { color: selected ? s.color : colors.text }]}>
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Submit */}
        <Pressable
          style={[styles.submitButton, { backgroundColor: colors.tint, opacity: submitting ? 0.6 : 1 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitText}>
            {submitting ? 'Submitting...' : '🐛 Submit Bug Report'}
          </Text>
        </Pressable>

        <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
          Device info and app version are captured automatically.
        </Text>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing['5xl'],
  },
  heading: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    lineHeight: 22,
    marginBottom: theme.spacing['2xl'],
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    ...theme.typography.label,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    fontSize: 15,
    minHeight: 100,
    lineHeight: 22,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  chipText: {
    ...theme.typography.bodySmall,
    fontWeight: '500',
  },
  severityList: {
    gap: theme.spacing.sm,
  },
  severityOption: {
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  severityText: {
    ...theme.typography.body,
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    ...theme.shadows.md,
  },
  submitText: {
    color: '#FFFFFF',
    ...theme.typography.buttonLarge,
  },
  footerNote: {
    ...theme.typography.caption,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing['2xl'],
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.xl,
  },
  successTitle: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.sm,
  },
  successSubtitle: {
    ...theme.typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing['2xl'],
  },
  doneButton: {
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing['3xl'],
  },
  doneButtonText: {
    color: '#FFFFFF',
    ...theme.typography.button,
  },
});
