import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { theme, useThemeColors } from '@/constants/Theme';

interface LoadingButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Button with a spinner state. Shows an ActivityIndicator when loading.
 * Disabled when loading or explicitly set to disabled.
 */
export default function LoadingButton({ title, onPress, loading = false, disabled = false }: LoadingButtonProps) {
  const colors = useThemeColors();
  const isDisabled = loading || disabled;

  return (
    <Pressable
      style={[
        styles.button,
        { backgroundColor: isDisabled ? colors.border : colors.primary },
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={colors.textInverse} size="small" />
      ) : (
        <Text style={[styles.text, { color: colors.textInverse }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md + 2,
    paddingHorizontal: theme.spacing['2xl'],
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: theme.layout.buttonHeight,
    ...theme.shadows.sm,
  },
  text: {
    ...theme.typography.buttonLarge,
  },
});
