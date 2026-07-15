import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ChannelPillProps {
  channel: string;
}

/**
 * Light gray background pill displaying a channel tag name.
 */
export function ChannelPill({ channel }: ChannelPillProps) {
  return (
    <View style={styles.pill}>
      <Text style={styles.text}>{channel}</Text>
    </View>
  );
}

export default ChannelPill;

const styles = StyleSheet.create({
  pill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
});
