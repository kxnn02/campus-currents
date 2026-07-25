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
import { Ionicons } from '@expo/vector-icons';
import { theme, useThemeColors } from '@/constants/Theme';
import CalendarGrid from '@/components/CalendarGrid';
import ErrorState from '@/components/ErrorState';
import {
  useUnifiedMonthData,
  useUpcomingItems,
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
    // Filter OUT broadcasts from the grid — they're noise on the calendar dots.
    // Only show suspensions and actual events (they occupy specific dates).
    return unifiedItems
      .filter((item) => item.source !== 'broadcast')
      .map((item) => ({
        id: item.id,
        title: item.title,
        description: null,
        category: (item.source === 'suspension' ? 'holiday' :
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

  // "Up Next" — independent query for next 14 days (not limited to displayed month)
  const { data: upNextItems } = useUpcomingItems(
    profile ? { program: profile.program, year_level: profile.year_level } : null
  );

  // Get items for selected date — sorted by priority: suspensions → events → broadcasts
  const itemsForSelectedDate = useMemo(() => {
    if (!selectedDate || !unifiedItems) return [];
    const priorityOrder = { suspension: 0, event: 1, broadcast: 2 };
    return getUnifiedItemsForDate(unifiedItems, selectedDate)
      .sort((a, b) => {
        const pA = priorityOrder[a.source] ?? 2;
        const pB = priorityOrder[b.source] ?? 2;
        return pA - pB;
      });
  }, [selectedDate, unifiedItems]);

  const handleMonthChange = useCallback((newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  }, []);

  const handleGoToToday = useCallback(() => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
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
    } else if (item.source === 'suspension') {
      // Navigate to the suspension's date on the calendar grid
      const d = new Date(item.startDate);
      setYear(d.getFullYear());
      setMonth(d.getMonth() + 1);
      setSelectedDate(item.date);
    }
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
        {/* Up Next — compact single-line items, max 2 */}
        {!isLoading && upNextItems && upNextItems.length > 0 && (
          <View style={styles.upNextSection}>
            <View style={styles.upNextHeader}>
              <Text style={[styles.upNextTitle, { color: colors.textSecondary }]}>UP NEXT</Text>
              <Pressable
                style={[styles.todayButton, { backgroundColor: colors.tint + '12', borderColor: colors.tint + '30' }]}
                onPress={handleGoToToday}
                accessibilityRole="button"
                accessibilityLabel="Go to today"
              >
                <Text style={[styles.todayButtonText, { color: colors.tint }]}>Today</Text>
              </Pressable>
            </View>
            {upNextItems.slice(0, 2).map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.upNextRow,
                  {
                    backgroundColor: item.source === 'suspension' ? '#FEF2F2' : 'transparent',
                  },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => handleItemPress(item)}
                accessibilityRole="button"
                accessibilityLabel={`${item.title} on ${item.date}`}
              >
                <View style={[
                  styles.upNextDot,
                  { backgroundColor: item.color },
                  item.source === 'suspension' && styles.upNextSuspensionDot,
                ]} />
                <Text
                  style={[styles.upNextDateLabel, { color: item.source === 'suspension' ? '#B91C1C' : colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {new Date(item.startDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'Asia/Manila',
                  })}
                </Text>
                <Text
                  style={[styles.upNextItemLabel, { color: item.source === 'suspension' ? '#991B1B' : colors.text }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {item.source === 'suspension' && (
                  <Ionicons name="close-circle" size={14} color="#DC2626" />
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* Calendar Grid */}
        {isLoading ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        ) : (
          <>
            {/* Show Today button only when Up Next is empty (no items = no header row for it) */}
            {(!upNextItems || upNextItems.length === 0) && (
              <View style={styles.todayRow}>
                <Pressable
                  style={[styles.todayButton, { backgroundColor: colors.tint + '12', borderColor: colors.tint + '30' }]}
                  onPress={handleGoToToday}
                  accessibilityRole="button"
                  accessibilityLabel="Go to today"
                >
                  <Text style={[styles.todayButtonText, { color: colors.tint }]}>Today</Text>
                </Pressable>
              </View>
            )}
            <CalendarGrid
              year={year}
              month={month}
              events={eventsForGrid}
              selectedDate={selectedDate}
              onDatePress={handleDatePress}
              onMonthChange={handleMonthChange}
            />
          </>
        )}

        {/* Items for selected date */}
        {selectedDate && (
          <View style={styles.eventsSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {formatDateHeader(selectedDate)}
              </Text>
              {itemsForSelectedDate.length > 0 && (
                <View style={[styles.eventCountBadge, { backgroundColor: colors.tint + '15' }]}>
                  <Text style={[styles.eventCountText, { color: colors.tint }]}>
                    {itemsForSelectedDate.length}
                  </Text>
                </View>
              )}
            </View>

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
                <Ionicons name="calendar-outline" size={32} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Nothing scheduled for this day
                </Text>
                <Text style={[styles.emptyHint, { color: colors.textTertiary }]}>
                  Tap another date to see events
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
    item.source === 'suspension' ? 'Suspension' :
    item.source === 'broadcast' ? 'Announcement' :
    'Event';

  const sourceIcon =
    item.source === 'suspension' ? 'close-circle' :
    item.source === 'broadcast' ? 'megaphone' :
    'calendar';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.itemCard,
        {
          backgroundColor: item.source === 'suspension' ? '#FEF2F2' : colors.surface,
          borderColor: item.source === 'suspension' ? '#FECACA' : colors.border,
        },
        pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
      ]}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}`}
    >
      <View style={[styles.itemStripe, { backgroundColor: item.color }]} />
      <View style={styles.itemContent}>
        <View style={styles.itemSourceRow}>
          <Ionicons name={sourceIcon as any} size={12} color={item.source === 'suspension' ? '#DC2626' : colors.textTertiary} />
          <Text style={[styles.itemSource, { color: item.source === 'suspension' ? '#B91C1C' : colors.textTertiary }]}>
            {sourceLabel}
          </Text>
        </View>
        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.subtitle}
          </Text>
        )}
        {item.source === 'broadcast' && (
          <Text style={[styles.itemPostedAt, { color: colors.textTertiary }]}>
            Posted {new Date(item.startDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              timeZone: 'Asia/Manila',
            })}
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
  todayRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing.sm,
  },
  todayButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  todayButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Up Next section — compact
  upNextSection: {
    marginBottom: theme.spacing.md,
  },
  upNextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  upNextTitle: {
    ...theme.typography.overline,
    letterSpacing: 1,
  },
  upNextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.md,
    marginBottom: 2,
  },
  upNextDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  upNextSuspensionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  upNextDateLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 90,
  },
  upNextItemLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.xs,
    marginRight: theme.spacing.xs,
  },
  sectionTitle: {
    ...theme.typography.h3,
  },
  eventCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  eventCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  // Unified item card
  itemCard: {
    flexDirection: 'row',
    borderRadius: theme.radius.xl,
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
  itemSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: theme.spacing.xs,
  },
  itemSource: {
    ...theme.typography.caption,
  },
  itemTitle: {
    ...theme.typography.h3,
    fontSize: 15,
    marginBottom: theme.spacing.xs,
  },
  itemSubtitle: {
    ...theme.typography.bodySmall,
  },
  itemPostedAt: {
    ...theme.typography.caption,
    marginTop: 2,
    fontStyle: 'italic',
  },
  // Empty state
  emptyCard: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing['3xl'],
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  emptyText: {
    ...theme.typography.body,
    textAlign: 'center',
  },
  emptyHint: {
    ...theme.typography.caption,
    textAlign: 'center',
  },
});
