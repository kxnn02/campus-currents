import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/Theme';

interface TierBadgeProps {
  tier: 'routine' | 'important' | 'emergency';
}

const tierConfig = {
  emergency: {
    bg: theme.colors.tier.emergency,
    text: '#FFFFFF',
    label: 'Emergency',
  },
  important: {
    bg: theme.colors.tier.important,
    text: '#FFFFFF',
    label: 'Important',
  },
  routine: {
    bg: theme.colors.tier.routine,
    text: '#FFFFFF',
    label: 'Routine',
  },
} as const;

/**
 * Colored pill/badge displaying the broadcast tier label.
 * Emergency = red, Important = amber, Routine = blue with white text.
 */
export default function TierBadge({ tier }: TierBadgeProps) {
  const config = tierConfig[tier];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.xl,
    alignSelf: 'flex-start',
  },
  text: {
    ...theme.typography.caption,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
