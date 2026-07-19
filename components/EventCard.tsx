import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CalendarEvent } from '@/types/database';
import { getCategoryColor } from '@/lib/calendar';
import { theme, useThemeColors } from '@/constants/Theme';

interface EventCardProps {
  event: CalendarEvent;
  onPress: (event: CalendarEvent) => void;
}

/**
 * Calendar event list item displaying category dot, title, time range, and location.
 * Pressable card used in the calendar date detail list.
 */
export default function EventCard({ event, onPress }: EventCardProps) {
  const colors = useThemeColors();
  const categoryColor = getCategoryColor(event.category);

  const formatTimeRange = (): string => {
    if (event.is_all_day) return 'All day';

    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    const formatTime = (date: Date): string => {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const minuteStr = minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : '';
      return `${hours}${minuteStr} ${ampm}`;
    };

    return `${formatTime(startDate)} – ${formatTime(endDate)}`;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.borderLight },
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(event)}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${formatTimeRange()}`}
    >
      {/* Colored left strip matching Figma event cards */}
      <View style={[styles.leftStrip, { backgroundColor: categoryColor }]} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={[styles.time, { color: colors.textSecondary }]}>{formatTimeRange()}</Text>
        {event.location ? (
          <Text style={[styles.location, { color: colors.textTertiary }]} numberOfLines={1}>
            📍 {event.location}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: theme.spacing.xs + 2,
    ...theme.shadows.sm,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  leftStrip: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h3,
    fontSize: 15,
    marginBottom: theme.spacing.xs,
  },
  time: {
    ...theme.typography.bodySmall,
    marginBottom: theme.spacing.xs,
  },
  location: {
    ...theme.typography.caption,
  },
});
