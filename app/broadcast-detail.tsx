import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useBroadcastDetail } from '@/lib/feed';
import { recordRead } from '@/lib/receipts';
import { supabase } from '@/lib/supabase';
import TierBadge from '@/components/TierBadge';
import ChannelPill from '@/components/ChannelPill';
import ErrorState from '@/components/ErrorState';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

/**
 * Formats a date string into "MMM D, YYYY • h:mm A" format.
 * e.g., "Jul 14, 2026 • 3:30 PM"
 */
function formatDetailDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minuteStr = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${month} ${day}, ${year} \u2022 ${hours}:${minuteStr} ${ampm}`;
}

export default function BroadcastDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { data: broadcast, isLoading, isError, refetch } = useBroadcastDetail(id ?? '');

  // Record read receipt on mount
  useEffect(() => {
    if (!id) return;

    async function markRead() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        recordRead(id!, session.user.id);
      }
    }

    markRead();
  }, [id]);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: '', headerBackTitle: 'Back' }} />
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (isError || !broadcast) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: '', headerBackTitle: 'Back' }} />
        <ErrorState
          message="Unable to load broadcast details"
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  const senderName = `${broadcast.sender.first_name} ${broadcast.sender.last_name}`.trim();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Announcement',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Tier badge and Channel pill */}
        <View style={styles.badgeRow}>
          <TierBadge tier={broadcast.tier} />
          <ChannelPill channel={broadcast.channel} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>{broadcast.title}</Text>

        {/* Metadata: sender and date */}
        <View style={styles.metaRow}>
          <Text style={[styles.sender, { color: colors.text }]}>{senderName}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDetailDate(broadcast.sent_at)}</Text>
        </View>

        {/* Body */}
        <Text style={[styles.body, { color: colors.text }]}>{broadcast.body}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 12,
  },
  metaRow: {
    marginBottom: 20,
    gap: 4,
  },
  sender: {
    fontSize: 14,
    fontWeight: '600',
  },
  date: {
    fontSize: 13,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
});
