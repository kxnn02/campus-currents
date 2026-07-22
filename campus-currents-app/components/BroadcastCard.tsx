import React, { useState } from 'react';
import { Pressable, View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Broadcast, NotificationTier } from '@/types/database';
import { formatRelativeTime } from '@/lib/feed';
import { ChannelPill } from '@/components/ChannelPill';
import { theme, useThemeColors } from '@/constants/Theme';

export interface BroadcastCardProps {
  broadcast: Broadcast;
  onPress: (broadcast: Broadcast) => void;
}

const tierColors: Record<NotificationTier, string> = {
  emergency: theme.colors.tier.emergency,
  important: theme.colors.tier.important,
  routine: theme.colors.tier.routine,
};

const tierLabels: Record<NotificationTier, string> = {
  emergency: 'Emergency',
  important: 'Important',
  routine: 'Routine',
};

/**
 * BroadcastCard displays a single broadcast in the feed.
 *
 * Features:
 * - 4px colored left border for tier visual hierarchy
 * - Optional image/poster with responsive 16:9 aspect ratio
 * - Graceful image loading with placeholder
 * - Title emphasized over tier label
 * - Clear 3-level text hierarchy: title → body → metadata
 * - Works on all screen sizes (uses percentage-based image width)
 */
export function BroadcastCard({ broadcast, onPress }: BroadcastCardProps) {
  const colors = useThemeColors();
  const { width: screenWidth } = useWindowDimensions();
  const borderColor = tierColors[broadcast.tier] ?? theme.colors.tier.routine;
  const tierLabel = tierLabels[broadcast.tier] ?? 'Routine';
  const [imageError, setImageError] = useState(false);

  const hasImage = !!broadcast.image_url && !imageError;
  // Card content width = screen - horizontal margins (16*2) - card padding (20+16) - border (4)
  const imageWidth = screenWidth - 32 - 36 - 4;
  const imageHeight = imageWidth * (9 / 16); // 16:9 aspect ratio

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          borderLeftColor: borderColor,
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
        },
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(broadcast)}
      accessibilityRole="button"
      accessibilityLabel={`${tierLabel} broadcast: ${broadcast.title}`}
    >
      <View style={styles.content}>
        {/* Top row: Tier pill + pin */}
        <View style={styles.topRow}>
          <View style={[styles.tierPill, { backgroundColor: borderColor + '14' }]}>
            <Text style={[styles.tierLabel, { color: borderColor }]}>
              {tierLabel}
            </Text>
          </View>

          {broadcast.is_pinned && (
            <Ionicons
              name="pin"
              size={13}
              color={colors.textSecondary}
              accessibilityLabel="Pinned"
            />
          )}
        </View>

        {/* Title — highest visual weight */}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {broadcast.title}
        </Text>

        {/* Body preview — 2 lines, secondary hierarchy */}
        <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={2}>
          {broadcast.body}
        </Text>

        {/* Image/Poster — responsive 16:9 container */}
        {hasImage && (
          <View style={[styles.imageContainer, { borderColor: colors.borderLight }]}>
            <Image
              source={{ uri: broadcast.image_url! }}
              style={[styles.image, { width: imageWidth, height: imageHeight }]}
              resizeMode="cover"
              onError={() => setImageError(true)}
              accessibilityLabel={`Image for: ${broadcast.title}`}
            />
          </View>
        )}

        {/* Bottom row: timestamp + channel pill */}
        <View style={styles.bottomRow}>
          <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
            {formatRelativeTime(broadcast.sent_at)}
          </Text>

          <ChannelPill channel={broadcast.channel} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.tier.routine,
    borderWidth: 1,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm + 2,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  content: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingLeft: theme.spacing.xl,
    paddingRight: theme.spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm + 2,
  },
  tierPill: {
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.xs,
  },
  tierLabel: {
    ...theme.typography.overline,
    fontSize: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: theme.spacing.xs + 2,
    letterSpacing: -0.2,
  },
  body: {
    ...theme.typography.body,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  // Image
  imageContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    backgroundColor: '#F3F4F6', // Light gray placeholder while loading
  },
  image: {
    borderRadius: 9,
  },
  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  timestamp: {
    ...theme.typography.caption,
  },
});
