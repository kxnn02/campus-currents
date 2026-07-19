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
import { useBroadcastFeed, useUnreadCount } from '@/lib/feed';
import { useProfile } from '@/lib/profile';
import { Broadcast, NotificationTier } from '@/types/database';

type FilterOption = 'all' | NotificationTier;

const FILTER_OPTIONS: { key: FilterOption; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'emergency', label: 'Emergency', icon: 'warning' },
  { key: 'important', label: 'Important', icon: 'alert-circle' },
  { key: 'routine', label: 'Routine', icon: 'notifications' },
];

export default function FeedScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const navigation = useNavigation();

  // Get profile from shared context
  const { profile, isLoading: profileLoading } = useProfile();

  // Reset unread count on screen focus
  const { reset: resetUnread } = useUnreadCount();

  // Filter state
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  // Feed query — only start when profile is available
  const feedQuery = useBroadcastFeed(profile);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      resetUnread();
      // Refetch feed data on focus to pick up new broadcasts
      feedQuery.refetch();
    });
    return unsubscribe;
  }, [navigation, resetUnread, feedQuery]);

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

  // Pull-to-refresh handler — triggers hard refetch
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

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

  // Filter chips component
  const FilterChips = () => (
    <View style={styles.filterContainer}>
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

  // Build list data with pinned section header
  type ListItem =
    | { type: 'filter-bar' }
    | { type: 'pinned-header' }
    | { type: 'broadcast'; broadcast: Broadcast }
    | { type: 'empty-filter' };

  const listData: ListItem[] = [];

  // Filter bar is always first
  listData.push({ type: 'filter-bar' });

  if (filteredBroadcasts.length === 0 && allBroadcasts.length > 0) {
    // Filter resulted in no items
    listData.push({ type: 'empty-filter' });
  } else {
    if (pinnedBroadcasts.length > 0) {
      listData.push({ type: 'pinned-header' });
      pinnedBroadcasts.forEach((b) => listData.push({ type: 'broadcast', broadcast: b }));
    }
    regularBroadcasts.forEach((b) => listData.push({ type: 'broadcast', broadcast: b }));
  }

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'filter-bar') {
      return <FilterChips />;
    }

    if (item.type === 'pinned-header') {
      return (
        <View style={styles.pinnedHeader}>
          <Ionicons name="pin" size={12} color={colors.textSecondary} />
          <Text style={[styles.pinnedHeaderText, { color: colors.textSecondary }]}>
            Pinned
          </Text>
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
    if (item.type === 'pinned-header') return 'pinned-header';
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
    paddingBottom: 80, // Account for absolute-positioned tab bar
  },
  skeletonContainer: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
  // Filter chips
  filterContainer: {
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.light.background,
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
  // Pinned header
  pinnedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  pinnedHeaderText: {
    ...theme.typography.overline,
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
