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
import { useProfile } from '@/lib/profile';

const FEATURES = [
  { key: 'feed', label: '📋 News Feed' },
  { key: 'status', label: '🏫 Suspension Status' },
  { key: 'calendar', label: '📅 Calendar' },
  { key: 'emergency', label: '🚨 Emergency Alerts' },
  { key: 'push', label: '🔔 Push Notifications' },
  { key: 'login', label: '🔑 Login Process' },
  { key: 'design', label: '🎨 Design / UI' },
  { key: 'speed', label: '⚡ Speed & Performance' },
];

const STAR_LABELS = ['Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];

export default function FeedbackScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { profile } = useProfile();

  const [rating, setRating] = useState(0);
  const [likedFeatures, setLikedFeatures] = useState<string[]>([]);
  const [improvementAreas, setImprovementAreas] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [recommend, setRecommend] = useState<'yes' | 'no' | 'maybe' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function toggleSelection(item: string, list: string[], setter: (v: string[]) => void) {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  }

  async function handleSubmit() {
    if (rating === 0) {
      Alert.alert('Rating required', 'Please tap a star to rate your experience.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Error', 'Please sign in to submit feedback.');
        return;
      }

      const deviceInfo = {
        brand: Device.brand,
        model: Device.modelName,
        os: Platform.OS,
        osVersion: Platform.Version,
      };

      const { error } = await supabase.from('feedback').insert({
        user_id: session.user.id,
        rating,
        liked_features: likedFeatures,
        improvement_areas: improvementAreas,
        comment: comment.trim() || null,
        would_recommend: recommend,
        device_info: deviceInfo,
        app_version: Constants.expoConfig?.version ?? '1.0.0',
      });

      if (error) throw error;

      setSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit feedback';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Feedback' }} />
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={[styles.successTitle, { color: colors.text }]}>Thank you!</Text>
          <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
            Your feedback helps us improve CampusCurrents for everyone.
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
      <Stack.Screen options={{ title: 'Send Feedback' }} />
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
        {/* Header */}
        <Text style={[styles.heading, { color: colors.text }]}>How's your experience?</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your honest feedback helps us build a better app for SSC-R.
        </Text>

        {/* Star Rating */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Overall Rating *</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
                accessibilityRole="button"
                accessibilityLabel={`Rate ${star} stars`}
              >
                <Text style={[styles.starIcon, { opacity: star <= rating ? 1 : 0.25 }]}>
                  ★
                </Text>
              </Pressable>
            ))}
          </View>
          {rating > 0 && (
            <Text style={[styles.ratingLabel, { color: colors.tint }]}>
              {STAR_LABELS[rating - 1]}
            </Text>
          )}
        </View>

        {/* Liked Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>What do you like most?</Text>
          <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>Select all that apply</Text>
          <View style={styles.chipGrid}>
            {FEATURES.map((f) => {
              const selected = likedFeatures.includes(f.key);
              return (
                <Pressable
                  key={f.key}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.tint + '15' : colors.surface,
                      borderColor: selected ? colors.tint : colors.border,
                    },
                  ]}
                  onPress={() => toggleSelection(f.key, likedFeatures, setLikedFeatures)}
                >
                  <Text style={[styles.chipText, { color: selected ? colors.tint : colors.text }]}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Improvement Areas */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>What needs improvement?</Text>
          <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>Select all that apply</Text>
          <View style={styles.chipGrid}>
            {FEATURES.map((f) => {
              const selected = improvementAreas.includes(f.key);
              return (
                <Pressable
                  key={f.key}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? '#FEF2F2' : colors.surface,
                      borderColor: selected ? '#EF4444' : colors.border,
                    },
                  ]}
                  onPress={() => toggleSelection(f.key, improvementAreas, setImprovementAreas)}
                >
                  <Text style={[styles.chipText, { color: selected ? '#DC2626' : colors.text }]}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Would Recommend */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Would you recommend this to a classmate?</Text>
          <View style={styles.recommendRow}>
            {(['yes', 'no', 'maybe'] as const).map((option) => {
              const selected = recommend === option;
              const emoji = option === 'yes' ? '👍' : option === 'no' ? '👎' : '🤷';
              return (
                <Pressable
                  key={option}
                  style={[
                    styles.recommendButton,
                    {
                      backgroundColor: selected ? colors.tint + '15' : colors.surface,
                      borderColor: selected ? colors.tint : colors.border,
                    },
                  ]}
                  onPress={() => setRecommend(option)}
                >
                  <Text style={styles.recommendEmoji}>{emoji}</Text>
                  <Text style={[styles.recommendLabel, { color: selected ? colors.tint : colors.text }]}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Free Text Comment */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Anything else? (optional)</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Bugs, suggestions, compliments — anything helps..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            maxLength={500}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.textSecondary }]}>
            {comment.length}/500
          </Text>
        </View>

        {/* Submit */}
        <Pressable
          style={[styles.submitButton, { backgroundColor: colors.tint, opacity: submitting ? 0.6 : 1 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitText}>
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Text>
        </Pressable>

        <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
          You can submit feedback multiple times — every response is helpful.
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
    marginBottom: theme.spacing['2xl'],
  },
  sectionLabel: {
    ...theme.typography.label,
    marginBottom: theme.spacing.xs,
  },
  sectionHint: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.md,
  },
  // Stars
  starsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  starButton: {
    padding: theme.spacing.xs,
  },
  starIcon: {
    fontSize: 40,
    color: '#F59E0B',
  },
  ratingLabel: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
  },
  // Chips
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
  // Recommend
  recommendRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  recommendButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  recommendEmoji: {
    fontSize: 24,
  },
  recommendLabel: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  // Text area
  textArea: {
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    fontSize: 15,
    minHeight: 100,
    lineHeight: 22,
  },
  charCount: {
    ...theme.typography.caption,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  // Submit
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
  // Success state
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing['2xl'],
  },
  successEmoji: {
    fontSize: 64,
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
