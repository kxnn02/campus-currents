import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme, useThemeColors } from '@/constants/Theme';
import CalendarGrid from '@/components/CalendarGrid';
import ErrorState from '@/components/ErrorState';
import {
  useUnifiedMonthData,
  getUnifiedItemsForDate,
  UnifiedCalendarItem,
  getCategoryColor,
} from '@/lib/calendar';
import { useProfile } from '@/lib/profile';
import { CalendarEvent, EventCategory } from '@/types/database';
import Colors from '@/constants/Colors';

export default function CalendarScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const { profile } = useProfile();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  // Fetch unified data (events + broadcasts + suspensions)
  const { data: unifiedItems, isLoading, isError, refetch, isRefetching } = useUnifiedMonthData(
    year,
    month,
    profile ? { program: profile.program, year_level: profile.year_level } : null
  );

  // Convert unified items to CalendarEvent-like format for the grid dots
  const eventsForGrid = useMemo(() => {
    if (!unifiedItems) return [];
    return unifiedItems.map((item) => ({
      id: item.id,
      title: item.title,
      description: null,
      category: (item.source === 'suspension' ? 'holiday' :
                 item.source === 'broadcast' ? 'administrative' :
                 item.category) as EventCategory,
      start_date: item.startDate,
      end_date: item.endDate,
      is_all_day: item.isAllDay,
      location: item.location,
      organizer_name: '',
      target_audience: {},
      attachment_url: null,
      status: 'active' as const,
      is_deleted: false,
      created_by: '',
      school_id: '',
      created_at: '',
      updated_at: '',
    }));
  }, [unifiedItems]);

  // Get items for selected date
  const itemsForSelectedDate = useMemo(() => {
    if (!selectedDate || !unifiedItems) return [];
    return getUnifiedItemsForDate(unifiedItems, selectedDate);
  }, [selectedDate, unifiedItems]);

  const handleMonthChange = useCallback((newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  }, []);

  const handleDatePress = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleItemPress = useCallback((item: UnifiedCalendarItem) => {
    if (item.source === 'event') {
      router.push(`/event-detail?id=${item.id}`);
    } else if (item.source === 'broadcast') {
      const broadcastId = item.id.replace('broadcast-', '');
      router.push(`/broadcast-detail?id=${broadcastId}` as never);
    }
    // Suspensions just stay on the calendar (no detail view needed)
  }, [router]);

  if (isError && !unifiedItems) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <ErrorState
          message="Unable to load calendar"
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
            onRefresh={() => refetch()}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
      >
        {/* Calendar Grid */}
        {isLoading ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        ) : (
          <CalendarGrid
            year={year}
            month={month}
            events={eventsForGrid}
            selectedDate={selectedDate}
            onDatePress={handleDatePress}
            onMonthChange={handleMonthChange}
          />
        )}

        {/* Items for selected date */}
        {selectedDate && (
          <View style={styles.eventsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {formatDateHeader(selectedDate)}
            </Text>

            {itemsForSelectedDate.length > 0 ? (
              itemsForSelectedDate.map((item) => (
                <UnifiedItemCard
                  key={item.id}
                  item={item}
                  colors={colors}
                  onPress={handleItemPress}
                />
              ))
            ) : (
              <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.emptyIcon]}>📅</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Nothing scheduled for this day
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDateHeader(date: string): string {
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Unified calendar item card — shows events, broadcasts, and suspensions
 * with a colored left-strip and source badge.
 */
function UnifiedItemCard({
  item,
  colors,
  onPress,
}: {
  item: UnifiedCalendarItem;
  colors: Record<string, string>;
  onPress: (item: UnifiedCalendarItem) => void;
}) {
  const sourceLabel =
    item.source === 'suspension' ? '🔴 Suspension' :
    item.source === 'broadcast' ? '📢 Announcement' :
    '📅 Event';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.itemCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
      ]}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}`}
    >
      <View style={[styles.itemStripe, { backgroundColor: item.color }]} />
      <View style={styles.itemContent}>
        <Text style={[styles.itemSource, { color: colors.textTertiary }]}>
          {sourceLabel}
        </Text>
        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.subtitle}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 96,
  },
  loadingContainer: {
    borderRadius: theme.radius['2xl'],
    padding: theme.spacing['5xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
  },
  eventsSection: {
    marginTop: theme.spacing['2xl'],
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.xs,
  },
  // Unified item card
  itemCard: {
    flexDirection: 'row',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  itemStripe: {
    width: 4,
  },
  itemContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  itemSource: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.xs,
  },
  itemTitle: {
    ...theme.typography.h3,
    fontSize: 15,
    marginBottom: theme.spacing.xs,
  },
  itemSubtitle: {
    ...theme.typography.bodySmall,
  },
  // Empty state
  emptyCard: {
    borderRadius: theme.radius['2xl'],
    borderWidth: 1,
    padding: theme.spacing['3xl'],
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    ...theme.typography.body,
    textAlign: 'center',
  },
});
