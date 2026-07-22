import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useBroadcastDetail } from '@/lib/feed';
import { recordRead } from '@/lib/receipts';
import { supabase } from '@/lib/supabase';
import TierBadge from '@/components/TierBadge';
import ChannelPill from '@/components/ChannelPill';
import ErrorState from '@/components/ErrorState';
import { theme, useThemeColors } from '@/constants/Theme';

/**
 * Formats a date string into "MMM D, YYYY • h:mm A" format.
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
  const colors = useThemeColors();
  const router = useRouter();
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
        <View style={[styles.metaCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Text style={[styles.sender, { color: colors.text }]}>{senderName}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDetailDate(broadcast.sent_at)}</Text>
        </View>

        {/* Body */}
        <Text style={[styles.body, { color: colors.text }]}>{broadcast.body}</Text>

        {/* Image/Poster — full width with proper aspect ratio */}
        {broadcast.image_url && (
          <BroadcastDetailImage imageUrl={broadcast.image_url} />
        )}

        {/* View Event Link */}
        {broadcast.linked_event_id && (
          <TouchableOpacity
            style={[styles.viewEventButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push(`/event-detail?id=${broadcast.linked_event_id}`)}
            accessibilityRole="button"
            accessibilityLabel="View linked event"
          >
            <Text style={styles.viewEventText}>View Event →</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

/**
 * Responsive image component that fills the content width
 * and maintains the natural aspect ratio of the image.
 */
function BroadcastDetailImage({ imageUrl }: { imageUrl: string }) {
  const { width: screenWidth } = useWindowDimensions();
  const colors = useThemeColors();
  const [aspect, setAspect] = useState(16 / 9);
  // Content area width = screen - padding (24 * 2)
  const imageWidth = screenWidth - 48;

  useEffect(() => {
    Image.getSize(
      imageUrl,
      (w, h) => {
        if (w > 0 && h > 0) {
          setAspect(Math.max(0.5, Math.min(2, w / h)));
        }
      },
      () => {}
    );
  }, [imageUrl]);

  return (
    <View style={[styles.detailImageContainer, { borderColor: colors.borderLight }]}>
      <Image
        source={{ uri: imageUrl }}
        style={{ width: imageWidth, height: imageWidth / aspect, borderRadius: 12 }}
        resizeMode="contain"
        accessibilityLabel="Broadcast image"
      />
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
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing['4xl'],
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    lineHeight: 32,
    marginBottom: theme.spacing.md,
  },
  metaCard: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  sender: {
    ...theme.typography.label,
  },
  date: {
    ...theme.typography.bodySmall,
  },
  body: {
    ...theme.typography.bodyLarge,
    lineHeight: 26,
  },
  detailImageContainer: {
    marginTop: theme.spacing.xl,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
  },
  viewEventButton: {
    marginTop: theme.spacing['2xl'],
    paddingVertical: theme.spacing.md + 2,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  viewEventText: {
    color: '#FFFFFF',
    ...theme.typography.buttonLarge,
  },
});
