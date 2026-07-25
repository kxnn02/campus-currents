import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { theme, useThemeColors } from '@/constants/Theme';
import { BroadcastCard } from '@/components/BroadcastCard';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { useQueryClient } from '@tanstack/react-query';
import { useBroadcastFeed, useUnreadCount } from '@/lib/feed';
import { useProfile } from '@/lib/profile';
import { useActiveSuspensions, formatSuspensionSource, formatSuspensionReason } from '@/lib/suspensions';
import { Broadcast, NotificationTier } from '@/types/database';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FilterOption = 'all' | NotificationTier;

const FILTER_OPTIONS: { key: FilterOption; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'emergency', label: 'Emergency', icon: 'warning' },
  { key: 'important', label: 'Important', icon: 'alert-circle' },
  { key: 'routine', label: 'Routine', icon: 'notifications' },
];

/** Max pinned items shown before auto-collapsing */
const PINNED_COLLAPSE_THRESHOLD = 2;

/**
 * Categorizes a timestamp into a human-readable date group for feed separators.
 */
function getDateGroup(sentAt: string): string {
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

  const sentDate = new Date(sentAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

  if (sentDate === todayStr) return 'Today';
  if (sentDate === yesterdayStr) return 'Yesterday';

  // Check if within this week (last 7 days)
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
  if (sentDate > weekAgoStr) return 'This Week';

  return 'Earlier';
}

export default function FeedScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  // Get profile from shared context
  const { profile, isLoading: profileLoading } = useProfile();

  // Check for active/upcoming suspensions to show banner in feed
  const { data: activeSuspensions } = useActiveSuspensions(
    profile ?? { level: null, program: null },
    { enabled: !!profile }
  );
  const suspensionBannerData = useMemo(() => {
    if (!activeSuspensions) return null;
    const { todaySuspensions, upcomingSuspensions } = activeSuspensions;
    if (todaySuspensions.length > 0) {
      const s = todaySuspensions[0];
      return { text: `Classes suspended today — ${formatSuspensionReason(s.reason)}`, isToday: true };
    }
    if (upcomingSuspensions.length > 0) {
      const s = upcomingSuspensions[0];
      const d = new Date(s.suspension_date + 'T00:00:00');
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Manila' });
      return { text: `Classes suspended ${dayLabel} — ${formatSuspensionReason(s.reason)}`, isToday: false };
    }
    return null;
  }, [activeSuspensions]);

  // Reset unread count on screen focus
  const { reset: resetUnread } = useUnreadCount();

  // Filter state
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  // Pinned section collapsed state
  const [pinnedExpanded, setPinnedExpanded] = useState(false);

  // Feed query — only start when profile is available
  const feedQuery = useBroadcastFeed(profile);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      resetUnread();
      // Only invalidate if data is stale — avoids refetching on slow connections
      // when user just switches tabs quickly
      const queryState = queryClient.getQueryState(['broadcasts', 'feed']);
      const isStale = !queryState?.dataUpdatedAt || (Date.now() - queryState.dataUpdatedAt > 180_000);
      if (isStale) {
        queryClient.invalidateQueries({ queryKey: ['broadcasts', 'feed'] });
      }
    });
    return unsubscribe;
  }, [navigation, resetUnread, queryClient]);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = feedQuery;

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Flatten pages into a single list
  const allBroadcasts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.broadcasts);
  }, [data]);

  // Apply tier filter
  const filteredBroadcasts = useMemo(() => {
    if (activeFilter === 'all') return allBroadcasts;
    return allBroadcasts.filter((b) => b.tier === activeFilter);
  }, [allBroadcasts, activeFilter]);

  // Separate pinned from non-pinned
  const pinnedBroadcasts = useMemo(
    () => filteredBroadcasts.filter((b) => b.is_pinned),
    [filteredBroadcasts]
  );
  const regularBroadcasts = useMemo(
    () => filteredBroadcasts.filter((b) => !b.is_pinned),
    [filteredBroadcasts]
  );

  // Auto-collapse pinned if above threshold
  const shouldCollapse = pinnedBroadcasts.length > PINNED_COLLAPSE_THRESHOLD;
  const visiblePinned = shouldCollapse && !pinnedExpanded
    ? pinnedBroadcasts.slice(0, PINNED_COLLAPSE_THRESHOLD)
    : pinnedBroadcasts;

  const togglePinned = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPinnedExpanded((prev) => !prev);
  }, []);

  // Pull-to-refresh handler — resets and refetches from page 0
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.resetQueries({ queryKey: ['broadcasts', 'feed'] });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  // Infinite scroll — load next page
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Navigate to broadcast detail
  const handleCardPress = useCallback(
    (broadcast: Broadcast) => {
      router.push(`/broadcast-detail?id=${broadcast.id}` as never);
    },
    [router]
  );

  // Filter chip colors
  const getFilterChipColor = (key: FilterOption): string => {
    switch (key) {
      case 'emergency': return theme.colors.tier.emergency;
      case 'important': return theme.colors.tier.important;
      case 'routine': return theme.colors.tier.routine;
      default: return colors.tint;
    }
  };

  // Filter chips component — extracted as stable component to avoid recreation on each render
  const FilterChips = useMemo(() => {
    return (
      <View style={[styles.filterContainer, { backgroundColor: colors.background }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_OPTIONS.map((option) => {
            const isActive = activeFilter === option.key;
            const chipColor = getFilterChipColor(option.key);
            return (
              <Pressable
                key={option.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? chipColor + '18' : colors.surface,
                    borderColor: isActive ? chipColor : colors.borderLight,
                  },
                ]}
                onPress={() => setActiveFilter(option.key)}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${option.label}`}
                accessibilityState={{ selected: isActive }}
              >
                <Ionicons
                  name={option.icon as any}
                  size={14}
                  color={isActive ? chipColor : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isActive ? chipColor : colors.textSecondary },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }, [activeFilter, colors]);

  // Loading state: profile loading or initial feed loading
  if (profileLoading || (!profile && isLoading)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <View style={styles.skeletonContainer}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </SafeAreaView>
    );
  }

  // Feed loading state (profile available, first load)
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <View style={styles.skeletonContainer}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </SafeAreaView>
    );
  }

  // Error state — no cached data available
  if (isError && allBroadcasts.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <ErrorState
          message="Unable to load announcements"
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  // Empty state — query succeeded but no broadcasts
  if (!isLoading && allBroadcasts.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <EmptyState icon="📭" message="No announcements yet" />
      </SafeAreaView>
    );
  }

  // Build list data with collapsible pinned section
  type ListItem =
    | { type: 'filter-bar' }
    | { type: 'suspension-banner' }
    | { type: 'pinned-section' }
    | { type: 'date-separator'; label: string }
    | { type: 'broadcast'; broadcast: Broadcast }
    | { type: 'empty-filter' };

  const listData: ListItem[] = [];

  // Filter bar is always first
  listData.push({ type: 'filter-bar' });

  // Suspension banner right after filters (if active/upcoming suspension exists)
  if (suspensionBannerData) {
    listData.push({ type: 'suspension-banner' });
  }

  if (filteredBroadcasts.length === 0 && allBroadcasts.length > 0) {
    listData.push({ type: 'empty-filter' });
  } else {
    if (pinnedBroadcasts.length > 0) {
      listData.push({ type: 'pinned-section' });
    }
    // Add date-group headers between broadcasts
    let lastDateGroup = '';
    regularBroadcasts.forEach((b) => {
      const dateGroup = getDateGroup(b.sent_at);
      if (dateGroup !== lastDateGroup) {
        listData.push({ type: 'date-separator', label: dateGroup });
        lastDateGroup = dateGroup;
      }
      listData.push({ type: 'broadcast', broadcast: b });
    });
  }

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'filter-bar') {
      return FilterChips;
    }

    if (item.type === 'suspension-banner' && suspensionBannerData) {
      return (
        <Pressable
          style={[
            styles.suspensionBanner,
            { backgroundColor: suspensionBannerData.isToday ? '#FEE2E2' : '#FEF3C7' },
          ]}
          onPress={() => router.push('/(tabs)/status' as never)}
          accessibilityRole="button"
          accessibilityLabel={`${suspensionBannerData.text}. Tap to see status.`}
        >
          <Ionicons
            name={suspensionBannerData.isToday ? 'close-circle' : 'alert-circle'}
            size={16}
            color={suspensionBannerData.isToday ? '#DC2626' : '#D97706'}
          />
          <Text style={[styles.suspensionBannerText, { color: suspensionBannerData.isToday ? '#991B1B' : '#92400E' }]}>
            {suspensionBannerData.text}
          </Text>
          <Text style={[styles.suspensionBannerLink, { color: suspensionBannerData.isToday ? '#DC2626' : '#D97706' }]}>
            Status →
          </Text>
        </Pressable>
      );
    }

    if (item.type === 'date-separator') {
      return (
        <View style={styles.dateSeparator}>
          <Text style={[styles.dateSeparatorText, { color: colors.textSecondary }]}>
            {item.label}
          </Text>
        </View>
      );
    }

    if (item.type === 'pinned-section') {
      const hiddenCount = pinnedBroadcasts.length - visiblePinned.length;
      return (
        <View style={styles.pinnedSection}>
          {/* Pinned header with toggle */}
          <Pressable
            style={styles.pinnedHeader}
            onPress={shouldCollapse ? togglePinned : undefined}
            accessibilityRole={shouldCollapse ? 'button' : 'header'}
            accessibilityLabel={`Pinned announcements, ${pinnedBroadcasts.length} items${shouldCollapse ? `, tap to ${pinnedExpanded ? 'collapse' : 'expand'}` : ''}`}
          >
            <View style={styles.pinnedHeaderLeft}>
              <Ionicons name="pin" size={12} color={colors.textSecondary} />
              <Text style={[styles.pinnedHeaderText, { color: colors.textSecondary }]}>
                Pinned
              </Text>
              {pinnedBroadcasts.length > 1 && (
                <View style={[styles.pinnedCount, { backgroundColor: colors.primaryBg }]}>
                  <Text style={[styles.pinnedCountText, { color: colors.primary }]}>
                    {pinnedBroadcasts.length}
                  </Text>
                </View>
              )}
            </View>
            {shouldCollapse && (
              <Ionicons
                name={pinnedExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.textTertiary}
              />
            )}
          </Pressable>

          {/* Visible pinned cards */}
          {visiblePinned.map((broadcast) => (
            <BroadcastCard
              key={broadcast.id}
              broadcast={broadcast}
              onPress={handleCardPress}
            />
          ))}

          {/* "Show more" button when collapsed */}
          {shouldCollapse && !pinnedExpanded && hiddenCount > 0 && (
            <Pressable
              style={[styles.showMoreButton, { borderColor: colors.borderLight }]}
              onPress={togglePinned}
              accessibilityRole="button"
              accessibilityLabel={`Show ${hiddenCount} more pinned announcements`}
            >
              <Text style={[styles.showMoreText, { color: colors.primary }]}>
                Show {hiddenCount} more pinned
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.primary} />
            </Pressable>
          )}
        </View>
      );
    }

    if (item.type === 'empty-filter') {
      return (
        <View style={styles.emptyFilter}>
          <Text style={[styles.emptyFilterText, { color: colors.textSecondary }]}>
            No {activeFilter} broadcasts
          </Text>
        </View>
      );
    }

    return (
      <BroadcastCard broadcast={item.broadcast} onPress={handleCardPress} />
    );
  };

  const keyExtractor = (item: ListItem, index: number) => {
    if (item.type === 'filter-bar') return 'filter-bar';
    if (item.type === 'suspension-banner') return 'suspension-banner';
    if (item.type === 'pinned-section') return 'pinned-section';
    if (item.type === 'date-separator') return `date-${item.label}-${index}`;
    if (item.type === 'empty-filter') return 'empty-filter';
    return item.broadcast.id;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        stickyHeaderIndices={[0]}
        maxToRenderPerBatch={5}
        windowSize={7}
        removeClippedSubviews={true}
        initialNumToRender={6}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color={colors.tint} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: theme.spacing.lg,
    paddingBottom: 96,
  },
  skeletonContainer: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
  // Filter chips
  filterContainer: {
    paddingVertical: theme.spacing.sm,
  },
  // Suspension banner
  suspensionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.radius.lg,
  },
  suspensionBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  suspensionBannerLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  // Date separators
  dateSeparator: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xs,
  },
  dateSeparatorText: {
    ...theme.typography.overline,
    letterSpacing: 0.8,
  },
  filterScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  filterChipText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  // Pinned section
  pinnedSection: {
    marginBottom: theme.spacing.sm,
  },
  pinnedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  pinnedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  pinnedHeaderText: {
    ...theme.typography.overline,
  },
  pinnedCount: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radius.full,
    marginLeft: 4,
  },
  pinnedCountText: {
    fontSize: 10,
    fontWeight: '700',
  },
  // Show more button
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xs,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  showMoreText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Empty filter state
  emptyFilter: {
    paddingVertical: theme.spacing['5xl'],
    alignItems: 'center',
  },
  emptyFilterText: {
    ...theme.typography.body,
  },
  footer: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
});
