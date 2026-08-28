import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, useThemeColors } from '@/constants/Theme';

interface EmptyStateProps {
  /** Ionicons name (e.g. "mail-open-outline"). Falls back to no icon if omitted. */
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  message: string;
}

/**
 * Centered empty state with an optional vector icon and a message.
 * Uses Ionicons to stay visually consistent with ErrorState.
 */
export default function EmptyState({ icon, message }: EmptyStateProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      {icon ? (
        <Ionicons
          name={icon}
          size={48}
          color={colors.textTertiary}
          style={styles.icon}
        />
      ) : null}
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
    marginBottom: theme.spacing.md,
  },
  message: {
    ...theme.typography.bodyLarge,
    textAlign: 'center',
    lineHeight: 22,
  },
});
