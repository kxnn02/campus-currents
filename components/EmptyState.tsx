import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyStateProps {
  icon?: string;
  message: string;
}

/**
 * Centered empty state component with an optional icon (emoji/text) and a message.
 * Used when a list has no items to display.
 */
export default function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
