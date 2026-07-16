import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
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
 * Layout:
 * - 4px colored left border indicating tier (red/amber/blue)
 * - Content area with tier label, title (1 line), body preview (2 lines),
 *   and a bottom row with relative timestamp, channel pill, and optional pin icon
 */
export function BroadcastCard({ broadcast, onPress }: BroadcastCardProps) {
  const colors = useThemeColors();
  const borderColor = tierColors[broadcast.tier] ?? theme.colors.tier.routine;
  const tierLabel = tierLabels[broadcast.tier] ?? 'Routine';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { borderLeftColor: borderColor, backgroundColor: colors.surface },
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(broadcast)}
      accessibilityRole="button"
      accessibilityLabel={`${tierLabel} broadcast: ${broadcast.title}`}
    >
      <View style={styles.content}>
        {/* Tier label */}
        <Text style={[styles.tierLabel, { color: borderColor }]}>
          {tierLabel}
        </Text>

        {/* Title — bold, single line with ellipsis */}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {broadcast.title}
        </Text>

        {/* Body preview — 2 lines with ellipsis */}
        <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={2}>
          {broadcast.body}
        </Text>

        {/* Bottom row: timestamp + channel pill + pin icon */}
        <View style={styles.bottomRow}>
          <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
            {formatRelativeTime(broadcast.sent_at)}
          </Text>

          <ChannelPill channel={broadcast.channel} />

          {broadcast.is_pinned && (
            <Ionicons
              name="pin"
              size={14}
              color={colors.textSecondary}
              style={styles.pinIcon}
              accessibilityLabel="Pinned"
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.tier.routine,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.xs + 2,
    ...theme.shadows.md,
  },
  cardPressed: {
    opacity: 0.85,
  },
  content: {
    padding: theme.spacing.md,
  },
  tierLabel: {
    ...theme.typography.overline,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  body: {
    ...theme.typography.bodySmall,
    marginBottom: theme.spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  timestamp: {
    ...theme.typography.caption,
  },
  pinIcon: {
    marginLeft: 'auto',
  },
});
