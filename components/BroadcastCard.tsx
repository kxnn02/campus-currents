import React from 'react';
import { Pressable, View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Broadcast, NotificationTier } from '@/types/database';
import { formatRelativeTime } from '@/lib/feed';
import { ChannelPill } from '@/components/ChannelPill';
import Colors from '@/constants/Colors';

export interface BroadcastCardProps {
  broadcast: Broadcast;
  onPress: (broadcast: Broadcast) => void;
}

const tierColors: Record<NotificationTier, string> = {
  emergency: Colors.tier.emergency,  // #DC2626
  important: Colors.tier.important,  // #F59E0B
  routine: Colors.tier.routine,      // #3B82F6
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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const borderColor = tierColors[broadcast.tier] ?? Colors.tier.routine;
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
          <Text style={styles.timestamp}>
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
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.tier.routine,
    marginHorizontal: 16,
    marginVertical: 6,
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
  },
  content: {
    padding: 12,
  },
  tierLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  pinIcon: {
    marginLeft: 'auto',
  },
});
