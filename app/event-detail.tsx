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
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useEventDetail, getCategoryColor } from '@/lib/calendar';
import ErrorState from '@/components/ErrorState';
import { EventCategory } from '@/types/database';
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
  // If it's already a full URL, use as-is
  if (attachmentUrl.startsWith('http')) {
    return attachmentUrl;
  }
  // Otherwise, construct the public URL from Supabase Storage
  const { data } = supabase.storage
    .from('event-posters')
    .getPublicUrl(attachmentUrl);
  return data.publicUrl;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
          {/* Title */}
          <Text
            style={[styles.title, { color: colors.text }]}
            accessibilityRole="header"
          >
            {event.title}
          </Text>

          {/* Category badge */}
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: categoryColor + '15' },
            ]}
          >
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {getCategoryLabel(event.category)}
            </Text>
          </View>

          {/* Date/Time */}
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🗓️</Text>
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
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>👤</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              Organized by {event.organizer_name}
            </Text>
          </View>

          {/* Description */}
          {event.description && (
            <View style={styles.descriptionSection}>
              <Text style={[styles.descriptionLabel, { color: colors.text }]}>
                Description
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
    paddingBottom: 32,
  },
  posterImage: {
    width: '100%',
    height: 200,
  },
  posterPlaceholder: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  detailIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  detailText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  descriptionSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
  },
});
