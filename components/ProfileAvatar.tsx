import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProfileAvatarProps {
  firstName: string;
  lastName: string;
  size?: number;
}

/**
 * Initials-based circle avatar.
 * Generates a deterministic background color from the name and displays
 * the first letter of each name in white.
 */
export default function ProfileAvatar({ firstName, lastName, size = 48 }: ProfileAvatarProps) {
  const initials = `${(firstName || '').charAt(0).toUpperCase()}${(lastName || '').charAt(0).toUpperCase()}`;

  // Deterministic color from name string
  const colorPalette = ['#3B82F6', '#16A34A', '#8B5CF6', '#F97316', '#DC2626', '#14B8A6', '#EAB308', '#EC4899'];
  const hash = (firstName + lastName).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const backgroundColor = colorPalette[hash % colorPalette.length];

  const fontSize = size * 0.4;

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
      accessibilityLabel={`Avatar for ${firstName} ${lastName}`}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
