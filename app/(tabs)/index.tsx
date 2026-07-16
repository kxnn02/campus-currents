import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { BroadcastCard } from '@/components/BroadcastCard';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { useBroadcastFeed, useUnreadCount } from '@/lib/feed';
import { useProfile } from '@/lib/profile';
import { Broadcast } from '@/types/database';

export default function FeedScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const navigation = useNavigation();

  // Get profile from shared context
  const { profile, isLoading: profileLoading } = useProfile();

  // Reset unread count on screen focus
  const { reset: resetUnread } = useUnreadCount();

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

  // Separate pinned from non-pinned
  const pinnedBroadcasts = useMemo(
    () => allBroadcasts.filter((b) => b.is_pinned),
    [allBroadcasts]
  );
  const regularBroadcasts = useMemo(
    () => allBroadcasts.filter((b) => !b.is_pinned),
    [allBroadcasts]
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
    | { type: 'pinned-header' }
    | { type: 'broadcast'; broadcast: Broadcast };

  const listData: ListItem[] = [];

  if (pinnedBroadcasts.length > 0) {
    listData.push({ type: 'pinned-header' });
    pinnedBroadcasts.forEach((b) => listData.push({ type: 'broadcast', broadcast: b }));
  }

  regularBroadcasts.forEach((b) => listData.push({ type: 'broadcast', broadcast: b }));

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'pinned-header') {
      return (
        <View style={styles.pinnedHeader}>
          <Text style={[styles.pinnedHeaderText, { color: colors.textSecondary }]}>
            📌 Pinned
          </Text>
        </View>
      );
    }

    return (
      <BroadcastCard broadcast={item.broadcast} onPress={handleCardPress} />
    );
  };

  const keyExtractor = (item: ListItem, index: number) => {
    if (item.type === 'pinned-header') return 'pinned-header';
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
    paddingVertical: 8,
  },
  skeletonContainer: {
    flex: 1,
    paddingTop: 16,
  },
  pinnedHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  pinnedHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
