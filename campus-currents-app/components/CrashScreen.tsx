import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

/**
 * Full-screen crash fallback displayed by the root ErrorBoundary
 * when an unhandled JS error occurs.
 *
 * Shows a human-readable "Something went wrong" message with a Reload button.
 * Raw error details are never exposed to the user.
 */
export function CrashScreen({ retry }: { error?: Error; retry?: () => void }) {
  return (
    <View style={styles.container}>
      <FontAwesome name="exclamation-triangle" size={64} color="#DC2626" />
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.subtitle}>
        The app ran into a problem and couldn't recover. Please reload to try again.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={retry}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Reload the app"
      >
        <FontAwesome name="refresh" size={18} color="#FFFFFF" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Reload</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#AF101A',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 32,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
