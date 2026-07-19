import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, useThemeColors } from '@/constants/Theme';

interface EmptyStateProps {
  icon?: string;
  message: string;
}

/**
 * Centered empty state component with an optional icon (emoji/text) and a message.
 * Used when a list has no items to display.
 */
export default function EmptyState({ icon, message }: EmptyStateProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing['3xl'],
  },
  icon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  message: {
    ...theme.typography.bodyLarge,
    textAlign: 'center',
    lineHeight: 22,
  },
});
