import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme, useThemeColors } from '@/constants/Theme';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

/**
 * Full-screen error state with a message and a retry button.
 * Used when data fetching fails and no cached data is available.
 */
export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      <Pressable
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={onRetry}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Retry</Text>
      </Pressable>
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
    marginBottom: theme.spacing.lg,
  },
  message: {
    ...theme.typography.bodyLarge,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing['2xl'],
  },
  button: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    ...theme.shadows.sm,
  },
  buttonText: {
    color: '#FFFFFF',
    ...theme.typography.button,
  },
});
