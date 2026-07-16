import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, useThemeColors } from '@/constants/Theme';

interface ChannelPillProps {
  channel: string;
}

/**
 * Light gray background pill displaying a channel tag name.
 */
export function ChannelPill({ channel }: ChannelPillProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.pill, { backgroundColor: colors.borderLight }]}>
      <Text style={[styles.text, { color: colors.textSecondary }]}>{channel}</Text>
    </View>
  );
}

export default ChannelPill;

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.xl,
    alignSelf: 'flex-start',
  },
  text: {
    ...theme.typography.caption,
    fontWeight: '500',
  },
});
