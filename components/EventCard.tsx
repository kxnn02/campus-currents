import React from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { CalendarEvent } from '@/types/database';
import { getCategoryColor } from '@/lib/calendar';
import Colors from '@/constants/Colors';

interface EventCardProps {
  event: CalendarEvent;
  onPress: (event: CalendarEvent) => void;
}

/**
 * Calendar event list item displaying category dot, title, time range, and location.
 * Pressable card used in the calendar date detail list.
 */
export default function EventCard({ event, onPress }: EventCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
      style={[styles.card, { backgroundColor: colors.surface }]}
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
          <Text style={[styles.location, { color: colors.textSecondary }]} numberOfLines={1}>
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
    borderRadius: 10,
    padding: 14,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  time: {
    fontSize: 13,
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
  },
});
