import React from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { theme, useThemeColors } from '@/constants/Theme';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  editable?: boolean;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
}

/**
 * Form input with a label above and inline red error text below when an error exists.
 * Used in profile completion and edit forms.
 */
export default function FormField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  editable = true,
  keyboardType = 'default',
  maxLength,
}: FormFieldProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
          !editable && { backgroundColor: colors.background, color: colors.textTertiary },
          error ? { borderColor: colors.error } : null,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        editable={editable}
        keyboardType={keyboardType}
        maxLength={maxLength}
        accessibilityLabel={label}
        accessibilityHint={error ? `Error: ${error}` : undefined}
      />
      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.label,
    marginBottom: theme.spacing.xs + 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    fontSize: 16,
  },
  error: {
    ...theme.typography.caption,
    marginTop: theme.spacing.xs,
  },
});
