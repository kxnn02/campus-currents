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
 * Design principles applied (from mobile-app-ui-design skill):
 * - 4px colored left border for tier visual hierarchy
 * - Title emphasized over tier label (values > labels anti-pattern fix)
 * - Soft shadow matched to surface (not harsh black)
 * - 8-point grid spacing throughout
 * - Pressable with scale feedback for tactile feel (emotional micro-interaction)
 * - Clear 3-level text hierarchy: title → body → metadata
 */
export function BroadcastCard({ broadcast, onPress }: BroadcastCardProps) {
  const colors = useThemeColors();
  const borderColor = tierColors[broadcast.tier] ?? theme.colors.tier.routine;
  const tierLabel = tierLabels[broadcast.tier] ?? 'Routine';

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

        {/* Title — highest visual weight (values > labels) */}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {broadcast.title}
        </Text>

        {/* Body preview — 2 lines, secondary hierarchy */}
        <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={2}>
          {broadcast.body}
        </Text>

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
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.tier.routine,
    borderWidth: 1,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm + 2,
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
    marginBottom: theme.spacing.md,
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
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: theme.spacing.sm,
  },
  body: {
    ...theme.typography.bodyLarge,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  timestamp: {
    ...theme.typography.caption,
  },
});
