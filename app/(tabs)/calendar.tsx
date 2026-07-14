import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

// Placeholder events - will be replaced with Supabase fetch
const SAMPLE_EVENTS = [
  {
    id: '1',
    title: 'Midterm Exams Begin',
    category: 'academic',
    start_date: '2026-07-28T08:00:00Z',
    end_date: '2026-07-28T17:00:00Z',
    location: 'All rooms',
    organizer_name: 'Academic Affairs',
    is_all_day: true,
  },
  {
    id: '2',
    title: 'GDSC General Assembly',
    category: 'orgActivity',
    start_date: '2026-07-28T14:00:00Z',
    end_date: '2026-07-28T16:00:00Z',
    location: 'Room 301, Building A',
    organizer_name: 'GDSC SSC-R',
    is_all_day: false,
  },
  {
    id: '3',
    title: 'SSC-R Foundation Day',
    category: 'schoolEvent',
    start_date: '2026-08-28T08:00:00Z',
    end_date: '2026-08-28T17:00:00Z',
    location: 'Main Auditorium & Covered Court',
    organizer_name: 'Office of Student Affairs',
    is_all_day: true,
  },
  {
    id: '4',
    title: 'Payment Deadline - 2nd Semester',
    category: 'administrative',
    start_date: '2026-08-01T00:00:00Z',
    end_date: '2026-08-01T23:59:00Z',
    location: 'Cashier Office',
    organizer_name: 'Finance Office',
    is_all_day: true,
  },
];

function getCategoryColor(category: string): string {
  return Colors.calendar[category as keyof typeof Colors.calendar] || Colors.calendar.academic;
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'academic': return 'Academic';
    case 'schoolEvent': return 'School Event';
    case 'orgActivity': return 'Org Activity';
    case 'administrative': return 'Administrative';
    case 'holiday': return 'Holiday';
    case 'sports': return 'Sports';
    default: return 'Event';
  }
}

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedDate] = useState(new Date());

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Month header */}
        <View style={styles.monthHeader}>
          <Pressable style={styles.navButton}>
            <Text style={[styles.navText, { color: colors.tint }]}>{'<'}</Text>
          </Pressable>
          <Text style={[styles.monthText, { color: colors.text }]}>
            {selectedDate.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
          </Text>
          <Pressable style={styles.navButton}>
            <Text style={[styles.navText, { color: colors.tint }]}>{'>'}</Text>
          </Pressable>
        </View>

        {/* Simple calendar placeholder - will be replaced with proper calendar grid */}
        <View style={[styles.calendarPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
            📅 Calendar grid will be implemented here
          </Text>
          <Text style={[styles.placeholderSubtext, { color: colors.textSecondary }]}>
            Today: {selectedDate.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        {/* Upcoming events */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Events</Text>

        {SAMPLE_EVENTS.map((event) => (
          <View key={event.id} style={[styles.eventCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(event.category) }]} />
            <View style={styles.eventContent}>
              <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
              <Text style={[styles.eventMeta, { color: colors.textSecondary }]}>
                📍 {event.location}
              </Text>
              <Text style={[styles.eventMeta, { color: colors.textSecondary }]}>
                🕐 {event.is_all_day ? 'All day' : new Date(event.start_date).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                {' • '}
                {new Date(event.start_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
              </Text>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(event.category) + '15' }]}>
                <Text style={[styles.categoryText, { color: getCategoryColor(event.category) }]}>
                  {getCategoryLabel(event.category)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  navText: {
    fontSize: 20,
    fontWeight: '600',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
  },
  calendarPlaceholder: {
    borderRadius: 12,
    padding: 32,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholderText: {
    fontSize: 16,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  eventCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  categoryDot: {
    width: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  eventContent: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventMeta: {
    fontSize: 13,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
