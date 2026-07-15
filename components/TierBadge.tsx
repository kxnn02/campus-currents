import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

interface TierBadgeProps {
  tier: 'routine' | 'important' | 'emergency';
}

/**
 * Colored pill/badge displaying the broadcast tier label.
 * Emergency = red, Important = amber, Routine = blue with white text.
 */
export default function TierBadge({ tier }: TierBadgeProps) {
  const backgroundColor = Colors.tier[tier];
  const label = tier.charAt(0).toUpperCase() + tier.slice(1);

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
