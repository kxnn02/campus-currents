import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/Theme';

interface ProfileAvatarProps {
  firstName: string;
  lastName: string;
  size?: number;
}

// Colors from the design palette for deterministic avatar coloring
const avatarColors = [
  theme.palette.blue500,
  theme.palette.green600,
  theme.palette.purple500,
  theme.palette.orange500,
  theme.palette.red700,
  theme.palette.teal500,
  theme.palette.yellow500,
  theme.palette.blue800,
];

/**
 * Initials-based circle avatar.
 * Generates a deterministic background color from the name and displays
 * the first letter of each name in white.
 */
export default function ProfileAvatar({ firstName, lastName, size = 48 }: ProfileAvatarProps) {
  const initials = `${(firstName || '').charAt(0).toUpperCase()}${(lastName || '').charAt(0).toUpperCase()}`;

  // Deterministic color from name string
  const hash = (firstName + lastName).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const backgroundColor = avatarColors[hash % avatarColors.length];

  const fontSize = size * 0.38;

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
    ...theme.shadows.sm,
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
