import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

/**
 * Full-screen error state with a message and a retry button.
 * Used when data fetching fails and no cached data is available.
 */
export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable style={styles.button} onPress={onRetry} accessibilityRole="button">
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
    padding: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
