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
        { backgroundColor: colors.surface },
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(event)}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${formatTimeRange()}`}
    >
      <View style={[styles.dot, { backgroundColor: categoryColor }]} />
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
    alignItems: 'flex-start',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md + 2,
    marginVertical: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  cardPressed: {
    opacity: 0.8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...theme.typography.h3,
    fontSize: 15,
    marginBottom: 2,
  },
  time: {
    ...theme.typography.bodySmall,
    marginBottom: 2,
  },
  location: {
    ...theme.typography.caption,
  },
});
