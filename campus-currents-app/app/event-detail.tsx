import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { theme, useThemeColors } from '@/constants/Theme';
import { useEventDetail, getCategoryColor } from '@/lib/calendar';
import { useProfile } from '@/lib/profile';
import ErrorState from '@/components/ErrorState';
import { EventCategory, Program } from '@/types/database';
import { supabase } from '@/lib/supabase';

function getCategoryLabel(category: EventCategory): string {
  switch (category) {
    case 'academic':
      return 'Academic';
    case 'school_event':
      return 'School Event';
    case 'org_activity':
      return 'Org Activity';
    case 'administrative':
      return 'Administrative';
    case 'holiday':
      return 'Holiday';
    case 'sports':
      return 'Sports';
    case 'seminar':
      return 'Seminar';
    default:
      return 'Event';
  }
}

function formatEventDateTime(
  startDate: string,
  endDate: string,
  isAllDay: boolean
): string {
  if (isAllDay) {
    const date = new Date(startDate);
    return `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • All day`;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const dateStr = start.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const startTime = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const endTime = end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `${dateStr} • ${startTime} – ${endTime}`;
}

function getStorageUrl(attachmentUrl: string): string {
  if (attachmentUrl.startsWith('http')) {
    return attachmentUrl;
  }
  const { data } = supabase.storage
    .from('event-posters')
    .getPublicUrl(attachmentUrl);
  return data.publicUrl;
}

/**
 * If target_audience has a `programs` array and the student's program is NOT in it,
 * returns a formatted string like "For BSIT, BSBA". Otherwise returns null.
 */
function getTargetProgramsLabel(
  targetAudience: Record<string, unknown>,
  studentProgram: Program | null
): string | null {
  if (targetAudience.all === true) return null;
  const programs = targetAudience.programs;
  if (!Array.isArray(programs) || programs.length === 0) return null;
  // If student's program IS in the list, no need for the label
  if (studentProgram && programs.includes(studentProgram)) return null;
  return `For ${(programs as string[]).join(', ')}`;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const { profile } = useProfile();
  const { data: event, isLoading, isError, refetch } = useEventDetail(id ?? '');
  const [imageError, setImageError] = useState(false);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Event', headerBackTitle: 'Back' }} />
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </>
    );
  }

  if (isError || !event) {
    return (
      <>
        <Stack.Screen options={{ title: 'Event', headerBackTitle: 'Back' }} />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <ErrorState message="Unable to load event details" onRetry={refetch} />
        </View>
      </>
    );
  }

  const categoryColor = getCategoryColor(event.category);
  const programsLabel = getTargetProgramsLabel(event.target_audience, profile?.program ?? null);

  return (
    <>
      <Stack.Screen options={{ title: event.title, headerBackTitle: 'Back' }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Poster image */}
        {event.attachment_url && !imageError ? (
          <Image
            source={{ uri: getStorageUrl(event.attachment_url) }}
            style={styles.posterImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
            accessibilityLabel={`Poster for ${event.title}`}
          />
        ) : event.attachment_url && imageError ? (
          <View style={[styles.posterPlaceholder, { backgroundColor: categoryColor + '20' }]}>
            <Text style={[styles.placeholderIcon, { color: categoryColor }]}>🖼️</Text>
            <Text style={[styles.placeholderText, { color: categoryColor }]}>
              Image unavailable
            </Text>
          </View>
        ) : null}

        <View style={styles.content}>
          {/* Category badge */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '15' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {getCategoryLabel(event.category)}
            </Text>
          </View>

          {/* Target programs chip (informational — event is still visible) */}
          {programsLabel && (
            <View style={[styles.programsChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.programsChipText, { color: colors.textSecondary }]}>
                {programsLabel}
              </Text>
            </View>
          )}

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
            {event.title}
          </Text>

          {/* Details card */}
          <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Date/Time */}
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📅</Text>
              <Text style={[styles.detailText, { color: colors.text }]}>
                {formatEventDateTime(event.start_date, event.end_date, event.is_all_day)}
              </Text>
            </View>

            {/* Location */}
            {event.location && (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📍</Text>
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {event.location}
                </Text>
              </View>
            )}

            {/* Organizer */}
            {event.organizer_name && (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>👤</Text>
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  {event.organizer_name}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {event.description && (
            <View style={[styles.descriptionSection, { borderTopColor: colors.border }]}>
              <Text style={[styles.descriptionLabel, { color: colors.text }]}>
                About
              </Text>
              <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                {event.description}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
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
  },
  scrollContent: {
    paddingBottom: theme.spacing['5xl'],
  },
  posterImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  posterPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  placeholderText: {
    ...theme.typography.body,
    fontWeight: '500',
  },
  content: {
    padding: theme.spacing.xl,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.radius['2xl'],
    marginBottom: theme.spacing.md,
  },
  categoryText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  programsChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.radius['2xl'],
    borderWidth: 1,
    marginBottom: theme.spacing.md,
  },
  programsChipText: {
    ...theme.typography.caption,
    fontWeight: '500',
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.lg,
  },
  detailsCard: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm + 2,
  },
  detailIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  detailText: {
    ...theme.typography.body,
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  descriptionSection: {
    paddingTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: '#E4BEBA', // fallback; overridden inline with colors.border
  },
  descriptionLabel: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.sm,
  },
  descriptionText: {
    ...theme.typography.bodyLarge,
    lineHeight: 26,
  },
});
