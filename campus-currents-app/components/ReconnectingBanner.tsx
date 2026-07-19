import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Simple non-interactive text banner displayed at the top of the screen
 * when the Realtime subscription is attempting to reconnect.
 */
export default function ReconnectingBanner() {
  return (
    <View style={styles.banner} accessibilityLiveRegion="polite">
      <Text style={styles.text}>Reconnecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '500',
  },
});
