import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface ChannelPillProps {
  channel: string;
}

/**
 * Light gray background pill displaying a channel tag name.
 */
export function ChannelPill({ channel }: ChannelPillProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.pill, { backgroundColor: colorScheme === 'dark' ? colors.border : '#F3F4F6' }]}>
      <Text style={[styles.text, { color: colors.text }]}>{channel}</Text>
    </View>
  );
}

export default ChannelPill;

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
