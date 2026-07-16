import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import CalendarGrid from '@/components/CalendarGrid';
import EventCard from '@/components/EventCard';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { useMonthEvents, getEventsForDate, sortCalendarEvents } from '@/lib/calendar';
import { useProfile } from '@/lib/profile';
import { CalendarEvent } from '@/types/database';

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  // Get profile from shared context
  const { profile } = useProfile();

  // Track current displayed month/year
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-based
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch events for the displayed month with audience filtering
  const { data: events, isLoading, isError, refetch, isRefetching } = useMonthEvents(
    year,
    month,
    profile ? { program: profile.program, year_level: profile.year_level } : null
  );

  // Get sorted events for the selected date
  const eventsForSelectedDate = useMemo(() => {
    if (!selectedDate || !events) return [];
    const dateEvents = getEventsForDate(events, selectedDate);
    return sortCalendarEvents(dateEvents);
  }, [selectedDate, events]);

  const handleMonthChange = useCallback((newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  }, []);

  const handleDatePress = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleEventPress = useCallback((event: CalendarEvent) => {
    router.push(`/event-detail?id=${event.id}`);
  }, [router]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Error state with retry
  if (isError && !events) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <ErrorState
          message="Unable to load events"
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
      >
        {/* Calendar Grid with loading state */}
        {isLoading ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        ) : (
          <CalendarGrid
            year={year}
            month={month}
            events={events ?? []}
            selectedDate={selectedDate}
            onDatePress={handleDatePress}
            onMonthChange={handleMonthChange}
          />
        )}

        {/* Event list section below the grid */}
        {selectedDate && (
          <View style={styles.eventsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Events
            </Text>

            {eventsForSelectedDate.length > 0 ? (
              eventsForSelectedDate.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPress={handleEventPress}
                />
              ))
            ) : (
              <EmptyState
                icon="📅"
                message="No events on this day"
              />
            )}
          </View>
        )}
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
    paddingBottom: 32,
  },
  loadingContainer: {
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
  },
  eventsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 4,
  },
});
